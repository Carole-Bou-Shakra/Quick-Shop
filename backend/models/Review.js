const mongoose = require('mongoose');
const { Schema } = mongoose;

const ReviewSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,  // Reference to User model (assuming you have a User model)
        required: true,
        ref: 'User',  // Reference to the User model
    },
    product: {
        type: Schema.Types.ObjectId,  // Reference to Product model
        required: true,
        ref: 'Product',  // Reference to the Product model
    },
    rating: {
        type: Number,
        required: true,
        min: 1,  // Assuming ratings are between 1 and 5
        max: 5,
    },
    comment: {
        type: String,
        required: true,
        minlength: 5,  // Assuming comments should be at least 5 characters
    },
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
});

const Review = mongoose.model('Review', ReviewSchema);

module.exports = Review;
