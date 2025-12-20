import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./LoginPage.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const { isAuthenticated, login, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, loading, navigate]);

  const handleLogin = async () => {
    if (!password.trim() && !email.trim()) {
      setMessage("Please enter ByoSync email and password");
      return;
    }
    let regex = /^[a-zA-Z0-9._%+-]+@byosync.in$/;
    if (!regex.test(email)) {
      setMessage("Invalid Email address");
      return;
    }

    if (!password.trim()) {
      setMessage("Please enter Password");
      return;
    }

    if (!email.trim()) {
      setMessage("Please enter ByoSync email");
      return;
    }

    const result = await login(email, password);
    setMessage(result.message);
    if (result.success) {
      navigate("/dashboard");
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
