import './Dashboard.css';

const Dashboard = () => {
  const activeWorkItems = [
    { id: 1, title: 'Design new landing page', status: 'In Progress', priority: 'High', dueDate: '2024-01-15' },
    { id: 2, title: 'Fix authentication bug', status: 'In Progress', priority: 'Critical', dueDate: '2024-01-10' },
    { id: 3, title: 'Review pull requests', status: 'Pending', priority: 'Medium', dueDate: '2024-01-12' },
    { id: 4, title: 'Update documentation', status: 'In Progress', priority: 'Low', dueDate: '2024-01-20' },
  ];

  const stats = [
    { label: 'Active Tasks', value: '12', color: '#667eea' },
    { label: 'Completed Today', value: '5', color: '#48bb78' },
    { label: 'Ideas', value: '23', color: '#ed8936' },
    { label: 'Events This Week', value: '8', color: '#f56565' },
  ];

  return (
    <div className="page dashboard">
      <header className="page-header">
        <h1>Dashboard</h1>
        <p className="page-subtitle">Overview of your active work</p>
      </header>

      <div className="stats-grid">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card" style={{ borderTopColor: stat.color }}>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      <section className="dashboard-section">
        <h2 className="section-title">Active Work</h2>
        <div className="work-items">
          {activeWorkItems.map((item) => (
            <div key={item.id} className="work-item">
              <div className="work-item-header">
                <h3>{item.title}</h3>
                <span className={`priority-badge priority-${item.priority.toLowerCase()}`}>
                  {item.priority}
                </span>
              </div>
              <div className="work-item-meta">
                <span className="status">{item.status}</span>
                <span className="due-date">Due: {item.dueDate}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {activeWorkItems.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3>No active work</h3>
          <p>Start by creating some tasks or ideas</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
