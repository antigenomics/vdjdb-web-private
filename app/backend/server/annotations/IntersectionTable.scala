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

package backend.server.annotations

import java.util

import backend.server.ResultsTable
import backend.server.annotations.api.intersect.SampleIntersectionRequest
import backend.server.database.Database
import com.antigenomics.vdjdb.scoring.SequenceSearcherPreset
import com.antigenomics.vdjdb.text.{ExactTextFilter, TextFilter}
import com.antigenomics.vdjtools.sample.Sample
import com.milaboratory.core.tree.TreeSearchParameters

import scala.collection.JavaConverters._
import scala.math.Ordering.String

class IntersectionTable extends ResultsTable[IntersectionTableRow] {

    def sort(columnIndex: Int, sortType: String): Unit = {
        if ((sortType == "desc" || sortType == "asc") && (columnIndex >= 0)) {
            rows = rows.sortWith((e1, e2) => {
                val v1 = e1.entries(columnIndex)
                val v2 = e2.entries(columnIndex)
                sortType match {
                    case "desc" => String.gt(v1, v2)
                    case "asc" => String.lt(v1, v2)
                }
            })
        }
    }

    def update(request: SampleIntersectionRequest, sample: Sample, database: Database): IntersectionTable = {
        val treeSearchParameters = request.hammingDistance match {
            case 0 => new TreeSearchParameters(0, 0, 0)
            case 1 => TreeSearchParameters.ONE_MISMATCH
            case 2 => TreeSearchParameters.TWO_MISMATCHES
            case 3 => TreeSearchParameters.THREE_MISMATCHES
            case _ => new TreeSearchParameters(0, 0, 0)
        }
        val searchParameters = new SequenceSearcherPreset(treeSearchParameters)
        val filters = new util.ArrayList[TextFilter]()
        if (request.mhc.toLowerCase() != "any") {
            filters.add(new ExactTextFilter("mhc.class", request.mhc, false))
        }

        val instance = database.getInstance.filter(filters)
            .asClonotypeDatabase(request.matchV, request.matchJ, searchParameters, request.species, request.gene, request.confidenceThreshold)

        val results = instance.search(sample)
        this.rows = results
            .asScala.toList
            .sortWith { case ((c1, _), (c2, _)) => c1.getFreq > c2.getFreq }
            .map { case (c, l) => (c, l.asScala) }
            .map(IntersectionTableRow.createFromSearchResult)
        this.currentPage = 0
        this
    }
}
