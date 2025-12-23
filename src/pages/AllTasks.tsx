import './AllTasks.css';

const AllTasks = () => {
  const tasks = [
    { id: 1, title: 'Design new landing page', project: 'Website Redesign', priority: 'High', status: 'In Progress', dueDate: '2024-01-15', assignee: 'You' },
    { id: 2, title: 'Fix authentication bug', project: 'Backend', priority: 'Critical', status: 'In Progress', dueDate: '2024-01-10', assignee: 'You' },
    { id: 3, title: 'Review pull requests', project: 'Development', priority: 'Medium', status: 'Pending', dueDate: '2024-01-12', assignee: 'You' },
    { id: 4, title: 'Update documentation', project: 'Documentation', priority: 'Low', status: 'Pending', dueDate: '2024-01-20', assignee: 'You' },
    { id: 5, title: 'Write unit tests', project: 'Testing', priority: 'Medium', status: 'Pending', dueDate: '2024-01-18', assignee: 'You' },
    { id: 6, title: 'Database optimization', project: 'Backend', priority: 'High', status: 'Completed', dueDate: '2024-01-08', assignee: 'You' },
    { id: 7, title: 'Set up CI/CD pipeline', project: 'DevOps', priority: 'High', status: 'Completed', dueDate: '2024-01-05', assignee: 'You' },
    { id: 8, title: 'Mobile responsive design', project: 'Website Redesign', priority: 'Medium', status: 'Pending', dueDate: '2024-01-22', assignee: 'You' },
  ];

  return (
    <div className="page all-tasks-page">
      <header className="page-header">
        <div>
          <h1>All Tasks</h1>
          <p className="page-subtitle">Complete task list in table view</p>
        </div>
        <div className="header-actions">
          <input type="search" placeholder="Search tasks..." className="search-input" />
          <select className="filter-select">
            <option>All Status</option>
            <option>In Progress</option>
            <option>Pending</option>
            <option>Completed</option>
          </select>
          <button className="btn-primary">+ New Task</button>
        </div>
      </header>

      <div className="table-container">
        <table className="tasks-table">
          <thead>
            <tr>
              <th><input type="checkbox" /></th>
              <th>Task</th>
              <th>Project</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Due Date</th>
              <th>Assignee</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id}>
                <td><input type="checkbox" /></td>
                <td className="task-title-cell">{task.title}</td>
                <td>{task.project}</td>
                <td>
                  <span className={`priority-badge priority-${task.priority.toLowerCase()}`}>
                    {task.priority}
                  </span>
                </td>
                <td>
                  <span className={`status-badge status-${task.status.toLowerCase().replace(' ', '-')}`}>
                    {task.status}
                  </span>
                </td>
                <td>{task.dueDate}</td>
                <td>{task.assignee}</td>
                <td>
                  <div className="action-buttons">
                    <button className="icon-btn" title="Edit">✏️</button>
                    <button className="icon-btn" title="Delete">🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {tasks.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No tasks found</h3>
          <p>Create your first task to see it here</p>
        </div>
      )}
    </div>
  );
};

export default AllTasks;
