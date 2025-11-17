import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import { PieChart, Pie, Cell, Legend } from "recharts";
import { useLocation, useNavigate } from "react-router-dom";
import "./ShopkeeperDetails.css";
import axios from "axios";
import decrypt from "../utils/Decrypt";
import { env } from "../utils/config.js";

const ShopkeeperDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState(30);
  const [message, setMessage] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const auth = localStorage.getItem("auth") === "true";
    if (!auth) {
      navigate("/");
    }
  }, [navigate]);

  // Get userId from query param
  const queryParams = new URLSearchParams(location.search);
  const userId = queryParams.get("userId");

  useEffect(() => {
    // ye function tab chalega jab page (component) load hoga
    const fetchUsers = async () => {
      try {
        const res = await axios.post(
          `${env.BASE_URL}/admin/get-data-selected-user`,
          { userId, filter, page },
          {
            withCredentials: true,
          }
        );
        console.log("res", res);
        setUser(res.data.data);
        setMessage(res.data.message);
        setPage(res.data.data.currentPage || 1);
        setTotalPages(res.data.data.totalPages || 1);
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };
    fetchUsers();
  }, [filter, page]);

  useEffect(() => {
    if (message) {
      console.log("mess", message);
      const timer = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    console.log("mess", message);
  }, [message]);

  const handleBack = () => {
    navigate(-1);
  };

  const COLORS = ["#ef4444", "#22c55e", "#ff00c3ff"];

  const getPieData = (stats) => [
    // { name: "API Calls", value: stats.api },
    { name: "Error", value: stats.server_error },
    { name: "Success", value: stats.success },
    { name: "Bad Request", value: stats.bad_request },
  ];

  if (!user) {
    return (
      <>
        <Header />
        <div className="shopkeeper-container">
          <div className="loading">
            <p>Loading User details...</p>
          </div>
        </div>
      </>
    );
  }
  const total =
    user?.performance.success +
    user?.performance.server_error +
    user?.performance.bad_request;
  const successPercent = ((user?.performance.success / total) * 100).toFixed(0);
  const badPercent = ((user?.performance.bad_request / total) * 100).toFixed(0);
  const errorPercent = ((user?.performance.server_error / total) * 100).toFixed(
    0
  );

  return (
    <>
      <Header />
      <div className="shopkeeper-container">
        {message && <div className="toast">{message}</div>}

        {/* Top Bar */}
        {/* <div className="top-bar">
        <button onClick={handleBack} className="back-btn">←</button>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div> */}
        {/* Shopkeeper Info */}
        <div className="card">
          <h2>Information</h2>
          <p className="subtitle">Detailed profile and financial summary.</p>
          <div className="info-grid">
            <div>
              <strong>Name:</strong> {decrypt(user?.firstName)}
              {decrypt(user?.lastName)}
            </div>

            {/* <div>
              <strong>User ID:</strong> {user?.userId}
            </div> */}
            <div>
              <strong>Email:</strong> {decrypt(user?.email)}
            </div>
            <div>
              <strong>Total Transactions:</strong> {user?.totalTransactions}
            </div>
            <div>
              <strong>Total Coins Paid by User:</strong>{" "}
              {user?.totalTransactionCoins}
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="filter-section">
          <h3>Filter Data</h3>
          <div className="filter-sections">
            <button
              className={`filter-btn ${filter === 10 ? "active" : ""}`}
              onClick={() => {
                setFilter(10);
                setPage(1);
              }}
            >
              10 Days
            </button>
            <button
              className={`filter-btn ${filter === 15 ? "active" : ""}`}
              onClick={() => {
                setFilter(15);
                setPage(1);
              }}
            >
              15 Days
            </button>
            <button
              className={`filter-btn ${filter === 30 ? "active" : ""}`}
              onClick={() => {
                setFilter(30);
                setPage(1);
              }}
            >
              1 Month
            </button>
          </div>
        </div>

        {/* Performance Overview */}
        <div className="card">
          <h3>Performance Overview</h3>
          {/* <div className="chart-placeholder">
            <div className="circle-chart">
              <div className="circle-inner"></div>
            </div>
            <div className="chart-legend">
              <p>
                <span className="green-dot"></span> Success: 90%
              </p>
              <p>
                <span className="red-dot"></span> Error: 5%
              </p>
              <p>
                <span className="blue-dot"></span> API Calls: 5%
              </p>
            </div>
          </div> */}
          <div className="chart-section">
            <PieChart width={230} height={230}>
              <Pie
                data={getPieData(user.performance)}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                labelLine={false}
              >
                {getPieData(user.performance)
                  .filter((entry) => entry.name !== "api")
                  .map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
              </Pie>
              <Legend />
            </PieChart>

            <div className="chart-text">
              <p style={{ color: "#22c55e" }}>Success: {successPercent}%</p>
              <p style={{ color: "#ef4444" }}>Error: {errorPercent}%</p>
              <p style={{ color: "#ff00c3ff" }}>Bad Request: {badPercent}%</p>
              {/* <p style={{ color: "#3b82f6" }}>API Calls: {apiPercent}%</p> */}
            </div>
          </div>
        </div>

        {/* API Logs */}
        <div className="card">
          <h3>API Logs</h3>
          <p className="subtitle">Recent API call activities.</p>
          <table>
            <thead>
              <tr>
                <th>Start Time</th>
                <th>Type</th>
                <th>Message</th>
                <th>Time Taken</th>
              </tr>
            </thead>
            <tbody>
              {user?.logs.map((log, i) => (
                <tr key={i}>
                  <td>{new Date(log.time).toLocaleString()}</td>
                  <td>
                    <span className={`badge ${log.type}`}>
                      {log.type.replace("_", " ")}
                    </span>
                  </td>
                  <td>{log.message}</td>
                  <td>{log.timeTaken}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="pagination">
            <button disabled={page === 1} onClick={() => setPage(page - 1)}>
              Prev
            </button>

            <span>
              Page {page} of {totalPages}
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        </div>

        {/* Footer */}
        {/* <footer className="footer">Made with 💜 ByoSync</footer> */}
      </div>
    </>
  );
};

export default ShopkeeperDetails;
