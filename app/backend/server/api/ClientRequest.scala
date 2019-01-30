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

package backend.server.api

import play.api.libs.json._

case class ClientRequest(id: Int, action: Option[String], data: Option[JsValue])

object ClientRequest {
    implicit val clientRequestWrites: Writes[ClientRequest] = Json.writes[ClientRequest]
    implicit val clientRequestReads: Reads[ClientRequest] = (json: JsValue) => {
        if ((json \ "id").isEmpty) {
            JsError()
        } else {
            JsSuccess(ClientRequest((json \ "id").as[Int], (json \ "action").asOpt[String], (json \ "data").asOpt[JsValue]))
        }
    }
}
