import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Header = () => {
  const navigate = useNavigate();
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
        <div className="header-left"></div>
        <div className="header-right">
          {/* <button className="logout-btn" onClick={() => navigate("/")}>
            <span className="logout-icon"></span> Change Password
          </button> */}
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
