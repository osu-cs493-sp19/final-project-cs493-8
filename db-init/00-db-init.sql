-- MySQL dump 10.13  Distrib 5.7.22, for Linux (x86_64)
--
-- Host: localhost    Database: businesses
-- ------------------------------------------------------
-- Server version	5.7.22

DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` mediumint(9) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` ENUM('admin','instructor','student') NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=latin1;

LOCK TABLES `users` WRITE;

INSERT INTO `users` VALUES
  (1,'Admin','admin@businesses.com','$2a$08$Y00/JO/uN9n0dHKuudRX2eKksWMIHXDLzHWKuz/K67alAYsZRRike', 'admin'),
  (2,'Nick Arzner','nick@block15.com','$2a$08$Y2IHnr/PU9tzG5HKrHGJH.zH3HAvlR5i5puD5GZ1sHA/mVrHKci72', 'instructor'),
  (3,'Tori Lockwood','lori@robnetts.com','$2a$08$bAKRXPs6fUPhqjZy55TIeO1e.aXud4LD81awrYncaCKJoMsg/s0c.', 'instructor'),
  (4,'Joel Rea','joel@lickspigot.com','$2a$08$WvRkJm.bz3zoRnmA.aQZBewLopoe00nA4qbzbnLyS4eRbm2MFNkMO', 'instructor'),
  (5,'The Owners','owners@firstalt.coop','$2a$08$FBStm3plzBCnh/MPIUsJ0.f7kJkp6aH47haXHb3HY.Gfygan7e8He', 'instructor'),
  (6,'Kim Marchesi','kim@localboyzhawaiiancafe.com','$2a$08$q8njvTTel9JDR.BQbb1cD.XL73CR.QCOXLnofdpd9orbv0dzWGir.', 'student'),
  (7,'William McCanless','william@interzoneorganic1','$2a$08$U7IXbbolDIk0SRlmH/dnT.FBCvf.EMvorShGlM65XeQFr./P0rhqe', 'student'),
  (8,'Paul Turner','paul@darksidecinema.com','$2a$08$Kb1f8JbT/9kl.wRuRsRoYO19ddMcc79zXvfUcwchJJ1qHxVMDJN1K', 'student'),
  (9,'Allan Stuart','allan@allanscoffee.com','$2a$08$ALw6f6NIpdptAUhhezTjhezjjnMLcbBP/uRnqVCwYNSWBdno6y2I6','student'),
  (10,'Winco Employees','employees@wincofoods.com','$2a$08$64je8REF7I4j4bQuJKIdXO09VkCXJqoaF18znHs/a3zuKi/olDR/S', 'student'),
  (11,'Philip Wilson','philib@bookbin.com','$2a$08$Ev.K7sU3yWrCUECK2O2a5.eA8mbvVEImv/EyYka1yhRxQFKIbxrfS', 'student'),
  (12,'Fred Meyer','fred@fredmeyer.com','$2a$08$ljdJ4mrSIEXsaiEMu29xUuEFAOj43gL5rcR7wCq8Rl2z/bqzf.xuC', 'student'),
  (13,'Mike Easter','mike@cyclotopia.com','$2a$08$Apk5L0bDogb4G6ZtoKluPeZXCxye0qdNZCah9TJX9QvdRqZ5hwWAy', 'student'),
  (14,'Casey Collett','casey@oregoncoffeeandtea.com','$2a$08$5SL3bkbe5S1WnE6rWciiX.9HAfXG/UGbZAQU7K0S4XTNGIHapPBy2', 'student'),
  (15,'John Semadeni','john@corvalliscycleryinc.com','$2a$08$xIku71t6OFFN9Ztil1Kh2eQWk/0lC8C.UThx3PwAwYCSMxdzpPhTO', 'student'),
  (16,'Alex Spaeth','alex@spaethlumber.com','$2a$08$H9dDFONytVUgh2ZcCQlHL.8uP6RricbtoCk2vsr/roTBtGkYLUivS', 'student'),
  (17,'Tristan James','tristan@newmorningbakery.com','$2a$08$pJFEMJNiTa7azhokPUnXZusS6NMqT3eBJE45sX6Kli380PZoM2nje', 'student')
  ;

UNLOCK TABLES;

DROP TABLE IF EXISTS `courses`;

CREATE TABLE `courses` (
  `id` mediumint(9) NOT NULL AUTO_INCREMENT,
  `description` varchar(1000) NOT NULL,
  `subject` varchar(4) NOT NULL,
  `number` varchar(3) NOT NULL,
  `title` varchar(255) NOT NULL,
  `term` varchar(255) NOT NULL,
  `instructorId` mediumint(9) NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `courses_ibfk_1` FOREIGN KEY (`instructorId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;

LOCK TABLES `courses` WRITE;

INSERT INTO `courses` VALUES
  (1,
  'The varieties of computer hardware and software. The effects, positive and negative, of computers on human lives. Ethical implications of information technology. Hands-on experience with a variety of computer applications. Lec/lab.',
  'CS',
  '101',
  'COMPUTERS: APPLICATIONS AND IMPLICATIONS',
  'FALL 2019',
  2),
  (2,
  'Introduction to the computer science field and profession. Team problem solving. Introduction to writing computer programs. Approaches to teaching course topics vary across sections. Lec/lab.',
  'CS',
  '160',
  'COMPUTER SCIENCE ORIENTATION',
  'FALL 2019',
  3),
  (3,
  'Overview of fundamental concepts of computer science. Introduction to problem solving, software engineering, and object-oriented programming. Includes algorithm design and program development. Lec/lab/rec.',
  'CS',
  '161',
  'INTRODUCTION TO COMPUTER SCIENCE I',
  'Winter 2020',
  2),
  (4,
  'Basic data structures. Computer programming techniques and application of software engineering principles. Introduction to analysis of programs. Lec/lab/rec.',
  'CS',
  '162',
  'INTRODUCTION TO COMPUTER SCIENCE II',
  'Winter 2020',
  3),
  (5,
  'Overview of the fundamental concepts of computer science. Introduction to problem solving, algorithm development, data types, and basic data structures. Introduction to analysis of algorithms and principles of software engineering. System development and computer programming using procedural/object-oriented paradigms. Offered via Ecampus only.',
  'CS',
  '165',
  'ACCELERATED INTRODUCTION TO COMPUTER SCIENCE',
  'Winter 2020',
  4),
  (6,
  'Introduction to the electrical and computer engineering professional practice. Covers the foundations of engineering problem solving and other skills necessary for success. Students will be taught engineering practice through hands-on approaches. Recommended for electrical and computer engineering majors, and for those interested in engineering as a profession. Lec/lab. Has extra fees.',
  'ECE',
  '111',
  'INTRODUCTION TO ECE: TOOLS',
  'Fall 2019',
  4),
  (7,
  'Basic electrical and computer engineering concepts, problem solving and hands-on laboratory project. Topics include electronic circuit and device models, digital logic, circuit analysis, and simulation tools. Lec/lab. Has extra fees.',
  'ECE',
  '112',
  'INTRODUCTION TO ECE: CONCEPTS',
  'Winter 2020',
  5);

UNLOCK TABLES;

DROP TABLE IF EXISTS `assignments`;

CREATE TABLE `assignments` (
  `id` mediumint(9) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` varchar(1000) NOT NULL,
  `courseId` mediumint(9) NOT NULL,
  `points` mediumint(9) NOT NULL,
  `due` TIMESTAMP NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `assignments_ibfk_1` FOREIGN KEY (`courseId`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;

LOCK TABLES `assignments` WRITE;

INSERT INTO `assignments` VALUES
  (1, "Final project CS101", "Write paper.on computer hardware interaction with software.", 1, 100, "2019-06-14 00:07:00"),
  (2, "Final project CS160", "Create Python graphic circle.", 2, 100, "2019-06-14 00:07:00"),
  (3, "Final project CS161", "Create C++ hello world.", 3, 100, "2019-06-14 00:07:00"),
  (4, "Final project CS162", "Create C++ zork game.", 4, 100, "2019-06-14 00:07:00"),
  (5, "Final project CS165", "Create C++ zoo program.", 5, 100, "2019-06-14 00:07:00"),
  (6, "Final project ECE111", "Soder electrical board.", 6, 100, "2019-06-14 00:07:00"),
  (7, "Final project ECE112.", "Create LED stoplight.", 7, 100, "2019-06-14 00:07:00");

UNLOCK TABLES;


DROP TABLE IF EXISTS `submissions`;

CREATE TABLE `submissions` (
  `id` mediumint(9) NOT NULL AUTO_INCREMENT,
  `description` varchar(1000) NOT NULL,
  `assignmentId` mediumint(9) NOT NULL,
  `studentId` mediumint(9) NOT NULL,
  `timestamp` TIMESTAMP NOT NULL,
  `file` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `submissions_ibfk_1` FOREIGN KEY (`assignmentId`) REFERENCES `assignments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `submissions_ibfk_2` FOREIGN KEY (`studentId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
