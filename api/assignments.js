const router = require('express').Router();

const {
  AssignmentSchema,
  insertNewAssignment,
  getAssignmentById,
  replaceAssignmentById,
  deleteAssignmentById,
  getSubmissionsById,
  getAssignmentsPage,
  validcourseinstructor,
  validcourseinstructorById
} = require('../models/assignments');


const { generateAuthToken, requireAuthentication, requireAdmin } = require('../lib/auth');
const { validateAgainstSchema} = require('../lib/validation.js')

const crypto = require('crypto');

const validation = require('../lib/validation');

const fs = require('fs');

const multer = require('multer');


const mysqlPool = require('../lib/mysqlPool');

router.post('/'
,requireAuthentication
, async (req, res) => {
  //const status = await getAdminStatus(req.user);
  //console.log(status.admin);

  //Given userID and Course ID
  console.log(req.user);
  console.log(req.body.courseId);
  response = await validcourseinstructor(req.user,req.body.courseId);
  console.log(response);

  if ((req.role=='instructor' && response.length > 0) || req.role=='admin') {
    if (validateAgainstSchema(req.body, AssignmentSchema)) {
      try {
        const id = await insertNewAssignment(req.body);
        res.status(201).send({
          id: id
        });
      } catch (err) {
        console.error(err);
        res.status(500).send({
          error: "Error inserting assignment into DB.  Please try again later."
        });
      }
    } else {
      res.status(400).send({
        error: "Request body is not a valid assignemnt object."
      });
    }
  }
    else{
      res.status(403).send({
          error: "Unauthorized to access the specified resource"
        });
    }
});


router.get('/:id', async (req, res, next) => {
  try {
    const assignment = await getAssignmentById(parseInt(req.params.id));
    if (assignment) {
      res.status(200).send(assignment);
    } else {
      next();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Unable to fetch assignment.  Please try again later."
    });
  }
});

router.patch('/:id'
  ,requireAuthentication
  , async (req, res) => {

    response = await validcourseinstructor(req.user,req.body.courseId);
    //const status = await getAdminStatus(req.user);
    //console.log(status.admin);
    if ((req.role=='instructor' && response.length > 0) || req.role=='admin') {
      if (validateAgainstSchema(req.body, AssignmentSchema)) {
        try {
          const id = await replaceAssignmentById(req.params.id,req.body);
          res.status(201).send({
            happened: id
          });
        } catch (err) {
          console.error(err);
          res.status(500).send({
            error: "Error inserting assignment into DB.  Please try again later."
          });
        }
      } else {
        res.status(400).send({
          error: "Request body is not a valid assignemnt object."
        });
      }
  }
  else{
    res.status(403).send({
        error: "Unauthorized to access the specified resource"
      });
  }

});


router.delete('/:id'
  ,requireAuthentication
  , async (req, res) => {
    //const status = await getAdminStatus(req.user);
    //console.log(status.admin);
    response = await validcourseinstructorById(req.user,req.params.id);
    console.log(response);
  if ((req.role=='instructor' && response.length > 0) || req.role=='admin') {

        try {
          const id = await deleteAssignmentById(req.params.id);
          res.status(201).send({
            happened: id
          });
        } catch (err) {
          console.error(err);
          res.status(500).send({
            error: "Error inserting assignment into DB.  Please try again later."
          });
        }

    }
  else{
    res.status(403).send({
        error: "Unauthorized to access the specified resource"
      });
  }

});

router.get('/:id/submissions'
    ,requireAuthentication
    ,async (req, res, next) => {
      response = await validcourseinstructorById(req.user,req.params.id);
  if ((req.role=='instructor' && response.length > 0) || req.role=='admin') {

          try {
            //const submissions = await getSubmissionsById(req.params.id);


            const assignmentPage = await getAssignmentsPage(req.params.id, parseInt(req.query.page) || 1, req.body.studentId);
            assignmentPage.links = {};
            if (assignmentPage.page < assignmentPage.totalPages) {
              assignmentPage.links.nextPage = `/assignments?page=${assignmentPage.page + 1}`;
              assignmentPage.links.lastPage = `/assignments?page=${assignmentPage.totalPages}`;
            }
            if (assignmentPage.page > 1) {
              assignmentPage.links.prevPage = `/assignments?page=${assignmentPage.page - 1}`;
              assignmentPage.links.firstPage = '/assignments?page=1';
            }
            res.status(200).send(assignmentPage);

          } catch (err) {
            console.error(err);
            res.status(500).send({
              error: "Error inserting assignment into DB.  Please try again later."
            });
          }
        }
    else{
      res.status(403).send({
          error: "Unauthorized to access the specified resource"
        });
    }

});




/*const imageTypes = {
  'image/jpeg': 'jpg',
  'image/png': 'png'
};
const upload = multer({
  storage: multer.diskStorage({
    destination: `${__dirname}/uploads`,
    filename: (req, file, callback) => {
      const basename = crypto.pseudoRandomBytes(16).toString('hex');
      const extension = imageTypes[file.mimetype];
      callback(null, `${basename}.${extension}`);
    }
  }),
  fileFilter: (req, file, callback) => {
    callback(null, !!imageTypes[file.mimetype])
  }
});*/

const upload = multer({ dest: `${__dirname}/uploads` });

function removeUploadedFile(file) {
  return new Promise((resolve, reject) => {
    fs.unlink(file.path, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

function saveFile (file, submission) {

  return new Promise((resolve, reject) => {

    submission = extractValidFields(submission, AssignmentSchema);
    submission.file =  fs.readFileSync(file.path);
    mysqlPool.query(
      'INSERT INTO submissions SET ?',
      [ file ],
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result.affectedRows > 0);
        }
      }
    );
  });


};

router.post('/:id/submissions',
  //requireAuthentication,
upload.single('file'), async (req, res, next) => {
  //authentication stuffs
  //authenticated
  //student role
  //in this course

  //if (validateAgainstSchema(req.body, SubmissionSchema)) {
    try {
        const file = {
          path: req.file.path,
          filename: req.file.filename,
          contentType: req.file.mimetype,
          userId: req.body.userId
        };
        console.log("FIRST IMAGE")
        console.log(file);
        //const id = await saveFile(file, req.body);
        //await removeUploadedFile(req.file);

       res.status(200).send({
           file: req.file
        });
      } catch (err) {
        next(err);
      }
  //}

});

module.exports = router;
