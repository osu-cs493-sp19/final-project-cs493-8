const router = require('express').Router();

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
router.get('/test', async (req, res, next) => {
  res.status(200).send({
    error: "Test works!."
  });
});


module.exports = router;