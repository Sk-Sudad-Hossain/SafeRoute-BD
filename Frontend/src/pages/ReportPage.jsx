import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ReportMap from "../views/ReportMap";
import { useAuth } from "../context/AuthContext";
import "../styles/auth.css";

const ReportPage = () => {
  const API = import.meta.env.VITE_API_URL;
  const { token } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    issueType: "",
    description: "",
    location: "",
    latitude: "",
    longitude: "",
    severity: "",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [message, setMessage] = useState("");

  //  NEW: photo state
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  //  NEW: handle photo selection
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate type
    if (!file.type.startsWith("image/")) {
      setMessage("Please select an image file");
      return;
    }

    // Validate size (5 MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage("Image must be under 5 MB");
      return;
    }

    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setMessage("");
  };

  const handleRemovePhoto = () => {
    setPhoto(null);
    setPhotoPreview("");
  };

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

  const handleSearchLocation = async () => {
    if (!searchQuery.trim()) return;

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=1`,
        {
          headers: {
            Accept: "application/json",
            "User-Agent": "SafeRoute-App",
          },
        }
      );

      const data = await res.json();

      if (data && data.length > 0) {
        const place = data[0];
        const coords = {
          lat: parseFloat(place.lat),
          lng: parseFloat(place.lon),
        };
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

    if (!token) {
      setMessage("You must be logged in to submit a report.");
      setTimeout(() => navigate("/login"), 1500);
      return;
    }

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

    setSubmitting(true);

    try {
      //  Use FormData so we can send a file
      const fd = new FormData();
      fd.append("issueType", formData.issueType);
      fd.append("description", formData.description);
      fd.append("severity", formData.severity);
      fd.append(
        "location",
        JSON.stringify({
          address: formData.location,
          latitude: Number(formData.latitude),
          longitude: Number(formData.longitude),
        })
      );

      if (photo) {
        fd.append("photo", photo);
      }

      const response = await fetch(`${API}/reports`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // NOTE: do NOT set Content-Type manually for FormData
          // the browser will set it correctly with the boundary
        },
        body: fd,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create report");
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
      setSelectedLocation(null);
      setSearchQuery("");
      setPhoto(null);
      setPhotoPreview("");
    } catch (error) {
      setMessage(error.message);
      console.error(error);
    } finally {
      setSubmitting(false);
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
              message.includes("successfully") ? "auth-success" : "auth-error"
            }
          >
            {message}
          </p>
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

          {/*  NEW: PHOTO UPLOAD */}
          <div className="auth-field">
            <label>Photo Evidence (Optional)</label>

            {!photoPreview ? (
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <label
                  className="auth-button"
                  style={{
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flex: 1,
                    minWidth: "140px",
                  }}
                >
                  📷 Take Photo
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoChange}
                    style={{ display: "none" }}
                  />
                </label>

                <label
                  className="auth-button"
                  style={{
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flex: 1,
                    minWidth: "140px",
                  }}
                >
                  📁 Choose File
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    style={{ display: "none" }}
                  />
                </label>
              </div>
            ) : (
              <div style={{ marginTop: "10px" }}>
                <img
                  src={photoPreview}
                  alt="Preview"
                  style={{
                    width: "100%",
                    maxHeight: "300px",
                    objectFit: "cover",
                    borderRadius: "12px",
                    border: "2px solid #ddd",
                  }}
                />
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="auth-button"
                  style={{
                    marginTop: "8px",
                    background: "#e74c3c",
                  }}
                >
                  ❌ Remove Photo
                </button>
              </div>
            )}
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

          <button
            type="submit"
            className="auth-button"
            disabled={submitting}
            style={{ opacity: submitting ? 0.6 : 1 }}
          >
            {submitting ? "Submitting..." : "Submit Report"}
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