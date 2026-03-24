import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";
import TaskList from "../components/TaskList";

export default function Dashboard() {
  const { accessToken, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("pending");
  const navigate = useNavigate();

  useEffect(() => {
    if (!accessToken) return;
    client.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    const load = async () => {
      setLoading(true);
      try {
        const resp = await client.get("tasks/");
        setTasks(resp.data);
      } catch {
        setError("Failed to load tasks.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [accessToken]);

  const handleComplete = async (task) => {
    try {
      const resp = await client.patch(`tasks/${task.id}/status/`, {
        status: "completed",
      });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? resp.data : t)));
    } catch {
      setError("Failed to update task.");
    }
  };

  const handleDelete = async (task) => {
    try {
      await client.delete(`tasks/${task.id}/`);
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
    } catch {
      setError("Failed to delete task.");
    }
  };

  const handleEdit = (task) => navigate(`/tasks/${task.id}`);

  // Stats
  const total = tasks.length;
  const pending = tasks.filter((t) => t.status === "pending").length;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const topScore = tasks.length
    ? Math.max(...tasks.map((t) => t.priority_score)).toFixed(1)
    : "-";

  return (
    <div className="dashboard-page">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-brand">
          <div className="navbar-brand-icon" aria-hidden="true" />
          <span className="navbar-brand-name">SmartStudy</span>
        </div>
        <div className="navbar-actions">
          <button className="btn btn-accent btn-sm" onClick={() => navigate("/tasks/new")}>
            Add Task
          </button>
          <button className="btn btn-ghost btn-sm" onClick={logout}>
            Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-main">
        {/* Header */}
        <div className="dashboard-header">
          <h1 className="dashboard-title">My Study Tasks</h1>
          <p className="dashboard-subtitle">
            Listed by priority - highest urgency first
          </p>
        </div>

        {/* Stats */}
        <div className="stats-row">
          <div className="stat-card">
            <span className="stat-label">Total Tasks</span>
            <span className="stat-value purple">{total}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Pending</span>
            <span className="stat-value amber">{pending}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Completed</span>
            <span className="stat-value green">{completed}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Top Priority</span>
            <span className="stat-value cyan" style={{ fontSize: "1.5rem" }}>
              {topScore}
            </span>
          </div>
        </div>

        {/* Filter bar */}
        <div className="filter-bar">
          <div className="filter-tabs">
            {[
              ["pending", "Pending"],
              ["completed", "Completed"],
              ["all", "All"],
            ].map(([val, label]) => (
              <button
                key={val}
                className={`filter-tab ${filter === val ? "active" : ""}`}
                onClick={() => setFilter(val)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: "1rem" }}>
            {error}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="loading-spinner">Loading tasks...</div>
        ) : (
          <TaskList
            tasks={tasks}
            onComplete={handleComplete}
            onDelete={handleDelete}
            onEdit={handleEdit}
            filter={filter}
          />
        )}
      </div>
    </div>
  );
}
