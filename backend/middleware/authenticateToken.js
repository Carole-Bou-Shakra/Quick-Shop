const jwt = require('jsonwebtoken');
require('dotenv').config(); // Make sure this is at the top, before using process.env

const JWT_SECRET = process.env.JWT_SECRET;

const authenticateToken = (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        
        if (!authHeader) {
            console.log('Authorization header missing!');
            return res.status(400).json({
                message: 'Authorization header missing!',
                data: null,
            });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            console.log('Token is missing or invalid!');
            return res.status(400).json({
                message: 'Invalid authorization token!',
                data: null,
            });
        }

        // Log the token to verify it's being passed correctly
        console.log('Received Token:', token);

        // Verify the token and decode the user
        const user = jwt.verify(token, JWT_SECRET);  // Use JWT_SECRET directly

        // Log the decoded user to verify it's correct
        console.log('Decoded user:', user);

        // Attach the user to the request object
        req.user = user;
        next();
    } catch (error) {
        console.error('Authentication Error:', error.message);  // Log the exact error message

        res.status(401).json({
            errors: [error.message],  // Send the specific error message from JWT
            message: 'Not authorized!',
            data: null,
        });
    }
};

module.exports = authenticateToken;


