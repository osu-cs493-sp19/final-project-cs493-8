-- MySQL dump 10.13  Distrib 5.7.22, for Linux (x86_64)
--
-- Host: localhost    Database: businesses
-- ------------------------------------------------------
-- Server version	5.7.22

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` mediumint(9) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` ENUM('admin','instructor','student') NOT NULL,
  PRIMARY KEY (`id`)
);



DROP TABLE IF EXISTS `assignments`;
CREATE TABLE `assignments` (
  `id` mediumint(9) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `points` mediumint(3) NOT NULL,
  `due` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
);


DROP TABLE IF EXISTS `courses`;
CREATE TABLE `courses` (
  `id` mediumint(9) NOT NULL AUTO_INCREMENT,
  `subject` varchar(255) NOT NULL,
  `number` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `instructorId` mediumint(9) NOT NULL
  PRIMARY KEY (`id`),
  FOREIGN KEY instructorId (instructorId) REFERENCES users (id) ON DELETE CASCADE
);



DROP TABLE IF EXISTS `submissions`;
CREATE TABLE `submissions` (
  `id` mediumint(9) NOT NULL AUTO_INCREMENT,
  `assignmentId` mediumint(9) NOT NULL,
  `studentId` mediumint(9) NOT NULL,
  `timestamp` TIMESTAMP NOT NULL,
  `file` BLOB(3000),
  PRIMARY KEY (`id`),
  FOREIGN KEY assignmentId (assignmentId) REFERENCES assignments (id) ON DELETE CASCADE
  FOREIGN KEY studentId (studentId) REFERENCES users (id) ON DELETE CASCADE
);




LOCK TABLES `users` WRITE;
INSERT INTO `users` VALUES
  (0,'Admin','admin@businesses.com','$2a$08$Y00/JO/uN9n0dHKuudRX2eKksWMIHXDLzHWKuz/K67alAYsZRRike','admin'),
  (1,'Nick Arzner','nick@block15.com','$2a$08$Y2IHnr/PU9tzG5HKrHGJH.zH3HAvlR5i5puD5GZ1sHA/mVrHKci72','student'),
  (2,'Tori Lockwood','lori@robnetts.com','$2a$08$bAKRXPs6fUPhqjZy55TIeO1e.aXud4LD81awrYncaCKJoMsg/s0c.','instructor'),
UNLOCK TABLES;




LOCK TABLES `assignments` WRITE;
INSERT INTO `assignments` VALUES
  (0, 'ass-1','200',9999-12-31 23:59:59),
  (1, 'ass-2','100',9999-12-31 23:59:59),
UNLOCK TABLES;



LOCK TABLES `courses` WRITE;
INSERT INTO `courses` VALUES
  (0,'CS','493','clouds',2),
  (1,'Math','444','mathy',2)
UNLOCK TABLES;


LOCK TABLES `submissions` WRITE;
INSERT INTO `submissions` VALUES
  (0,0,1,1970-01-01 00:00:01,NULL),
UNLOCK TABLES;
