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

package backend.server.motifs.api.cdr3

import play.api.libs.json.{Format, Json}

case class MotifCDR3SearchResult(cdr3: String, top: Int, clusters: Seq[MotifCDR3SearchEntry], clustersNorm: Seq[MotifCDR3SearchEntry])

object MotifCDR3SearchResult {
  implicit val motifCDR3SearchResultFormat: Format[MotifCDR3SearchResult] = Json.format[MotifCDR3SearchResult]
}
