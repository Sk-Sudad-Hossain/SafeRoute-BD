import React, { useState } from "react";
import { uploadImage } from "../utils/uploadUtils";
import { apiPost } from "../config/apiClient";
import "../styles/auth.css";

export default function ReportForm() {
  const [formData, setFormData] = useState({
    issueType: "",
    description: "",
    location: "",
    severity: "Medium",
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      let imageUrl = null;

      // Upload image if provided
      if (image) {
        imageUrl = await uploadImage(image);
      }

      // Create report with image URL
      const reportData = {
        ...formData,
        severity: Number(formData.severity),
        Attached_Image_URL: imageUrl || "",
      };

      await apiPost("/reports", reportData);

      setSuccess("Report submitted successfully!");
      setFormData({
        issueType: "",
        description: "",
        location: "",
        severity: "Medium",
      });
      setImage(null);
      setImagePreview(null);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to submit report");
      console.error("Report submission error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-form-container">
      <form onSubmit={handleSubmit} className="report-form">
        <h2>Report an Unsafe Area</h2>

        {error && <div className="form-error">{error}</div>}
        {success && <div className="form-success">{success}</div>}

        <div className="form-group">
          <label htmlFor="issueType">Issue Type *</label>
          <input
            type="text"
            id="issueType"
            name="issueType"
            value={formData.issueType}
            onChange={handleInputChange}
            placeholder="e.g., Bad Road Condition, Traffic Hazard"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe the issue in detail..."
            rows="4"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="location">Location *</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            placeholder="e.g., Mirpur, Dhaka"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="severity">Severity Level *</label>
          <select
            id="severity"
            name="severity"
            value={formData.severity}
            onChange={handleInputChange}
            required
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="image">Upload Image (Optional)</label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleImageChange}
          />
          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Preview" />
              <button
                type="button"
                className="remove-image"
                onClick={() => {
                  setImage(null);
                  setImagePreview(null);
                }}
              >
                Remove
              </button>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="submit-button"
        >
          {loading ? "Submitting..." : "Submit Report"}
        </button>
      </form>
    </div>
  );
}