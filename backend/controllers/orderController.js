const express = require('express');
const Order = require('../models/Order');  // Correct import
 // Assuming the model path is correct

const router = express.Router();

router.get('/', (req, res) => {
    res.send('orderController handled this request!');
});

router.post('/create', async (req, res) => {
    // Extract data from request body
    const { user, products, total_amount, order_status, payment_status } = req.body;
    // Create a new order instance with the extracted data
    const order = new Order({
        user: user,
        products: products,
        total_amount: total_amount,
        order_status: order_status || 'Pending',  // Default to 'Pending' if no status is provided
        payment_status: payment_status || 'Pending'  // Default to 'Pending' if no status is provided
    });
    try {
        // Save the order to the database
        await order.save();
    } catch (error) {
        // If there is an error, send a 500 response with the error message
        return res.status(500).json({
            errors: [error],
            message: 'Something went wrong!',
            data: null
        });
    }
    // If successful, respond with the created order data
    res.status(200).json({
        errors: null,
        message: 'Order was created successfully!',
        data: order
    });
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;  // Extract the order ID from the URL
    try {
        // Find the order by ID
        const order = await Order.findById(id);
        // If the order is not found, return a 404 error
        if (!order) {
            return res.status(404).json({
                errors: null,
                message: 'Order not found!',
                data: null
            });
        }
        // Respond with the found order data
        res.status(200).json({
            errors: null,
            message: 'Order found successfully!',
            data: order
        });
    } catch (error) {
        res.status(500).json({
            errors: [error],
            message: 'Something went wrong!',
            data: null
        });
    }
});


router.put('/update/:id', async (req, res) => {
    const { id } = req.params;  // Extract the order ID from the URL
    const { user_id, product_id, quantity, status, total_price } = req.body;  // Data to update
    try {
        // Find the order by ID and update it
        const updatedOrder = await Order.findByIdAndUpdate(
            id, 
            { 
                user_id,        // User associated with the order
                product_id,     // Product being ordered
                quantity,       // Quantity of the product ordered
                status,         // Status of the order (e.g., "shipped", "pending")
                total_price     // Total price of the order
            }, 
            { new: true }  // Return the updated order
        );
        // If the order is not found, return a 404 error
        if (!updatedOrder) {
            return res.status(404).json({
                errors: null,
                message: 'Order not found!',
                data: null
            });
        }
        // Respond with the updated order data
        res.status(200).json({
            errors: null,
            message: 'Order updated successfully!',
            data: updatedOrder
        });
    } catch (error) {
        // Catch any errors and return a 500 response
        res.status(500).json({
            errors: [error],
            message: 'Something went wrong!',
            data: null
        });
    }
});

router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;  // Extract the order ID from the URL
    try {
        // Find and delete the order by ID
        const deletedOrder = await Order.findByIdAndDelete(id);

        // If the order is not found, return a 404 error
        if (!deletedOrder) {
            return res.status(404).json({
                errors: null,
                message: 'Order not found!',
                data: null
            });
        }
        // Respond with a success message and deleted order data
        res.status(200).json({
            errors: null,
            message: 'Order deleted successfully!',
            data: deletedOrder
        });
    } catch (error) {
        // Handle any errors
        res.status(500).json({
            errors: [error],
            message: 'Something went wrong!',
            data: null
        });
    }
});











// Export the router to be used in the main app
module.exports = router;