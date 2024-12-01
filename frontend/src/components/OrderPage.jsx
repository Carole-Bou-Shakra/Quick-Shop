/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

function OrderPage() {
  const location = useLocation();
  const { cart } = location.state || {}; // Get cart data passed via state
  const [paymentMethod, setPaymentMethod] = useState('Credit'); // Default to 'Credit'
  const [isOrderSubmitted, setIsOrderSubmitted] = useState(false); // State to track order submission
  const [loading, setLoading] = useState(false); // For loading state
  const [error, setError] = useState(null); // For error state

  // Calculate the total price of items in the cart
  const totalPrice = cart?.reduce((total, product) => total + (product.price * product.quantity), 0);

  // If no cart data, return a message
  if (!cart || cart.length === 0) {
    return <p>No items in the cart.</p>;
  }

  // Handle payment method change
  const handlePaymentChange = (event) => {
    setPaymentMethod(event.target.value);
  };

  // Handle order submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    // Call the handleOrder function when the order is submitted
    await handleOrder();
  };

  // Handle order data submission to the backend
  const handleOrder = async () => {
    const userId = "60d9f2f9c8b4b214d8e2d8c8";  // Replace with actual user ID
    const address = "123 Main St, City, Country";  // Replace with actual address
    const status = "pending";  // Default status or dynamic status

    // Assuming `cart` is an array of products in your state or context
    const products = cart.map(product => ({
      productid: product._id,  // Replace with correct product ID field
      quantity: product.quantity,
      priceOfOne: product.price,  // Ensure priceOfOne is included for each product
    }));

    // Calculate totalPrice based on cart items
    const totalPrice = cart.reduce((acc, product) => acc + (product.price * product.quantity), 0);

    // Check if totalPrice, address, and priceOfOne are valid
    if (!totalPrice || !address || products.some(product => !product.priceOfOne || product.priceOfOne <= 0)) {
      setError("totalPrice, address, and priceOfOne are required and must be valid.");
      return;
    }

    const orderId = "67495ca4fe52ff3ee120c711";  // Replace with actual order ID or get dynamically
    const orderData = {
      user: userId,  // Make sure this is a valid user ID
      productid: products.map(product => product.productid),  // List of product IDs
      quantity: products.map(product => product.quantity),  // List of quantities
      status: status,
      totalPrice: totalPrice,
      address: address,
      priceOfOne: products.map(product => product.priceOfOne),  // List of prices for each product
    };

    try {
      setLoading(true);
      const response = await axios.put(
        `http://localhost:5000/api/v1/order/update/${orderId}`,
        orderData
      );
      setLoading(false);
      console.log("Order updated successfully:", response.data);
      setIsOrderSubmitted(true); // Set to true to show the success message
    } catch (err) {
      setLoading(false);
      const errorMessage = err.response?.data?.message || "Failed to update order. Please try again.";
      setError(errorMessage);
      console.log("Error details:", err.response?.data);
    }
  };

  return (
    <div
      className="min-h-screen flex justify-center items-center relative"
      style={{
        backgroundImage: "url('order7.jpeg')", // Replace with your image path
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="text-black bg-white bg-opacity-70 p-6 mt-10 rounded-lg w-1/2">
        <h1 className="text-2xl font-bold mb-4">Order Summary</h1>

        {/* Display cart items */}
        {cart.map((product) => (
          <div key={product._id} className="flex items-center justify-between mb-4 p-4 border-b">
            <img
              src={`http://localhost:5000/${product.pictures[0]}`}
              alt={product.name}
              className="w-24 h-24 object-cover mr-4"
            />
            <div className="flex-1">
              <h3 className="font-bold text-xl">{product.name}</h3>
              <p>{product.description}</p>
              <p>Quantity: {product.quantity}</p>
              <p>Price: ${product.price}</p>
            </div>
          </div>
        ))}

        {/* Payment Method Section */}
        <div className="mt-4">
          <h3 className="text-xl font-semibold mb-2">Choose Payment Method</h3>
          <div className="flex items-center mb-4">
            <input
              type="radio"
              id="credit"
              name="paymentMethod"
              value="Credit"
              checked={paymentMethod === 'Credit'}
              onChange={handlePaymentChange}
              className="mr-2"
            />
            <label htmlFor="credit" className="mr-6">Credit</label>

            <input
              type="radio"
              id="cash"
              name="paymentMethod"
              value="Cash"
              checked={paymentMethod === 'Cash'}
              onChange={handlePaymentChange}
              className="mr-2"
            />
            <label htmlFor="cash">Cash</label>
          </div>
        </div>

        {/* Order Summary */}
        <div className="mt-4">
          <p className="font-bold text-xl">Total Price: ${totalPrice}</p>
          <p className="text-lg">Payment Method: {paymentMethod}</p>
        </div>

        {/* Submit Button */}
        {!isOrderSubmitted ? (
          <div className="mt-4">
            <button
              onClick={handleSubmit}
              className="bg-[#b65518] text-white py-2 px-4 rounded-lg hover:bg-[#6d3011]"
            >
              Submit Order
            </button>
          </div>
        ) : (
          <div className="absolute top-0 left-0 w-full h-full bg-white text-black opacity-90">
            <div className="text-3xl font-bold mt-80 text-center">
              Your order has been submitted successfully!
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderPage;
