-- noinspection SqlDialectInspectionForFile

# FILE_METADATA AND TEMPORARY_FILE schemas

# --- !Ups

CREATE TABLE FILE_METADATA (
  ID BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  FILE_NAME VARCHAR(128) NOT NULL,
  EXTENSION VARCHAR(16) NOT NULL,
  PATH VARCHAR(512) NOT NULL,
  FOLDER VARCHAR(512) NOT NULL,
  CREATED_AT DATE NOT NULL
);

CREATE TABLE TEMPORARY_FILE (
  ID BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  LINK VARCHAR(32) NOT NULL UNIQUE,
  EXPIRED_AT DATE NOT NULL,
  METADATA_ID BIGINT NOT NULL,
  FOREIGN KEY (METADATA_ID) REFERENCES FILE_METADATA(ID) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE UNIQUE INDEX LINK_IDX ON TEMPORARY_FILE(LINK);

# --- !Downs

DROP INDEX TEMPORARY_FILE.LINK_IDX;
DROP TABLE TEMPORARY_FILE;
DROP TABLE FILE_METADATA;