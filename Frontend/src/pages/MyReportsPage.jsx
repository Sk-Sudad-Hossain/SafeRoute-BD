import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/auth.css";

const MyReportsPage = () => {
  const [reports, setReports] = useState([]);
  const API = import.meta.env.VITE_API_URL;
  useEffect(() => {
    fetch(`${API}/reports`)
      .then((res) => res.json())
      .then((data) => setReports(data))
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  return (
    <div className="auth-page">
      <div className="auth-card reports-page-card">
        <h2 className="auth-title">Report History</h2>

        <p className="auth-switch reports-home-link">
          Go back to <Link to="/">Home</Link>
        </p>

        {reports.length === 0 ? (
          <div className="reports-empty">
            <p>No reports submitted yet.</p>

            <div className="reports-actions">
              <Link to="/report">
                <button className="auth-button reports-action-btn">
                  Create New Report
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="reports-grid">
              {reports.map((report) => (
                <div key={report._id} className="report-card">
                  <h3 className="report-card-title">{report.issueType}</h3>

                  <p>
                    <b>Severity:</b> {report.severity}
                  </p>

                  <p>
                    <b>Location:</b> {report.location?.address || "N/A"}
                  </p>

                  <p>
                    <b>Latitude:</b> {report.location?.latitude ?? "N/A"}
                  </p>

                  <p>
                    <b>Longitude:</b> {report.location?.longitude ?? "N/A"}
                  </p>

                  <p>
                    <b>Date:</b>{" "}
                    {report.createdAt
                      ? new Date(report.createdAt).toLocaleDateString()
                      : "N/A"}
                  </p>

                  <span
                    className={`report-status ${
                      report.status === "Pending"
                        ? "status-pending"
                        : report.status === "Verified"
                        ? "status-verified"
                        : report.status === "Resolved"
                        ? "status-resolved"
                        : "status-rejected"
                    }`}
                  >
                    {report.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="reports-actions">
              <Link to="/report">
                <button className="auth-button reports-action-btn">
                  Create New Report
                </button>
              </Link>

              <Link to="/">
                <button className="auth-button reports-action-btn">
                  Back to Home
                </button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyReportsPage;