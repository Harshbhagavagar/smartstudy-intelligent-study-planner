import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function TaskForm({ mode }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = mode === "edit";
  const { accessToken } = useAuth();

  // Ensure the JWT header is always set for this component
  if (accessToken) {
    client.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  }

  const [form, setForm] = useState({
    title: "",
    description: "",
    deadline: "",
    effort: 5,
    complexity: 5,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      const load = async () => {
        setLoading(true);
        try {
          const resp = await client.get(`tasks/${id}/`);
          setForm({
            title: resp.data.title,
            description: resp.data.description || "",
            deadline: resp.data.deadline,
            effort: resp.data.effort,
            complexity: resp.data.complexity,
          });
        } catch {
          setError("Failed to load task.");
        } finally {
          setLoading(false);
        }
      };
      load();
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.title || !form.deadline) {
      setError("Title and deadline are required.");
      return;
    }
    if (form.effort < 1 || form.effort > 10) {
      setError("Effort must be between 1 and 10.");
      return;
    }
    if (form.complexity < 1 || form.complexity > 10) {
      setError("Complexity must be between 1 and 10.");
      return;
    }
    setLoading(true);
    // Coerce to integers - HTML number inputs return strings
    const payload = {
      ...form,
      effort: parseInt(form.effort, 10),
      complexity: parseInt(form.complexity, 10),
    };
    try {
      if (isEdit) {
        await client.put(`tasks/${id}/`, payload);
      } else {
        await client.post("tasks/", payload);
      }
      navigate("/");
    } catch {
      setError("Failed to save task. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  // Dot visualisers
  const effortDots = Array.from({ length: 10 }, (_, i) => i < Number(form.effort));
  const complexityDots = Array.from({ length: 10 }, (_, i) => i < Number(form.complexity));

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-brand">
          <div className="navbar-brand-icon" aria-hidden="true" />
          <span className="navbar-brand-name">SmartStudy</span>
        </div>
        <div className="navbar-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate("/")}>
            Back
          </button>
        </div>
      </nav>

      <div className="form-page">
        <div className="card task-form-card">
          <h1 className="form-page-title">{isEdit ? "Edit Task" : "New Task"}</h1>
          <p className="form-page-subtitle">
            {isEdit
              ? "Update the task details - priority score will be recalculated."
              : "Fill in the details and we will calculate the priority score for you."}
          </p>

          <form onSubmit={handleSubmit}>
            {/* Title */}
            <div className="form-group">
              <label className="form-label">Task Title *</label>
              <input
                className="form-input"
                name="title"
                placeholder="e.g. Revise Chapter 4 - Calculus"
                value={form.title}
                onChange={handleChange}
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea form-input"
                name="description"
                placeholder="Optional notes about this task..."
                value={form.description}
                onChange={handleChange}
              />
            </div>

            {/* Deadline */}
            <div className="form-group">
              <label className="form-label">Deadline *</label>
              <input
                type="date"
                className="form-input"
                name="deadline"
                value={form.deadline}
                onChange={handleChange}
              />
            </div>

            <div className="form-divider" />

            {/* Effort & Complexity side by side */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Effort (1-10)</label>
                <input
                  type="number"
                  className="form-input"
                  name="effort"
                  min="1"
                  max="10"
                  value={form.effort}
                  onChange={handleChange}
                />
                <div className="score-display" style={{ marginTop: "0.6rem" }}>
                  <div className="score-dots">
                    {effortDots.map((active, i) => (
                      <span
                        key={i}
                        className={`score-dot ${active ? "active-effort" : ""}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Complexity (1-10)</label>
                <input
                  type="number"
                  className="form-input"
                  name="complexity"
                  min="1"
                  max="10"
                  value={form.complexity}
                  onChange={handleChange}
                />
                <div className="score-display" style={{ marginTop: "0.6rem" }}>
                  <div className="score-dots">
                    {complexityDots.map((active, i) => (
                      <span
                        key={i}
                        className={`score-dot ${active ? "active-complexity" : ""}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Scoring hint */}
            <div
              style={{
                background: "rgba(124,58,237,0.1)",
                border: "1px solid rgba(124,58,237,0.25)",
                borderRadius: "10px",
                padding: "0.85rem 1rem",
                fontSize: "0.82rem",
                color: "var(--clr-primary-lt)",
                marginBottom: "0.5rem",
              }}
            >
              <strong>Priority Score = </strong>
              <code style={{ opacity: 0.85 }}>
                (1 / (days_left + 1)) * 100 + effort * 2 + complexity
              </code>
              <br />
              Closer deadlines and higher effort rank higher automatically.
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ flex: 1 }}
              >
                {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Task"}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => navigate("/")}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
