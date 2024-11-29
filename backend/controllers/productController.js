const express = require('express');
const Product = require('../models/Product');  // Correct import
const Like = require('../models/Like');  // Adjust the path based on your project structure
const { ImageUpload } = require('../middleware/ImageUpload');


 // Assuming the model path is correct

const router = express.Router();

router.get('/', (req, res) => {
    res.send('productController handled this request!');
});

router.post('/create', ImageUpload.array('pictures', 5), async (req, res) => {
    try {
        
        console.log(req.files)
    
        const pictures = req.files.map((file) => file.path)
        const {
            name,
            description,
            price,
            category,
        } = req.body

        if (
            !name ||
            !description ||
            !price ||
            !pictures.length ||
            !category
        ) {
            throw new Error("At least one of the required fields is empty")
        }


        const product = new Product({
            name,
            description,
            price,
            pictures,
            category
        })

        await product.save()

        res.status(200).json({
            errors: null,
            message: "Product created!",
            data: product
        })
    } catch (error) {
        res.status(500).json({
            errors: [error.message],
            message: "Something went wrong!",
            data: null
        })
    }
})



router.put('/update/:id', async (req, res) => {
    const { id } = req.params;  // Extract the product ID from the URL
    const { name, description, price, pictures, category, number_of_reviews, sum_of_ratings } = req.body;
    try {
        // Find the product by ID and update it
        const updatedProduct = await Product.findByIdAndUpdate(
            id, 
            { 
                name, 
                description, 
                price, 
                pictures, 
                category, 
                number_of_reviews, 
                sum_of_ratings 
            }, 
            { new: true }  // Return the updated product
        );
        // If the product is not found, return a 404 error
        if (!updatedProduct) {
            return res.status(404).json({
                errors: null,
                message: 'Product not found!',
                data: null
            });
        }
        // Respond with the updated product data
        res.status(200).json({
            errors: null,
            message: 'Product updated successfully!',
            data: updatedProduct
        });
    } catch (error) {
        res.status(500).json({
            errors: [error],
            message: 'Something went wrong!',
            data: null
        });
    }
});

router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;  // Extract the product ID from the URL
    try {
        // Find and delete the product by ID
        const deletedProduct = await Product.findByIdAndDelete(id);
        // If the product is not found, return a 404 error
        if (!deletedProduct) {
            return res.status(404).json({
                errors: null,
                message: 'Product not found!',
                data: null
            });
        }
        // Respond with a success message and deleted product data
        res.status(200).json({
            errors: null,
            message: 'Product deleted successfully!',
            data: deletedProduct
        });
    } catch (error) {
        res.status(500).json({
            errors: [error],
            message: 'Something went wrong!',
            data: null
        });
    }
});

router.get('/search', async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json({
            errors: null,
            message: "Products fetched!",
            data: products
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            errors: [error.message],
            message: "Something went wrong!",
            data: null
        })
    }
})

router.get('/:id', async (req, res) => {
    const { id } = req.params;  // Extract the product ID from the URL
    try {
        // Find the product by ID
        const product = await Product.findById(id);

        // If the product is not found, return a 404 error
        if (!product) {
            return res.status(404).json({
                errors: null,
                message: 'Product not found!',
                data: null
            });
        }

        // Respond with the found product data
        res.status(200).json({
            errors: null,
            message: 'Product found successfully!',
            data: product
        });
    } catch (error) {
        res.status(500).json({
            errors: [error],
            message: 'Something went wrong!',
            data: null
        });
    }
});

router.get('/product/search', async (req, res) => {
    const { searchTerm = '', page = 1, pageSize = 3 } = req.query;  // Extract searchTerm, page, and pageSize
    const pageInt = parseInt(page) || 1;
    const pageSizeInt = parseInt(pageSize) || 3;

    try {
        const search = searchTerm.trim();  // Trim any leading/trailing spaces from the search term

        if (!search) {
            return res.status(400).json({
                errors: ['Search term cannot be empty'],
                message: 'Bad request - no search term provided',
                data: null
            });
        }

        // Create a query to search products by name or description
        const query = {
            $or: [
                { name: { $regex: search, $options: 'i' } },  // Search by name (case-insensitive)
                { category: { $regex: search, $options: 'i' } }  // Search by description (case-insensitive)
            ]
        };

        // Fetch the total number of products matching the query
        const totalProducts = await Product.countDocuments(query);

        // Find the products that match the search query with pagination
        const products = await Product.find(query)
            .skip((pageInt - 1) * pageSizeInt)  // Skip items for previous pages
            .limit(pageSizeInt)  // Limit to page size
            .sort({ createdAt: -1 });  // Sort by creation date (optional)

        if (products.length === 0) {
            return res.status(404).json({
                errors: null,
                message: 'No products found',
                data: null
            });
        }

        // For each product, fetch the likes related to it (lazy load likes)
        for (const product of products) {
            const totalLikes = await Like.countDocuments({ product: product._id });
            const likes = await Like.find({ product: product._id })
                .skip((pageInt - 1) * pageSizeInt)  // Skip likes for previous pages
                .limit(pageSizeInt)  // Limit to 3 likes per page
                .populate('user', 'name email');  // Populate user details for each like

            product.likes = likes;  // Attach likes to the product
            product.totalLikes = totalLikes;  // Attach total likes count to the product
            product.pagination = {
                currentPage: pageInt,
                pageSize: pageSizeInt,
                totalLikes,
                totalPages: Math.ceil(totalLikes / pageSizeInt)  // Calculate total pages for likes
            };
        }

        // Send the response with the fetched products and likes
        res.status(200).json({
            errors: null,
            message: 'Products and likes fetched successfully!',
            data: {
                products,
                pagination: {
                    currentPage: pageInt,
                    pageSize: pageSizeInt,
                    totalProducts,
                    totalPages: Math.ceil(totalProducts / pageSizeInt)
                }
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            errors: [error.message],
            message: 'Something went wrong!',
            data: null
        });
    }
});


  



// Export the router to be used in the main app
module.exports = router;
