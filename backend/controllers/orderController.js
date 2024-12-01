const express = require('express');
const Order = require('../models/Order');  // Correct import
const  Cart  = ('../models/Cart');
const mongoose = require('mongoose');
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
    const { user, productid, quantity, status, totalPrice, address, priceOfOne } = req.body;  // Extract fields from request body

    try {
        console.log(`Attempting to update order with ID: ${id}`); // Debugging log
        console.log(`Request Body: ${JSON.stringify(req.body)}`); // Log the request body to see what's being passed

        // Validate required fields
        if (!totalPrice || !address || !priceOfOne || totalPrice <= 0 || !Array.isArray(priceOfOne)) {
            return res.status(400).json({
                errors: ["totalPrice, address, and priceOfOne are required and must be valid"],
                message: "Something went wrong!",
                data: null
            });
        }

        // Ensure productid, quantity, and priceOfOne are arrays
        const productArray = Array.isArray(productid) ? productid : [productid];
        const quantityArray = Array.isArray(quantity) ? quantity : [quantity];
        const priceOfOneArray = Array.isArray(priceOfOne) ? priceOfOne : [priceOfOne];

        // Validate product IDs
        const validProductIds = productArray.map(pid => {
            if (mongoose.Types.ObjectId.isValid(pid)) {
                return new mongoose.Types.ObjectId(pid);
            } else {
                console.error(`Invalid ObjectId: ${pid}`);
                return null;
            }
        }).filter(Boolean); // Remove null values

        if (validProductIds.length === 0) {
            return res.status(400).json({
                errors: ["Invalid product ID(s) provided"],
                message: "Something went wrong!",
                data: null
            });
        }

        // Construct product data
        const productsData = validProductIds.map((pid, index) => ({
            productId: pid,
            quantity: quantityArray[index] || 1,  // Default to 1 if not provided
            priceOfOne: priceOfOneArray[index] || 0,  // Default to 0 if not provided
        }));

        // Attempt to update the order
        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            {
                user,
                products: productsData,
                status,
                totalPrice,
                address
            },
            { new: true, runValidators: true }  // Return updated document with validation
        );

        if (!updatedOrder) {
            console.log('Order not found! Creating a new order...'); // Debugging log
            const newOrder = new Order({
                user,
                products: productsData,
                status,
                totalPrice,
                address
            });
            await newOrder.save();

            return res.status(200).json({
                errors: null,
                message: 'Order not found! A new order was created.',
                data: newOrder
            });
        }

        // Respond with the updated order
        res.status(200).json({
            errors: null,
            message: 'Order updated successfully!',
            data: updatedOrder
        });
    } catch (error) {
        console.error("Error updating order:", error.message, error.stack); // Debugging log for error
        res.status(500).json({
            errors: [error.message],
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