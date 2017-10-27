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
 */

package models

import base.BaseTestSpecWithApplication
import org.scalatest.BeforeAndAfterAll
import play.api.db.{DBApi, Database}

import scala.concurrent.ExecutionContext

abstract class DatabaseProviderTestSpec(databaseName: String = "database") extends BaseTestSpecWithApplication with BeforeAndAfterAll {
  lazy implicit val database: Database = app.injector.instanceOf[DBApi].database(databaseName)
  lazy implicit val ec: ExecutionContext = app.injector.instanceOf[ExecutionContext]
}
