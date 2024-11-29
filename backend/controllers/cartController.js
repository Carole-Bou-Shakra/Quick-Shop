const express = require('express');
const Cart = require('../models/Cart');  // Correct import
 // Assuming the model path is correct
 const authenticateToken = require('../middleware/authenticateToken'); 
 const Product = require('../models/Product');
 const mongoose = require('mongoose');


const router = express.Router();

router.get('/', (req, res) => {
    res.send('cartController handled this request!');
});

router.post('/create', async (req, res) => {
    const { user, products } = req.body; // Extract user and product details from request body
    // Ensure products is an array of objects, each containing product id, quantity, and total_price
    if (!Array.isArray(products) || products.length === 0) {
        return res.status(400).json({
            errors: ['Products array is required and cannot be empty.'],
            message: 'Invalid request.',
            data: null
        });
    }
    // Calculate the total price of the cart
    let totalCartPrice = 0;
    products.forEach(item => {
        totalCartPrice += item.total_price; // Sum up the total_price of each item
    });

    // Create a new Cart instance
    const cart = new Cart({
        user,
        products,
        total_price: totalCartPrice
    });
    try {
        // Save the cart to the database
        await cart.save();

        // Respond with success message
        res.status(200).json({
            errors: null,
            message: 'Cart was created successfully!',
            data: cart
        });
    } catch (error) {
        // Handle errors during saving
        res.status(500).json({
            errors: [error.message],
            message: 'Something went wrong while creating the cart!',
            data: null
        });
    }
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;  // Extract the cart ID from the URL
    try {
        // Find the cart by ID
        const cart = await Cart.findById(id).populate('user').populate('products.product'); // Populating user and products details
        // If the cart is not found, return a 404 error
        if (!cart) {
            return res.status(404).json({
                errors: null,
                message: 'Cart not found!',
                data: null
            });
        }
        // Respond with the found cart data
        res.status(200).json({
            errors: null,
            message: 'Cart found successfully!',
            data: cart
        });
    } catch (error) {
        res.status(500).json({
            errors: [error.message],
            message: 'Something went wrong while fetching the cart!',
            data: null
        });
    }
});

router.put('/update/:id', async (req, res) => {
    const { id } = req.params;  // Extract the cart ID from the URL
    const { user, products } = req.body;  // Extract user and products data from the request body
    try {
        // Find the cart by ID and update it
        const updatedCart = await Cart.findByIdAndUpdate(
            id, 
            { 
                user, 
                products 
            }, 
            { new: true }  // Return the updated cart
        );
        // If the cart is not found, return a 404 error
        if (!updatedCart) {
            return res.status(404).json({
                errors: null,
                message: 'Cart not found!',
                data: null
            });
        }
        // Respond with the updated cart data
        res.status(200).json({
            errors: null,
            message: 'Cart updated successfully!',
            data: updatedCart
        });
    } catch (error) {
        res.status(500).json({
            errors: [error.message],
            message: 'Something went wrong while updating the cart!',
            data: null
        });
    }
});

router.put('/update', authenticateToken, async (req, res) => {
    try {
      const user_Id = req.user._id;
      const cartItems = req.body.cart;
  
      console.log('User_ID:', user_Id); // Log userId
      console.log('Cart Items:', cartItems); // Log incoming cart data


      if (!cartItems || typeof cartItems !== 'object') {
        return res.status(400).json({ message: 'Invalid cart format.' });
      }
  
      // Find the user's cart or initialize a new one
      let cart = await Cart.findOne({ user: user_Id });
  
      if (!cart) {
        cart = new Cart({ user: user_Id, items: [] });
      }
  
      // Update quantities or add new products to the cart
      Object.entries(cartItems).forEach(([productId, quantity]) => {
        const existingItem = cart.items.find(item => item.product.toString() === productId);
  
        if (existingItem) {
          // Update quantity if the product already exists
          existingItem.quantity += Number(quantity);
        } else {
          // Add new product to the cart
          cart.items.push({ product: productId, quantity: Number(quantity) });
        }
      });
  
      // Recalculate total price
      await cart.save(); // pre('save') will handle the total price calculation
  
      res.status(200).json({
        errors: null,
        message: 'Cart updated successfully!',
        data: cart,
      });
    } catch (error) {
      console.error('Error updating cart:', error);
      res.status(500).json({
        errors: [error.message],
        message: 'Something went wrong!',
        data: null,
      });
    }
  });


router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;  // Extract the cart ID from the URL
    try {
        // Find and delete the cart by ID
        const deletedCart = await Cart.findByIdAndDelete(id);
        
        // If the cart is not found, return a 404 error
        if (!deletedCart) {
            return res.status(404).json({
                errors: null,
                message: 'Cart not found!',
                data: null
            });
        }

        // Respond with a success message and deleted cart data
        res.status(200).json({
            errors: null,
            message: 'Cart deleted successfully!',
            data: deletedCart
        });
    } catch (error) {
        res.status(500).json({
            errors: [error.message],
            message: 'Something went wrong while deleting the cart!',
            data: null
        });
    }
});


// router.put('/update', authenticateToken, async (req, res) => {
//     try {
//       const user_Id = req.user._id;
//       const cartItems = req.body.cart;
  
//       console.log('User_ID:', user_Id); // Log userId
//       console.log('Cart Items:', cartItems); // Log incoming cart data


//       if (!cartItems || typeof cartItems !== 'object') {
//         return res.status(400).json({ message: 'Invalid cart format.' });
//       }
  
//       // Find the user's cart or initialize a new one
//       let cart = await Cart.findOne({ user: user_Id });
  
//       if (!cart) {
//         cart = new Cart({ user: user_Id, items: [] });
//       }
  
//       // Update quantities or add new products to the cart
//       Object.entries(cartItems).forEach(([productId, quantity]) => {
//         const existingItem = cart.items.find(item => item.product.toString() === productId);
  
//         if (existingItem) {
//           // Update quantity if the product already exists
//           existingItem.quantity += Number(quantity);
//         } else {
//           // Add new product to the cart
//           cart.items.push({ product: productId, quantity: Number(quantity) });
//         }
//       });
  
//       // Recalculate total price
//       await cart.save(); // pre('save') will handle the total price calculation
  
//       res.status(200).json({
//         errors: null,
//         message: 'Cart updated successfully!',
//         data: cart,
//       });
//     } catch (error) {
//       console.error('Error updating cart:', error);
//       res.status(500).json({
//         errors: [error.message],
//         message: 'Something went wrong!',
//         data: null,
//       });
//     }
//   });

  router.get('/get', authenticateToken, async (req, res) => {
    try {
        const user_Id = req.user._id;  // Extract user ID from the authenticated user
        console.log('User ID:', user_Id);  // Log userId for debugging

        // Ensure userId is present and valid
        if (!user_Id) {
            return res.status(400).json({
                message: 'User ID is missing!',
                data: null,
            });
        }

        // Validate if userId is a valid ObjectId (mongoose format)
        if (!mongoose.Types.ObjectId.isValid(user_Id)) {
            return res.status(400).json({
                message: 'Invalid user ID format!',
                data: null,
            });
        }

        // Query the cart for the user and populate the product details
        const cart = await Cart.findOne({ user: mongoose.Types.ObjectId(user_Id) }).populate({
            path: 'items.product',
            model: 'Product',
        });

        console.log('Cart Data:', cart);  // Log cart for debugging

        // Check if the cart is found and has items
        if (!cart || cart.items.length === 0) {
            return res.status(200).json({
                message: 'Your cart is empty!',
                data: [],
            });
        }

        res.status(200).json({
            message: 'Cart fetched successfully!',
            data: cart.items,
        });
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({
            errors: [error.message],
            message: 'Something went wrong while fetching the cart!',
            data: null,
        });
    }
});





  




module.exports = router;