/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import axios from 'axios';

// Function to check if the token is valid
const isTokenValid = (token) => {
  if (!token) return false;

  const decodedToken = JSON.parse(atob(token.split('.')[1]));
  const currentTime = Math.floor(Date.now() / 1000);

  return decodedToken.exp > currentTime;
};

function Favorites() {
  const { state } = useLocation(); // Get the state passed from ProductGallery
  const { likedProducts, likedProductIds } = state;

  const [likedProductsState, setLikedProductsState] = useState(likedProductIds);
  const [favorites, setFavorites] = useState([]);

  const navigate = useNavigate(); // Hook to navigate to Cart page

  // Function to handle the like click and redirect to login if not logged in
  const handleLikeClick = async (productId) => {
    const token = localStorage.getItem('token'); // Get token from localStorage
    const isLoggedIn = isTokenValid(token); // Check if the token is valid

    if (!isLoggedIn) {
      alert('You must be logged in to like a product.');
      navigate('/login'); // Redirect to login page
      return;
    }

    const userId = localStorage.getItem('userId'); // Get userId from localStorage

    try {
      // Send like to the backend with userId, productId, and token
      const response = await axios.post('http://localhost:5000/api/v1/like/create', {
        productId,
        token,
        userId
      });

      console.log('Like created:', response.data);

      // Update likedProductsState to reflect the like
      setLikedProductsState((prevLikedProducts) => {
        const updatedLikedProducts = prevLikedProducts.includes(productId)
          ? prevLikedProducts.filter(id => id !== productId)
          : [...prevLikedProducts, productId];

        return updatedLikedProducts;
      });
    } catch (error) {
      console.error('Error creating like:', error);
      alert('Something went wrong while liking the product.');
    }
  };

  // Update the favorites list with liked products
  useEffect(() => {
    setFavorites(likedProducts.filter(product => likedProductsState.includes(product._id)));
  }, [likedProductsState, likedProducts]);

  return (
    <div
      className="min-h-screen flex justify-center items-center relative"
      style={{ backgroundColor: '#ce807e' }}
    >
      <div className="flex gap-10 text-black flex-wrap justify-center mt-8 z-10">
        {likedProducts
          .filter(product => likedProductsState.includes(product._id))
          .map((product) => (
            <div key={product._id} className="bg-gray-200 rounded-[20px] overflow-hidden w-[250px] h-[500px] flex flex-col">
              <div className="card-top h-[50%] relative">
                <div className="relative w-full h-full">
                  <img
                    className="absolute object-cover w-full h-full"
                    src={`http://localhost:5000/${product.pictures[0]}`}
                    alt={product.name}
                  />
                  <button
                    onClick={() => handleLikeClick(product._id)}
                    className="absolute top-2 right-2 text-white text-2xl"
                  >
                    {likedProductsState.includes(product._id) ? (
                      <FaHeart className="text-red-500" />
                    ) : (
                      <FaRegHeart className="text-gray-500" />
                    )}
                  </button>
                </div>
              </div>
              <div className="card-bottom p-2 h-[40%] flex flex-col justify-between">
                <div className="flex justify-between">
                  <h2 className="text-xl"><b>{product.name}</b></h2>
                  <h3 className="text-xl">${product.price}</h3>
                </div>
                <p className="text-start mt-4">{product.description}</p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default Favorites;
