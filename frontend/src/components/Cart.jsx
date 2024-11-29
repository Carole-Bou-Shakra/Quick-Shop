/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from 'axios';

function Cart() {
  const location = useLocation();
  const navigate = useNavigate(); // Hook to navigate to another page

  const [cart, setCart] = useState(
    location.state?.cart?.map((product) => ({
      ...product,
      quantity: product.quantity || 1,
    })) || []
  );
  const [paymentStatus, setPaymentStatus] = useState('Credit'); // Default to 'Credit'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (location.state?.cart) {
      setCart(location.state.cart.map(product => ({
        ...product,
        quantity: product.quantity || 1,
      })));
      localStorage.setItem('cart', JSON.stringify(location.state.cart));
    } else {
      const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
      setCart(savedCart.map(product => ({
        ...product,
        quantity: product.quantity || 1,
      })));
    }
  }, [location.state]);

  const handleOrder = () => {
    // Navigate to the OrderPage with the cart and payment status
    navigate('/order', {
      state: {
        cart: cart,
        paymentStatus: paymentStatus,
      },
    });
  };

  const addToCart = async (newProduct) => {
    setCart((prevCart) => {
      const existingProductIndex = prevCart.findIndex(
        (product) => product._id === newProduct._id
      );

      let updatedCart;
      if (existingProductIndex !== -1) {
        updatedCart = prevCart.map((product, index) =>
          index === existingProductIndex
            ? { ...product, quantity: product.quantity + 1 }
            : product
        );
      } else {
        updatedCart = [...prevCart, { ...newProduct, quantity: 1 }];
      }

      // Save updated cart locally
      localStorage.setItem('cart', JSON.stringify(updatedCart));

      // Send updated cart to the server
      updateCartInDatabase(updatedCart);

      return updatedCart;
    });
  };

  const updateCartInDatabase = async (cart) => {
    const token = localStorage.getItem('token'); // Retrieve the token from local storage
  
    try {
      setLoading(true);
      const response = await axios.put(
        "http://localhost:5000/api/v1/cart/update",
        { cart },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token
          },
        }
      );
      setLoading(false);
      console.log("Cart updated successfully:", response.data);
    } catch (err) {
      setLoading(false);
      setError("Failed to update cart. Please try again.");
      console.error(err);
    }
  };
  
  
  const handleRemove = (productId) => {
    setCart((prevCart) =>
      prevCart
        .map((product) => {
          if (product._id === productId) {
            if (product.quantity > 1) {
              return { ...product, quantity: product.quantity - 1 };
            }
            return null;
          }
          return product;
        })
        .filter((product) => product !== null)
    );
  };

  const handleQuantityChange = (productId, change) => {
    setCart((prevCart) => {
      const updatedCart = prevCart.map((product) => {
        if (product._id === productId) {
          const updatedQuantity = Math.max(1, product.quantity + change);
          return { ...product, quantity: updatedQuantity };
        }
        return product;
      });

      localStorage.setItem('cart', JSON.stringify(updatedCart));

      // Update the server with the new cart
      updateCartInDatabase(updatedCart);

      return updatedCart;
    });
  };

  return (
    <div className="min-h-screen flex justify-center items-center relative" style={{ backgroundImage: "url('image4.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}>
      <div className="text-black bg-white bg-opacity-70 p-6 mt-10 rounded-lg">
        <h1 className="text-2xl font-bold mb-4">Cart</h1>
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {cart.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <div>
            {cart.map((product) => (
              <div key={product._id} className="flex items-center justify-between mb-4 p-4 border-b">
                <img src={`http://localhost:5000/${product.pictures[0]}`} alt={product.name} className="w-24 h-24 object-cover mr-4" />
                <div className="flex-1">
                  <h3 className="font-bold text-xl">{product.name}</h3>
                  <p>{product.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg">${product.price}</p>
                  <div className="flex items-center">
                    <button onClick={() => handleQuantityChange(product._id, -1)} className="bg-gray-500 text-white px-2 py-1 rounded-full mt-2 hover:bg-gray-600">-</button>
                    <span className="mx-2">{product.quantity || 1}</span>
                    <button onClick={() => handleQuantityChange(product._id, 1)} className="bg-gray-500 text-white px-2 py-1 rounded-full mt-2 hover:bg-gray-600">+</button>
                  </div>
                  <button onClick={() => handleRemove(product._id)} className="bg-red-500 text-white px-4 py-2 rounded-full mt-2 hover:bg-red-600">Remove</button>
                </div>
              </div>
            ))}
            <button
              onClick={handleOrder}
              className="bg-[#d6b474] text-white px-4 py-2 rounded-full mt-4 hover:bg-[#bdac94]"
            >
              Proceed to Order
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;
