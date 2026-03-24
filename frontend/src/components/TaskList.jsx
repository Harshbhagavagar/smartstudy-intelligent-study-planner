function priorityTier(score) {
  if (score >= 40) return "high";
  if (score >= 15) return "medium";
  return "low";
}

export default function TaskList({ tasks, onComplete, onDelete, onEdit, filter }) {
  const filtered = tasks.filter((t) => (filter === "all" ? true : t.status === filter));

  if (!filtered.length) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          {filter === "completed" ? "Done" : "Tasks"}
        </div>
        <p className="empty-state-title">
          {filter === "completed" ? "No completed tasks yet" : "No tasks here"}
        </p>
        <p>
          {filter === "pending"
            ? "Add your first task using the button above."
            : "Switch filters to see other tasks."}
        </p>
      </div>
    );
  }

  return (
    <div className="tasks-list">
      {filtered.map((task) => {
        const tier = priorityTier(task.priority_score);
        const score = Number(task.priority_score).toFixed(1);

        return (
          <div
            key={task.id}
            className={`task-card stripe-${tier} ${task.status === "completed" ? "completed" : ""}`}
          >
            {/* Task info - flex: 1, takes all remaining width */}
            <div className="task-info">
              <p className="task-title">{task.title}</p>
              {task.description && (
                <p style={{ fontSize: "0.82rem", color: "var(--clr-muted)", marginBottom: "0.4rem" }}>
                  {task.description}
                </p>
              )}
              <div className="task-meta">
                <span className="badge badge-deadline">Deadline {task.deadline}</span>
                <span className="badge badge-effort">Effort {task.effort}</span>
                <span className="badge badge-complexity">Complexity {task.complexity}</span>
                <span className={`badge badge-status-${task.status}`}>
                  {task.status === "completed" ? "Done" : "Pending"}
                </span>
              </div>
            </div>

            {/* Priority score bubble - fixed 64x64 */}
            <div className={`priority-score score-${tier}`}>
              <span>{score}</span>
              <span className="score-label">Priority</span>
            </div>

            {/* Action buttons */}
            <div className="task-actions">
              {task.status === "pending" && (
                <button className="btn btn-success btn-sm" onClick={() => onComplete(task)}>
                  Done
                </button>
              )}
              <button className="btn btn-ghost btn-sm" onClick={() => onEdit(task)}>
                Edit
              </button>
              <button className="btn btn-danger btn-sm" onClick={() => onDelete(task)}>
                Delete
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
