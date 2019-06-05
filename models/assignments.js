/*
 * User schema and data accessor methods;
 */


const mysqlPool = require('../lib/mysqlPool');
const { extractValidFields } = require('../lib/validation');


/*
 * Schema describing required/optional fields of a business object.
 */
const AssignmentSchema = {
  courseId: { required: true },
  title: { required: true },
  points: { required: true },
  due: { required: true }
};

exports.AssignmentSchema = AssignmentSchema;

insertNewAssignment = async (assignment) =>{
    return new Promise(async (resolve, reject) => {
        assignment = extractValidFields(assignment, AssignmentSchema);
        assignment.description="nothing, not needed";
        mysqlPool.query(
            'INSERT INTO assignments SET ?',
            assignment,
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

exports.insertNewAssignment = insertNewAssignment;








getAssignmentById = async (id) => {
    return new Promise((resolve, reject) => {
        mysqlPool.query(
            'SELECT * FROM assignments WHERE assignments.id = ?',
            [ id ],
            (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            }
        );
    });
}

exports.getAssignmentById = getAssignmentById;

function replaceAssignmentById(id, newassignment) {
  return new Promise((resolve, reject) => {
    newassignment = extractValidFields(newassignment, AssignmentSchema);
    newassignment.description="nothing, not needed";
    mysqlPool.query(
      'UPDATE assignments SET ? WHERE id = ?',
      [ newassignment, id ],
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result.affectedRows > 0);
        }
      }
    );
  });
}

exports.replaceAssignmentById = replaceAssignmentById


function deleteAssignmentById(id){
    return new Promise((resolve, reject) => {
      mysqlPool.query(
        'DELETE FROM assignments WHERE id = ?',
        [  id ],
        (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result.affectedRows > 0);
          }
        }
      );
    });
  }


exports.deleteAssignmentById = deleteAssignmentById;


function getSubmissionsById(id){
  return new Promise((resolve, reject) => {
    mysqlPool.query(
      'SELECT assignmentId, studentId, timestamp, file FROM submissions join assignments on submissions.assignmentId = assignments.id WHERE assignments.id = ?',
      [  id ],
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          console.log(result)
          resolve(result);
        }
      }
    );
  });
}
exports.getSubmissionsById = getSubmissionsById;



/*
 * Executes a MySQL query to fetch the total number of assignments.  Returns
 * a Promise that resolves to this count.
 */
function getAssignmentsCount() {
  return new Promise((resolve, reject) => {
    mysqlPool.query(
      'SELECT COUNT(*) AS count FROM assignments',
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

/*
 * Executes a MySQL query to return a single page of assignments.  Returns a
 * Promise that resolves to an array containing the fetched page of assignments.
 */
function getAssignmentsPage(page, id) {
  return new Promise(async (resolve, reject) => {
    /*
     * Compute last page number and make sure page is within allowed bounds.
     * Compute offset into collection.
     */
     const count = await getAssignmentsCount();
     const pageSize = 10;
     const lastPage = Math.ceil(count / pageSize);
     page = page > lastPage ? lastPage : page;
     page = page < 1 ? 1 : page;
     const offset = (page - 1) * pageSize;

    mysqlPool.query(
      'SELECT assignmentId, studentId, timestamp, file FROM submissions join assignments on submissions.assignmentId = assignments.id WHERE assignments.id = ? ORDER BY submissions.studentId LIMIT ?,?',
      [ id, offset, pageSize ],
      (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            assignmentsubmissions: results,
            page: page,
            totalPages: lastPage,
            pageSize: pageSize,
            count: count
          });
        }
      }
    );
  });
}
exports.getAssignmentsPage = getAssignmentsPage;
