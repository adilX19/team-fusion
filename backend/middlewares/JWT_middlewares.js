const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const { JWT_SECRET } = process.env;

// Middleware to verify JWT
const verifyToken = (request, response, next) => {
    // const token = request.cookies.token; // Retrieve token from cookies
    // for dev testing
    const token = request.headers.authorization?.split(' ')[1];
    console.log(token)

    if (!token) {
        return response.status(401).json({ error: 'Unauthorized, token missing' });
    }

    // Verify token
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            console.log("Error", err)
            return response.status(403).json({ error: 'Token is invalid or expired' });
        }
        request.user = decoded; // Attach decoded token data to request
        next();
    });
};

module.exports = verifyToken;
