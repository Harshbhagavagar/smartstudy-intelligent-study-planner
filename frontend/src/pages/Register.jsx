import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import client from "../api/client";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!username || !email || !password) { setError("All fields are required."); return; }
    if (!email.includes("@")) { setError("Please enter a valid email."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    try {
      await client.post("auth/register/", { username, email, password });
      setSuccess("Account created! Redirecting to login…");
      setTimeout(() => navigate("/login"), 1200);
    } catch {
      setError("Registration failed. Username or email may already be taken.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">📚</div>
          <span className="auth-logo-text">SmartStudy</span>
        </div>

        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Start organising your study tasks today</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              className="form-input"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          {error && <div className="alert alert-error">⚠️ {error}</div>}
          {success && <div className="alert alert-success">✅ {success}</div>}

          <button
            type="submit"
            className="btn btn-primary btn-full"
            style={{ marginTop: "1.5rem" }}
            disabled={loading}
          >
            {loading ? "Creating account…" : "🚀 Register"}
          </button>
        </form>

        <div className="auth-link-row">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}
