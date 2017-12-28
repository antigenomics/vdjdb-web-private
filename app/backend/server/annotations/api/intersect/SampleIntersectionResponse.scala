/*
 *        Copyright 2017 Bagaev Dmitry
 *
 *        Licensed under the Apache License, Version 2.0 (the "License");
 *        you may not use this file except in compliance with the License.
 *        You may obtain a copy of the License at
 *
 *            http://www.apache.org/licenses/LICENSE-2.0
 *
 *        Unless required by applicable law or agreed to in writing, software
 *        distributed under the License is distributed on an "AS IS" BASIS,
 *        WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *        See the License for the specific language governing permissions and
 *        limitations under the License.
 *
 */

package backend.server.annotations.api.intersect

import backend.server.annotations.IntersectionTableRow
import play.api.libs.json.{Json, Writes}

case class SampleIntersectionResponse(state: String, rows: Seq[IntersectionTableRow])

object SampleIntersectionResponse {
    final val Action: String = "intersect"

    final val ParseState = SampleIntersectionResponse("print", Seq())
    final val AnnotateState = SampleIntersectionResponse("annotate", Seq())
    final val LoadingState = SampleIntersectionResponse("loading", Seq())
    final def CompletedState(rows: Seq[IntersectionTableRow]) = SampleIntersectionResponse("completed", rows)

    implicit val sampleIntersectionResponseWrites: Writes[SampleIntersectionResponse] = Json.writes[SampleIntersectionResponse]
}
