/*
 *     Copyright 2017-2019 Bagaev Dmitry
 *
 *     Licensed under the Apache License, Version 2.0 (the "License");
 *     you may not use this file except in compliance with the License.
 *     You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 *     Unless required by applicable law or agreed to in writing, software
 *     distributed under the License is distributed on an "AS IS" BASIS,
 *     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *     See the License for the specific language governing permissions and
 *     limitations under the License.
 */

package backend.models.authorization.user

import java.io.File
import java.sql.Timestamp

import akka.actor.{ActorSystem, Cancellable}
import backend.models.authorization.forms.{SignupForm, SignupTemporaryForm}
import backend.models.authorization.permissions.{UserPermissions, UserPermissionsProvider}
import backend.models.authorization.tokens.session.SessionTokenProvider
import backend.models.authorization.tokens.verification.{VerificationToken, VerificationTokenConfiguration, VerificationTokenProvider}
import backend.models.files.FileMetadataProvider
import backend.models.files.sample.SampleFileProvider
import backend.utils.TimeUtils
import com.antigenomics.vdjtools.misc.Software
import javax.inject.{Inject, Singleton}
import org.apache.commons.io.FilenameUtils
import org.mindrot.jbcrypt.BCrypt
import org.slf4j.LoggerFactory
import play.api.Configuration
import play.api.db.slick.{DatabaseConfigProvider, HasDatabaseConfigProvider}
import play.api.inject.ApplicationLifecycle
import play.db.NamedDatabase
import slick.jdbc.JdbcProfile
import slick.jdbc.meta.MTable

import scala.async.Async.{async, await}
import scala.concurrent.duration._
import scala.concurrent.{ExecutionContext, Future}
import scala.language.postfixOps
import scala.util.{Failure, Success}

@Singleton
class UserProvider @Inject()(
  @NamedDatabase("default") protected val dbConfigProvider: DatabaseConfigProvider,
  vtp: VerificationTokenProvider,
  stp: SessionTokenProvider,
  lifecycle: ApplicationLifecycle
)(implicit ec: ExecutionContext, conf: Configuration, system: ActorSystem, upp: UserPermissionsProvider, sfp: SampleFileProvider, fmp: FileMetadataProvider)
    extends HasDatabaseConfigProvider[JdbcProfile] {
  final private val logger                     = LoggerFactory.getLogger(this.getClass)
  final private val configuration              = conf.get[VerificationTokenConfiguration]("application.auth.verification")
  final private val usersConfiguration         = conf.get[UserCreateConfiguration]("application.auth.common")
  final private val demoUserConfiguration      = conf.get[DemoUserConfiguration]("application.auth.demo")
  final private val temporaryUserConfiguration = conf.get[TemporaryUserConfiguration]("application.auth.temporary")

  import dbConfig.profile.api._

  final private val table = TableQuery[UserTable]

  if (usersConfiguration.enableDefaultUsers && usersConfiguration.createUsers.nonEmpty) {
    logger.info("Initial users: ")
    usersConfiguration.createUsers.foreach(
      user =>
        async {
          val check = await(get(user._2))
          if (check.isEmpty) {
            verifyUser(await(createUser(user._1, user._2, user._3, user._4.toLong)))
            logger.info(s"User ${user._2} has been created")
          } else {
            logger.info(s"User ${user._2} already created")
          }
        }
    )
  } else if (!usersConfiguration.enableDefaultUsers && usersConfiguration.clearDefaultUsers) {
    logger.info("Clearing initial users: ")
    usersConfiguration.createUsers.foreach(
      user =>
        async {
          val check = await(get(user._2))
          if (check.isDefined) {
            await(delete(check.get))
            logger.info(s"User ${user._2} has been deleted")
          }
        }
    )
  }

  if (demoUserConfiguration.enabled) async {
    logger.info("Demo user is enabled")
    val check = await(get(demoUserConfiguration.login))
    if (check.isEmpty) {
      val demoUser =
        await(verifyUser(await(createUser("vdjdb-demo", demoUserConfiguration.login, demoUserConfiguration.password, UserPermissionsProvider.DEMO_ID))))
      if (demoUser.isDefined) {
        val demoFiles = new File(demoUserConfiguration.filesLocation)
        if (demoFiles.exists && demoFiles.isDirectory) {
          demoFiles.listFiles
            .filter(_.isFile)
            .foreach((file) => {
              val name      = FilenameUtils.getBaseName(file.getName)
              val extension = FilenameUtils.getExtension(file.getName)
              demoUser.get.addDemoSampleFile(name, extension, Software.VDJtools.toString, file).map {
                case Left(sampleFileID) =>
                  logger.info(s"Added demo sample file: $name")
                case Right(error) =>
                  logger.warn(s"$error")
              }
            })
        }
        logger.info(s"Demo user has been created")
      } else {
        logger.info("Failed to create demo user")
      }
    } else {
      logger.info(s"Demo user already created")
    }
  }

  final private val unverifiedDeleteScheduler: Option[Cancellable] = Option(configuration.interval.getSeconds != 0).collect {
    case true =>
      system.scheduler.schedule(configuration.interval.getSeconds seconds, configuration.interval.getSeconds seconds) {
        deleteUnverified onComplete {
          case Failure(ex) =>
            logger.warn("Cannot delete unverified users", ex)
          case _ =>
        }
      }
  }

  lifecycle.addStopHook { () =>
    Future.successful(unverifiedDeleteScheduler.foreach(_.cancel()))
  }

  final private val temporaryDeleteScheduler: Option[Cancellable] = Option(temporaryUserConfiguration.interval.getSeconds != 0).collect {
    case true =>
      system.scheduler.schedule(temporaryUserConfiguration.interval.getSeconds seconds, temporaryUserConfiguration.interval.getSeconds seconds) {
        deleteTemporary onComplete {
          case Failure(ex) =>
            logger.warn("Cannot delete temporary users", ex)
          case _ =>
        }
      }
  }

  lifecycle.addStopHook { () =>
    Future.successful(temporaryDeleteScheduler.foreach(_.cancel()))
  }

  getAll onComplete {
    case Success(users) =>
      users.foreach(user => {
        if (user.folderPath == "<default>") {
          val folderPath = s"${usersConfiguration.uploadLocation}/${user.email}"
          val folder     = new File(folderPath)
          folder.mkdirs()
          db.run(table.filter(_.id === user.id).map(_.folderPath).update(folderPath))
        }
      })
    case Failure(ex) =>
      logger.warn("Cannot initialize default columns in user table after evolutions", ex)
  }

  def getTable: TableQuery[UserTable] = table

  def getAuthTokenSessionName: String = stp.getAuthTokenSessionName

  def getVerificationConfiguration: VerificationTokenConfiguration = configuration

  def getDemoUserConfiguration: DemoUserConfiguration = demoUserConfiguration

  def getVerificationMethod: String = configuration.method

  def getVerificationServer: String = configuration.server

  def isVerificationRequired: Boolean = configuration.required

  def getAll: Future[Seq[User]] = db.run(table.result)

  def get(id: Long): Future[Option[User]] = {
    db.run(table.filter(_.id === id).result.headOption)
  }

  def get(email: String): Future[Option[User]] = {
    db.run(table.filter(_.email === email).result.headOption)
  }

  def get(ids: Seq[Long]): Future[Seq[User]] = {
    db.run(table.filter(fm => fm.id inSet ids).result)
  }

  def getBySessionToken(sessionToken: String): Future[Option[User]] = {
    stp.get(sessionToken) flatMap {
      case Some(token) => get(token.userID)
      case None        => Future.successful(None)
    }
  }

  def getWithPermissions(email: String): Future[Option[(User, UserPermissions)]] = {
    db.run(table.withPermissions.filter(_._1.email === email).result.headOption)
  }

  def getTemporaryUsers(expiredOnly: Boolean = false): Future[Seq[User]] = {
    if (!expiredOnly) {
      db.run(table.filter(fm => fm.isTemporary).result)
    } else {
      db.run(table.filter(fm => fm.isTemporary && fm.createdOn < TimeUtils.getCreatedAt(temporaryUserConfiguration.keep)).result)
    }
  }

  def countForCreateIP(createIP: String): Future[Int] = {
    db.run(table.filter(fm => fm.createIP === createIP).result).map(_.length)
  }

  def touch(id: Long): Future[Int] = {
    db.run(table.filter(fm => fm.id === id).map(_.lastAccessedOn).update(TimeUtils.getCurrentTimestamp))
  }

  def delete(id: Long)(implicit sfp: SampleFileProvider): Future[Int] = {
    get(id) flatMap {
      case Some(user) => delete(user)
      case None       => Future.successful(0)
    }
  }

  def delete(user: User)(implicit sfp: SampleFileProvider): Future[Int] = {
    user.delete flatMap { _ =>
      db.run(table.filter(_.id === user.id).delete)
    }
  }

  def deleteUnverified(implicit sfp: SampleFileProvider): Future[Int] = {
    db.run(MTable.getTables)
      .flatMap(
        tables =>
          async {
            if (tables.exists(_.name.name == UserTable.TABLE_NAME)) {
              val currentTimestamp = TimeUtils.getCurrentTimestamp
              val expiredTokens    = await(vtp.getExpired(currentTimestamp))
              val userIDs          = expiredTokens.map(_.userID)
              await(get(userIDs).flatMap(users => {
                users.foreach(user => {
                  user.delete
                })
                deleteByIDS(userIDs).flatMap(_ => {
                  vtp.delete(expiredTokens)
                })
              }))
            } else {
              0
            }
          }
      )
  }

  def deleteTemporary(implicit sfp: SampleFileProvider): Future[Int] = {
    db.run(MTable.getTables)
      .flatMap(
        tables =>
          async {
            if (tables.exists(_.name.name == UserTable.TABLE_NAME)) {
              val expiredTemporaryUsers = await(getTemporaryUsers(expiredOnly = true))
              val userIDs               = expiredTemporaryUsers.map(_.id)
              await(get(userIDs).flatMap(users => {
                users.foreach(user => {
                  user.delete
                })
                deleteByIDS(userIDs)
              }))
            } else {
              0
            }
          }
      )
  }

  def createUser(
    login: String,
    email: String,
    password: String,
    permissionsID: Long    = UserPermissionsProvider.DEFAULT_ID,
    verifyUntil: Timestamp = TimeUtils.getExpiredAt(configuration.keep)
  ): Future[VerificationToken] =
    async {
      val check = await(get(email))
      if (check.nonEmpty) {
        throw new RuntimeException("User already exists")
      }
      val hash       = BCrypt.hashpw(password, BCrypt.gensalt())
      val folderPath = s"${usersConfiguration.uploadLocation}/$email"
      val folder     = new File(folderPath)
      folder.mkdirs()
      val user = User(
        id             = 0,
        login          = login,
        email          = email,
        verified       = false,
        folderPath     = folderPath,
        createIP       = "none",
        isTemporary    = false,
        createdOn      = TimeUtils.getCurrentTimestamp,
        lastAccessedOn = TimeUtils.getCurrentTimestamp,
        hash,
        permissionsID
      )
      val userID: Long = await(insert(user))
      await(vtp.createVerificationToken(userID, verifyUntil))
    }

  def createUser(form: SignupForm): Future[VerificationToken] = {
    createUser(form.login, form.email, form.password)
  }

  def createTemporaryUser(token: String, createIP: String): Future[Option[User]] = async {
    val check = await(get(token))
    if (check.nonEmpty) {
      throw new RuntimeException("User already exists")
    }
    val count = await(countForCreateIP(createIP))
    if (count >= temporaryUserConfiguration.maxForOneIP) {
      throw new RuntimeException("Too much users for one IP")
    }
    val hash       = BCrypt.hashpw(token, BCrypt.gensalt())
    val folderPath = s"${usersConfiguration.uploadLocation}/$token"
    val folder     = new File(folderPath)
    folder.mkdirs()
    val user = User(
      id             = 0,
      login          = token,
      email          = token,
      verified       = true,
      folderPath     = folderPath,
      createIP       = createIP,
      isTemporary    = true,
      createdOn      = TimeUtils.getCurrentTimestamp,
      lastAccessedOn = TimeUtils.getCurrentTimestamp,
      hash,
      permissionID = UserPermissionsProvider.TEMPORARY_ID
    )
    val userID: Long = await(insert(user))
    await(get(userID))
  }

  def createTemporaryUser(form: SignupTemporaryForm, createIP: String): Future[Option[User]] = {
    createTemporaryUser(form.token, createIP)
  }

  def verifyUser(token: VerificationToken): Future[Option[User]] = {
    verifyUser(token.token)
  }

  def verifyUser(token: String): Future[Option[User]] = async {
    val verificationToken = await(vtp.get(token))
    if (verificationToken.isEmpty) {
      throw new RuntimeException("Invalid token")
    }
    val success = await(db.run(table.filter(_.id === verificationToken.get.userID).map(_.verified).update(true)))
    if (success == 1) {
      await(
        vtp
          .delete(verificationToken.get)
          .flatMap(_ => {
            get(verificationToken.get.userID)
          })
      )
    } else {
      None
    }
  }

  def updatePassword(user: User, newPassword: String): Future[Int] = {
    val newHash = BCrypt.hashpw(newPassword, BCrypt.gensalt())
    db.run(table.filter(_.id === user.id).map(u => (u.password, u.verified)).update((newHash, true)))
  }

  private def insert(user: User): Future[Long] = {
    db.run(table returning table.map(_.id) += user)
  }

  private def deleteByIDS(ids: Seq[Long]): Future[Int] = {
    db.run(table.filter(fm => fm.id inSet ids).delete)
  }
}
