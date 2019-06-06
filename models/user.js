/*
 * User schema and data accessor methods;
 */
const bcrypt = require('bcryptjs');

const mysqlPool = require('../lib/mysqlPool');
const { extractValidFields } = require('../lib/validation');


/*
 * Schema describing required/optional fields of a business object.
 */

const UserSchema = {
  name: { required: true },
  email: { required: true },
  password: { required: true },
  role: { required: true }
};

exports.UserSchema = UserSchema;

insertNewUser = async (user) =>{
    return new Promise(async (resolve, reject) => {
        user = extractValidFields(user, UserSchema);
        user.password = await bcrypt.hash(user.password, 8);
        user.id = null;
        mysqlPool.query(
            'INSERT INTO users SET ?',
            user,
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

exports.insertNewUser = insertNewUser;

getUserByEmail = async (email, includePassword) => {
    return new Promise((resolve, reject) => {
        mysqlPool.query(
            'SELECT' + (includePassword ? ' * ' : ' id, name, email, role ') + 'FROM users WHERE email = ?',
            [ email ],
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

exports.getUserByEmail = getUserByEmail;

getUserById = async (id, includePassword) => {
    return new Promise((resolve, reject) => {
        mysqlPool.query(
            'SELECT' + (includePassword ? ' * ' : ' id, name, email, role ') + 'FROM users WHERE id = ?',
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

exports.getUserById = getUserById;

validateUser = async (email, password) => {
    let user = (await getUserByEmail(email, true))[0];
    const authenticated = user && await bcrypt.compare(password, user.password);
    return authenticated;
}

exports.validateUser = validateUser;

