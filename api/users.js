const router = require('express').Router();

const {
  insertNewUser,
  UserSchema,
  getUserByEmail,
  getUserById,
  validateUser
} = require('../models/user');

const {
  getCoursesByInstructorId,
  getEnrollmentByStudentId,
} = require('../models/course');

const { generateAuthToken, requireAuthentication, requireAdmin } = require('../lib/auth');


const { validateAgainstSchema } = require('../lib/validation');


/*
 * Route to list all of a user's businesses.
 */
router.get('/test', requireAuthentication, async (req, res, next) => {
  res.status(200).send({
    user: req.user,
    role: req.role
  });
});


router.get('/:userId', requireAuthentication, async (req, res, next) => {
  const userId = req.params.userId;
  try {
    if(req.user !== parseInt(userId) && !(req.role == 'admin')){
      res.status(403).json({
        error: "Unauthorized to access the specified resource"
      });
    }else{
      const user = (await getUserById(userId, false))[0];
      console.log(user);
      console.log(userId);
      if(user.role == 'instructor'){
        user.classes = await getCoursesByInstructorId(userId);  
      } else if(user.role == 'student'){
        user.classes = await getEnrollmentByStudentId(userId);
      }

      if(user){
        res.status(200).send({
          user: user
        });
      }else{
        next();
      }
    }
  } catch(err){
    console.log(err);
    res.status(500).send({
      error: "Error getting user.  Try again later."
    });
  }
});

router.post('/', requireAdmin, async (req, res, next) => {
  if (validateAgainstSchema(req.body, UserSchema)) {
    try {
      if(!(typeof(variable) == "undefined") || !req.admin && (req.body.role === "admin" || req.body.role === "instructor")){
        res.status(403).json({
          error: "Unauthorized to create the specified resource"
        });
      }else{
        const userId = await insertNewUser(req.body);
        res.status(201).send({
          id: userId,
          links: {
            users: `/users/login`
          }
        });
      }
    } catch (err) {
      console.error(err);
      res.status(500).send({
        error: "Error inserting user into DB.  Please try again later."
      });
    }
  } else {
    res.status(400).send({
      error: "Request body is not a valid user object."
    });
  }
});

router.post('/login', async (req, res, next) => {
  if (req.body && req.body.email && req.body.password) {
    try {
      const authenticated = await validateUser(req.body.email, req.body.password);
      if(authenticated){
        const user = (await getUserByEmail(req.body.email, false))[0];
        const token = generateAuthToken(user.id);
        res.status(200).send({
          token: token
        });
      }else{
        res.status(401).send({
          error: "Invalid credentials"
        });
      }
    } catch(err) {
      console.log(err);
      res.status(500).send({
        error: "Error validating user.  Try again later."
      });
    }
  } else {
    res.status(400).send({
      error: "Request body was invalid"
    });
  }
});


module.exports = router;