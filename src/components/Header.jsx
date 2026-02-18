import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Header.css";

const Header = ({ showBack } = {}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  
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

  // Close mobile drawer on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.search]);

  // Close on Escape
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);
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
          {/* Mobile 3-dot menu */}
          <button
            type="button"
            className="menu-btn"
            aria-label="Open menu"
            aria-expanded={menuOpen ? "true" : "false"}
            onClick={() => setMenuOpen(true)}
          >
            ⋮
          </button>

          {/* Desktop actions */}
          <div className="header-actions">
          {/* <button className="logout-btn" onClick={() => navigate("/")}>
            <span className="logout-icon"></span> Change Password
          </button> */}
          <button
            className="logout-btn"
            onClick={() => navigate("/delete-user")}
          >
            Delete User
          </button>
          <button
            className="logout-btn"
            onClick={() => navigate("/notification")}
          >
            Sent Notification
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
          {/* <img src="/admin.jpg" alt="Admin" className="admin-avatar" /> */}
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div
        className={`menu-overlay ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen(false)}
        role="presentation"
      />
      <aside
        className={`menu-drawer ${menuOpen ? "open" : ""}`}
        aria-hidden={menuOpen ? "false" : "true"}
      >
        <div className="menu-drawer-head">
          <span className="menu-title">Menu</span>
          <button
            type="button"
            className="menu-close"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>
        <div className="menu-drawer-body">
          <button
            className="menu-item"
            type="button"
            onClick={() => navigate("/delete-user")}
          >
            Delete User
          </button>
          <button
            className="menu-item"
            type="button"
            onClick={() => navigate("/notification")}
          >
            Sent Notification
          </button>
          <button className="menu-item danger" type="button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>
    </div>
  );
};

export default Header;
