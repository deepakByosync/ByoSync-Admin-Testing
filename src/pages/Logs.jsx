import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { env } from "../utils/config.js";
import "./Logs.css"; // custom css styling

const Logs = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const data = queryParams.get("log"); // e.g., "hello"
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState(30);
  const [message, setMessage] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const res = await axios.post(
          `${env.BASE_URL}/admin/get-all-logs`,
          { form: data, filter, page },
          { withCredentials: true }
        );
        console.log(res);
        setLogs(res.data.data.logs || []);
        setMessage(res.data.message);
        setPage(res.data.data.currentPage || 1);
        setTotalPages(res.data.data.totalPages || 1);
      } catch (err) {
        console.error("Error fetching logs:", err);
      } finally {
        setLoading(false); // Set loading to false after the request completes
      }
    };

    fetchLogs();
  }, [data, filter, page]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <>
      <Header />
      <div className="logs-container">
        {/* Header */}
        {message && <div className="toast">{message}</div>}

        <div className="logs-header">
          <h2>{data} Logs</h2>
          <p className="logs-subtitle">
            Showing API logs for: <b>{data}</b>
          </p>
        </div>

        {/* Filter Buttons */}
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

        {/* Logs Table */}
        <div className="logs-table-card">
          <h3>API Logs</h3>
          <p className="subtitle">Recent API call activities</p>

          {loading ? (
            <div className="loading">Loading...</div> // Loading spinner/message
          ) : logs.length === 0 ? (
            <p className="no-logs">No logs available.</p>
          ) : (
            <table className="logs-table">
              <thead>
                <tr>
                  <th>Start Time</th>
                  <th>Type</th>
                  <th>Message</th>
                  <th>Time Taken</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => (
                  <tr key={i}>
                    <td>{new Date(log.createdAt).toLocaleString()}</td>
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
          )}

          <div className="pagination">
            <button
              disabled={page === 1 || loading} // Disable button if on the first page or while loading
              onClick={() => setPage(page - 1)}
            >
              Prev
            </button>

            <span>
              Page {page} of {totalPages}
            </span>

            <button
              disabled={page === totalPages || loading} // Disable button if on the last page or while loading
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Logs;
