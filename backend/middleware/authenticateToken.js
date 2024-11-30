const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        
        if (!authHeader) {
            throw new Error('Authorization header missing!');
        }

        // Check if the token has the 'Bearer' part
        if (!authHeader.startsWith('Bearer ')) {
            throw new Error('Invalid token format! It should start with "Bearer ".');
        }

        const token = authHeader.split(' ')[1];  // Extract token from the Authorization header

        if (!token) {
            throw new Error('Token is missing after "Bearer "');
        }

        const user = jwt.verify(token, process.env.JWT_SECRET);

        req.user = user; // Attach user data to the request object
        next(); // Pass control to the next middleware or route handler
    } catch (error) {
        console.error(error);
        res.status(401).json({
            errors: [error.message],
            message: 'Not authorized!',
            data: null,
        });
    }
};

module.exports = authenticateToken;
