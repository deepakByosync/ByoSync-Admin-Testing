import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, Legend } from "recharts";
import axios from "axios";
import "./ShopkeeperPage.css"; // styling separate rakhi hai
import decrypt from "../utils/Decrypt";
import { env } from "../utils/config.js";

const TopUsersPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const userType = queryParams.get("userType"); // e.g., "merchant"
  const COLORS = ["#ef4444", "#22c55e", "#ff00c3ff"];

  useEffect(() => {
    // ye function tab chalega jab page (component) load hoga
    const fetchTopUsers = async () => {
      try {
        const res = await axios.post(
          `${env.BASE_URL}/admin/get-top-users`,
          { userType },
          {
            withCredentials: true,
          }
        );
        console.log("res", res);
        setUser(res.data.data);
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };
    fetchTopUsers();
  }, []);

  // useEffect(() => {
  //   console.log(user);
  // }, [user]);

  const getPieData = (stats) => {
    if (!stats) return [];
    return [
      { name: "Error", value: stats.server_error || 0 },
      { name: "Success", value: stats.success || 0 },
      { name: "Bad Request", value: stats.bad_request || 0 },
    ];
  };

  if (!user) {
    return (
      <>
        <Header />
        <div className="shopkeeper-container">
          <div className="loading">
            <p>Loading top users...</p>
          </div>
        </div>
      </>
    );
  }
  return (
    <>
      <Header />

      <div className="shopkeeper-containers">
        {user?.topUsers.map((shop) => {
          // Calculate percentages safely
          const success = shop.performance?.success || 0;
          const serverError = shop.performance?.server_error || 0;
          const badRequest = shop.performance?.bad_request || 0;
          const total = success + serverError + badRequest;
          
          const successPercent = total > 0 ? ((success / total) * 100).toFixed(0) : "0";
          const errorPercent = total > 0 ? ((serverError / total) * 100).toFixed(0) : "0";
          const badPercent = total > 0 ? ((badRequest / total) * 100).toFixed(0) : "0";
          // const apiPercent = total > 0 ? ((shop.performance?.api || 0) / total * 100).toFixed(0) : "0";

          return (
            <div key={shop.id} className="shop-card">
              <h3 className="shop-name">
                {decrypt(shop.firstName || '')} {decrypt(shop.lastName || '')}
              </h3>
              <div className="chart-section">
                <PieChart width={230} height={230}>
                  <Pie
                    data={getPieData(shop.performance)}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    labelLine={false}
                  >
                    {getPieData(shop.performance)
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
                  <p style={{ color: "#ff00c3ff" }}>
                    Bad Request: {badPercent}%
                  </p>
                  {/* <p style={{ color: "#3b82f6" }}>API Calls: {apiPercent}%</p> */}
                </div>
              </div>
              <table className="activity-table">
                <thead>
                  <tr>
                    <th className="time">Start Time</th>
                    <th className="type">Type</th>
                    <th>Message</th>
                    <th>Time Taken</th>
                  </tr>
                </thead>
                <tbody>
                  {shop.logs.map((a, i) => (
                    <tr key={i}>
                      <td>{new Date(a.time).toLocaleString()}</td>
                      <td>
                        <span className={`badge ${a.type}`}>
                          {a.type.replace("_", " ")}
                        </span>
                      </td>
                      <td>{a.message}</td>
                      <td>{a.timeTaken}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                className="view-btn"
                onClick={() => navigate(`/user-details?userId=${shop.userId}`)}
                // onClick={() => navigate(`/shopkeepers-details?userId=${id}`)}
              >
                View More
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default TopUsersPage;
