import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import CreateTaskModal from '../components/CreateTaskModal';
import type { TaskState } from '../types';
import './Dashboard.css';

interface KanbanState {
  id: TaskState;
  label: string;
  description: string;
  color: string;
  gradient: string;
  icon: string;
  isDefault: boolean;
}

const Dashboard = () => {
  const { state, updateTask } = useApp();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterDomain, setFilterDomain] = useState<string>('all');
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [showStateManager, setShowStateManager] = useState(false);
  const [editingState, setEditingState] = useState<TaskState | null>(null);
  const [newStateName, setNewStateName] = useState('');
  const [newStateDescription, setNewStateDescription] = useState('');
  const [newStateIcon, setNewStateIcon] = useState('📌');

  // Default Kanban states
  const defaultStates: KanbanState[] = [
    { 
      id: 'gotta-start', 
      label: 'Gotta Start', 
      description: 'Ready to begin',
      color: '#667eea',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      icon: '🎯',
      isDefault: true
    },
    { 
      id: 'in-progress', 
      label: 'In Progress', 
      description: 'Currently working',
      color: '#f093fb',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      icon: '⚡',
      isDefault: true
    },
    { 
      id: 'nearly-done', 
      label: 'Nearly Done', 
      description: 'Almost finished',
      color: '#4facfe',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      icon: '🎉',
      isDefault: true
    },
    { 
      id: 'paused', 
      label: 'Paused', 
      description: 'On hold',
      color: '#a8edea',
      gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      icon: '⏸️',
      isDefault: true
    },
    { 
      id: 'completed', 
      label: 'Completed', 
      description: 'Done & dusted',
      color: '#43e97b',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      icon: '✅',
      isDefault: true
    },
  ];

  const [kanbanStates, setKanbanStates] = useState<KanbanState[]>(() => {
    const saved = localStorage.getItem('omniDesk_kanbanStates');
    return saved ? JSON.parse(saved) : defaultStates;
  });

  useEffect(() => {
    localStorage.setItem('omniDesk_kanbanStates', JSON.stringify(kanbanStates));
  }, [kanbanStates]);

  // Get all tasks including completed (for full Kanban view)
  const allTasks = state.tasks.filter(task => !task.deletedAt);

  // Filter by domain
  const filteredTasks = filterDomain === 'all' 
    ? allTasks 
    : allTasks.filter(task => task.domainId === filterDomain);

  // Group tasks by state - Kanban columns
  const tasksByState: Record<string, typeof allTasks> = {};
  kanbanStates.forEach(s => {
    tasksByState[s.id] = [];
  });

  filteredTasks.forEach(task => {
    if (tasksByState[task.state]) {
      tasksByState[task.state].push(task);
    }
  });

  const getDomain = (domainId: string) => {
    return state.domains.find(d => d.id === domainId);
  };

  const getTaskProgress = (task: typeof allTasks[0]) => {
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

  const handleDragStart = (taskId: string, e: React.DragEvent) => {
    setDraggedTask(taskId);
    e.dataTransfer.setData('taskId', taskId);
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

  // CRUD operations for Kanban states
  const handleAddState = () => {
    if (newStateName.trim()) {
      const stateId = newStateName.toLowerCase().replace(/\s+/g, '-') as TaskState;
      const colors = ['#4facfe', '#fa709a', '#ffa751', '#c471f5', '#12c2e9', '#f77062', '#56ab2f'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      
      const newState: KanbanState = {
        id: stateId,
        label: newStateName,
        description: newStateDescription || 'Custom state',
        color: randomColor,
        gradient: `linear-gradient(135deg, ${randomColor} 0%, ${randomColor}dd 100%)`,
        icon: newStateIcon,
        isDefault: false
      };

      setKanbanStates([...kanbanStates, newState]);
      setNewStateName('');
      setNewStateDescription('');
      setNewStateIcon('📌');
      setShowStateManager(false);
    }
  };

  const handleUpdateState = (stateId: TaskState) => {
    setKanbanStates(kanbanStates.map(s => 
      s.id === stateId 
        ? { ...s, label: newStateName, description: newStateDescription, icon: newStateIcon }
        : s
    ));
    setEditingState(null);
    setNewStateName('');
    setNewStateDescription('');
    setNewStateIcon('📌');
  };

  const handleDeleteState = (stateId: TaskState) => {
    const hasTasks = tasksByState[stateId]?.length > 0;
    if (hasTasks) {
      alert('Cannot delete state with tasks. Move or delete tasks first.');
      return;
    }
    setKanbanStates(kanbanStates.filter(s => s.id !== stateId));
  };

  const startEditState = (kanbanState: KanbanState) => {
    setEditingState(kanbanState.id);
    setNewStateName(kanbanState.label);
    setNewStateDescription(kanbanState.description);
    setNewStateIcon(kanbanState.icon);
    setShowStateManager(true);
  };

  const stats = [
    { label: 'Total Tasks', value: allTasks.length.toString(), color: '#667eea', icon: '📊' },
    { label: 'In Progress', value: (tasksByState['in-progress']?.length || 0).toString(), color: '#ed8936', icon: '⚡' },
    { label: 'Nearly Done', value: (tasksByState['nearly-done']?.length || 0).toString(), color: '#48bb78', icon: '🎯' },
    { label: 'Completed', value: (tasksByState['completed']?.length || 0).toString(), color: '#43e97b', icon: '✅' },
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
        <button 
          className="btn-manage-states" 
          onClick={() => setShowStateManager(!showStateManager)}
        >
          ⚙️ Manage States
        </button>
      </div>

      {showStateManager && (
        <div className="state-manager">
          <div className="state-manager-header">
            <h3>{editingState ? 'Edit State' : 'Add New State'}</h3>
            <button onClick={() => {
              setShowStateManager(false);
              setEditingState(null);
              setNewStateName('');
              setNewStateDescription('');
              setNewStateIcon('📌');
            }}>×</button>
          </div>
          <div className="state-form">
            <input
              type="text"
              placeholder="State name..."
              value={newStateName}
              onChange={(e) => setNewStateName(e.target.value)}
              maxLength={20}
            />
            <input
              type="text"
              placeholder="Description..."
              value={newStateDescription}
              onChange={(e) => setNewStateDescription(e.target.value)}
              maxLength={50}
            />
            <input
              type="text"
              placeholder="Icon emoji..."
              value={newStateIcon}
              onChange={(e) => setNewStateIcon(e.target.value)}
              maxLength={2}
            />
            <button 
              onClick={() => editingState ? handleUpdateState(editingState) : handleAddState()}
              className="btn-primary btn-sm"
            >
              {editingState ? 'Update' : 'Add'} State
            </button>
          </div>
          
          <div className="states-list">
            <h4>Current States</h4>
            {kanbanStates.map(kanbanState => (
              <div key={kanbanState.id} className="state-item" style={{ borderLeft: `4px solid ${kanbanState.color}` }}>
                <span className="state-icon">{kanbanState.icon}</span>
                <div className="state-info">
                  <strong>{kanbanState.label}</strong>
                  <small>{kanbanState.description}</small>
                </div>
                {!kanbanState.isDefault && (
                  <div className="state-actions">
                    <button onClick={() => startEditState(kanbanState)} title="Edit">✏️</button>
                    <button onClick={() => handleDeleteState(kanbanState.id)} title="Delete">🗑️</button>
                  </div>
                )}
                {kanbanState.isDefault && (
                  <span className="default-badge">Default</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

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
        <div className="kanban-board-grid">
          {kanbanStates.map((kanbanState) => {
            const stateTasks = tasksByState[kanbanState.id] || [];

            return (
              <div 
                key={kanbanState.id} 
                className="kanban-column"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(kanbanState.id as TaskState)}
              >
                <div className="column-header" style={{ background: kanbanState.gradient }}>
                  <div className="column-info">
                    <span className="column-icon">{kanbanState.icon}</span>
                    <div>
                      <h3 className="column-title">{kanbanState.label}</h3>
                      <p className="column-description">{kanbanState.description}</p>
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
                          onDragStart={(e) => handleDragStart(task.id, e)}
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
                                      background: kanbanState.gradient
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
