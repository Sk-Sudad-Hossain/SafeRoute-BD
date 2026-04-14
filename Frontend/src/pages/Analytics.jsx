import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/analytics.css";
import banner from "../assets/feature-bg/adminPanel.png";

const API_BASE = "http://localhost:1715/api";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

const AdminAnalytics = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch(`${API_BASE}/reports`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setReports(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch reports:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  // Filter reports by selected month+year
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const d = new Date(r.createdAt);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });
  }, [reports, selectedMonth, selectedYear]);

  // Stats
  const totalReports = filteredReports.length;
  const highSeverity = filteredReports.filter((r) => r.severity === "High").length;
  const verified = filteredReports.filter((r) => r.status === "Verified").length;
  const resolved = filteredReports.filter((r) => r.status === "Resolved").length;

  // Reports per city
  const cityMap = useMemo(() => {
    const map = {};
    filteredReports.forEach((r) => {
      const addr = r.location?.address || "";
      // Extract city from address (last meaningful segment)
      const parts = addr.split(",").map((s) => s.trim()).filter(Boolean);
      const city = parts.length >= 2 ? parts[parts.length - 2] : parts[0] || "Unknown";
      map[city] = (map[city] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filteredReports]);

  // High-risk zones (High severity reports)
  const highRiskZones = useMemo(() => {
    return filteredReports
      .filter((r) => r.severity === "High")
      .map((r) => ({
        address: r.location?.address || "Unknown location",
        issueType: r.issueType,
        status: r.status,
        date: new Date(r.createdAt).toLocaleDateString(),
      }));
  }, [filteredReports]);

  // Issue type breakdown
  const issueBreakdown = useMemo(() => {
    const map = {};
    filteredReports.forEach((r) => {
      map[r.issueType] = (map[r.issueType] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filteredReports]);

  // CSV Export
  const handleExportCSV = () => {
    if (filteredReports.length === 0) {
      alert("No data to export for this month.");
      return;
    }

    const headers = [
      "Issue Type",
      "Address",
      "City",
      "Latitude",
      "Longitude",
      "Severity",
      "Status",
      "Admin Note",
      "Date",
    ];

    const rows = filteredReports.map((r) => {
      const addr = r.location?.address || "";
      const parts = addr.split(",").map((s) => s.trim()).filter(Boolean);
      const city = parts.length >= 2 ? parts[parts.length - 2] : parts[0] || "Unknown";
      return [
        r.issueType,
        `"${addr}"`,
        city,
        r.location?.latitude || "",
        r.location?.longitude || "",
        r.severity,
        r.status,
        `"${r.adminNote || ""}"`,
        new Date(r.createdAt).toLocaleString(),
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `SafeRoute_Analytics_${MONTHS[selectedMonth]}_${selectedYear}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const maxCityCount = cityMap.length > 0 ? cityMap[0][1] : 1;

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h1>SafeRoute BD</h1>
        <p>Admin Panel</p>
        <nav>
          <button className="sidebar-btn" onClick={() => navigate("/")}>Homepage</button>
          <button className="sidebar-btn" onClick={() => navigate("/admin")}>Verify Reports</button>
          <button className="sidebar-btn" onClick={() => navigate("/admin/alerts")}>Alerts</button>
          <button className="sidebar-btn active">Analytics</button>
          <button className="sidebar-btn">Settings</button>
        </nav>
      </aside>

      <main className="admin-main">
        <h2>Analytics</h2>
        <p>Monthly insights on road safety reports across Bangladesh.</p>

        {/* Banner */}
        <div className="admin-banner" style={{ backgroundImage: `url(${banner})` }}>
          <div className="banner-overlay">
            <h3>Road Safety Analytics</h3>
            <p>Track report trends, high-risk zones, and city-wise data</p>
          </div>
        </div>

        {/* Month/Year Selector + Export */}
        <div className="analytics-controls">
          <div className="analytics-selectors">
            <select
              className="analytics-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
            >
              {MONTHS.map((m, i) => (
                <option key={m} value={i}>{m}</option>
              ))}
            </select>

            <select
              className="analytics-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <button className="csv-export-btn" onClick={handleExportCSV}>
            ⬇ Download CSV
          </button>
        </div>

        {loading ? (
          <div className="analytics-loading">Loading analytics...</div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="summary-cards">
              <div className="summary-card pending">
                <div className="summary-icon">📋</div>
                <h3>Total Reports</h3>
                <p>{totalReports}</p>
              </div>
              <div className="summary-card rejected">
                <div className="summary-icon">🔴</div>
                <h3>High Severity</h3>
                <p>{highSeverity}</p>
              </div>
              <div className="summary-card verified">
                <div className="summary-icon">✔</div>
                <h3>Verified</h3>
                <p>{verified}</p>
              </div>
              <div className="summary-card resolved">
                <div className="summary-icon">🛠</div>
                <h3>Resolved</h3>
                <p>{resolved}</p>
              </div>
            </div>

            <div className="analytics-grid">
              {/* Reports Per City */}
              <div className="analytics-card">
                <h3 className="analytics-card-title">📍 Reports Per City</h3>
                {cityMap.length === 0 ? (
                  <p className="analytics-empty">No data for this month.</p>
                ) : (
                  <div className="city-list">
                    {cityMap.map(([city, count]) => (
                      <div key={city} className="city-row">
                        <div className="city-label">
                          <span className="city-name">{city}</span>
                          <span className="city-count">{count}</span>
                        </div>
                        <div className="city-bar-track">
                          <div
                            className="city-bar-fill"
                            style={{ width: `${(count / maxCityCount) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Issue Type Breakdown */}
              <div className="analytics-card">
                <h3 className="analytics-card-title">🗂 Issue Type Breakdown</h3>
                {issueBreakdown.length === 0 ? (
                  <p className="analytics-empty">No data for this month.</p>
                ) : (
                  <div className="issue-list">
                    {issueBreakdown.map(([issue, count]) => (
                      <div key={issue} className="issue-row">
                        <span className="issue-name">{issue}</span>
                        <span className="issue-badge">{count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* High Risk Zones */}
            <div className="analytics-card full-width">
              <div className="analytics-card-header">
                <h3 className="analytics-card-title">🚨 High-Risk Zones</h3>
                <span className="risk-count">{highRiskZones.length} zones</span>
              </div>
              {highRiskZones.length === 0 ? (
                <p className="analytics-empty">No high-risk reports this month. 🎉</p>
              ) : (
                <div className="risk-table-wrap">
                  <table className="report-table">
                    <thead>
                      <tr>
                        <th>Location</th>
                        <th>Issue Type</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {highRiskZones.map((z, i) => (
                        <tr key={i}>
                          <td style={{ fontSize: "15px" }}>{z.address}</td>
                          <td style={{ fontSize: "15px" }}>{z.issueType}</td>
                          <td>
                            <span className={`badge status-${z.status.toLowerCase()}`}>
                              {z.status}
                            </span>
                          </td>
                          <td style={{ fontSize: "15px" }}>{z.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminAnalytics;