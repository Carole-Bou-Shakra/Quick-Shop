const express = require('express');
const mongoose = require('mongoose');
const { User } = require('./models/User');
const { Review } = require('./models/Review');
const {Product} = require('./models/Product');
const {Like} = require('./models/Like');
const {Cart} = require('./models/Cart');
const { Order } = require('./models/Order');
const userController = require('./controllers/userController');
const reviewController = require('./controllers/reviewController'); 
const productController = require('./controllers/productController');
const likeController = require('./controllers/likeController');
const cartController = require('./controllers/cartController');
const orderController = require('./controllers/orderController');
const path = require('path');
const cors = require('cors');

require('dotenv').config();

const clientOptions = {
    serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true
    }
};

const app = express();

app.use(cors());

app.use('/images', express.static(path.join(__dirname, 'images')))

app.use(express.json());


const prefix = '/api';
const version = '/v1';

app.use(prefix + version + '/user', userController);
app.use(prefix + version + '/review', reviewController); 
app.use(prefix + version + '/product', productController);
app.use(prefix + version + '/like', likeController);
app.use(prefix + version + '/cart', cartController);
app.use(prefix + version + '/order', orderController);



mongoose.connect(process.env.DATABASE_URL || '', clientOptions)
    .then(() => console.log("Connected to MongoDB!"))
    .then(() => app.listen(5000, () => {
        console.log("Server started on port 5000");
    }))
    .catch(err => console.error("Could not connect to MongoDB", err));
