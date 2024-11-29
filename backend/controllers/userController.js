const express = require('express');
const { User } = require('../models/User'); // Assuming the model path is correct

const authenticateToken = require('../middleware/authenticateToken'); 
const signToken = require('../utils/signToken');

const router = express.Router();

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'carole 123'; // Replace with your actual secret key


router.get('/', (req, res) => {
    res.send('userController handled this request!');
});


router.post('/create', async (req, res) => {
    // Extract from request
    const { password, email, name } = req.body;

    // Hash the password before saving the user
    try {
        const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

        const user = new User({
            name: name,
            password: hashedPassword, // Save the hashed password
            email: email
        });

        await user.save();

        // Return the response with the signed token
        res.status(200).json({
            errors: null,
            message: 'User was created successfully!',
            data: signToken(user)
        });
    } catch (error) {
        // Handle errors, especially if there is an issue with saving to the database
        res.status(500).json({
            errors: [error],
            message: 'Something went wrong!',
            data: null
        });
    }
});


router.put('/update/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;  // Extract the user ID from the URL
    const { password, email, name } = req.body;  // Extract the data to update from the request body

    // Ensure the user is trying to update their own data
    if (id !== req.user.id) {
        return res.status(403).json({
            errors: ['You are not authorized to update this user.'],
            message: 'Forbidden!',
            data: null
        });
    }
    // Create an object with the data to be updated
    const updatedUserData = {
        name: name,
        password: password,
        email: email
    };

    try {
        // Attempt to find the user by ID and update the data
        const updatedUser = await User.findByIdAndUpdate(id, updatedUserData, { new: true });

        // Check if the user was not found
        if (!updatedUser) {
            return res.status(404).json({
                errors: null,
                message: 'User not found!',
                data: null
            });
        }
        // Generate a JWT token after user creation
        const token = jwt.sign({  id: updatedUser._id }, 'JWT_Secret', { expiresIn: '1h' });

        // Respond with the updated user data
        res.status(200).json({
            errors: null,
            message: 'User was updated successfully!',
            data: updatedUser,
            token: token
        });

    } catch (error) {
        // Handle errors and send a response
        res.status(500).json({
            errors: [error],
            message: 'Something went wrong!',
            data: null
        });
    }
});


// New Login Endpoint
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ email });

        // If user not found or password doesn't match
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({
                errors: null,
                message: 'Invalid email or password!',
                data: null
            });
        }

        // Generate JWT token with user details
        const token = signToken(user);

        // Send response with user data and token
        res.status(200).json({
            errors: null,
            message: 'Login successful!',
            data: {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                },
                token, // Include the token in the response
            }
        });
    } catch (error) {
        res.status(500).json({
            errors: [error],
            message: 'Something went wrong!',
            data: null
        });
    }
});




router.delete('/delete/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;  // Extract the user ID from the URL

    // Ensure the user is trying to delete their own data
    if (id !== req.user.id) {
        return res.status(403).json({
            errors: ['You are not authorized to delete this user.'],
            message: 'Forbidden!',
            data: null
        });
    }
    try {
        // Attempt to find and delete the user by ID
        const deletedUser = await User.findByIdAndDelete(id);

        // Check if the user was not found
        if (!deletedUser) {
            return res.status(404).json({
                errors: null,
                message: 'User not found!',
                data: null
            });
        }
        // Respond with a message indicating successful deletion
        res.status(200).json({
            errors: null,
            message: 'User was deleted successfully!',
            data: deletedUser
        });
    } catch (error) {
        // Handle errors and send a response
        res.status(500).json({
            errors: [error],
            message: 'Something went wrong!',
            data: null
        });
    }
});

router.get('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;  // Extract the user ID from the URL

    // Ensure the user is trying to access their own data
    if (id !== req.user.id) {
        return res.status(403).json({
            errors: ['You are not authorized to access this user data.'],
            message: 'Forbidden!',
            data: null
        });
    }

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                errors: null,
                message: 'User not found!',
                data: null
            });
        }
        // Issue a new token (optional)
        const token = jwt.sign({ id: user._id }, 'JWT_Secret', { expiresIn: '1h' });

        res.status(200).json({
            errors: null,
            message: 'User found successfully!',
            data: user,
            token: token // Send the new token in the response
        });
    } catch (error) {
        res.status(500).json({
            errors: [error],
            message: 'Something went wrong!',
            data: null
        });
    }
});


module.exports = router;
