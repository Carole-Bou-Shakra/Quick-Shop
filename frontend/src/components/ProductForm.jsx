/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ProductForm = () => {
  const [productData, setProductData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    pictures: [],
  });

  const [responseData, setResponseData] = useState(null);
  const navigate = useNavigate(); // Hook for navigation

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData({ ...productData, [name]: value });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setProductData((prevData) => ({
      ...prevData,
      pictures: [...prevData.pictures, ...files],
    }));
  };

  const handleRemoveImage = (index) => {
    setProductData((prevData) => ({
      ...prevData,
      pictures: prevData.pictures.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    // Append form fields
    Object.keys(productData).forEach((key) => {
      if (key === "pictures" && productData.pictures) {
        productData.pictures.forEach((file) => {
          formData.append("pictures", file);
        });
      } else {
        formData.append(key, productData[key]);
      }
    });

    try {
      const response = await axios.post(
        "http://localhost:5000/api/v1/product/create",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      console.log("Product created successfully:", response.data);
      setResponseData(response.data.data);

      // Navigate to the ProductGallery route after successful submission
      navigate("/");
    } catch (error) {
      console.error("Error creating product:", error.response?.data || error.message);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        backgroundImage: `url('bashboard1.jpg')`, // Replace with your image path
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="max-w-lg mx-auto p-6 bg-white/30 shadow-lg rounded-[20px] mt-10 space-y-4 backdrop-blur-lg border border-white/20"
        style={{
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.37)",
        }}
      >
        <div className="flex flex-col">
          <label htmlFor="name" className="text-sm font-semibold text-gray-700">
            Name
          </label>
          <input
            type="text"
            name="name"
            placeholder="Name"
            onChange={handleChange}
            required
            className="mt-2 px-4 py-2 border border-gray-300 rounded-[20px] focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-col">
          <label
            htmlFor="description"
            className="text-sm font-semibold text-gray-700"
          >
            Description
          </label>
          <textarea
            name="description"
            placeholder="Description"
            onChange={handleChange}
            required
            className="mt-2 px-4 py-2 border h-18 border-gray-300 rounded-[20px] focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="price" className="text-sm font-semibold text-gray-700">
            Price
          </label>
          <input
            type="number"
            name="price"
            placeholder="Price"
            onChange={handleChange}
            required
            className="mt-2 px-4 py-2 border border-gray-300 rounded-[20px] focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-col">
          <label
            htmlFor="category"
            className="text-sm font-semibold text-gray-700"
          >
            Category
          </label>
          <input
            type="text"
            name="category"
            placeholder="Category"
            onChange={handleChange}
            required
            className="mt-2 px-4 py-2 border border-gray-300 rounded-[20px] focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-col">
          <label
            htmlFor="pictures"
            className="text-sm font-semibold text-gray-700"
          >
            Upload Pictures
          </label>
          <input
            type="file"
            name="pictures"
            multiple
            onChange={handleFileChange}
            className="mt-2 px-4 py-2 border border-gray-300 rounded-[20px] focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {productData.pictures.length > 0 && (
          <div className="mt-4 space-y-2">
            <h3 className="text-sm font-semibold text-gray-700">
              Uploaded Pictures
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {productData.pictures.map((file, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          className="w-full py-2 bg-[#b37755] text-white font-semibold rounded-[20px] hover:bg-[#c4695c] focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Create Product
        </button>
      </form>
    </div>
  );
};

export default ProductForm;
