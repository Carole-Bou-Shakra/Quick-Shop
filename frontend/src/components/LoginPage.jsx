/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// eslint-disable-next-line react/prop-types
const LoginPage = ({ handleLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  // Handle form submission and API login
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const userCredentials = {
      email: username,  // Make sure you're using the correct username variable
      password: password,
    };
  
    // Assuming you already have the token (replace with your actual logic for getting the token)
    const token = localStorage.getItem("authenticateToken");
  
    try {
      const response = await fetch("http://localhost:5000/api/v1/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // Include the token here
        },
        body: JSON.stringify({
          email: userCredentials.email,  // Use userCredentials.email here
          password: userCredentials.password,
        }),
      });
  
      const result = await response.json();
  
      console.log("Response from API:", result); // Debugging the response
  
      if (response.ok) {
        handleLogin(); // Set logged-in state in the parent
        navigate("/");
        console.log("Login successful:", result);
      } else {
        setErrorMessage(result.message || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Error during login:", error);
      setErrorMessage("An error occurred. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-cover bg-center" style={{ backgroundImage: "url('loginimage.jpg')" }}>
      <div className="w-96 max-w-md p-8 rounded-[20px] shadow-lg bg-white bg-opacity-60">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
        {errorMessage && (
          <p className="text-red-500 text-center mb-4">{errorMessage}</p>
        )}

        <form onSubmit={handleSubmit} className="rounded-[20px]">
          <div className="mb-4">
            <label
              htmlFor="username"
              className="block text-gray-700 font-medium mb-2"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              className="w-full p-3 border border-gray-300 rounded-[30px]"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-gray-700 font-medium mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full p-3 border border-gray-300 rounded-[30px]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              className="w-[75%] py-2 h-[7vh] bg-[#6f6d80] text-white font-semibold rounded-[30px] hover:bg-[#743c30] transition"
            >
              Login
            </button>
          </div>

          <p className="mt-4 text-sm text-center px-2">
            Don’t have an account?{" "}
            <a href="/signup" className="text-blue-500 hover:underline">
              Sign Up
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
