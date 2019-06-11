const router = require('express').Router();

const { generateAuthToken, requireAuthentication, requireAdmin } = require('../lib/auth');
const {
  getUserById
} = require('../models/user');
const { validateAgainstSchema} = require('../lib/validation.js')

const crypto = require('crypto');

const validation = require('../lib/validation');

const fs = require('fs');

const multer = require('multer');

const mysqlPool = require('../lib/mysqlPool');

const {
  CourseSchema,
  getCourses,
  getCoursesCount,
  getCourseByID,
  updateCourseByID,
  insertNewCourse,
  deleteCourse,
  getStudentIDsInCourse,
  getStudentsInCourse,
  insertStudent,
  unenrollStudent,
  isCourseInEnrollments,
  isCourseInAssignments,
  getAssignmentsInCourse
} = require('../models/course');

var json2csv = require('json2csv').parse;

/*
 * Route to insert a new course. Admin authorization needed.
 */
router.post('/', requireAdmin, async (req, res) => {
  console.log("status admin", req.admin);
  if (req.admin) {
    try {
      if (validateAgainstSchema(req.body, CourseSchema)) {
        const id = await insertNewCourse(req.body);
        res.status(201).send({
          id: id
        });
      } else {
        res.status(400).send({
          error: "The request body was either not present or did not contain a valid Course object."
        });
      }
    }  catch (err) {
      console.error(err);
      res.status(500).send({
        error: "Error inserting course into DB.  Please try again later."
      });
    }
  } else{
    res.status(403).send({
      error: "Unauthorized to access the specified resource"
    });
  }
});

/*
 * Route to get all courses. No authorization needed. Paginated response.
 */
router.get('/', async (req, res) => {
  let page = parseInt(req.query.page) || 1;
  const numPerPage = 10;
  try {
    const length = await getCoursesCount();
    console.log("Try: ", length);
    const lastPage = Math.ceil(length / numPerPage);
    page = page < 1 ? 1 : page;
    page = page > lastPage ? lastPage : page;
    const offset = (page - 1) *numPerPage;/*
     * Calculate starting and ending indices of businesses on requested page and
     * slice out the corresponsing sub-array of busibesses.
     */
    const start = (page - 1) * numPerPage;
    const end = start + numPerPage;
    //const pageBusinesses = businesses.slice(start, end);

    /*
     * Generate HATEOAS links for surrounding pages.
     */
    const links = {};
    if (page < lastPage) {
      links.nextPage = `/courses?page=${page + 1}`;
      links.lastPage = `/courses?page=${lastPage}`;
    }
    if (page > 1) {
      links.prevPage = `/courses?page=${page - 1}`;
      links.firstPage = '/courses?page=1';
    }

    /*
     * Construct and send response.
     */

    //reference error if you use businesses
    const courses = await getCourses(offset, numPerPage);
    res.status(200).json({
      courses: courses,
      pageNumber: page,
      totalPages: lastPage,
      pageSize: numPerPage,
      totalCount: courses.length,
      links: links
    });

  } catch (err) {
    console.log("error", err);
    res.status(500).send("Error getting courses.");
  }
});

/*
 * Route to fetch info about a specific course.
 */
router.get('/:courseid', async (req, res) => {
  const id = parseInt(req.params.courseid);
  try {
    const validID = await getCourseByID(id);
    if (validID[0]) {
      res.status(200).send(validID);
    } else {
      res.status(400).send("Error: not a valid course ID");
    }
  } catch (err) {
    console.log(" -- Error: ", err);
    res.status(500).send({
      error: "Error fetching course, try again."
    });
  }
});

/*
 * Route to replace data for a course.
 */
 router.patch('/:id', requireAuthentication, async (req, res) => {
   const courseid = parseInt(req.params.id);
   try {
     const validCourse = await getCourseByID(courseid);
     console.log(validCourse);
     if (validCourse[0]) {
       if (req.user === validCourse[0].instructorId || req.role === "admin"){
         if (validation.validateAgainstSchema(req.body, CourseSchema)) {
           console.log("valid body request and ID");
           const updatedCourse = validation.extractValidFields(req.body, CourseSchema);
           const updateSuccessful = await updateCourseByID(courseid, updatedCourse);
           if (updateSuccessful) {
             res.status(200).send("Success - Verify by getting course with the same ID");
           } else {
             res.status(500).send({
               error: "Request was not successful. Try again."
             });
           }
         } else {
           res.status(400).send({
             error: "Request doesn't have a valid request body."
           });
         }
       }  else {
         res.status(403).send({
           error: "Unauthorized to access the specified resource"
         });
       }
     }  else {
       console.log("not a valid business id");
       res.status(404).send({
         error: "Error replacing course. Try again. Not a valid ID."
       });
     }
   } catch (err) {
       console.log(" -- Error: ", err);
       res.status(500).send({
         error: "Error putting business. Try again."
       });
     }
   });

/*
 * Route to delete a course.
 */
router.delete('/:id', requireAuthentication, async (req, res) => {
  console.log(req.role);
  if (req.role === "admin"){
    try {
      const id = parseInt(req.params.id);
      const validId = await getCourseByID(id);
      if (validId[0]) {

        //const deleteStudents = await deleteStudentsByCourseID(id);
        //const deleteAssignments = await deleteAssignmentsByCourseID(id);
        const deleteSuccessful = await deleteCourse(id);
        console.log("deleteSuccessful: ", deleteSuccessful);
        if (deleteSuccessful) {
             res.status(204).end();
        } else {
            next();
        }
      } else {
        res.status(404).send("Specified Course " + id + " not found.");
      }
    } catch (err) {
      console.log(err);
        res.status(500).send({
          error: "Unable to delete course."
        });
    }
  } else {
      res.status(403).send({
        error: "Unauthorized to access the specified resource"
      });
    }
});

/*
 * Route to fetch a list of students enrolled in a specific course.
 */
router.get('/:courseid/students', requireAuthentication, async (req, res) => {
  //console.log("req.role", req.role);
  if (req.role === "admin" || req.role === "instructor"){
    console.log("req.role", req.role);
    const id = parseInt(req.params.courseid);
    try {
      const ifCourse = await isCourseInEnrollments(id);
      console.log("ifCourse", ifCourse[0]);
      if (ifCourse[0]) {
        const students = await getStudentIDsInCourse(id);
        if (students) {
          res.status(200).send({students: students});
        }
      } else {
        res.status(404).send("Specified Course " + id + " not found.");
      }

    } catch (err) {
      console.log(" -- Error: ", err);
      res.status(500).send({
        error: "Error fetching course, try again."
      });
    }
  } else {
    res.status(403).send({
      error: "Unauthorized to access the specified resource"
    });
  }
});

/*
 * Route to insert students enrolled in a specific course.
 */
router.post('/:courseid/students', requireAuthentication, async (req, res) => {
  console.log("in insert");
  if (req.role === "admin" || req.role === "instructor"){
    const id = parseInt(req.params.courseid);
    try {
      const isValidCourse = await getCourseByID(id);
      //console.log("isvalid course = ", isValidCourse);
      if (isValidCourse[0]) {
        if (req.body.userid) {
          const insertValue = {};
          //insertValue.id = NULL;
          insertValue.courseid = id;
          insertValue.userid = req.body.userid;
          const success = await insertStudent(insertValue);
          if (success) {
            res.status(200).send({ id: success });
          } else {
            res.status(500).send("Error inserting new student to a course.");
          }
        } else {
          res.status(400).send("The request body was either not present or invalid.");
        }
      } else {
        res.status(404).send("Specified Course " + id + " not found.");
      }
    } catch (err) {
      console.log(" -- Error: ", err);
      res.status(500).send({
        error: "Error inserting student to a course, try again."
      });
    }
  } else {
    res.status(403).send({
      error: "Unauthorized to access the specified resource"
    });
  }
});

/*
 * Route to unenroll a student in a specific course.
 */
router.delete('/:courseid/students', requireAuthentication, async (req, res) => {
  console.log("in delete");
  if (req.role === "admin" || req.role === "instructor"){
    const id = parseInt(req.params.courseid);
    try {
      const isValidCourse = await getCourseByID(id);
      //console.log("isvalid course = ", isValidCourse);
      if (isValidCourse[0]) {
        if (req.body.userid) {
          const success = await unenrollStudent(id, req.body.userid);
          console.log(success);
          if (success) {
            res.status(200).send({ id: success });
          } else {
            res.status(500).send("Error deleting a student from a course.");
          }
        } else {
          res.status(400).send("The request body was either not present or invalid.");
        }
      } else {
        res.status(404).send("Specified Course " + id + " not found.");
      }
    } catch (err) {
      console.log(" -- Error: ", err);
      res.status(500).send({
        error: "Error deleting a student from a course, try again."
      });
    }
  } else {
    res.status(403).send({
      error: "Unauthorized to access the specified resource"
    });
  }
});

/*
 * Route to fetch a list of assignments associated with a specific course.
 */
 router.get('/:courseid/assignments', async (req, res) => {
   const id = parseInt(req.params.courseid);
   try {
     const ifCourse = await isCourseInAssignments(id);
     console.log("ifCourse", ifCourse[0]);
     if (ifCourse[0]) {
       const assignments = await getAssignmentsInCourse(id);
       if (assignments) {
         res.status(200).send({assignments: assignments});
       }
     } else {
       res.status(404).send("Specified Course " + id + " not found.");
     }
   } catch (err) {
     console.log(" -- Error: ", err);
     res.status(500).send({
       error: "Error fetching course, try again."
     });
   }

 });

 router.get('/:courseid/roster', requireAuthentication, async (req,res) => {
   const id = parseInt(req.params.courseid);
   try {
     const validCourse = await getCourseByID(id);
     console.log("validCourse\n", validCourse);
     if (validCourse[0]) {
       if (req.user === validCourse[0].instructorId || req.role === "admin"){
         const students = await getStudentsInCourse(id);

         if (students[0]) {
           //var json2Convert = {};
           //json2Convert.students = students;
           stringStudents = JSON.stringify(students);
           var json =  JSON.parse(stringStudents);
           console.log(json);

           var filename = "courseId" + id + "roster.csv";
           console.log(filename);
           const fields = ['userId', 'name', 'email'];
           const csv = json2csv(json, fields);
           console.log("CSV\n", csv);
           //write csv file
           fs.writeFile(filename, csv, 'utf8', function(err) {
             if (err) throw err;
             console.log("wrote file");
             //res.status(200).send(csv);
           });

           res.attachment(filename);
           res.status(200).send(csv);


         } else {
           res.status(400).send("No students in the course");
         }
       } else {
         res.status(403).send({
           error: "Unauthorized to access the specified resource"
         });
       }
     } else {
       res.status(404).send("Specified Course " + id + " not found.");
     }
   } catch (err) {
     console.log(" -- Error: ", err);
     res.status(500).send({
       error: "Error generating course roster, try again."
     });
   }
 });

module.exports = router;
