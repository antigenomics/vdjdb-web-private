/*
 *    Copyright 2017 Bagaev Dmitry
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */

package backend.utils.files

import java.io.{File, PrintWriter}
import java.text.SimpleDateFormat
import java.util.Date

import backend.utils.CommonUtils

import scala.io.Source

case class TemporaryFile(private val filePath: String, private val guardPath: String, private val folderPath: String) {

    def isLocked: Boolean = {
        val lockFile = new File(folderPath + ".lock")
        lockFile.exists()
    }

    def getFile: Option[File] = {
        val file = new File(filePath)
        if (file.exists() && file.isFile) {
            Some(file)
        } else {
            None
        }
    }

    def delete(): Unit = {
        val folder = new File(folderPath)
        val file = new File(filePath)
        val guardFile = new File(guardPath)
        val lockFile = new File(folderPath + ".lock")

        if (guardFile.exists()) {
            guardFile.delete()
        }
        if (file.exists()) {
            file.delete()
        }
        if (lockFile.exists()) {
            lockFile.delete()
        }
        if (folder.exists()) {
            folder.delete()
        }
    }

}

object TemporaryFile {
    private val tmpDirectory: String = "/tmp/vdjdb"

    def create(name: String, content: String): TemporaryFileLink = {
        val dateFormat: SimpleDateFormat = new SimpleDateFormat("HH:mm-dd-MM-yyyy")
        val currentDate: String = dateFormat.format(new Date())

        val unique = CommonUtils.randomAlphaString(30)
        val outputFolderPath = TemporaryFile.tmpDirectory + "/" + unique

        val outputFolder = new File(outputFolderPath)
        if (outputFolder.mkdirs()) {
            val fileName = currentDate + "-" + name
            val fileAbsolutePath = outputFolderPath + "/" + fileName

            val contentFile = new File(fileAbsolutePath)
            contentFile.createNewFile()
            val printWriter = new PrintWriter(contentFile)
            printWriter.write(content)
            printWriter.close()

            val hash = FileUtils.fileContentHash("MD5", fileAbsolutePath) + currentDate
            val guard = CommonUtils.randomAlphaNumericString(50)

            val guardFile = new File(outputFolderPath + "/.guard" + guard)
            guardFile.createNewFile()
            val guardWriter = new PrintWriter(guardFile)
            guardWriter.println(fileName)
            guardWriter.println(hash)
            guardWriter.close()

            TemporaryFileLink(unique, guard, hash)
        } else {
            TemporaryFileLink("", "", "")
        }
    }

    def find(link: TemporaryFileLink, lock: Boolean = true): Option[TemporaryFile] = {
        val unique = link.unique
        val guard = link.guard
        val hash = link.hash

        val invalidLink = unique.contains("..") || guard.contains("..")

        if (!invalidLink) {
            val folderPath = TemporaryFile.tmpDirectory + "/" + unique + "/"
            val guardPath = folderPath + ".guard" + guard

            val folder = new File(folderPath)
            val guardFile = new File(guardPath)

            val temporaryExists: Boolean =
                folder.exists() && folder.isDirectory &&
                    guardFile.exists() && !guardFile.isDirectory

            if (temporaryExists) {
                if (lock) {
                    val lockPath = folderPath + ".lock"
                    val lockFile = new File(lockPath)
                    lockFile.createNewFile()
                }

                val guard = Source.fromFile(guardFile).getLines().toList
                val guardFileName = guard.head
                val guardHash = guard(1)

                val filePath = folderPath + guardFileName
                val fileHash = FileUtils.fileContentHash("MD5", filePath)
                val hashValid: Boolean = guardHash.contains(fileHash) && guardHash.contentEquals(hash)

                if (hashValid) {
                    Some(TemporaryFile(filePath, guardPath, folderPath))
                } else {
                    None
                }
            } else {
                None
            }
        } else {
            None
        }
    }
}
