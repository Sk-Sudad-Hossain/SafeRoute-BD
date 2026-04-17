import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/auth.css";

const MyReportsPage = () => {
  const API = import.meta.env.VITE_API_URL;
  const { token, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Wait for AuthContext to finish its initial check
    if (authLoading) return;

    // Not logged in → redirect to login
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchMyReports = async () => {
      try {
        const res = await fetch(`${API}/reports/mine`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch your reports");
        }

        setReports(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMyReports();
  }, [API, token, authLoading, navigate]);

  if (authLoading || loading) {
    return (
      <div className="auth-page">
        <div className="auth-card reports-page-card">
          <h2 className="auth-title">Report History</h2>
          <p>Loading your reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card reports-page-card">
        <h2 className="auth-title">Report History</h2>

        <p className="auth-switch reports-home-link">
          Go back to <Link to="/">Home</Link>
        </p>

        {error && <p className="auth-error">{error}</p>}

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

  {report.photoUrl && (
    <img
      src={report.photoUrl}
      alt="Report evidence"
      style={{
        width: "100%",
        maxHeight: "200px",
        objectFit: "cover",
        borderRadius: "8px",
        marginBottom: "10px",
      }}
    />
  )}

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