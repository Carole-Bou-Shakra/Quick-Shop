const express = require('express');
const router = express.Router();
const Review = require('../models/Review'); // Adjust path as necessary

// Example route to fetch reviews
router.get('/', (req, res) => {
    res.send('reviewController handled this request!');
});

    // Extract data from the request body
    router.post('/create', async (req, res) => {
    const { user, product, rating, comment } = req.body;
    // Create a new Review instance
    const review = new Review({
        user,
        product,
        rating,
        comment
    });
    try {
        // Save the review to the database
        await review.save();

        // Respond with success
        res.status(200).json({
            errors: null,
            message: 'Review was created successfully!',
            data: review
        });
    } catch (error) {
        // Handle errors during saving
        res.status(500).json({
            errors: [error.message],
            message: 'Something went wrong while creating the review!',
            data: null
        });
    }
});

router.get('/:id', async (req, res) => {
    const { id } = req.params; // Extract the review ID from the URL
    try {
        // Find the review by ID
        const review = await Review.findById(id)
            .populate('user', 'name email') // Populate user details (customize fields as needed)
            .populate('product', 'name description'); // Populate product details (customize fields as needed)

        // If the review is not found, return a 404 error
        if (!review) {
            return res.status(404).json({
                errors: null,
                message: 'Review not found!',
                data: null
            });
        }

        // Respond with the found review data
        res.status(200).json({
            errors: null,
            message: 'Review found successfully!',
            data: review
        });
    } catch (error) {
        // Handle errors
        res.status(500).json({
            errors: [error.message],
            message: 'Something went wrong!',
            data: null
        });
    }
});

router.put('/update/:id', async (req, res) => {
    const { id } = req.params; // Extract the review ID from the URL
    const { user, product, rating, comment } = req.body; // Extract fields to update from the request body
    try {
        // Find the review by ID and update it
        const updatedReview = await Review.findByIdAndUpdate(
            id,
            {
                user,
                product,
                rating,
                comment
            },
            { new: true } // Return the updated review
        );
        // If the review is not found, return a 404 error
        if (!updatedReview) {
            return res.status(404).json({
                errors: null,
                message: 'Review not found!',
                data: null
            });
        }
        // Respond with the updated review data
        res.status(200).json({
            errors: null,
            message: 'Review updated successfully!',
            data: updatedReview
        });
    } catch (error) {
        // Handle errors
        res.status(500).json({
            errors: [error.message],
            message: 'Something went wrong while updating the review!',
            data: null
        });
    }
});

router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params; // Extract the review ID from the URL
    try {
        // Find and delete the review by ID
        const deletedReview = await Review.findByIdAndDelete(id);
        // If the review is not found, return a 404 error
        if (!deletedReview) {
            return res.status(404).json({
                errors: null,
                message: 'Review not found!',
                data: null
            });
        }
        // Respond with a success message and deleted review data
        res.status(200).json({
            errors: null,
            message: 'Review deleted successfully!',
            data: deletedReview
        });
    } catch (error) {
        // Handle any errors that occur
        res.status(500).json({
            errors: [error.message],
            message: 'Something went wrong while deleting the review!',
            data: null
        });
    }
});

// Export the router
module.exports = router;
