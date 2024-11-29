const mongoose = require('mongoose');
const { Schema } = mongoose;

const LikeSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,  // Reference to User model
        required: true,
        ref: 'User',  // Reference to the User model
    },
    product: {
        type: Schema.Types.ObjectId,  // Reference to Product model
        required: true,
        ref: 'Product',  // Reference to the Product model
    },
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
});

const Like = mongoose.model('Like', LikeSchema);

module.exports = Like;
