/* eslint-disable no-unused-vars */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [name, setName] = useState(""); // Changed to `name` for consistency
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // Add state for error messages
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    const userCredentials = {
      name: name, // Use `name` for the user field
      email: email,
      password: password,
    };

    // Get the authenticate token (assuming it's in localStorage)
    const token = localStorage.getItem("authenticateToken");

    try {
      const response = await fetch("http://localhost:5000/api/v1/user/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Add token to the request header
        },
        body: JSON.stringify(userCredentials),
      });

      const result = await response.json();

      if (response.ok) {
        console.log("User signed up:", result);
        navigate("/loginpage"); // Redirect to login after successful sign up
      } else {
        setErrorMessage(result.message || "Signup failed. Please try again.");
      }
    } catch (error) {
      setErrorMessage("An error occurred. Please try again.");
      console.error("Error during signup:", error);
    }
  };

  return (
    <div
    className="min-h-screen flex justify-center items-center bg-cover bg-center"
    style={{ backgroundImage: "url('image.jpg')" }} // Replace with your image path or URL
  >
      <form
        onSubmit={handleSignup}
        className="bg-white p-6 rounded-[20px] shadow-md w-96 bg-opacity-60 "
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Sign Up</h2>

        {errorMessage && <p className="text-red-500 text-center mb-4">{errorMessage}</p>} {/* Error message */}

        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-black">
            Name
          </label>
          <input
            type="text"
            id="name"
            className="w-full px-4 py-2 border rounded-[30px] focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-black">
            Email
          </label>
          <input
            type="email"
            id="email"
            className="w-full px-4 py-2 border rounded-[30px] focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-black">
            Password
          </label>
          <input
            type="password"
            id="password"
            className="w-full px-4 py-2 border rounded-[30px] focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            className="w-[75%] py-2 h-[7vh] bg-[#743614] text-white rounded-[30px] hover:bg-[#a5794b]"
          >
            Sign Up
          </button>
        </div>

        <p className="mt-4 text-sm text-center">
          Already have an account?{" "}
          <a href="/loginpage" className="text-blue-500 hover:underline">
            Login
          </a>
        </p>
      </form>
    </div>
  );
};

export default Signup;
