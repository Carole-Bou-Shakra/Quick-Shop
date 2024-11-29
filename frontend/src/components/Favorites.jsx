/* eslint-disable-next-line no-unused-vars */
import React, { useEffect, useState } from 'react';
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";

function Favorites() {
  const { state } = useLocation(); // Get the state passed from ProductGallery
  const { likedProducts, likedProductIds } = state;

  const [likedProductsState, setLikedProductsState] = useState(likedProductIds);
  const [favorites, setFavorites] = useState([]);

  const navigate = useNavigate(); // Hook to navigate to Cart page

  // Toggle like status for the heart
  const handleLikeClick = (productId) => {
    setLikedProductsState((prevLikedProducts) => {
      const updatedLikedProducts = prevLikedProducts.includes(productId)
        ? prevLikedProducts.filter(id => id !== productId)
        : [...prevLikedProducts, productId];

      return updatedLikedProducts;
    });
  };

  // Update the favorites list with liked products
  useEffect(() => {
    setFavorites(likedProducts.filter(product => likedProductsState.includes(product._id)));
  }, [likedProductsState, likedProducts]);

  const goToCart = () => {
    // Pass the selected favorites directly to the Cart page
    navigate("/cart", { state: { cart: favorites } });
  };

  return (
    <div
      className="min-h-screen flex justify-center items-center relative"
      style={{
        backgroundColor: '#ce807e', // Solid background color
      }}
    >
      <div className="flex gap-10 text-black flex-wrap justify-center mt-8 z-10">
        {likedProducts
          .filter(product => likedProductsState.includes(product._id)) // Only show liked products
          .map((product) => (
            <div key={product._id} className="bg-gray-200 rounded-[20px] overflow-hidden w-[250px] h-[500px] flex flex-col">
              <div className="card-top h-[50%] relative">
                {/* Image and Like button */}
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
              <div className="card-bottom p-2 h-[50%] flex flex-col justify-between">
                <div className="flex justify-between">
                  <h2 className="text-xl"><b>{product.name}</b></h2>
                  <h3 className="text-xl">${product.price}</h3>
                </div>
                <p className="text-start mt-4">{product.description}</p>

                {/* Button to navigate to Cart */}
                <div className="mt-4 w-full flex justify-center">
                  <button
                    onClick={goToCart}
                    className="px-6 py-2 bg-[#8c063b] text-white rounded-[20px] shadow-md hover:bg-[#8c063b] w-full"
                  >
                    Go to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default Favorites;
