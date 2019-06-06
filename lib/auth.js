const jwt = require('jsonwebtoken');
const { getUserById } = require('../models/user');
const secretKey = 'SuperSecret';

generateAuthToken = (userId) => {
    const payload = {sub: userId};
    return jwt.sign(payload, secretKey, {expiresIn: '24h'});
}

exports.generateAuthToken = generateAuthToken;

requireAuthentication = async (req, res, next) => {
    const authHeader = req.get('Authorization') || '';
    const authHeaderParts = authHeader.split(' ');
    const token = authHeaderParts[0] === 'Bearer' ? authHeaderParts[1] : null;
    try {
        const payload = jwt.verify(token, secretKey);
        req.user = payload.sub;
        req.role = (await getUserById(req.user, true))[0].role;
        next();
    } catch (err) {
        res.status(401).json({
            error: "Invalid authentication token provided."
        });  
    }
}

exports.requireAuthentication = requireAuthentication;

requireAdmin = async (req, res, next) => {
    const authHeader = req.get('Authorization') || '';
    const authHeaderParts = authHeader.split(' ');
    const token = authHeaderParts[0] === 'Bearer' ? authHeaderParts[1] : null;
    try {
        const payload = jwt.verify(token, secretKey);
        req.user = payload.sub;
        req.admin = (await getUserById(req.user, true))[0].role === 'admin' ? 1 : 0;
        next();
    } catch (err) {
        req.admin = 0;
        next();
    }
}

exports.requireAdmin = requireAdmin;