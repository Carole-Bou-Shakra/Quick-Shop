const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the schema for an Order
const OrderSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',  // Assuming you have a User model
        required: true
    },
    products: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',  // Reference to Product model
                required: true
            },
            quantity: {
                type: Number,
                required: true
            },
            total_price: {
                type: Number,
                required: true
            }
        }
    ],
    total_amount: {
        type: Number,
        required: true
    },
    order_status: {
        type: String,
        enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },
    payment_status: {
        type: String,
        enum: ['Pending', 'Paid'],
        default: 'Pending'
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
