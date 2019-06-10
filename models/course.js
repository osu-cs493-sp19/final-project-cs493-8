const mysqlPool = require('../lib/mysqlPool');
const { extractValidFields } = require('../lib/validation');

/*
 * Schema describing required/optional fields of a Course object.
 */
const CourseSchema = {
  description: { required: true },
  subject: { required: true },
  number: { required: true },
  title: { required: true },
  term: { required: true },
  instructorId: { required: true }
};
exports.CourseSchema = CourseSchema;

function insertNewCourse(course){
  return new Promise((resolve, reject) => {
    newCourse = extractValidFields(course, CourseSchema);
    mysqlPool.query(
        'INSERT INTO courses SET ?',
        newCourse,
        (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result.insertId);
            }
        }
    );
  });
}
exports.insertNewCourse= insertNewCourse;

/*
 * Executes a MySQL query to fetch the total number of assignments.  Returns
 * a Promise that resolves to this count.
 */
function getCoursesCount() {
  return new Promise((resolve, reject) => {
    mysqlPool.query(
      'SELECT COUNT(*) AS count FROM courses',
      (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results[0].count);
        }
      }
    );
  });
}
exports.getCoursesCount = getCoursesCount;

function getCourses(offset, numPerPage) {
  return new Promise(async (resolve, reject) => {
    mysqlPool.query(
      'SELECT * FROM courses ORDER BY id LIMIT ?,?',
      [offset, numPerPage],
      (err, results) => {
        if (err){
          reject(err);
        }
        else {
          //console.log(results[0].id);
          resolve(results);
        }
      }
    );
  });
}
exports.getCourses = getCourses;

function getCourseByID(id) {
  return new Promise(async (resolve, reject) => {
    mysqlPool.query(
      'select * from courses where id=?',
      [id],
      (err, results) => {
        if (err) {
          reject(err);
        } else {
          console.log(results);
          resolve(results);
        }
      }
    );
  });
}
exports.getCourseByID = getCourseByID;

function updateCourseByID(courseID, course) {
  return new Promise((resolve, reject) => {
    mysqlPool.query(
      'UPDATE courses SET ? WHERE id = ?',
      [ course, courseID ],
      function (err, result) {
        if (err) {
          reject(err);
        } else {
          console.log(result);
          resolve(result.affectedRows > 0);
        }
      }
    );
  });
}
exports.updateCourseByID = updateCourseByID;


function deleteCourse(id){
  return new Promise((resolve, reject) => {
    mysqlPool.query(
      'DELETE FROM courses WHERE id = ?',
      [ id ],
      function (err, result) {
        if (err) {
          reject(err);
        } else {
          //console.log("resolve delete query", result);
          resolve(result.affectedRows > 0);
        }
      }
    );
  });
}
exports.deleteCourse = deleteCourse;

function getStudentIDsInCourse(id) {
  return new Promise(async (resolve, reject) => {
    mysqlPool.query(
      'SELECT enrollments.userId FROM enrollments JOIN users ON enrollments.userId=users.id AND enrollments.courseId=?',
      [id],
      (err, results) => {
        if (err) {
          reject(err);
        } else {
          console.log(results);
          resolve(results);
        }
      }
    );
  });
}
exports.getStudentIDsInCourse = getStudentIDsInCourse;

function getStudentsInCourse(id) {
  return new Promise(async (resolve, reject) => {
    mysqlPool.query(
      'SELECT enrollments.userId, users.name, users.email FROM enrollments JOIN users ON enrollments.userId=users.id AND enrollments.courseId=?',
      [id],
      (err, results) => {
        if (err) {
          reject(err);
        } else {
          console.log(results);
          resolve(results);
        }
      }
    );
  });
}
exports.getStudentsInCourse = getStudentsInCourse;

function isCourseInEnrollments(id) {
  return new Promise(async (resolve, reject) => {
    mysqlPool.query(
      'SELECT * FROM enrollments WHERE enrollments.courseId=?',
      [id],
      (err, results) => {
        if (err) {
          reject(err);
        } else {
          //console.log("in course", results);
          resolve(results);
        }
      }
    );
  });
}
exports.isCourseInEnrollments = isCourseInEnrollments;

function insertStudent(row) {
  return new Promise(async (resolve, reject) => {
    mysqlPool.query(
      'INSERT INTO enrollments SET ?',
      [row],
      (err, results) => {
        if (err) {
          reject(err);
        } else {
          //console.log("in course", results);
          resolve(results.insertId);
        }
      }
    );
  });
}
exports.insertStudent = insertStudent;

function unenrollStudent(courseid, userid) {
  return new Promise(async (resolve, reject) => {
    mysqlPool.query(
      'DELETE FROM enrollments where enrollments.courseId=? AND enrollments.userId=?',
      [courseid, userid],
      (err, results) => {
        if (err) {
          reject(err);
        } else {
          //console.log("in course", results);
          resolve(results);
        }
      }
    );
  });
}
exports.unenrollStudent = unenrollStudent;

function isCourseInAssignments(id) {
  return new Promise(async (resolve, reject) => {
    mysqlPool.query(
      'SELECT * FROM assignments WHERE assignments.courseId=?',
      [id],
      (err, results) => {
        if (err) {
          reject(err);
        } else {
          //console.log("in course", results);
          resolve(results);
        }
      }
    );
  });
}
exports.isCourseInAssignments = isCourseInAssignments;

function getAssignmentsInCourse(id) {
  return new Promise(async (resolve, reject) => {
    mysqlPool.query(
      'SELECT assignments.id FROM assignments WHERE assignments.courseId=?',
      [id],
      (err, results) => {
        if (err) {
          reject(err);
        } else {
          //console.log("in course", results);
          resolve(results);
        }
      }
    );
  });
}
exports.getAssignmentsInCourse = getAssignmentsInCourse;
