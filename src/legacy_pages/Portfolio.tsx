import './Portfolio.css';

const Portfolio = () => {
  const projects = [
    {
      id: 1,
      title: 'Website Redesign',
      description: 'Complete overhaul of company website with modern design',
      status: 'In Progress',
      progress: 65,
      startDate: '2024-01-01',
      dueDate: '2024-02-15',
      tasks: { total: 23, completed: 15 }
    },
    {
      id: 2,
      title: 'Mobile App Development',
      description: 'Native mobile app for iOS and Android platforms',
      status: 'Planning',
      progress: 20,
      startDate: '2024-01-10',
      dueDate: '2024-04-30',
      tasks: { total: 45, completed: 9 }
    },
    {
      id: 3,
      title: 'API Integration',
      description: 'Integrate third-party payment and analytics APIs',
      status: 'Completed',
      progress: 100,
      startDate: '2023-12-01',
      dueDate: '2024-01-05',
      tasks: { total: 12, completed: 12 }
    },
  ];

  return (
    <div className="page portfolio-page">
      <header className="page-header">
        <div>
          <h1>Portfolio</h1>
          <p className="page-subtitle">Your projects and achievements</p>
        </div>
        <button className="btn-primary">+ New Project</button>
      </header>

      <div className="portfolio-stats">
        <div className="stat-card">
          <div className="stat-value">3</div>
          <div className="stat-label">Active Projects</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">80</div>
          <div className="stat-label">Total Tasks</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">36</div>
          <div className="stat-label">Completed Tasks</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">45%</div>
          <div className="stat-label">Overall Progress</div>
        </div>
      </div>

      <div className="projects-grid">
        {projects.map((project) => (
          <div key={project.id} className="project-card">
            <div className="project-header">
              <h3>{project.title}</h3>
              <span className={`status-badge status-${project.status.toLowerCase().replace(' ', '-')}`}>
                {project.status}
              </span>
            </div>
            
            <p className="project-description">{project.description}</p>
            
            <div className="project-progress">
              <div className="progress-header">
                <span>Progress</span>
                <span>{project.progress}%</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
            </div>

            <div className="project-meta">
              <div className="meta-item">
                <span className="meta-label">Tasks:</span>
                <span className="meta-value">
                  {project.tasks.completed} / {project.tasks.total}
                </span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Timeline:</span>
                <span className="meta-value">
                  {project.startDate} → {project.dueDate}
                </span>
              </div>
            </div>

            <div className="project-actions">
              <button className="btn-secondary">View Details</button>
              <button className="icon-btn">✏️</button>
            </div>
          </div>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">💼</div>
          <h3>No projects yet</h3>
          <p>Create your first project to showcase your work</p>
          <button className="btn-primary">+ New Project</button>
        </div>
      )}
    </div>
  );
};

export default Portfolio;
