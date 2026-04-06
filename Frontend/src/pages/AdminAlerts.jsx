import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/adminAlerts.css";
import alertMap from "../assets/feature-bg/alertMap.png";

const API_BASE = "http://localhost:1715/api";

const AdminAlerts = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("Low");
  const [expiresAt, setExpiresAt] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      alert("Please log in as admin first.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        title,
        description,
        severity,
      };

      if (expiresAt) {
        payload.expiresAt = expiresAt;
      }

      const response = await fetch(`${API_BASE}/alerts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create alert");
      }

      alert("Alert created successfully");

      setTitle("");
      setDescription("");
      setSeverity("Low");
      setExpiresAt("");
    } catch (error) {
      console.error("Create alert error:", error);
      alert(error.message || "Failed to create alert");
    } finally {
      setLoading(false);
    }
  };

  const getSeverityClass = () => {
    if (severity === "High") return "severity-preview high";
    if (severity === "Moderate") return "severity-preview moderate";
    return "severity-preview low";
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h1>SafeRoute BD</h1>
        <p>Admin Panel</p>

        <nav>
          <button className="sidebar-btn" onClick={() => navigate("/")}>
            Homepage
          </button>

          <button className="sidebar-btn" onClick={() => navigate("/admin")}>     
            Verify Reports
          </button>

          <button className="sidebar-btn active">
            Alerts
          </button>

          <button className="sidebar-btn">
            Analytics
          </button>

          <button className="sidebar-btn">
            Settings
          </button>
        </nav>
      </aside>

      <main className="admin-main">
        <h2>Create Alert</h2>
        <p>Create a public safety alert for users.</p>

        <div className="alerts-banner">
          <div className="alerts-banner-overlay">
            <div className="alerts-banner-text">
              <h3>Public Alert Management</h3>
              <p>
                Publish road safety alerts with severity level and expiry time
                so users can see the latest risk updates instantly.
              </p>
            </div>
          </div>
        </div>

        <div className="alerts-content-grid">
          <div className="alert-form-card">
            <form className="alert-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Alert Name</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter alert title"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows="5"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Write alert details"
                  required
                />
              </div>

              <div className="form-group">
                <label>Severity</label>

                <div className="severity-options">
                  <label
                    className={`severity-card ${severity === "High" ? "selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="severity"
                      value="High"
                      checked={severity === "High"}
                      onChange={(e) => setSeverity(e.target.value)}
                    />
                    <span className="severity-dot high"></span>
                    <span>High</span>
                  </label>

                  <label
                    className={`severity-card ${severity === "Moderate" ? "selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="severity"
                      value="Moderate"
                      checked={severity === "Moderate"}
                      onChange={(e) => setSeverity(e.target.value)}
                    />
                    <span className="severity-dot moderate"></span>
                    <span>Moderate</span>
                  </label>

                  <label
                    className={`severity-card ${severity === "Low" ? "selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="severity"
                      value="Low"
                      checked={severity === "Low"}
                      onChange={(e) => setSeverity(e.target.value)}
                    />
                    <span className="severity-dot low"></span>
                    <span>Low</span>
                  </label>
                </div>

                <div className={getSeverityClass()}>
                  Selected Severity: {severity}
                </div>
              </div>

              <div className="form-group">
                <label>Expiry Date & Time (optional)</label>
                <input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                />
                <small>If left empty, validity will be 24 hour by default.</small>
              </div>

              <button
                type="submit"
                className="create-alert-btn"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Alert"}
              </button>
            </form>
          </div>

          <div className="alert-visual-card">
            <img src={alertMap} alt="Alert Map" className="alert-visual-image" />

            <div className="visual-info">
              <h3>Alert Preview Guide</h3>
              <div className="visual-badge high">
                <span className="badge-dot"></span>
                High Alert
              </div>
              <div className="visual-badge moderate">
                <span className="badge-dot"></span>
                Moderate Alert
              </div>
              <div className="visual-badge low">
                <span className="badge-dot"></span>
                Low Alert
              </div>

              <p>
                High alerts appear in red, moderate alerts in yellow, and low
                alerts in green on the user side.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminAlerts;