
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";


const Navbar = ({ toggleFormVisibility, isFormVisible, isLoggedIn }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Function to fetch product suggestions
  const fetchSuggestions = async (term) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:5000/api/v1/product/product/search?searchTerm=${term}&page=1&pageSize=3`
      );
      setSuggestions(response.data.data.products);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSuggestions([]);
      return;
    }
    const timeoutId = setTimeout(() => {
      fetchSuggestions(searchTerm);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Handle form visibility toggle and navigation
  const handleStoreClick = () => {
    toggleFormVisibility();
    navigate("/product-form");
  };

  // Navigate to the cart page
  const handleCartClick = () => {
    navigate("/cart");
  };

  return (
    <header className="navbar flex flex-col sm:flex-row items-center justify-between bg-[#921b3e] text-white p-4 shadow-md">
      <div className="logo text-2xl font-bold mb-4 sm:mb-0">QuickShop</div>

      <div className="filters flex flex-col sm:flex-row items-center gap-4 relative mb-4 sm:mb-0 w-full sm:w-auto">
        <input
          type="text"
          placeholder="Search"
          className="search-bar text-black px-4 py-2 rounded-[20px] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {loading && <div className="loading-indicator">Loading...</div>}

        {searchTerm && suggestions.length > 0 ? (
          <div className="suggestions absolute top-full left-0 mt-2 w-full bg-white shadow-lg border border-gray-300 rounded-lg z-10">
            {suggestions.map((product) => (
              <div
                key={product._id}
                className="suggestion-item text-black flex items-center gap-4 p-2 border-b border-gray-300 hover:bg-gray-100 cursor-pointer"
              >
                <img
                  src={product.imageUrl || `http://localhost:5000/${product.pictures[0] || 'default-image.jpg'}`}
                  alt={product.name}
                  className="w-12 h-12 object-cover rounded-full"
                />
                <div className="suggestion-details flex flex-col">
                  <span className="product-name font-semibold">{product.name}</span>
                  <span className="product-description text-sm text-gray-600">{product.description}</span>
                </div>
              </div>
            ))}
          </div>
        ) : searchTerm && !loading && !suggestions.length && (
          <div className="absolute top-full left-0 mt-2 w-full bg-white shadow-lg border border-gray-300 rounded-lg z-10">
            <p className="text-black p-2">No suggestions found</p>
          </div>
        )}
      </div>

      <div className="nav-buttons flex flex-col sm:flex-row items-center gap-4">
        <button
          className="nav-btn px-4 py-2 bg-[#ce807e] hover:bg-[#8b0019] rounded-[20px] transition"
          onClick={() => navigate("/")}
        >
          Home
        </button>
        {!isLoggedIn && (
          <button
            className="nav-btn px-4 py-2 bg-[#ce807e] hover:bg-[#8b0019] rounded-[20px] transition"
            onClick={handleStoreClick}
          >
            {isFormVisible ? "Hide Store Form" : "Show Store Form"}
          </button>
        )}
        <button className="nav-btn px-4 py-2 bg-[#ce807e] hover:bg-[#8b0019] rounded-[20px] transition">
          Profile
        </button>

      </div>
    </header>
  );
};

export default Navbar;
