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

package backend.models.authorization.user

import javax.inject.{Inject, Singleton}

import backend.models.authorization.permissions.{UserPermissions, UserPermissionsProvider}
import backend.models.authorization.verification.{VerificationToken, VerificationTokenProvider}
import play.api.db.slick.{DatabaseConfigProvider, HasDatabaseConfigProvider}
import play.db.NamedDatabase
import slick.jdbc.JdbcProfile
import slick.lifted.TableQuery
import org.mindrot.jbcrypt.BCrypt
import scala.async.Async.{async, await}
import scala.concurrent.{ExecutionContext, Future}

@Singleton
class UserProvider @Inject()(@NamedDatabase("default") protected val dbConfigProvider: DatabaseConfigProvider, vtp: VerificationTokenProvider)
                            (implicit ec: ExecutionContext) extends HasDatabaseConfigProvider[JdbcProfile] {
    import dbConfig.profile.api._

    def getAll: Future[Seq[User]] = db.run(UserProvider.table.result)

    def get(id: Long): Future[Option[User]] = {
        db.run(UserProvider.table.filter(_.id === id).result.headOption)
    }

    def get(email: String): Future[Option[User]] = {
        db.run(UserProvider.table.filter(_.email === email).result.headOption)
    }

    def getWithPermissions(email: String): Future[Option[(User, UserPermissions)]] = {
        db.run(UserProvider.table.withPermissions.filter(_._1.email === email).result.headOption)
    }

    def delete(id: Long): Future[Int] = {
        db.run(UserProvider.table.filter(_.id === id).delete)
    }

    def delete(user: User): Future[Int] = {
        delete(user.id)
    }

    def delete(users: Seq[User]): Future[Int] = {
        val ids = users.map(_.id)
        db.run(UserProvider.table.filter(fm => fm.id inSet ids).delete)
    }

    def createUser(login: String, email: String, password: String): Future[VerificationToken] = async {
        val check = await(get(email))
        if (check.nonEmpty) {
            throw new RuntimeException("User already exists")
        }
        val hash = BCrypt.hashpw(password, BCrypt.gensalt())
        val user = User(0, login, email, verified = false, hash, UserPermissionsProvider.DEFAULT_ID)
        val userID: Long = await(insert(user))
        await(vtp.createVerificationToken(userID))
    }

    private def insert(user: User): Future[Long] = {
        db.run(UserProvider.table returning UserProvider.table.map(_.id) += user)
    }
}

object UserProvider {
    private[authorization] final val table = TableQuery[UserTable]
}