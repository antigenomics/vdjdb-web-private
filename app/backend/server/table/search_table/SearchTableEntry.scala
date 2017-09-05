package backend.server.table.search_table

import play.api.libs.json.{Json, OWrites}

case class SearchTableEntry(column: String, value: String)

object SearchTableEntry {
    implicit val searchTableEntryWrites: OWrites[SearchTableEntry] = Json.writes[SearchTableEntry]
}
