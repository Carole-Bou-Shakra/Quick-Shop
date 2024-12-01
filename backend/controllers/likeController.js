const express = require('express');
const router = express.Router();
const Like = require('../models/Like'); // Adjust path as necessary
const authenticateToken = require('../middleware/authenticateToken');  

// Example route to fetch reviews
router.get('/', (req, res) => {
    res.send('likeController handled this request!');
});

router.post('/create', authenticateToken, async (req, res) => {
    try {
      const { productId } = req.body;
      if (!productId) {
        throw new Error('Missing required fields!');
      }
  
      const userId = req.user.id; // User ID from the token
  
      const like = new Like({
        user: userId,
        product: productId
      });
  
      await like.save(); // Save the like in the database
  
      res.status(200).json({
        message: 'Like created!',
        data: like
      });
    } catch (error) {
      res.status(500).json({
        errors: [error.message],
        message: 'Something went wrong!',
        data: null
      });
    }
  });
  
router.get('/:id', async (req, res) => {
    const { id } = req.params; // Extract the Like ID from the URL
    try {
        // Find the like by ID
        const like = await Like.findById(id)
            .populate('user', 'name email') // Populate user details (customize fields as needed)
            .populate('product', 'name description'); // Populate product details (customize fields as needed)

        // If the like is not found, return a 404 error
        if (!like) {
            return res.status(404).json({
                errors: null,
                message: 'Like not found!',
                data: null
            });
        }

        // Respond with the found like data
        res.status(200).json({
            errors: null,
            message: 'Like found successfully!',
            data: like
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


router.get("/:userId/like", async (req, res) => {
    try {
        const { userId } = req.params;

        // Pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 3;
        const startIndex = (page - 1) * limit;

        console.log("User ID:", userId);
        console.log("Page:", page, "Limit:", limit, "StartIndex:", startIndex);

        // Find likes for the user
        const userLikes = await Like.find({ user: userId })
            .skip(startIndex)
            .limit(limit);

        // Check if likes are found
        if (userLikes.length === 0) {
            return res.status(404).json({
                errors: null,
                message: 'No likes found for this user.',
                data: []
            });
        }

        // Get total likes for pagination
        const total = await Like.countDocuments({ user: userId });
        const pages = Math.ceil(total / limit);

        res.status(200).json({
            page,
            limit,
            total,
            pages,
            data: userLikes,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            errors: [error.message],
            message: "Something went wrong!",
            data: null,
        });
    }
});




router.put('/update/:id', async (req, res) => {
    const { id } = req.params; // Extract the Like ID from the URL
    const { user, product, rating } = req.body; // Extract fields to update from the request body
    try {
        // Find the like by ID and update it
        const updatedLike = await Like.findByIdAndUpdate(
            id,
            {
                user,
                product,
              
            },
            { new: true } // Return the updated like
        );
        // If the like is not found, return a 404 error
        if (!updatedLike) {
            return res.status(404).json({
                errors: null,
                message: 'Like not found!',
                data: null
            });
        }
        // Respond with the updated like data
        res.status(200).json({
            errors: null,
            message: 'Like updated successfully!',
            data: updatedLike
        });
    } catch (error) {
        // Handle errors
        res.status(500).json({
            errors: [error.message],
            message: 'Something went wrong while updating the like!',
            data: null
        });
    }
});

router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params; // Extract the Like ID from the URL
    try {
        // Find and delete the like by ID
        const deletedLike = await Like.findByIdAndDelete(id);
        // If the like is not found, return a 404 error
        if (!deletedLike) {
            return res.status(404).json({
                errors: null,
                message: 'Like not found!',
                data: null
            });
        }

        // Respond with a success message and deleted like data
        res.status(200).json({
            errors: null,
            message: 'Like deleted successfully!',
            data: deletedLike
        });
    } catch (error) {
        // Handle any errors that occur
        res.status(500).json({
            errors: [error.message],
            message: 'Something went wrong while deleting the like!',
            data: null
        });
    }
});


module.exports = router;