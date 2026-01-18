import React, { useEffect, useMemo, useState } from "react";
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
  const queryParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  const userType = queryParams.get("userType"); // e.g., "merchant"

  const parseNum = (v, fallback) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  };

  const [limit, setLimit] = useState(() => parseNum(queryParams.get("limit"), 10));
  const [filter, setFilter] = useState(() => parseNum(queryParams.get("filter"), 2));
  const [page, setPage] = useState(() => parseNum(queryParams.get("page"), 1));
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const COLORS = ["#ef4444", "#22c55e", "#ff00c3ff"];

  // Sync state from URL (e.g., when user presses browser back)
  useEffect(() => {
    const qLimit = parseNum(queryParams.get("limit"), 10);
    const qFilter = parseNum(queryParams.get("filter"), 2);
    const qPage = parseNum(queryParams.get("page"), 1);

    if (qLimit !== limit) setLimit(qLimit);
    if (qFilter !== filter) setFilter(qFilter);
    if (qPage !== page) setPage(qPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  // Persist state into URL so it doesn't reset on navigation
  useEffect(() => {
    if (!userType) return;
    const params = new URLSearchParams(location.search);
    params.set("userType", userType);
    params.set("limit", String(limit));
    params.set("filter", String(filter));
    params.set("page", String(page));

    const nextSearch = `?${params.toString()}`;
    if (nextSearch !== location.search) {
      navigate(
        { pathname: location.pathname, search: nextSearch },
        { replace: true }
      );
    }
  }, [userType, limit, filter, page, location.pathname, location.search, navigate]);

  useEffect(() => {
    // ye function tab chalega jab page (component) load hoga
    const fetchTopUsers = async () => {
      if (!userType) return;
      setLoading(true);
      try {
        const res = await axios.post(
          `${env.BASE_URL}/admin/get-top-users?limit=${limit}&filter=${filter}&page=${page}`,
          { userType, limit, filter, page },
          {
            withCredentials: true,
          }
        );
        console.log("res", res);

        // Normalize response shape to avoid runtime crashes
        const raw = res?.data?.data ?? {};
        const topUsers = raw?.topUsers ?? raw?.data?.topUsers ?? [];
        const count = raw?.count ?? raw?.data?.count ?? 0;
        const apiTotalPages = raw?.totalPages ?? raw?.data?.totalPages ?? 1;
        const apiCurrentPage = raw?.currentPage ?? raw?.data?.currentPage ?? page;
        setUser({
          count: typeof count === "number" ? count : Number(count) || 0,
          topUsers: Array.isArray(topUsers) ? topUsers : [],
        });
        setTotalPages(
          typeof apiTotalPages === "number"
            ? apiTotalPages
            : Number(apiTotalPages) || 1
        );
        const nextPage =
          typeof apiCurrentPage === "number"
            ? apiCurrentPage
            : Number(apiCurrentPage) || 1;
        if (nextPage !== page) setPage(nextPage);
      } catch (err) {
        console.error("Error fetching stats:", err);
        setUser({ count: 0, topUsers: [] });
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };
    fetchTopUsers();
  }, [userType, limit, filter, page]);

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

      <div className="topusers-controls">
        <div className="topusers-controls-left">
          <span className="topusers-title">Top Users</span>
          <span className="topusers-subtitle">
            Total: {user?.count ?? 0} | Showing {(user?.topUsers ?? []).length}
          </span>
        </div>

        <div className="topusers-controls-right">
          <label className="topusers-label" htmlFor="topusers-filter">
            Filter
          </label>
          <select
            id="topusers-filter"
            className="topusers-select"
            value={filter}
            onChange={(e) => {
              setFilter(Number(e.target.value));
              setPage(1);
            }}
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={30}>30</option>
            <option value={45}>45</option>
          </select>

          <label className="topusers-label" htmlFor="topusers-limit">
            Limit
          </label>
          <select
            id="topusers-limit"
            className="topusers-select"
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={40}>40</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          {loading ? <span className="topusers-loading">Loading…</span> : null}
        </div>
      </div>

      <div className="shopkeeper-containers">
        {(user?.topUsers ?? []).map((shop) => {
          // Calculate percentages safely
          const success = shop.performance?.success || 0;
          const serverError = shop.performance?.server_error || 0;
          const badRequest = shop.performance?.bad_request || 0;
          const total = success + serverError + badRequest;

          const successPercent =
            total > 0 ? ((success / total) * 100).toFixed(0) : "0";
          const errorPercent =
            total > 0 ? ((serverError / total) * 100).toFixed(0) : "0";
          const badPercent =
            total > 0 ? ((badRequest / total) * 100).toFixed(0) : "0";
          // const apiPercent = total > 0 ? ((shop.performance?.api || 0) / total * 100).toFixed(0) : "0";

          return (
            <div key={shop.id} className="shop-card">
              <h3 className="shop-name">
                {decrypt(shop.firstName || "")} {decrypt(shop.lastName || "")}
              </h3>
              <h5>Total Chai: {shop.chai}</h5>
              {/* <div className="chart-section">
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
                </div>
              </div> */}
              {/* <table className="activity-table">
                <thead>
                  <tr>
                    <th className="time">Start Time</th>
                    <th className="type">Type</th>
                    <th>Message</th>
                    <th>Time Taken</th>
                  </tr>
                </thead>
                <tbody>
                  {(shop.logs ?? []).length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: "center" }}>
                        No logs available.
                      </td>
                    </tr>
                  ) : (
                    (shop.logs ?? []).map((a, i) => (
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
                    ))
                  )}
                </tbody>
              </table> */}
              <button
                className="view-btn"
                onClick={() => navigate(`/user-details?userId=${shop._id}`)}
                // onClick={() => navigate(`/shopkeepers-details?userId=${id}`)}
              >
                View More
              </button>
            </div>
          );
        })}
      </div>

      <div className="topusers-pagination">
        <button
          className="topusers-pagebtn"
          disabled={loading || page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Prev
        </button>
        <span className="topusers-pageinfo">
          Page {page} of {totalPages}
        </span>
        <button
          className="topusers-pagebtn"
          disabled={loading || page >= totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        >
          Next
        </button>
      </div>
    </>
  );
};

export default TopUsersPage;
