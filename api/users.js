const router = require('express').Router();

const { getBusinessesByOwnerId } = require('../models/business');
const { getReviewsByUserId } = require('../models/review');
const { getPhotosByUserId } = require('../models/photo');
const {
  insertNewUser,
  UserSchema,
  getUserByEmail,
  getUserById,
  validateUser
} = require('../models/user');

const { generateAuthToken, requireAuthentication, requireAdmin } = require('../lib/auth');


const { validateAgainstSchema } = require('../lib/validation');


/*
 * Route to list all of a user's businesses.
 */
router.get('/:id/businesses', requireAuthentication, async (req, res, next) => {
  try {
    req.admin = (await getUserById(req.user, true))[0].admin;
    if (req.user !== parseInt(req.params.id) && !req.admin) {
      res.status(403).json({
        error: "Unauthorized to access the specified resource"
      });
    } else {          
      const businesses = await getBusinessesByOwnerId(parseInt(req.params.id));
      if (businesses) {
        res.status(200).send({ businesses: businesses });
      } else {
        next();
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Unable to fetch businesses.  Please try again later."
    });
  }
});

/*
 * Route to list all of a user's reviews.
 */
router.get('/:id/reviews', requireAuthentication, async (req, res, next) => {
  try {
    req.admin = (await getUserById(req.user, true))[0].admin;
    if (req.user !== parseInt(req.params.id) &&! req.admin) {
      res.status(403).json({
        error: "Unauthorized to access the specified resource"
      });
    } else {
      const reviews = await getReviewsByUserId(parseInt(req.params.id));
      if (reviews) {
        res.status(200).send({ reviews: reviews });
      } else {
        next();
      }  
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Unable to fetch reviews.  Please try again later."
    });
  }
});

/*
 * Route to list all of a user's photos.
 */
router.get('/:id/photos', requireAuthentication, async (req, res, next) => {
  try {
    req.admin = (await getUserById(req.user, true))[0].admin;
    if (req.user !== parseInt(req.params.id) && !req.admin) {
      res.status(403).json({
        error: "Unauthorized to access the specified resource"
      });
    } else {          
      const photos = await getPhotosByUserId(parseInt(req.params.id));
      if (photos) {
        res.status(200).send({ photos: photos });
      } else {
        next();
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Unable to fetch photos.  Please try again later."
    });
  }
});

router.post('/', requireAdmin, async (req, res, next) => {
  if (validateAgainstSchema(req.body, UserSchema)) {
    try {
      if(!(typeof(variable) == "undefined") || !req.admin && req.body.admin){
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

router.get('/:userId', requireAuthentication, async (req, res, next) => {
  const userId = req.params.userId;
  try {
    req.admin = (await getUserById(req.user, true))[0].admin;
    if(req.user !== parseInt(userId) && !req.admin){
      res.status(403).json({
        error: "Unauthorized to access the specified resource"
      });
    }else{
      const user = (await getUserById(userId, false))[0];
      console.log(user);
      console.log(userId);
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

module.exports = router;