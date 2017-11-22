/*
 *
 *       Copyright 2017 Bagaev Dmitry
 *
 *       Licensed under the Apache License, Version 2.0 (the "License");
 *       you may not use this file except in compliance with the License.
 *       You may obtain a copy of the License at
 *
 *           http://www.apache.org/licenses/LICENSE-2.0
 *
 *       Unless required by applicable law or agreed to in writing, software
 *       distributed under the License is distributed on an "AS IS" BASIS,
 *       WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *       See the License for the specific language governing permissions and
 *       limitations under the License.
 */

package backend.controllers

import java.nio.file.Paths
import javax.inject.Inject

import akka.actor.ActorSystem
import akka.stream.Materializer
import backend.actions.{SessionAction, UserRequest, UserRequestAction}
import backend.actors.AnnotationsWebSocketActor
import backend.models.authorization.permissions.UserPermissionsProvider
import backend.models.authorization.user.UserProvider
import backend.models.files.FileMetadataProvider
import backend.models.files.sample.SampleFileProvider
import backend.server.limit.RequestLimits
import backend.utils.analytics.Analytics
import com.typesafe.config.ConfigMemorySize
import org.apache.commons.io.FilenameUtils
import org.slf4j.LoggerFactory
import play.api.{Configuration, Environment}
import play.api.libs.Files
import play.api.libs.json.JsValue
import play.api.libs.streams.ActorFlow
import play.api.mvc._

import scala.async.Async.{async, await}
import scala.concurrent.{ExecutionContext, Future}

class AnnotationsAPI @Inject()(cc: ControllerComponents, userRequestAction: UserRequestAction, conf: Configuration)
                              (implicit upp: UserPermissionsProvider, up: UserProvider, sfp: SampleFileProvider, fmp: FileMetadataProvider,
                               as: ActorSystem, mat: Materializer, ec: ExecutionContext, limits: RequestLimits,
                               environment: Environment, analytics: Analytics)
    extends AbstractController(cc) {
    private final val maxUploadFileSize = conf.get[ConfigMemorySize]("application.annotations.upload.maxFileSize")
    private final val logger = LoggerFactory.getLogger(this.getClass)

    def checkUploadAllowed(implicit ec: ExecutionContext): ActionFilter[UserRequest] = new ActionFilter[UserRequest] {
        override protected def executionContext: ExecutionContext = ec

        override protected def filter[A](request: UserRequest[A]): Future[Option[Result]] = {
            request.user.get.getDetails.map { details =>
                if (!details.permissions.isUploadAllowed) {
                    Some(BadRequest("Upload is not allowed for this account"))
                } else {
                    None
                }
            }
        }
    }

    def uploadFile: Action[MultipartFormData[Files.TemporaryFile]] =
        (userRequestAction(parse.multipartFormData(maxUploadFileSize.toBytes)) andThen SessionAction.authorizedOnly andThen checkUploadAllowed).async {
            implicit request =>
                request.body.file("file").map { file =>
                    request.body.asFormUrlEncoded("name").headOption match {
                        case Some(nameWithExtension) => async {
                            val name = FilenameUtils.getBaseName(nameWithExtension)
                            val extension = FilenameUtils.getExtension(nameWithExtension)
                            val sampleFileID = await(request.user.get.addSampleFile(name, extension, file.ref))
                            logger.debug(s"File uploaded $name ($extension) from user ${request.user.get.login} (sampleID: $sampleFileID)")
                            Ok(s"$sampleFileID")
                        }
                        case None => async {
                            BadRequest("Empty file name")
                        }
                    }
                }.getOrElse {
                    async {
                        BadRequest("Internal server error")
                    }
                }
        }

    def connect: WebSocket = WebSocket.acceptOrResult[JsValue, JsValue] { implicit request =>
        async {
            if (limits.allowConnection(request)) {
                request.session.get(up.getAuthTokenSessionName) match {
                    case None => Left(Forbidden)
                    case Some(token) =>
                        val user = await(up.getBySessionToken(token))
                        if (user.nonEmpty) {
                            val details = await(user.get.getDetails)
                            Right(ActorFlow.actorRef { out =>
                                AnnotationsWebSocketActor.props(out, limits.getLimit(request), user.get, details)
                            })
                        } else {
                            Left(Forbidden)
                        }
                }
            } else {
                Left(Forbidden)
            }
        }
    }
}
