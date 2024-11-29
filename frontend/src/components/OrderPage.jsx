/* eslint-disable no-unused-vars */
// OrderPage.jsx
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

function OrderPage() {
  const location = useLocation();
  const { cart } = location.state || {}; // Get cart data passed via state
  const [paymentMethod, setPaymentMethod] = useState('Credit'); // Default to 'Credit'
  const [isOrderSubmitted, setIsOrderSubmitted] = useState(false); // State to track order submission

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

  // Handle form submission
  const handleSubmit = (event) => {
    event.preventDefault();
    // Simulate order submission (e.g., save to backend or process the order)
    setIsOrderSubmitted(true);
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
      <div className="text-black bg-white bg-opacity-70 p-6  mt-10 rounded-lg w-1/2">
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
