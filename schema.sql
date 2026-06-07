-- student management system - database setup
-- creates all the tables and adds some sample data
-- works on mysql 8 (this is what i used for the aiven cloud database)

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS scores;
DROP TABLE IF EXISTS subject_streams;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS subjects;
DROP TABLE IF EXISTS class_streams;
DROP TABLE IF EXISTS grading_scale;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- class streams like form 1a, form 1b, form 1c
CREATE TABLE class_streams (
  id int NOT NULL AUTO_INCREMENT,
  name varchar(50) NOT NULL,
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- subjects offered by the school
CREATE TABLE subjects (
  id int NOT NULL AUTO_INCREMENT,
  name varchar(100) NOT NULL,
  code varchar(20) NOT NULL,
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- students, each one belongs to a class stream
CREATE TABLE students (
  id int NOT NULL AUTO_INCREMENT,
  name varchar(100) NOT NULL,
  admission_no varchar(50) NOT NULL,
  gender varchar(10) DEFAULT NULL,
  class_stream_id int DEFAULT NULL,
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY admission_no (admission_no),
  KEY class_stream_id (class_stream_id),
  CONSTRAINT students_ibfk_1 FOREIGN KEY (class_stream_id) REFERENCES class_streams (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- links subjects to the streams they are offered in
CREATE TABLE subject_streams (
  subject_id int NOT NULL,
  class_stream_id int NOT NULL,
  PRIMARY KEY (subject_id, class_stream_id),
  KEY class_stream_id (class_stream_id),
  CONSTRAINT subject_streams_ibfk_1 FOREIGN KEY (subject_id) REFERENCES subjects (id) ON DELETE CASCADE,
  CONSTRAINT subject_streams_ibfk_2 FOREIGN KEY (class_stream_id) REFERENCES class_streams (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- scores for each student per subject. the unique key stops duplicate entries
CREATE TABLE scores (
  id int NOT NULL AUTO_INCREMENT,
  student_id int NOT NULL,
  subject_id int NOT NULL,
  cat_score float DEFAULT 0,
  exam_score float DEFAULT 0,
  term int DEFAULT 1,
  year int DEFAULT 2026,
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY unique_score (student_id, subject_id, term, year),
  KEY subject_id (subject_id),
  CONSTRAINT scores_ibfk_1 FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE,
  CONSTRAINT scores_ibfk_2 FOREIGN KEY (subject_id) REFERENCES subjects (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- grading scale, can be changed from the settings page
CREATE TABLE grading_scale (
  id int NOT NULL AUTO_INCREMENT,
  grade varchar(5) NOT NULL,
  min_score float NOT NULL,
  max_score float NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- admin users for login
CREATE TABLE users (
  id int NOT NULL AUTO_INCREMENT,
  username varchar(50) NOT NULL,
  password_hash varchar(255) NOT NULL,
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- sample data
-- inserted in this order so the foreign keys don't fail

INSERT INTO class_streams (id, name, created_at) VALUES
(5, 'Form 1A', '2026-06-04 19:26:44'),
(7, 'Form 1B', '2026-06-05 21:03:40'),
(10, 'Form 1C', '2026-06-05 21:47:00');

INSERT INTO subjects (id, name, code, created_at) VALUES
(5, 'English', 'ENG-114', '2026-06-06 15:39:16'),
(6, 'Mathematics', 'MAT-112', '2026-06-06 15:39:36');

INSERT INTO students (id, name, admission_no, gender, class_stream_id, created_at) VALUES
(1, 'Ethan Mwangi', '22-3108', 'Male', 5, '2026-06-04 19:24:42'),
(2, 'Risper Wanjiku', '22-1204', 'Female', 5, '2026-06-04 20:10:12'),
(3, 'John Mark', '22-3256', 'Male', 5, '2026-06-04 20:11:22'),
(5, 'Christine Wanjiru', '22-4531', 'Female', 7, '2026-06-05 21:48:29'),
(8, 'Ann Wairimu', '22-3104', 'Female', 5, '2026-06-05 22:21:55');

INSERT INTO subject_streams (subject_id, class_stream_id) VALUES
(5, 5),
(6, 5);

INSERT INTO scores (id, student_id, subject_id, cat_score, exam_score, term, year, created_at) VALUES
(10, 8, 5, 25, 50, 1, 2026, '2026-06-06 16:04:18'),
(11, 1, 5, 34, 45, 1, 2026, '2026-06-06 16:04:18'),
(12, 3, 5, 29, 33, 1, 2026, '2026-06-06 16:04:18'),
(13, 2, 5, 35, 57, 1, 2026, '2026-06-06 16:04:18'),
(14, 8, 6, 26, 47, 1, 2026, '2026-06-06 18:43:56'),
(15, 1, 6, 38, 58, 1, 2026, '2026-06-06 18:43:56'),
(16, 3, 6, 21, 35, 1, 2026, '2026-06-06 18:43:56'),
(17, 2, 6, 29, 38, 1, 2026, '2026-06-06 18:43:56');

INSERT INTO grading_scale (id, grade, min_score, max_score) VALUES
(1, 'A', 80, 100),
(2, 'B', 65, 79),
(3, 'C', 50, 64),
(4, 'D', 40, 49),
(5, 'E', 0, 39);

-- demo login for testing: username demo, password demo123
INSERT INTO users (id, username, password_hash, created_at) VALUES
(1, 'admin', '$2b$10$mw7lil9fF.JjM.auUWL6l.hNwkrWEL/O9H64tWLJI.tOHWXCMgxU.', '2026-06-06 20:34:08'),
(2, 'demo', '$2b$10$uvhlg7MW8IUvJysS/VDtjO7b4qwOizDCYXWMku2IbybCcOIJ8nmBO', '2026-06-06 21:40:14');