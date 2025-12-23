import { Link } from 'react-router-dom';
import './Tasks.css';

const Tasks = () => {
  const tasks = [
    { id: 1, title: 'Design new landing page', description: 'Create mockups for the new landing page', status: 'In Progress', priority: 'High' },
    { id: 2, title: 'Fix authentication bug', description: 'Users unable to login with Google OAuth', status: 'In Progress', priority: 'Critical' },
    { id: 3, title: 'Review pull requests', description: 'Review and merge pending PRs', status: 'Pending', priority: 'Medium' },
    { id: 4, title: 'Update documentation', description: 'Add API documentation for new endpoints', status: 'Pending', priority: 'Low' },
    { id: 5, title: 'Write unit tests', description: 'Add tests for authentication module', status: 'Pending', priority: 'Medium' },
    { id: 6, title: 'Database optimization', description: 'Optimize slow queries in production', status: 'Completed', priority: 'High' },
  ];

  return (
    <div className="page tasks-page">
      <header className="page-header">
        <h1>Tasks</h1>
        <button className="btn-primary">+ New Task</button>
      </header>

      <div className="tasks-grid">
        {tasks.map((task) => (
          <Link to={`/tasks/${task.id}`} key={task.id} className="task-card">
            <div className="task-card-header">
              <span className={`priority-badge priority-${task.priority.toLowerCase()}`}>
                {task.priority}
              </span>
              <span className={`status-badge status-${task.status.toLowerCase().replace(' ', '-')}`}>
                {task.status}
              </span>
            </div>
            <h3 className="task-title">{task.title}</h3>
            <p className="task-description">{task.description}</p>
            <div className="task-footer">
              <span className="task-subtasks">3 subtasks</span>
              <span className="task-date">Due: Jan 15</span>
            </div>
          </Link>
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">✓</div>
          <h3>No tasks yet</h3>
          <p>Create your first task to get started</p>
          <button className="btn-primary">+ New Task</button>
        </div>
      )}
    </div>
  );
};

export default Tasks;
