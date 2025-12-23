import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import CreateTaskModal from '../components/CreateTaskModal';
import type { TaskState } from '../types';
import './Dashboard.css';

const Dashboard = () => {
  const { state, updateTask } = useApp();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterDomain, setFilterDomain] = useState<string>('all');
  const [draggedTask, setDraggedTask] = useState<string | null>(null);

  // Get all tasks including completed (for full Kanban view)
  const allTasks = state.tasks.filter(task => !task.deletedAt);

  // Filter by domain
  const filteredTasks = filterDomain === 'all' 
    ? allTasks 
    : allTasks.filter(task => task.domainId === filterDomain);

  // Group tasks by state - Kanban columns
  const tasksByState: Record<TaskState, typeof allTasks> = {
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

  const stateConfig: Record<TaskState, { label: string; description: string; color: string; gradient: string; icon: string }> = {
    'gotta-start': { 
      label: 'Gotta Start', 
      description: 'Ready to begin',
      color: '#9e9e9e',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      icon: '🎯'
    },
    'in-progress': { 
      label: 'In Progress', 
      description: 'Currently working',
      color: '#ed8936',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      icon: '⚡'
    },
    'nearly-done': { 
      label: 'Nearly Done', 
      description: 'Almost finished',
      color: '#48bb78',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      icon: '🎉'
    },
    'paused': { 
      label: 'Paused', 
      description: 'On hold',
      color: '#4299e1',
      gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      icon: '⏸️'
    },
    'completed': { 
      label: 'Completed', 
      description: 'Done & dusted',
      color: '#48bb78',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      icon: '✅'
    },
  };

  const handleDragStart = (taskId: string) => {
    setDraggedTask(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (newState: TaskState) => {
    if (draggedTask) {
      updateTask(draggedTask, { state: newState });
      setDraggedTask(null);
    }
  };

  const stats = [
    { label: 'Total Tasks', value: allTasks.length.toString(), color: '#667eea', icon: '📊' },
    { label: 'In Progress', value: tasksByState['in-progress'].length.toString(), color: '#ed8936', icon: '⚡' },
    { label: 'Nearly Done', value: tasksByState['nearly-done'].length.toString(), color: '#48bb78', icon: '🎯' },
    { label: 'Completed', value: tasksByState['completed'].length.toString(), color: '#43e97b', icon: '✅' },
  ];

  return (
    <div className="page dashboard">
      <header className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="page-subtitle">Your global command center — everything at a glance</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
          + New Task
        </button>
      </header>

      <div className="stats-grid">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-content">
              <div className="stat-value" style={{ background: `linear-gradient(135deg, ${stat.color}, ${stat.color}dd)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {stat.value}
              </div>
              <div className="stat-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-controls">
        <div className="filter-group">
          <label>🏷️ Filter by Domain:</label>
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

      {allTasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🚀</div>
          <h3>No tasks yet</h3>
          <p>Start your journey by creating your first task or converting ideas</p>
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            + Create First Task
          </button>
        </div>
      ) : (
        <div className="kanban-board">
          {(Object.keys(stateConfig) as TaskState[]).map((stateKey) => {
            const config = stateConfig[stateKey];
            const stateTasks = tasksByState[stateKey];

            return (
              <div 
                key={stateKey} 
                className="kanban-column"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(stateKey)}
              >
                <div className="column-header" style={{ background: config.gradient }}>
                  <div className="column-info">
                    <span className="column-icon">{config.icon}</span>
                    <div>
                      <h3 className="column-title">{config.label}</h3>
                      <p className="column-description">{config.description}</p>
                    </div>
                  </div>
                  <span className="column-count">{stateTasks.length}</span>
                </div>
                
                <div className="kanban-cards">
                  {stateTasks.length === 0 ? (
                    <div className="empty-column">
                      <p>No tasks here</p>
                      <span>Drag tasks to this column</span>
                    </div>
                  ) : (
                    stateTasks.map(task => {
                      const domain = getDomain(task.domainId);
                      const progress = getTaskProgress(task);
                      const dueDateInfo = formatDate(task.deadline);

                      return (
                        <div 
                          key={task.id} 
                          className="kanban-card"
                          draggable
                          onDragStart={() => handleDragStart(task.id)}
                        >
                          <Link to={`/tasks/${task.id}`} className="card-link">
                            <div className="card-header">
                              <h4 className="card-title">{task.title}</h4>
                              <span 
                                className="domain-pill"
                                style={{ 
                                  background: domain ? `${domain.color}25` : 'rgba(255,255,255,0.05)',
                                  color: domain?.color || 'var(--text-primary)',
                                  border: `1px solid ${domain?.color || 'var(--glass-border)'}40`
                                }}
                              >
                                {domain?.name || 'Unknown'}
                              </span>
                            </div>
                            
                            {task.description && (
                              <p className="card-description">{task.description}</p>
                            )}
                            
                            {task.subtasks.length > 0 && (
                              <div className="card-progress">
                                <div className="progress-info">
                                  <span className="progress-label">
                                    {task.subtasks.filter(s => s.state === 'completed').length}/{task.subtasks.length} subtasks
                                  </span>
                                  <span className="progress-percent">{progress}%</span>
                                </div>
                                <div className="progress-bar">
                                  <div 
                                    className="progress-fill" 
                                    style={{ 
                                      width: `${progress}%`,
                                      background: config.gradient
                                    }}
                                  />
                                </div>
                              </div>
                            )}
                            
                            <div className="card-footer">
                              {task.subtasks.length > 0 && (
                                <span className="card-meta">📋 {task.subtasks.length} tasks</span>
                              )}
                              {dueDateInfo && (
                                <span className={`card-deadline ${dueDateInfo.includes('overdue') ? 'overdue' : ''}`}>
                                  📅 {dueDateInfo}
                                </span>
                              )}
                            </div>
                          </Link>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
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
