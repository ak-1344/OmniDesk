import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import CreateTaskModal from '../components/CreateTaskModal';
import './Tasks.css';

const Tasks = () => {
  const { state } = useApp();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterDomain, setFilterDomain] = useState<string>('all');
  const [filterState, setFilterState] = useState<string>('all');

  const activeTasks = state.tasks.filter(task => !task.deletedAt);

  const handleDragStart = (taskId: string, e: React.DragEvent) => {
    e.dataTransfer.setData('taskId', taskId);
  };
  
  const filteredTasks = activeTasks.filter(task => {
    if (filterDomain !== 'all' && task.domainId !== filterDomain) return false;
    if (filterState !== 'all' && task.state !== filterState) return false;
    return true;
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
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getStateLabel = (state: string) => {
    const labels: Record<string, string> = {
      'gotta-start': 'Gotta Start',
      'in-progress': 'In Progress',
      'nearly-done': 'Nearly Done',
      'paused': 'Paused',
      'completed': 'Completed',
    };
    return labels[state] || state;
  };

  return (
    <div className="page tasks-page">
      <header className="page-header">
        <div>
          <h1>Tasks</h1>
          <p className="page-subtitle">Your commitments and what needs to be done</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
          + New Task
        </button>
      </header>

      <div className="filters-bar">
        <div className="filter-group">
          <label>Domain:</label>
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

        <div className="filter-group">
          <label>State:</label>
          <select 
            className="filter-select"
            value={filterState}
            onChange={(e) => setFilterState(e.target.value)}
          >
            <option value="all">All States</option>
            <option value="gotta-start">Gotta Start</option>
            <option value="in-progress">In Progress</option>
            <option value="nearly-done">Nearly Done</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {filteredTasks.length > 0 ? (
        <div className="tasks-grid">
          {filteredTasks.map((task) => {
            const domain = getDomain(task.domainId);
            const progress = getTaskProgress(task);

            return (
              <div
                key={task.id}
                className="task-card-wrapper"
                draggable
                onDragStart={(e) => handleDragStart(task.id, e)}
              >
                <Link to={`/tasks/${task.id}`} className="task-card">
                  <div className="task-card-header">
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
                  <span className={`status-badge status-${task.state}`}>
                    {getStateLabel(task.state)}
                  </span>
                </div>
                
                <h3 className="task-title">{task.title}</h3>
                <p className="task-description">{task.description}</p>
                
                {task.subtasks.length > 0 && (
                  <div className="task-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ 
                          width: `${progress}%`,
                          background: domain?.color || 'var(--accent-primary)'
                        }}
                      />
                    </div>
                    <span className="progress-text">{progress}%</span>
                  </div>
                )}
                
                <div className="task-footer">
                  <span className="task-subtasks">
                    {task.subtasks.length} subtask{task.subtasks.length !== 1 ? 's' : ''}
                  </span>
                  {task.deadline && (
                    <span className="task-date">Due: {formatDate(task.deadline)}</span>
                  )}
                </div>
              </Link>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">✓</div>
          <h3>No tasks {filterDomain !== 'all' || filterState !== 'all' ? 'match your filters' : 'yet'}</h3>
          <p>{filterDomain !== 'all' || filterState !== 'all' ? 'Try adjusting your filters' : 'Create your first task to get started'}</p>
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            + New Task
          </button>
        </div>
      )}

      {showCreateModal && (
        <CreateTaskModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
};

export default Tasks;
