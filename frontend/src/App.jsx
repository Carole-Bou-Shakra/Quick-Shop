/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import Navbar from "./components/Navbar";
import ProductForm from "./components/ProductForm";
import ProductGallery from "./components/ProductGallery";
import LoginPage from "./components/LoginPage"; // Import the Login component
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Signup from "./components/SignUp";
import Cart from "./components/Cart"; // Import the CartPage component
import Favorites from "./components/Favorites";
import OrderPage from "./components/OrderPage"; 

const App = () => {
  // Initialize products state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [products, setProducts] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false); // Add this state
  const [likedProducts, setLikedProducts] = useState([]); // Define likedProducts state

  // Function to add a product to the state
  const addProduct = (product) => {
    setProducts((prevProducts) => [...prevProducts, product]);
  };

  // Function to handle login and update isLoggedIn state
  const handleLogin = () => {
    setIsLoggedIn(true); // Update login state when login is successful
  };

  const toggleFormVisibility = () => {
    setIsFormVisible((prevState) => !prevState);
  };

  // Function to add product to favorites
  const addToFavorites = (product) => {
    setLikedProducts((prevFavorites) => [...prevFavorites, product]);
  };

  return (
    <Router>
      <Navbar 
        toggleFormVisibility={toggleFormVisibility} 
        isFormVisible={isFormVisible} 
        isLoggedIn={isLoggedIn} // Pass login status to Navbar
      />

      <Routes>
        {/* Home Route: Displays ProductGallery only */}
        <Route path="/" element={<ProductGallery products={products} />} />

        {/* ProductForm Route: Displays ProductForm only */}
        <Route
          path="/product-form"
          element={<ProductForm addProduct={addProduct} />}
        />

        {/* Login Page Route */}
        <Route 
          path="/loginpage" 
          element={<LoginPage handleLogin={handleLogin} />} 
        />

        {/* Signup Route */}
        <Route path="/signup" element={<Signup />} />

        {/* Cart Page Route: Protected Route */}
        <Route 
          path="/cart" 
          element={isLoggedIn ? <Cart products={products} /> : <LoginPage handleLogin={handleLogin} />}
        />

        {/* Favorites Route: Pass likedProducts to Favorites page */}
        <Route 
          path="/favorites" 
          element={<Favorites likedProducts={likedProducts} />} // Pass likedProducts to Favorites page
        />

       {/* Order Page Route */}
       <Route
          path="/order"
          element={isLoggedIn ? <OrderPage /> : <LoginPage handleLogin={handleLogin} />} />
      </Routes>
    </Router>
  );
};

export default App;
