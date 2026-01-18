import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Dashboard.css";
import { env } from "../utils/config.js";

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    // ye function tab chalega jab page (component) load hoga
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${env.BASE_URL}/admin/admin-stats`, {
          withCredentials: true,
        });
        console.log("res", res);
        setStats(res.data.data);
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="dashboard-container">
      {/* Navbar */}
      <Header />

      {/* Main Content */}
      <main className="dashboard-content">
        <h1 className="dashboard-title">Dashboard Overview</h1>

        <div className="panel-container">
          {/* Customer Panel */}
          <div className="panel-card">
            <h2>User Panel</h2>
            <div className="panel-row">
              <span>Total Users</span>
              <strong>{stats?.totalUsers}</strong>
            </div>
            <div className="panel-row">
              <span>Total Chai</span>
              <strong>{stats?.totalChai}</strong>
            </div>
            {/* <div className="panel-row">
              <span>Total Transactions</span>
              <strong>{stats?.totalTransactions}</strong>
            </div>
            <div className="panel-row">
              <span>Paid by Users</span>
              <strong>₹ {stats?.totalAmount}</strong>
            </div> */}
            <button
              className="view-btn"
              onClick={() => navigate("/top-users?userType=user&limit=10&filter=1&page=1")}
            >
              View More
            </button>
            <button
              className="view-btn"
              onClick={() => navigate("/chai-device")}
            >
              View Chai Device
            </button>
          </div>

          {/* logs Panel */}
          <div className="panel-card">
            <h2>Logs Panel</h2>
            <div className="panel-row">
              <button
                className="view-btn"
                onClick={() => navigate("/logs?log=BACKEND")}
              >
                Back End
              </button>

              <button
                className="view-btn"
                onClick={() => navigate("/logs?log=APP")}
              >
                APP
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      {/* <footer className="footer">
        <p>
          Made with 💜 <a href="#">ByoSync</a>
        </p>
      </footer> */}
    </div>
  );
};

export default Dashboard;
