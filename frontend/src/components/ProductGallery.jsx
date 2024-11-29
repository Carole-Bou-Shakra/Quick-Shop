/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaRegHeart, FaShoppingCart } from "react-icons/fa"; // Import the cart icon

function ProductGallery() {
  const [products, setProducts] = useState([]);
  const [currentImageIndices, setCurrentImageIndices] = useState({});
  const [cart, setCart] = useState([]); // To store multiple products in the cart
  const [likedProducts, setLikedProducts] = useState([]); // To track liked products
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const token = localStorage.getItem("authToken"); // Assume token is stored in localStorage

  // Fetch products from the backend API
  async function getAllProducts() {
    try {
      const response = await fetch("http://localhost:5000/api/v1/product/search");
      const result = await response.json();
      setProducts(result.data);

      // Set the initial image indices for each product
      const initialIndices = result.data.reduce((acc, product) => {
        acc[product._id] = 0; // Start from the first image
        return acc;
      }, {});
      setCurrentImageIndices(initialIndices);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  }

  useEffect(() => {
    getAllProducts();
  }, []);

  // Handle Add to Cart
  const handleAddToCart = async (product) => {
    setCart((prevCart) => {
      // Check if product already exists in the cart
      const existingProductIndex = prevCart.findIndex((item) => item._id === product._id);
      if (existingProductIndex !== -1) {
        // If exists, increase the quantity
        const updatedCart = [...prevCart];
        updatedCart[existingProductIndex].quantity += 1;
        return updatedCart;
      } else {
        // If not, add the product to the cart
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });

    setCartCount((prevCount) => prevCount + 1); // Update the cart count

    // Send the updated cart to the backend
    try {
      const response = await fetch("http://localhost:5000/api/v1/cart/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Pass the authentication token
        },
        body: JSON.stringify({ cart: cart }), // Send the updated cart data
      });

      if (!response.ok) {
        throw new Error("Failed to update cart in the backend");
      }

      // Optionally fetch the updated cart again to reflect any changes
      await fetchCart();
    } catch (error) {
      console.error("Error updating cart in the backend:", error);
    }
  };

  // Handle Like Button Click
  // const handleLikeClick = (productId) => {
  //   setLikedProducts((prevLikes) => {
  //     if (prevLikes.includes(productId)) {
  //       return prevLikes.filter((id) => id !== productId); // Remove if already liked
  //     } else {
  //       return [...prevLikes, productId]; // Add to liked products
  //     }
  //   });
  // };

  // Navigate to cart
  const navigateToCart = () => {
    navigate("/cart", { state: { cart } });
  };

  // Navigate to favorites
  // Handle Like button click
  const handleLikeClick = (productId) => {
    setLikedProducts((prevLikedProducts) => {
      if (prevLikedProducts.includes(productId)) {
        return prevLikedProducts.filter(id => id !== productId); // Remove from liked products
      } else {
        return [...prevLikedProducts, productId]; // Add to liked products
      }
    });
  };
  const navigateToFavorites = () => {
    // Find the liked products by matching the product ids
    const likedProductDetails = products.filter(product =>
      likedProducts.includes(product._id)
    );
  
    navigate("/favorites", { state: { likedProducts: likedProductDetails, likedProductIds: likedProducts } });
  };
  

  

  return (
    <div
      className="min-h-screen flex justify-center items-center relative"
      style={{ backgroundColor: "#ce807e" }}
    >
      <div className="flex gap-10 text-black flex-wrap justify-center relative mt-8">
        {products.map((product) => (
          <div
            key={product._id}
            className="bg-gray-200 rounded-[20px] overflow-hidden w-[250px] h-[500px] transition-all duration-500 ease-in-out hover:bg-gray-300 hover:shadow-lg flex flex-col"
          >
            {/* Card Top Section */}
            <div className="card-top relative flex-1">
              <div className="relative w-full h-full ">
                <img
                  className="absolute object-cover w-full h-full transition-opacity duration-500"
                  src={`http://localhost:5000/${product.pictures[currentImageIndices[product._id]]}`}
                  alt={`Product image`}
                />
                <button
                  onClick={() => showPrevImage(product._id)}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 font-bold bg-slate-300 text-black p-2 rounded-full shadow"
                >
                  &lt;
                </button>
                <button
                  onClick={() => showNextImage(product._id)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 font-bold bg-slate-300 text-black p-2 rounded-full shadow"
                >
                  &gt;
                </button>
                <button
                  onClick={() => handleLikeClick(product._id)}
                  className="absolute top-2 right-2 text-white text-2xl"
                >
                  {likedProducts.includes(product._id) ? (
                    <FaHeart className="text-red-500" />
                  ) : (
                    <FaRegHeart className="text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            {/* Card Bottom Section */}
            <div className="card-bottom p-2 flex-1">
              <div className="flex flex-col justify-between h-[80%]">
                <div className="flex justify-between">
                  <h2 className="text-xl">
                    <b>{product.name}</b>
                  </h2>
                  <h3 className="text-xl">${product.price}</h3>
                </div>
                <p className="text-sm text-gray-600 mt-4">
                  <i>Category: {product.category}</i>
                </p>
                <p className="text-start mt-4">{product.description}</p>

                {/* Add to Cart Button */}
                <button
                  className="text-white px-4 py-2 rounded-[20px] mt-2 bg-[#8c063b]"
                  onClick={() => handleAddToCart(product)}
                >
                  Add to Cart
                </button>

                   {/* Favorite Button */}
            <button
              className="text-white px-4 py-2 rounded-[20px] mt-2 bg-[#ce807e]"
              onClick={navigateToFavorites}
            >
              Go to Favorites
            </button>

              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cart Icon */}
      <div
        className="fixed bottom-4 right-4 bg-[#ce807e] rounded-full p-4 shadow-lg cursor-pointer z-50"
        onClick={navigateToCart}
      >
        <FaShoppingCart className="text-white text-2xl" />
        {cartCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-2 py-1">
            {cartCount}
          </span>
        )}
      </div>
    </div>
  );
}

export default ProductGallery;
