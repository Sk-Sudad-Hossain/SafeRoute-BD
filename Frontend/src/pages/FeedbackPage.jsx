import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../utils/api";
import "../styles/vehiclePages.css";

const feedbackFields = [
  {
    key: "platformExperience",
    number: "1.",
    title: "Overall Experience",
    prompt: "How would you rate your overall experience with this platform?",
  },
  {
    key: "usability",
    number: "2.",
    title: "Usability",
    prompt: "How easy is the platform to use?",
  },
  {
    key: "effectiveness",
    number: "3.",
    title: "Road Safety Features Effectiveness",
    prompt: "How effective do you find the road safety features(e.g., alerts, safety scores)?",
  },
];

const defaultForm = {
  userName: "Anonymous User",
  userEmail: "",
  platformExperience: 5,
  usability: 5,
  effectiveness: 5,
  comment: "",
};

const FeedbackStars = ({ label, name, value, onChange }) => (
  <div className="feedback-stars" role="radiogroup" aria-label={label}>
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        className={`feedback-star ${star <= value ? "is-active" : ""}`}
        onClick={() => onChange(name, star)}
        aria-label={`${label}: ${star} star${star > 1 ? "s" : ""}`}
      >
        ★
      </button>
    ))}
  </div>
);

const formatDate = (value) => {
  if (!value) return "";
  return new Date(value).toLocaleString();
};

const FeedbackPage = () => {
  const { user } = useAuth();
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [entries, setEntries] = useState([]);
  const [formData, setFormData] = useState({
    ...defaultForm,
    userName: user?.name || defaultForm.userName,
    userEmail: user?.email || defaultForm.userEmail,
  });

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      userName: user?.name || prev.userName || defaultForm.userName,
      userEmail: user?.email || prev.userEmail || defaultForm.userEmail,
    }));
  }, [user]);

  const loadFeedbackEntries = async () => {
    try {
      setLoadingEntries(true);
      const response = await fetch(`${API_BASE_URL}/feedback`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load recent feedback");
      }

      setEntries(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingEntries(false);
    }
  };

  useEffect(() => {
    loadFeedbackEntries();
  }, []);

  const handleFieldChange = (event) => {
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleStarChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const payload = {
        ...formData,
        platformExperience: Number(formData.platformExperience),
        usability: Number(formData.usability),
        effectiveness: Number(formData.effectiveness),
      };

      const response = await fetch(`${API_BASE_URL}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Failed to submit feedback");
      }

      setEntries((prev) => [data.feedback, ...prev].slice(0, 20));
      setFormData({
        ...defaultForm,
        userName: user?.name || defaultForm.userName,
        userEmail: user?.email || defaultForm.userEmail,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
      setSubmitted(false);
    }
  };

  return (
    <div className="feedback-shell">
      <div className="feedback-topbar">
        <h1>Feedback</h1>
      </div>

      {!submitted ? (
        <main className="feedback-panel">
          <h2>We Value Your Feedback</h2>

          {feedbackFields.map((field) => (
            <section key={field.key} className="feedback-question-row">
              <div className="feedback-question-copy">
                <h3>
                  <span>{field.number}</span> {field.title}
                </h3>
                <p>{field.prompt}</p>
              </div>
              <FeedbackStars
                label={field.title}
                name={field.key}
                value={formData[field.key]}
                onChange={handleStarChange}
              />
            </section>
          ))}

          <form className="feedback-form" onSubmit={handleSubmit}>
            <section className="feedback-question-row feedback-question-row-comment">
              <div className="feedback-question-copy">
                <h3>
                  <span>4.</span> Your Feedback
                </h3>
                <p>Please Share Your thoughts, suggestions, or issues:</p>
              </div>
            </section>

            <textarea
              name="comment"
              value={formData.comment}
              onChange={handleFieldChange}
              className="feedback-textarea"
              placeholder="Type here"
            />

            {error && <div className="vehicle-inline-alert is-error">{error}</div>}

            <div className="feedback-submit-row">
              <button type="submit" className="feedback-submit-button">
                Submit
              </button>
            </div>
          </form>

          <section className="feedback-history-section">
            <div className="feedback-history-head">
              <h3>Recent Feedback</h3>
              <button type="button" className="vehicle-action-pill" onClick={loadFeedbackEntries}>
                Refresh
              </button>
            </div>

            {loadingEntries ? (
              <div className="vehicle-inline-alert">Loading recent feedback...</div>
            ) : entries.length ? (
              <div className="feedback-history-list">
                {entries.slice(0, 5).map((item) => (
                  <article key={item._id} className="feedback-history-item">
                    <div className="feedback-history-meta">
                      <strong>{item.userName || "Anonymous User"}</strong>
                      <span>{formatDate(item.createdAt)}</span>
                    </div>
                    <div className="feedback-history-scores">
                      <span>Experience: {item.platformExperience}/5</span>
                      <span>Usability: {item.usability}/5</span>
                      <span>Features: {item.effectiveness}/5</span>
                    </div>
                    <p>{item.comment || "No written comment provided."}</p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="vehicle-inline-alert">No feedback has been submitted yet.</div>
            )}
          </section>
        </main>
      ) : (
        <main className="feedback-panel feedback-panel-success feedback-panel-success-stack">
          <p>Thanks for your valuable feedback.</p>
          <div className="feedback-success-actions">
            <button type="button" className="feedback-submit-button" onClick={() => setSubmitted(false)}>
              Submit Another Response
            </button>
          </div>
          <section className="feedback-history-section feedback-history-success">
            <div className="feedback-history-head">
              <h3>Latest Saved Feedback</h3>
              <button type="button" className="vehicle-action-pill" onClick={loadFeedbackEntries}>
                Refresh
              </button>
            </div>
            {entries.length ? (
              <div className="feedback-history-list">
                {entries.slice(0, 3).map((item) => (
                  <article key={item._id} className="feedback-history-item">
                    <div className="feedback-history-meta">
                      <strong>{item.userName || "Anonymous User"}</strong>
                      <span>{formatDate(item.createdAt)}</span>
                    </div>
                    <div className="feedback-history-scores">
                      <span>Experience: {item.platformExperience}/5</span>
                      <span>Usability: {item.usability}/5</span>
                      <span>Features: {item.effectiveness}/5</span>
                    </div>
                    <p>{item.comment || "No written comment provided."}</p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="vehicle-inline-alert">Feedback saved. Refresh once if the list is still empty.</div>
            )}
          </section>
        </main>
      )}
    </div>
  );
};

export default FeedbackPage;
