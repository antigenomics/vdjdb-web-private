package backend.models.files

import javax.inject.{Inject, Singleton}

import play.api.db.slick.{DatabaseConfigProvider, HasDatabaseConfigProvider}
import play.db.NamedDatabase
import slick.jdbc.JdbcProfile
import slick.lifted.TableQuery

import scala.concurrent.{ExecutionContext, Future}

@Singleton
class FileMetadataProvider @Inject()(@NamedDatabase("default") protected val dbConfigProvider: DatabaseConfigProvider)
                            (implicit ec: ExecutionContext) extends HasDatabaseConfigProvider[JdbcProfile] {
    import dbConfig.profile.api._

    def getAll: Future[Seq[FileMetadata]] = {
        db.run(FileMetadataProvider.table.result)
    }

    def getByID(id: Long): Future[Option[FileMetadata]] = {
        db.run(FileMetadataProvider.table.filter(_.id === id).result.headOption)
    }
}

object FileMetadataProvider {
    private[files] final val table = TableQuery[FileMetadataTable]
}
