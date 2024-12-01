const express = require('express');
const Order = require('../models/Order');  // Correct import
const  Cart  = ('../models/Cart');

const  Product = ('../models/Product');
 // Assuming the model path is correct

 const authenticateToken = require('../middleware/authenticateToken'); 

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
        console.log(`Attempting to update order with ID: ${id}`); // Debugging log

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

        console.log(updatedOrder);  // Debugging log to show the updated order

        // If the order is not found, return a 404 error
        if (!updatedOrder) {
            console.log('Order not found!'); // Debugging log
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
        console.error(error);  // Debugging log for error
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

router.post('/create', authenticateToken, async (req, res) => {
    try {
        console.log("User:", req.user);

        const userId = req.user.id;

        // Check if the cart is empty
        const cart = await Cart.findOne({ user: userId });
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                errors: ["Cart is empty or not found!"],
                message: "Cart is empty.",
                data: null,
            });
        }

        const cartItems = cart.items;
        const productIds = cartItems.map(item => item.product);

        // Fetch products from the database
        const products = await Product.find({ _id: { $in: productIds } });

        // Map cart items to order products, including priceOfOne
        const orderProducts = cartItems.map((cartItem) => {
            const targetProduct = products.find(product =>
                product._id.toString() === cartItem.product.toString()
            );

            if (!targetProduct) {
                throw new Error(`Product with ID ${cartItem.product} not found!`);
            }

            return {
                productId: cartItem.product,
                quantity: cartItem.quantity,
                name: targetProduct.name,
                pictures: targetProduct.pictures,
                priceOfOne: targetProduct.price,  // Add the price for the product
            };
        });

        // Calculate total amount for the order
        const totalAmount = cartItems.reduce((total, cartItem) => {
            const targetProduct = products.find(product =>
                product._id.toString() === cartItem.product.toString()
            );
            return total + cartItem.quantity * (targetProduct?.price || 0);
        }, 0);

        // Prepare the order data with necessary fields
        const newOrder = {
            user: userId,        // The user ID (from the authenticated user)
            products: orderProducts,
            totalAmount,         // The total amount for the order
            status: "Pending",   // Default status for the order
            address: req.body.address, // Address from the request body
            totalPrice: totalAmount, // Total price calculated
        };

        console.log("New Order:", newOrder);

        // Save the new order to the database
        const order = new Order(newOrder);
        await order.save();

        // Populate the products in the saved order
        const populatedOrder = await Order.findById(order._id).populate({
            path: 'products.productId',
            select: 'name pictures price',
        });

        // Clear the cart after the order is placed
        await Cart.findOneAndUpdate(
            { user: userId },
            { $set: { items: [] } },
            { new: true }
        );

        // Return a successful response with the order data
        res.status(200).json({
            errors: null,
            message: "Order created successfully!",
            data: populatedOrder,
        });
    } catch (error) {
        console.error("Error in /create:", error.message);
        res.status(500).json({
            errors: [error.message],
            message: "Something went wrong!",
            data: null,
        });
    }
});









// Export the router to be used in the main app
module.exports = router;