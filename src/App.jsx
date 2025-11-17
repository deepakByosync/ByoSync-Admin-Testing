import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import TopUsersPage from "./pages/TopUsersPage.jsx";
import ShopkeeperDetails from "./pages/ShopkeeperDetails.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import Logs from "./pages/Logs.jsx";
import Notification from "./pages/Notification.jsx";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/top-users" element={<TopUsersPage />} />
        <Route path="/user-details" element={<ShopkeeperDetails />} />
        <Route path="/logs" element={<Logs />} />
        <Route path="/notification" element={<Notification />} />
      </Routes>
    </Router>
  );
};

export default App;
