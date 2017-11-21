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

import backend.models.authorization.permissions.{UserPermissions, UserPermissionsProvider}
import org.mindrot.jbcrypt.BCrypt
import scala.async.Async.{async, await}
import scala.concurrent.{ExecutionContext, Future}

case class User(id: Long, login: String, email: String, verified: Boolean,
                private[authorization] val password: String, private[authorization] val permissionID: Long) {
    def getPermissions(implicit upp: UserPermissionsProvider, ec: ExecutionContext): Future[UserPermissions] = {
        upp.getByID(permissionID).map(_.get)
    }

    def getDetails(implicit upp: UserPermissionsProvider, ec: ExecutionContext): Future[UserDetails] = async {
        val permissions = await(getPermissions)
        UserDetails(email, login, permissions)
    }

    def checkPassword(plain: String): Boolean = {
        BCrypt.checkpw(plain, password)
    }
}


