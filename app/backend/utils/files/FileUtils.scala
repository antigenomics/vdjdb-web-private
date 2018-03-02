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

import java.io.{File, FileInputStream, FileOutputStream}
import java.nio.file.StandardCopyOption.REPLACE_EXISTING
import java.nio.file.Files
import java.security.MessageDigest
import java.nio.file.Paths
import java.util.zip.ZipInputStream
import java.util.zip.GZIPOutputStream

import play.api.libs.Files.TemporaryFile

object FileUtils {

    def getDirectoryFiles(directory: String): List[File] = {
        val file = new File(directory)
        if (file.exists && file.isDirectory) {
            file.listFiles.filter(_.isFile).toList
        } else {
            List[File]()
        }
    }

    def copyFile(source: String, dest: String): Unit = {
        Files.copy(Paths.get(source), Paths.get(dest), REPLACE_EXISTING)
    }

    // t is the type of checksum, i.e. MD5, or SHA-512 or whatever
    // path is the path to the file you want to get the hash of
    def fileContentHash(t: String, path: String): String = {
        val arr = Files readAllBytes (Paths get path)
        val checksum = MessageDigest.getInstance(t) digest arr
        checksum.map("%02X" format _).mkString
    }

    def convertZipToGzip(file: play.api.libs.Files.TemporaryFile): TemporaryFile = {
        val zipInputStream = new ZipInputStream(new FileInputStream(file.getAbsoluteFile))
        val zipEntry = zipInputStream.getNextEntry

        //Assume that zip contains only one entry
        val fileName = zipEntry.getName
        val creator = play.api.libs.Files.SingletonTemporaryFileCreator

        // GZIP output stream
        val gzipOutputFile = creator.create(fileName, ".gzip")
        val gzip = new GZIPOutputStream(new FileOutputStream(gzipOutputFile.getAbsoluteFile))

        val buffer: Array[Byte] = new Array[Byte](1024)
        var len: Int = zipInputStream.read(buffer)
        while (len > 0) {
            gzip.write(buffer, 0, len)
            len = zipInputStream.read(buffer)
        }
        gzip.close()

        zipInputStream.closeEntry()
        zipInputStream.close()

        gzipOutputFile
    }

}
