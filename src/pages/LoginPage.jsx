import React, { useState, useEffect, use } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./LoginPage.css";
import { env } from "../utils/config.js";
// `${env.BASE_URL}
const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();
  // LOGIN API CALL
  useEffect(() => {
    const auth = localStorage.getItem("auth") === "true";
    if (auth) {
      navigate("/dashboard");
    }
  }, [navigate]);
  const handleLogin = async () => {
    if (!password.trim() && !email.trim()) {
      setMessage("Please enter ByoSync email and password");
      return;
    }
    let regex = /^[a-zA-Z0-9._%+-]+@byosync.in$/;
    if (!regex.test(email)) {
      console.log("Invalid Email address");
      setMessage("Invalid Email address");
      return;
    }

    if (!password.trim()) {
      console.log("Please enter Password");
      setMessage("Please enter Password");
      return;
    }

    if (!email.trim()) {
      console.log("Please enter your email");
      setMessage("Please enter ByoSync email");

      return;
    }

    console.log("email", email);
    console.log("pass", password);
    try {
      const response = await axios.post(
        `${env.BASE_URL}/admin/admin-login`,
        { email, password },
        {
          withCredentials: true,
        }
      );
      console.log("response", response);

      if (response.status === 200) {
        console.log("Navigating to dashboard...");
        localStorage.setItem("auth", true);
        setMessage("Login Successful!");
        navigate("/dashboard");
      }
      setMessage(response.response.data.message);
    } catch (error) {
      console.error(error);
      setMessage(error.response.data.message);
      // setMessage(error.response?.data?.error || "Something went wrong!");
    }
  };

  // remove msg after 3 sec
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="login-container">
      {message && <div className="toast">{message}</div>}

      <div className="login-box">
        <div className="logo-section">
          <img
            src="https://res.cloudinary.com/deepak2199/image/upload/v1760787897/pahpq3slvbhn9eazmhin.png"
            alt="ByoSync Logo"
            className="logo"
          />
        </div>

        <h2 className="title">Login as Admin</h2>

        <form>
          <div className="input-group">
            <input
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </form>
        <button onClick={handleLogin} className="login-btn">
          Login
        </button>
      </div>
      <footer className="footer">
        <p>
          Made with 💜 <a href="#">ByoSync</a>
        </p>
      </footer>
    </div>
  );
};

export default LoginPage;
