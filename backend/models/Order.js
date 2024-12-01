const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the schema for an Order
const OrderSchema = new Schema({
    products: [
        {
            product: {
                type: Schema.Types.ObjectId,
                ref: 'Product'
            },
            quantity: {
                type: Number,
                required: true,
                default: 1
            },
            priceOfOne: {
                type: Number,
                required: true
            }
        }
    ],
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    address: {
        type: String,
        required: true,
    },
    totalPrice: {
        type: Number,
        required: true
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
});



// Create a model for the Order schema
const Order = mongoose.model('Order', OrderSchema);

// Export the model
module.exports = Order;
