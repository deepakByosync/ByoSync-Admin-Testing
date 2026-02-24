import React, { useMemo } from "react";
import {
  AreaChart, Area,
  BarChart, Bar,
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell,
} from "recharts";

// this gives colors to the labels 
const TYPE_COLORS = {
  PERFORMANCE: "#38bdf8",
  SCREEN: "#a78bfa",
  CAMERA_EVENT: "#f472b6",
  SCREEN_TRANSITION: "#fb923c",
  API_CALL: "#34d399",
  SERVER_ERROR: "#f87171",
  SUCCESS: "#4ade80",
  UNKNOWN: "#94a3b8",
};
const colorOf = (t) => TYPE_COLORS[String(t || "").toUpperCase()] || "#94a3b8";

// this is to create a custom hoover popup for charts
const LightTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#ffffff",
      border: "1px solid #e2e8f0",
      borderRadius: 8,
      padding: "8px 14px",
      fontSize: 12,
      color: "#0f172a",
      boxShadow: "0 4px 16px rgba(0,0,0,0.12)"
    }}>
      {label && <div style={{ color: "#94a3b8", marginBottom: 4 }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || "#0f172a" }}>
          {p.name}: <b>{p.value}</b>
        </div>
      ))}
    </div>
  );
};

// ─── CARD WRAPPER ─────────────────────────────────────────────────────────────
const Card = ({ title, subtitle, children }) => (
  <div style={{
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    padding: "24px 28px",
    marginBottom: 24,
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
  }}>
    <div style={{ marginBottom: 16 }}>
      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0f172a" }}>{title}</h3>
      {subtitle && <p style={{ margin: "4px 0 0", fontSize: 12, color: "#94a3b8" }}>{subtitle}</p>}
    </div>
    {children}
  </div>
);

// ─── 1. TIMELINE CHART ────────────────────────────────────────────────────────
export const TimelineChart = ({ logs = [] }) => {
  const { data, types } = useMemo(() => {
    const map = {};
    const typeSet = new Set();
    logs.forEach(log => {
      const d = new Date(log.createdAt);
      const key = `${String(d.getHours()).padStart(2, "0")}:${String(Math.floor(d.getMinutes() / 10) * 10).padStart(2, "0")}`;
      if (!map[key]) map[key] = { time: key };
      map[key][log.type] = (map[key][log.type] || 0) + 1;
      typeSet.add(log.type);
    });
    return {
      data: Object.values(map).sort((a, b) => a.time.localeCompare(b.time)),
      types: [...typeSet],
    };
  }, [logs]);

  if (!logs.length) return null;

  return (
    <Card title="Event Timeline" subtitle="Log frequency per 10-min window, broken down by type">
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <defs>
            {types.map(t => (
              <linearGradient key={t} id={`tl-grad-${t}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colorOf(t)} stopOpacity={0.25} />
                <stop offset="95%" stopColor={colorOf(t)} stopOpacity={0.02} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="time" tick={{ fill: "#94a3b8", fontSize: 11 }} />
          <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
          <Tooltip content={<LightTooltip />} />
          {types.map(t => (
            <Area key={t} type="monotone" dataKey={t}
              name={t.replace(/_/g, " ")} stroke={colorOf(t)} strokeWidth={2}
              fill={`url(#tl-grad-${t})`} stackId="1"
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
};

// ─── 2. ACTIVITY FLOW ─────────────────────────────────────────────────────────
const JOURNEY_STEPS = [
  { key: "Application | Started",                                 label: "App Start",   color: "#38bdf8" },
  { key: "Application | Initialized",                             label: "App Init",    color: "#a78bfa" },
  { key: "UserRegisterFlow | Opened via Consent",                 label: "Register",    color: "#f472b6" },
  { key: "FaceRegistrationScreen | Opened from MainAppScaffold",  label: "Face Screen", color: "#fb923c" },
  { key: "Camera permission granted, starting CameraXPreview",    label: "Camera",      color: "#34d399" },
  { key: "Login Success",                                         label: "✓ Success",  color: "#4ade80" },
];

export const ActivityFlowChart = ({ logs = [] }) => {
  const counts = useMemo(() => {
    const msgCounts = {};
    logs.forEach(l => { msgCounts[l.message] = (msgCounts[l.message] || 0) + 1; });
    return JOURNEY_STEPS.map(s => ({ ...s, count: msgCounts[s.key] || 0 }));
  }, [logs]);

  const max = Math.max(...counts.map(c => c.count), 1);

  return (
    <Card title="User Journey Flow" subtitle="Event frequency through the app lifecycle">
      <div style={{ display: "flex", alignItems: "center", overflowX: "auto", paddingBottom: 8 }}>
        {counts.map((step, i) => {
          const pct = Math.max(step.count / max, 0.06);
          const isLast = i === counts.length - 1;
          return (
            <React.Fragment key={step.key}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 90, flex: "0 0 auto" }}>
                <div style={{
                  width: 72, height: 72, borderRadius: "50%",
                  background: `conic-gradient(${step.color} ${Math.round(pct * 360)}deg, #e2e8f0 0deg)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <div style={{
                    width: 54, height: 54, borderRadius: "50%", background: "#ffffff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 15, fontWeight: 800, color: "#0f172a",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.08)"
                  }}>
                    {step.count}
                  </div>
                </div>
                <div style={{ marginTop: 8, fontSize: 11, color: "#64748b", textAlign: "center", lineHeight: 1.3 }}>
                  {step.label}
                </div>
              </div>
              {!isLast && (
                <div style={{ flex: "1 1 0", height: 2, minWidth: 20, position: "relative", margin: "0 4px", marginBottom: 24 }}>
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, #38bdf8, #a78bfa)", borderRadius: 2 }} />
                  <div style={{
                    position: "absolute", right: -6, top: "50%", transform: "translateY(-50%)",
                    width: 0, height: 0, borderTop: "5px solid transparent",
                    borderBottom: "5px solid transparent", borderLeft: "8px solid #a78bfa"
                  }} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </Card>
  );
};

// ─── 3. HEATMAP ───────────────────────────────────────────────────────────────
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export const HeatmapChart = ({ logs = [] }) => {
  const { grid, maxVal } = useMemo(() => {
    const map = {};
    logs.forEach(l => {
      const d = new Date(l.createdAt);
      const key = `${d.getDay()}-${d.getHours()}`;
      map[key] = (map[key] || 0) + 1;
    });
    return { grid: map, maxVal: Math.max(...Object.values(map), 1) };
  }, [logs]);

  const cellColor = (v) => {
    if (!v) return "#f8fafc";
    const t = v / maxVal;
    if (t < 0.2) return "#f1f5f9";
    if (t < 0.4) return "#bae6fd";
    if (t < 0.6) return "#7dd3fc";
    if (t < 0.8) return "#38bdf8";
    return "#0284c7";
  };

  if (!logs.length) return null;

  return (
    <Card title="Activity Heatmap" subtitle="Logs per hour × day — reveals peak usage windows">
      <div style={{ overflowX: "auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "36px repeat(24, 1fr)", gap: 3, minWidth: 580 }}>
          <div />
          {HOURS.map(h => (
            <div key={h} style={{ fontSize: 9, color: "#94a3b8", textAlign: "center" }}>
              {h === 0 ? "12a" : h < 12 ? `${h}a` : h === 12 ? "12p" : `${h - 12}p`}
            </div>
          ))}
          {DAYS.map((day, di) => (
            <React.Fragment key={day}>
              <div style={{ fontSize: 10, color: "#64748b", display: "flex", alignItems: "center" }}>{day}</div>
              {HOURS.map(h => {
                const v = grid[`${di}-${h}`] || 0;
                return (
                  <div key={h} title={`${day} ${h}:00 — ${v} logs`} style={{
                    height: 18, borderRadius: 3, background: cellColor(v),
                    cursor: "default", transition: "transform 0.1s",
                    border: "1px solid #f1f5f9"
                  }}
                    onMouseEnter={e => e.currentTarget.style.transform = "scale(1.4)"}
                    onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                  />
                );
              })}
            </React.Fragment>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12 }}>
          <span style={{ fontSize: 10, color: "#94a3b8" }}>Low</span>
          {["#f1f5f9", "#bae6fd", "#7dd3fc", "#38bdf8", "#0284c7"].map(c => (
            <div key={c} style={{ width: 16, height: 16, borderRadius: 3, background: c, border: "1px solid #e2e8f0" }} />
          ))}
          <span style={{ fontSize: 10, color: "#94a3b8" }}>High</span>
        </div>
      </div>
    </Card>
  );
};

// ─── 4. TOP EVENTS ────────────────────────────────────────────────────────────
export const TopEventsChart = ({ logs = [] }) => {
  const data = useMemo(() => {
    const counts = {};
    logs.forEach(l => { counts[l.message || "Unknown"] = (counts[l.message || "Unknown"] || 0) + 1; });
    return Object.entries(counts)
      .map(([message, count]) => ({
        message: message.length > 40 ? message.slice(0, 40) + "…" : message,
        count,
      }))
      .sort((a, b) => b.count - a.count).slice(0, 8);
  }, [logs]);

  if (!logs.length) return null;

  return (
    <Card title="Top Events" subtitle="Most frequent log messages across all types">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 24, left: 4, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
          <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 11 }} />
          <YAxis type="category" dataKey="message" width={230} tick={{ fill: "#64748b", fontSize: 10 }} />
          <Tooltip content={<LightTooltip />} />
          <Bar dataKey="count" name="Count" radius={[0, 6, 6, 0]}>
            {data.map((_, i) => <Cell key={i} fill={`hsl(${200 + i * 18}, 80%, 60%)`} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

// ─── 5. PERFORMANCE DISTRIBUTION ─────────────────────────────────────────────
const PERF_BUCKETS = [
  { label: "0–100ms",   min: 0,   max: 100  },
  { label: "100–200ms", min: 100, max: 200  },
  { label: "200–300ms", min: 200, max: 300  },
  { label: "300–400ms", min: 300, max: 400  },
  { label: "400–500ms", min: 400, max: 500  },
  { label: "500ms+",    min: 500, max: Infinity },
];
const PERF_COLORS = ["#4ade80", "#a3e635", "#facc15", "#fb923c", "#f87171", "#ef4444"];

export const PerfDistChart = ({ logs = [] }) => {
  const data = useMemo(() => {
    const buckets = PERF_BUCKETS.map(b => ({ ...b, count: 0 }));
    logs
      .filter(l => l.type === "PERFORMANCE" && l.timeTaken != null)
      .forEach(l => {
        const t = parseFloat(String(l.timeTaken)); // handles "120ms" or 120
        if (!isNaN(t)) {
          const b = buckets.find(b => t >= b.min && t < b.max);
          if (b) b.count++;
        }
      });
    return buckets;
  }, [logs]);

  if (!data.some(d => d.count > 0)) return null;

  return (
    <Card title="Performance Distribution" subtitle="Response time buckets for PERFORMANCE logs">
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 11 }} />
          <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
          <Tooltip content={<LightTooltip />} />
          <Bar dataKey="count" name="Logs" radius={[6, 6, 0, 0]}>
            {data.map((_, i) => <Cell key={i} fill={PERF_COLORS[i]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

// ─── 6. USER ACTIVITY ─────────────────────────────────────────────────────────
export const UserActivityChart = ({ logs = [] }) => {
  const data = useMemo(() => {
    const counts = {};
    logs.forEach(l => {
      if (l.user) counts[l.user] = (counts[l.user] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([user, count]) => ({ user: user.slice(-10), count }))
      .sort((a, b) => b.count - a.count).slice(0, 8);
  }, [logs]);

  if (!data.length) return null;

  return (
    <Card title="Top Active Users" subtitle="Users ranked by total log volume">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="user" tick={{ fill: "#94a3b8", fontSize: 11 }} />
          <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
          <Tooltip content={<LightTooltip />} />
          <Bar dataKey="count" name="Logs" radius={[6, 6, 0, 0]}>
            {data.map((_, i) => <Cell key={i} fill={`hsl(${270 + i * 15}, 75%, 65%)`} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

// ─── 7. ERROR TREND ───────────────────────────────────────────────────────────
export const ErrorTrendChart = ({ logs = [] }) => {
  const data = useMemo(() => {
    const map = {};
    logs
      .filter(l => l.type === "SERVER_ERROR")
      .forEach(l => {
        const d = new Date(l.createdAt);
        const key = `${d.getMonth() + 1}/${d.getDate()}`;
        map[key] = (map[key] || 0) + 1;
      });
    return Object.entries(map)
      .map(([date, errors]) => ({ date, errors }))
      .sort((a, b) => {
        const [am, ad] = a.date.split("/").map(Number);
        const [bm, bd] = b.date.split("/").map(Number);
        return am !== bm ? am - bm : ad - bd;
      });
  }, [logs]);

  if (!data.length) return null;

  return (
    <Card title="Error Trend" subtitle="SERVER_ERROR count per day — spot crash spikes">
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 11 }} />
          <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
          <Tooltip content={<LightTooltip />} />
          <Line type="monotone" dataKey="errors" name="Errors"
            stroke="#f87171" strokeWidth={2.5}
            dot={{ fill: "#f87171", r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6, fill: "#fca5a5" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};