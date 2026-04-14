import React, { useState } from "react";
import { Link } from "react-router-dom";
import ReportMap from "../views/ReportMap";
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

  const [searchQuery, setSearchQuery] = useState(""); // 🔥 NEW
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [message, setMessage] = useState("");
  const [aiResult, setAiResult] = useState(null);
  
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  //  MAP + GPS + CLICK
  const handleLocationSelect = async (coords) => {
    setSelectedLocation(coords);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}&zoom=18&addressdetails=1`
      );

      const data = await res.json();

      const address =
        data.display_name ||
        `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`;

      setFormData((prev) => ({
        ...prev,
        latitude: coords.lat,
        longitude: coords.lng,
        location: address,
      }));
    } catch (error) {
      console.error("Geocoding failed:", error);

      setFormData((prev) => ({
        ...prev,
        latitude: coords.lat,
        longitude: coords.lng,
      }));
    }
  };

  //  SEARCH FUNCTION
const handleSearchLocation = async () => {
  if (!searchQuery.trim()) return;

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        searchQuery
      )}&limit=1`,
      {
        headers: {
          "Accept": "application/json",
          "User-Agent": "SafeRoute-App", // 🔥 IMPORTANT
        },
      }
    );

    const data = await res.json();

    console.log("Search result:", data); // 🔍 DEBUG

    if (data && data.length > 0) {
      const place = data[0];

      const coords = {
        lat: parseFloat(place.lat),
        lng: parseFloat(place.lon),
      };

      //  MOVE MAP + UPDATE FORM
      handleLocationSelect(coords);
    } else {
      alert("Location not found");
    }
  } catch (err) {
    console.error("Search error:", err);
    alert("Search failed. Try again.");
  }
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
        throw new Error(data.message || "Failed to create report");
      }

      setMessage("Report submitted successfully!");
      setAiResult(data.aiClassification || null);

      setFormData({
        issueType: "",
        description: "",
        location: "",
        latitude: "",
        longitude: "",
        severity: "",
      });

      setSelectedLocation(null);
      setSearchQuery("");
    } catch (error) {
      setMessage(error.message);
      console.error(error);
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
          <p
            className={
              message.includes("successfully")
                ? "auth-success"
                : "auth-error"
            }
          >
            {message}
          </p>
        )}

        {/* AI Classification Result */}
        {aiResult && (
          <div style={{
            borderRadius: "12px",
            padding: "14px 18px",
            marginBottom: "16px",
            background: aiResult.status === "Verified"
              ? "rgba(39, 174, 96, 0.15)"
              : aiResult.status === "Rejected"
              ? "rgba(231, 76, 60, 0.15)"
              : "rgba(241, 196, 15, 0.15)",
            borderLeft: `5px solid ${
              aiResult.status === "Verified" ? "#27ae60"
              : aiResult.status === "Rejected" ? "#e74c3c"
              : "#f1c40f"
            }`,
          }}>
            <p style={{ margin: "0 0 6px", fontWeight: 700, fontSize: "15px", color: "#12344d" }}>
              🤖 AI Classification Result
            </p>
            <p style={{ margin: "0 0 4px", fontSize: "14px", color: "#12344d" }}>
              <b>Status:</b>{" "}
              <span style={{
                fontWeight: 700,
                color: aiResult.status === "Verified" ? "#27ae60"
                  : aiResult.status === "Rejected" ? "#e74c3c"
                  : "#e67e22"
              }}>
                {aiResult.status}
              </span>
            </p>
            {aiResult.suggestedSeverity && (
              <p style={{ margin: "0 0 4px", fontSize: "14px", color: "#12344d" }}>
                <b>AI Suggested Severity:</b> {aiResult.suggestedSeverity}
              </p>
            )}
            {aiResult.confidence > 0 && (
              <p style={{ margin: "0 0 4px", fontSize: "14px", color: "#12344d" }}>
                <b>Confidence:</b> {(aiResult.confidence * 100).toFixed(1)}%
              </p>
            )}
            <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#315b81", fontStyle: "italic" }}>
              {aiResult.note}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">

          {/* 🔍 SEARCH BAR */}
          <div className="auth-field">
            <label>Search Location</label>
            <div style={{ display: "flex", gap: "10px" }}>
              <input
                type="text"
                placeholder="Search place (e.g. Dhanmondi)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSearchLocation();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleSearchLocation}
                className="auth-button"
                style={{ width: "120px" }}
              >
                Search
              </button>
            </div>
          </div>

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

          {/* MAP */}
          <div className="auth-field">
            <label>Select Location on Map</label>
            <div
              style={{
                width: "100%",
                height: "400px",
                marginTop: "10px",
                borderRadius: "12px",
                overflow: "hidden",
                position: "relative",
                zIndex: 10,
              }}
            >
              <ReportMap
                setLocation={handleLocationSelect}
                selectMode={true}
              />
            </div>
          </div>

          <div className="auth-field">
            <label>Location (Address)</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
            />
          </div>

          <div className="auth-field">
            <label>Latitude</label>
            <input type="number" value={formData.latitude} readOnly />
          </div>

          <div className="auth-field">
            <label>Longitude</label>
            <input type="number" value={formData.longitude} readOnly />
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