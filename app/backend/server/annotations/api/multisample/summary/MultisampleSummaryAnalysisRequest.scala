/*
 *     Copyright 2017 Bagaev Dmitry
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
 *
 */

package backend.server.annotations.api.multisample.summary

import play.api.libs.json.{Json, Reads}

case class MultisampleSummaryAnalysisRequest(tabID: Int, sampleNames: Seq[String],
                                             hammingDistance: Int, confidenceThreshold: Int, minEpitopeSize: Int,
                                             matchV: Boolean, matchJ: Boolean,
                                             species: String, gene: String, mhc: String) {}

object MultisampleSummaryAnalysisRequest {
    implicit val multisampleSummaryAnalysisRequestReads: Reads[MultisampleSummaryAnalysisRequest] = Json.reads[MultisampleSummaryAnalysisRequest]
}
