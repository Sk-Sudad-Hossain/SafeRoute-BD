import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/auth.css";

const ReportPage = () => {
  const [formData, setFormData] = useState({
    issueType: "",
    description: "",
    location: "",
    latitude: "",
    longitude: "",
    severity: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      if (
        !formData.issueType ||
        !formData.description ||
        !formData.location ||
        !formData.latitude ||
        !formData.longitude ||
        !formData.severity
      ) {
        setMessage("All fields are required");
        return;
      }

      const payload = {
        issueType: formData.issueType,
        description: formData.description,
        location: {
          address: formData.location,
          latitude: Number(formData.latitude),
          longitude: Number(formData.longitude),
        },
        severity: formData.severity,
      };

      const response = await fetch("http://localhost:1715/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Failed to create report");
      }

      setMessage("Report submitted successfully!");

      setFormData({
        issueType: "",
        description: "",
        location: "",
        latitude: "",
        longitude: "",
        severity: "",
      });
    } catch (error) {
      setMessage(error.message);
      console.error("Report submit error:", error);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-top-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>

        <div className="auth-header">
          <div>
            <h2 className="auth-title">Report Road Problem</h2>
            <p className="auth-subtitle">
              Help improve road safety in your community
            </p>
          </div>
        </div>

        {message && (
          <p className={message.includes("successfully") ? "auth-success" : "auth-error"}>
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label>Issue Type</label>
            <select
              name="issueType"
              value={formData.issueType}
              onChange={handleChange}
            >
              <option value="">Select issue type</option>
              <option value="Accident">🚗 Accident</option>
              <option value="Road Damage">🕳 Road Damage</option>
              <option value="Traffic Jam">🚦 Traffic Jam</option>
              <option value="Construction">🏗 Construction</option>
              <option value="Flooding">🌧 Flooding</option>
            </select>
          </div>

          <div className="auth-field">
            <label>Description</label>
            <textarea
              name="description"
              placeholder="Describe the problem"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="auth-field">
            <label>Location</label>
            <input
              type="text"
              name="location"
              placeholder="Enter location"
              value={formData.location}
              onChange={handleChange}
            />
          </div>

          <div className="auth-field">
            <label>Latitude</label>
            <input
              type="number"
              step="any"
              name="latitude"
              placeholder="Enter latitude"
              value={formData.latitude}
              onChange={handleChange}
            />
          </div>

          <div className="auth-field">
            <label>Longitude</label>
            <input
              type="number"
              step="any"
              name="longitude"
              placeholder="Enter longitude"
              value={formData.longitude}
              onChange={handleChange}
            />
          </div>

          <div className="auth-field">
            <label>Severity</label>
            <select
              name="severity"
              value={formData.severity}
              onChange={handleChange}
            >
              <option value="">Select severity</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <button type="submit" className="auth-button">
            Submit Report
          </button>
        </form>

        <p className="auth-switch">
          Go back to <Link to="/">Home</Link>
        </p>
      </div>
    </div>
  );
};

export default ReportPage;