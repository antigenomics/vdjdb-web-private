-- noinspection SqlDialectInspectionForFile

# FILE_METADATA AND TEMPORARY_FILE schemas

# --- !Ups

CREATE TABLE USER_PERMISSIONS (
    ID BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    MAX_FILES_COUNT INT NOT NULL,
    MAX_FILE_SIZE INT NOT NULL,
    IS_UPLOAD_ALLOWED BOOLEAN NOT NULL,
    IS_DELETE_ALLOWED BOOLEAN NOT NULL
);

INSERT INTO USER_PERMISSIONS VALUES(0, -1, -1, true, true);
INSERT INTO USER_PERMISSIONS VALUES(1, 10, 16, true, true);
INSERT INTO USER_PERMISSIONS VALUES(2, 0, 0, false, false);

CREATE TABLE USER (
    ID BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    LOGIN VARCHAR(64) NOT NULL,
    EMAIL VARCHAR(128) NOT NULL,
    VERIFIED BOOLEAN NOT NULL,
    PASSWORD VARCHAR(255) NOT NULL,
    PERMISSION_ID BIGINT NOT NULL,
    FOREIGN KEY (PERMISSION_ID) REFERENCES USER_PERMISSIONS(ID) ON UPDATE CASCADE ON DELETE NO ACTION
);

CREATE UNIQUE INDEX EMAIL_IDX ON USER(EMAIL);

CREATE TABLE VERIFICATION_TOKEN (
  ID BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  TOKEN VARCHAR(128) NOT NULL,
  USER_ID BIGINT NOT NULL,
  EXPIRED_AT TIMESTAMP NOT NULL
);

CREATE TABLE SESSION_TOKEN (
   ID BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
   TOKEN VARCHAR(255) NOT NULL,
   LAST_USAGE TIMESTAMP NOT NULL,
   USER_ID BIGINT NOT NULL
);

CREATE UNIQUE INDEX SESSION_TOKEN_IDX ON SESSION_TOKEN(TOKEN);

CREATE TABLE RESET_TOKEN (
   ID BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
   TOKEN VARCHAR(255) NOT NULL,
   EXPIRED_AT TIMESTAMP NOT NULL,
   USER_ID BIGINT NOT NULL
);

CREATE UNIQUE INDEX RESET_TOKEN_IDX ON RESET_TOKEN(TOKEN);

# --- !Downs

DROP INDEX RESET_TOKEN.RESET_TOKEN_IDX;
DROP TABLE RESET_TOKEN;
DROP INDEX SESSION_TOKEN.SESSION_TOKEN_IDX;
DROP TABLE SESSION_TOKEN;
DROP TABLE VERIFICATION_TOKEN;
DROP INDEX USER.EMAIL_IDX;
DROP TABLE USER;
DROP TABLE USER_PERMISSIONS;