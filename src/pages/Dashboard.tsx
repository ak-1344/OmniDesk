import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import CreateTaskModal from '../components/CreateTaskModal';
import type { TaskState } from '../types';
import './Dashboard.css';

const Dashboard = () => {
  const { state } = useApp();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterDomain, setFilterDomain] = useState<string>('all');

  // Get active tasks (not deleted, not completed)
  const activeTasks = state.tasks.filter(
    task => !task.deletedAt && task.state !== 'completed'
  );

  // Filter by domain
  const filteredTasks = filterDomain === 'all' 
    ? activeTasks 
    : activeTasks.filter(task => task.domainId === filterDomain);

  // Group tasks by state
  const tasksByState: Record<TaskState, typeof activeTasks> = {
    'gotta-start': [],
    'in-progress': [],
    'nearly-done': [],
    'paused': [],
    'completed': [],
  };

  filteredTasks.forEach(task => {
    if (tasksByState[task.state]) {
      tasksByState[task.state].push(task);
    }
  });

  const getDomain = (domainId: string) => {
    return state.domains.find(d => d.id === domainId);
  };

  const getTaskProgress = (task: typeof activeTasks[0]) => {
    if (task.subtasks.length === 0) return 0;
    const completed = task.subtasks.filter(s => s.state === 'completed').length;
    return Math.round((completed / task.subtasks.length) * 100);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays <= 7) return `Due in ${diffDays}d`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const stateConfig: Record<string, { label: string; description: string; color: string }> = {
    'gotta-start': { 
      label: 'Gotta Start', 
      description: 'Tasks ready to begin',
      color: '#9e9e9e'
    },
    'in-progress': { 
      label: 'In Progress', 
      description: 'Currently working on',
      color: '#ed8936'
    },
    'nearly-done': { 
      label: 'Nearly Done', 
      description: 'Almost finished',
      color: '#48bb78'
    },
    'paused': { 
      label: 'Paused', 
      description: 'Temporarily on hold',
      color: '#4299e1'
    },
  };

  const stats = [
    { label: 'Active Tasks', value: activeTasks.length.toString(), color: '#667eea' },
    { label: 'In Progress', value: tasksByState['in-progress'].length.toString(), color: '#ed8936' },
    { label: 'Nearly Done', value: tasksByState['nearly-done'].length.toString(), color: '#48bb78' },
    { label: 'Ideas', value: state.ideas.filter(i => !i.deletedAt).length.toString(), color: '#f56565' },
  ];

  return (
    <div className="page dashboard">
      <header className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="page-subtitle">What's going on in your life right now</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
          + New Task
        </button>
      </header>

      <div className="stats-grid">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="dashboard-controls">
        <div className="filter-group">
          <label>Filter by Domain:</label>
          <select 
            className="filter-select"
            value={filterDomain}
            onChange={(e) => setFilterDomain(e.target.value)}
          >
            <option value="all">All Domains</option>
            {state.domains.map(domain => (
              <option key={domain.id} value={domain.id}>{domain.name}</option>
            ))}
          </select>
        </div>
      </div>

      {activeTasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3>No active work</h3>
          <p>Start by creating some tasks or converting ideas into tasks</p>
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            + New Task
          </button>
        </div>
      ) : (
        <div className="dashboard-sections">
          {Object.entries(stateConfig).map(([stateKey, config]) => {
            const stateTasks = tasksByState[stateKey as TaskState];
            
            if (stateTasks.length === 0) return null;

            return (
              <section key={stateKey} className="dashboard-section">
                <div className="section-header">
                  <h2 className="section-title" style={{ color: config.color }}>
                    {config.label}
                  </h2>
                  <span className="section-count">{stateTasks.length}</span>
                </div>
                <p className="section-description">{config.description}</p>
                
                <div className="work-items">
                  {stateTasks.map(task => {
                    const domain = getDomain(task.domainId);
                    const progress = getTaskProgress(task);

                    return (
                      <Link 
                        to={`/tasks/${task.id}`}
                        key={task.id} 
                        className="work-item"
                        style={{ borderLeftColor: domain?.color || config.color }}
                      >
                        <div className="work-item-header">
                          <h3>{task.title}</h3>
                          <span 
                            className="domain-badge"
                            style={{ 
                              background: domain ? `${domain.color}20` : 'var(--bg-tertiary)',
                              color: domain?.color || 'var(--text-primary)',
                              border: `1px solid ${domain?.color || 'var(--border-color)'}`
                            }}
                          >
                            {domain?.name || 'Unknown'}
                          </span>
                        </div>
                        
                        {task.subtasks.length > 0 && (
                          <div className="task-progress">
                            <div className="progress-bar">
                              <div 
                                className="progress-fill" 
                                style={{ 
                                  width: `${progress}%`,
                                  background: domain?.color || config.color
                                }}
                              />
                            </div>
                            <span className="progress-text">
                              {task.subtasks.filter(s => s.state === 'completed').length}/{task.subtasks.length} done
                            </span>
                          </div>
                        )}
                        
                        <div className="work-item-meta">
                          {task.subtasks.length > 0 && (
                            <span>{task.subtasks.length} subtasks</span>
                          )}
                          {task.deadline && (
                            <span className="deadline">{formatDate(task.deadline)}</span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {showCreateModal && (
        <CreateTaskModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
};

export default Dashboard;
