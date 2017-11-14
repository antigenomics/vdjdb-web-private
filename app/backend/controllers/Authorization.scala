package backend.controllers

import javax.inject.Inject

import scala.async.Async.{async, await}
import backend.models.authorization.forms.{LoginForm, ResetForm, ResetRequestForm, SignupForm}
import backend.models.authorization.tokens.session.SessionTokenProvider
import backend.models.authorization.user.UserProvider
import backend.models.authorization.tokens.verification.VerificationTokenProvider
import backend.utils.analytics.Analytics
import org.slf4j.LoggerFactory
import play.api.Environment
import play.api.i18n.{Lang, Messages, MessagesApi}
import play.api.mvc._
import backend.actions.{SessionAction, UserRequestAction}
import backend.models.authorization.tokens.reset.ResetTokenProvider

import scala.concurrent.{ExecutionContext, Future}

class Authorization @Inject()(cc: ControllerComponents, messagesApi: MessagesApi, userRequestAction: UserRequestAction)
                             (implicit ec: ExecutionContext,
                              up: UserProvider, vtp: VerificationTokenProvider, stp: SessionTokenProvider, rtp: ResetTokenProvider,
                              environment: Environment, analytics: Analytics)
    extends AbstractController(cc) {
    private final val logger = LoggerFactory.getLogger(this.getClass)
    implicit val messages: Messages = messagesApi.preferred(Seq(Lang.defaultLang))

    def login: Action[AnyContent] = (userRequestAction andThen SessionAction.unauthorizedOnly) { implicit request =>
        Ok(frontend.views.html.authorization.login(LoginForm.loginFormMapping))
    }

    def onLogin: Action[AnyContent] = (userRequestAction andThen SessionAction.unauthorizedOnly).async { implicit request =>
        LoginForm.loginFormMapping.bindFromRequest.fold(
            formWithErrors => async {
                BadRequest(frontend.views.html.authorization.login(formWithErrors))
            },
            form => {
                up.get(form.email).flatMap {
                    case Some(user) => async {
                        if (user.verified) {
                            if (user.checkPassword(form.password)) {
                                val sessionToken = await(stp.createSessionToken(user))
                                Redirect(backend.controllers.routes.Application.index())
                                    .withSession(request.session + (stp.getAuthTokenSessionName, sessionToken))
                            } else {
                                BadRequest(frontend.views.html.authorization.login(LoginForm.loginFailedFormMapping))
                            }
                        } else {
                            BadRequest(frontend.views.html.authorization.login(LoginForm.loginUnverified))
                        }
                    }
                    case None => Future.successful(BadRequest(frontend.views.html.authorization.login(LoginForm.loginFailedFormMapping)))
                }
            }
        )
    }

    def signup: Action[AnyContent] = (userRequestAction andThen SessionAction.unauthorizedOnly) { implicit request =>
        Ok(frontend.views.html.authorization.signup(SignupForm.signupFormMapping))
    }

    def onSignup: Action[AnyContent] = (userRequestAction andThen SessionAction.unauthorizedOnly).async { implicit request =>
        SignupForm.signupFormMapping.bindFromRequest.fold(
            formWithErrors => async {
                BadRequest(frontend.views.html.authorization.signup(formWithErrors))
            },
            form => async {
                val check = await(up.get(form.email))
                if (check.nonEmpty) {
                    BadRequest(frontend.views.html.authorization.signup(SignupForm.userAlreadyExistsFormMapping))
                } else {
                    val verificationToken = await(up.createUser(form))
                    if (up.isVerificationRequired) {
                        //TODO verification email
                        logger.info(s"Verification token for ${form.email}: ${verificationToken.token}")
                        Redirect(backend.controllers.routes.Authorization.login()).flashing("created" -> "authorization.forms.signup.success.created")
                    } else {
                        val _ = await(up.verifyUser(verificationToken))
                        Redirect(backend.controllers.routes.Authorization.login()).flashing("created" -> "authorization.forms.signup.success.createdAndVerified")
                    }
                }
            }
        )
    }

    def resetRequest: Action[AnyContent] = (userRequestAction andThen SessionAction.unauthorizedOnly) { implicit request =>
        Ok(frontend.views.html.authorization.reset_request(ResetRequestForm.resetRequestFormMapping))
    }

    def onResetRequest: Action[AnyContent] = (userRequestAction andThen SessionAction.unauthorizedOnly).async { implicit request =>
        ResetRequestForm.resetRequestFormMapping.bindFromRequest.fold(
            formWithErrors => async {
                BadRequest(frontend.views.html.authorization.reset_request(formWithErrors))
            },
            form => async {
                val user = await(up.get(form.email))
                if (user.nonEmpty) {
                    //TODO Reset email
                    val resetTokenStr = await(rtp.createResetToken(user.get))
                    logger.info(s"Reset token for ${form.email}: $resetTokenStr")
                }
                Redirect(backend.controllers.routes.Authorization.login()).flashing("reset_request" -> "authorization.forms.reset.flashing.message")
            }
        )
    }

    def reset(token: String): Action[AnyContent] = (userRequestAction andThen SessionAction.unauthorizedOnly).async { implicit request =>
        async {
            val resetToken = await(rtp.getWithUser(token))
            if (resetToken.nonEmpty) {
                Ok(frontend.views.html.authorization.reset(token, ResetForm.resetFormMapping))
            } else {
                Redirect(backend.controllers.routes.Application.index())
            }
        }
    }

    def onReset(token: String): Action[AnyContent] = (userRequestAction andThen SessionAction.unauthorizedOnly).async { implicit request =>
        ResetForm.resetFormMapping.bindFromRequest.fold(
            formWithErrors => async {
                println("formWithErrors")
                print(formWithErrors.errors)
                BadRequest(frontend.views.html.authorization.reset(token, formWithErrors))
            },
            form => async {
                println("form")
                val tokenWithUser = await(rtp.getWithUser(token))
                if (tokenWithUser.nonEmpty) {
                    val _ = await(rtp.delete(tokenWithUser.get._1.id) flatMap { _ =>
                        up.updatePassword(tokenWithUser.get._2, form.newPassword)
                    })
                    Redirect(backend.controllers.routes.Authorization.login()).flashing("reset" -> "authorization.forms.login.flashing.reset")
                } else {
                    BadRequest(frontend.views.html.authorization.login(LoginForm.loginFormMapping.withGlobalError("internal.error")))
                }
            }
        )
    }

    def verifyWithToken(token: String): Action[AnyContent] = Action.async { implicit request =>
        async {
            val verificationToken = await(vtp.get(token))
            if (verificationToken.isEmpty) {
                BadRequest(messages("authorization.verification.invalidToken"))
            } else {
                val user = await(up.verifyUser(verificationToken.get.token))
                if (user.nonEmpty) {
                    Redirect(backend.controllers.routes.Authorization.login()).flashing("verified" -> "authorization.forms.login.flashing.verified")
                } else {
                    BadRequest(frontend.views.html.authorization.login(LoginForm.loginFormMapping.withGlobalError("internal.error")))
                }
            }
        }
    }

    def logout: Action[AnyContent] = (userRequestAction andThen SessionAction.authorizedOnly).async { implicit request =>
        stp.delete(request.token.get.token) map { _ =>
            SessionAction.clearSessionAndDiscardCookies(Redirect(backend.controllers.routes.Application.index()))
        }
    }
}
