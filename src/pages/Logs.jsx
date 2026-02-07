import React, { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import { useLocation } from "react-router-dom";
import { PieChart, Pie, Cell, Legend, Tooltip } from "recharts";
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

  const formatType = (type) => {
    if (!type) return "Unknown";
    return String(type)
      .split("_")
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  };

  const COLORS = [
    "#22c55e", // green
    "#ef4444", // red
    "#ff00c3ff", // pink
    "#3b82f6", // blue
    "#7a3cfe", // purple
    "#f59e0b", // amber
    "#10b981", // emerald
  ];

  const colorForType = (type, idx) => {
    const t = String(type || "").toUpperCase();
    if (t.includes("SUCCESS")) return "#22c55e";
    if (t.includes("PERFORMANCE")) return "#22c55e";
    if (t.includes("BAD_REQUEST")) return "#ff00c3ff";
    if (t.includes("SERVER_ERROR") || t === "ERROR") return "#ef4444";
    if (t.includes("API_CALL")) return "#3b82f6";
    if (t.includes("MIDDLEWARE_CALL")) return "#7a3cfe";
    return COLORS[idx % COLORS.length];
  };

  const pieData = useMemo(() => {
    const counts = (logs ?? []).reduce((acc, l) => {
      const key = l?.type ? String(l.type) : "UNKNOWN";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const sorted = Object.entries(counts)
      .map(([name, value]) => ({ rawName: name, name: formatType(name), value }))
      .sort((a, b) => b.value - a.value);

    const MAX_SLICES = 6;
    if (sorted.length <= MAX_SLICES) return sorted;

    const head = sorted.slice(0, MAX_SLICES);
    const tail = sorted.slice(MAX_SLICES);
    const others = tail.reduce((sum, x) => sum + (x.value || 0), 0);
    return [...head, { rawName: "OTHERS", name: "Others", value: others }];
  }, [logs]);

  const pieWithPercent = useMemo(() => {
    const total = (pieData ?? []).reduce((sum, x) => sum + (x.value || 0), 0);
    return (pieData ?? []).map((x) => ({
      ...x,
      percent: total > 0 ? ((x.value || 0) / total) * 100 : 0,
    }));
  }, [pieData]);

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

        {/* Pie Chart Summary */}
        <div className="logs-summary-card">
          <div className="logs-summary-head">
            <div>
              <h3>Logs Breakdown</h3>
              <p className="subtitle">By type (current page)</p>
            </div>
            <div className="logs-summary-meta">
              Total logs on page: <b>{(logs ?? []).length}</b>
            </div>
          </div>

          {(logs ?? []).length === 0 ? (
            <div className="no-logs">No logs to summarize.</div>
          ) : (
            <div className="logs-summary-body">
              <div className="logs-summary-chart">
                <PieChart width={320} height={220}>
                  <Pie
                    data={pieWithPercent}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    labelLine={false}
                  >
                    {pieWithPercent.map((entry, index) => (
                      <Cell
                        key={`cell-${entry.rawName || entry.name}-${index}`}
                        fill={colorForType(entry.rawName || entry.name, index)}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend layout="vertical" align="right" verticalAlign="right"/>
                </PieChart>
              </div>

              <div className="logs-percent-list">
                {pieWithPercent.map((item, idx) => (
                  <div
                    key={`pct-${item.rawName || item.name}-${idx}`}
                    className="logs-percent-row"
                    style={{ color: colorForType(item.rawName || item.name, idx) }}
                  >
                    {item.name}: {Math.round(item.percent)}%
                  </div>
                ))}
              </div>
            </div>
          )}
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
                  {/* <th>Start Time</th> */}
                  <th>Type</th>
                  <th>Message</th>
                  <th>Time Taken</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => (
                  <tr key={i}>
                    {/* <td>{new Date(log.createdAt).toLocaleString()}</td> */}
                    <td>
                      <span className={`badge ${log.type}`}>
                        {formatType(log.type)}
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
