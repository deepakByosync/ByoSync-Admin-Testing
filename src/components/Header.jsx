import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Header.css";

const Header = ({ showBack } = {}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  
  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleChangePassword = async () => {
    console.log("Change Password clicked!");

    const response = await axios.post(
      "http://localhost:7000/api/v1/admin/admin-password-change",
      {},
      {
        withCredentials: true,
      }
    );
    console.log("response", response);
    navigate("/");
  };
  return (
    <div>
      <header className="dashboard-header">
        <div className="header-left">
          {(showBack ?? (location.pathname !== "/dashboard" && location.pathname !== "/")) ? (
            <button
              className="back-btn"
              onClick={() => navigate(-1)}
              aria-label="Go back"
              title="Back"
              type="button"
            >
              ←
            </button>
          ) : null}
        </div>
        <div className="header-right">
          {/* <button className="logout-btn" onClick={() => navigate("/")}>
            <span className="logout-icon"></span> Change Password
          </button> */}
          <button
            className="logout-btn"
            onClick={() => navigate("/delete-user")}
          >
            <span className="logout-icon">Delete User</span>
          </button>
          <button
            className="logout-btn"
            onClick={() => navigate("/notification")}
          >
            <span className="logout-icon">Sent Notification</span>
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            <span className="logout-icon">Logout</span>
          </button>
          {/* <img src="/admin.jpg" alt="Admin" className="admin-avatar" /> */}
        </div>
      </header>
    </div>
  );
};

export default Header;
