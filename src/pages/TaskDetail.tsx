import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { SubtaskState } from '../types';
import './TaskDetail.css';

interface KanbanColumn {
  id: SubtaskState;
  title: string;
  color: string;
  gradient: string;
}

const TaskDetail = () => {
  const { id } = useParams();
  const { state, getTask, addSubtask, updateSubtask, deleteSubtask } = useApp();
  
  const [kanbanColumns, setKanbanColumns] = useState<KanbanColumn[]>([
    { 
      id: 'todo', 
      title: 'To Do', 
      color: '#667eea',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    { 
      id: 'in-progress', 
      title: 'In Progress', 
      color: '#f093fb',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    { 
      id: 'completed', 
      title: 'Completed', 
      color: '#43e97b',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    },
  ]);
  
  const [draggedSubtask, setDraggedSubtask] = useState<string | null>(null);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [showAddSubtask, setShowAddSubtask] = useState<string | null>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newSubtaskDescription, setNewSubtaskDescription] = useState('');
  const [newSubtaskDeadline, setNewSubtaskDeadline] = useState('');

  const task = getTask(id || '');
  
  if (!task) {
    return (
      <div className="page task-detail-page">
        <div className="empty-state">
          <h2>Task not found</h2>
          <Link to="/tasks" className="btn-primary">Back to Tasks</Link>
        </div>
      </div>
    );
  }

  const getSubtasksByStatus = (status: SubtaskState) => {
    return task.subtasks.filter(s => s.state === status);
  };

  const handleDragStart = (subtaskId: string) => {
    setDraggedSubtask(subtaskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (newState: SubtaskState) => {
    if (draggedSubtask && task) {
      updateSubtask(task.id, draggedSubtask, { state: newState });
      setDraggedSubtask(null);
    }
  };

  const handleAddColumn = () => {
    if (newColumnTitle.trim()) {
      const columnId = newColumnTitle.toLowerCase().replace(/\s+/g, '-') as SubtaskState;
      const colors = ['#4facfe', '#fa709a', '#ffa751', '#a8edea', '#fed6e3'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      
      setKanbanColumns([...kanbanColumns, {
        id: columnId,
        title: newColumnTitle,
        color: randomColor,
        gradient: `linear-gradient(135deg, ${randomColor} 0%, ${randomColor}dd 100%)`
      }]);
      setNewColumnTitle('');
      setShowAddColumn(false);
    }
  };

  const handleAddSubtask = (columnId: SubtaskState) => {
    if (newSubtaskTitle.trim() && task) {
      addSubtask(task.id, {
        title: newSubtaskTitle,
        description: newSubtaskDescription || undefined,
        state: columnId,
        deadline: newSubtaskDeadline || undefined,
      });
      setNewSubtaskTitle('');
      setNewSubtaskDescription('');
      setNewSubtaskDeadline('');
      setShowAddSubtask(null);
    }
  };

  const handleToggleSubtask = (subtaskId: string, currentState: SubtaskState) => {
    if (task) {
      const newState: SubtaskState = currentState === 'completed' ? 'todo' : 'completed';
      updateSubtask(task.id, subtaskId, { 
        state: newState,
        completedAt: newState === 'completed' ? new Date().toISOString() : undefined
      });
    }
  };

  const handleDeleteColumn = (columnId: SubtaskState) => {
    // Don't allow deleting if it has items
    const hasItems = task.subtasks.some(s => s.state === columnId);
    if (hasItems) {
      alert('Cannot delete column with items. Move or delete items first.');
      return;
    }
    setKanbanColumns(kanbanColumns.filter(col => col.id !== columnId));
  };

  const getDomain = () => {
    return state.domains.find(d => d.id === task.domainId);
  };

  const domain = getDomain();
  const completedSubtasks = task.subtasks.filter(s => s.state === 'completed').length;
  const totalSubtasks = task.subtasks.length;
  const progress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  return (
    <div className="page task-detail-page">
      <div className="task-detail-header">
        <Link to="/tasks" className="back-link">← Back to Tasks</Link>
        <div className="task-detail-title">
          <h1>{task.title}</h1>
          <div className="task-detail-badges">
            <span 
              className="domain-badge"
              style={{ 
                background: domain ? `${domain.color}25` : 'rgba(255,255,255,0.05)',
                color: domain?.color || 'var(--text-primary)',
                border: `1px solid ${domain?.color || 'var(--glass-border)'}60`
              }}
            >
              {domain?.name || 'No Domain'}
            </span>
            <span className={`priority-badge priority-${task.state}`}>
              {task.state.replace('-', ' ')}
            </span>
          </div>
        </div>
        <p className="task-detail-description">{task.description}</p>
        <div className="task-detail-meta">
          {task.ideaId && (
            <>
              <Link to={`/ideas/${task.ideaId}`} className="idea-origin-link">
                💡 Born from Idea
              </Link>
              <span>•</span>
            </>
          )}
          {task.deadline && <span>📅 Due: {new Date(task.deadline).toLocaleDateString()}</span>}
          {task.deadline && <span>•</span>}
          <span>📋 {totalSubtasks} subtasks ({completedSubtasks} completed)</span>
          <span>•</span>
          <span className="progress-indicator">
            Progress: <strong style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>{progress}%</strong>
          </span>
        </div>
        
        {totalSubtasks > 0 && (
          <div className="task-progress-bar">
            <div 
              className="progress-fill" 
              style={{ 
                width: `${progress}%`,
                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
              }}
            />
          </div>
        )}
      </div>

      <div className="kanban-board-container">
        <div className="kanban-board-header">
          <h2>Subtask Kanban Board</h2>
          <button 
            className="btn-add-column" 
            onClick={() => setShowAddColumn(!showAddColumn)}
          >
            + Add Column
          </button>
        </div>

        {showAddColumn && (
          <div className="add-column-form">
            <input
              type="text"
              placeholder="Column name..."
              value={newColumnTitle}
              onChange={(e) => setNewColumnTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddColumn()}
              autoFocus
            />
            <button onClick={handleAddColumn} className="btn-primary btn-sm">Add</button>
            <button onClick={() => {
              setShowAddColumn(false);
              setNewColumnTitle('');
            }} className="btn-secondary btn-sm">Cancel</button>
          </div>
        )}

        <div className="kanban-board">
          {kanbanColumns.map((column) => {
            const items = getSubtasksByStatus(column.id);
            const isDefaultColumn = ['todo', 'in-progress', 'completed'].includes(column.id);
            
            return (
              <div 
                key={column.id} 
                className="kanban-column"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(column.id)}
              >
                <div className="kanban-column-header" style={{ background: column.gradient }}>
                  <div className="column-header-content">
                    <h3>{column.title}</h3>
                    <span className="item-count">{items.length}</span>
                  </div>
                  {!isDefaultColumn && (
                    <button 
                      className="btn-delete-column"
                      onClick={() => handleDeleteColumn(column.id)}
                      title="Delete column"
                    >
                      ×
                    </button>
                  )}
                </div>
                
                <div className="kanban-items">
                  {items.map((item) => (
                    <div 
                      key={item.id} 
                      className="kanban-item"
                      draggable
                      onDragStart={() => handleDragStart(item.id)}
                    >
                      <div className="kanban-item-checkbox">
                        <input 
                          type="checkbox" 
                          checked={item.state === 'completed'}
                          onChange={() => handleToggleSubtask(item.id, item.state)}
                        />
                      </div>
                      <div className="kanban-item-content">
                        <span className={item.state === 'completed' ? 'completed-text' : ''}>
                          {item.title}
                        </span>
                        {item.description && (
                          <p className="subtask-description">{item.description}</p>
                        )}
                        {item.deadline && (
                          <p className="subtask-deadline">📅 {new Date(item.deadline).toLocaleDateString()}</p>
                        )}
                      </div>
                      <button 
                        className="btn-delete-subtask"
                        onClick={() => task && deleteSubtask(task.id, item.id)}
                        title="Delete subtask"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                  
                  {items.length === 0 && !showAddSubtask && (
                    <div className="kanban-empty">
                      <p>No items yet</p>
                      <span>Drag tasks here or add new ones</span>
                    </div>
                  )}
                  
                  {showAddSubtask === column.id ? (
                    <div className="add-subtask-form">
                      <input
                        type="text"
                        placeholder="Subtask title..."
                        value={newSubtaskTitle}
                        onChange={(e) => setNewSubtaskTitle(e.target.value)}
                        autoFocus
                      />
                      <textarea
                        placeholder="Description (optional)..."
                        value={newSubtaskDescription}
                        onChange={(e) => setNewSubtaskDescription(e.target.value)}
                        rows={2}
                      />
                      <input
                        type="date"
                        placeholder="Deadline (optional)..."
                        value={newSubtaskDeadline}
                        onChange={(e) => setNewSubtaskDeadline(e.target.value)}
                      />
                      <div className="form-actions">
                        <button onClick={() => handleAddSubtask(column.id)} className="btn-primary btn-sm">
                          Add
                        </button>
                        <button 
                          onClick={() => {
                            setShowAddSubtask(null);
                            setNewSubtaskTitle('');
                            setNewSubtaskDescription('');
                            setNewSubtaskDeadline('');
                          }} 
                          className="btn-secondary btn-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button 
                      className="kanban-add-btn"
                      onClick={() => setShowAddSubtask(column.id)}
                    >
                      + Add subtask
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
