import { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { TaskState } from '../types';
import './CreateTaskModal.css';

interface CreateTaskModalProps {
  onClose: () => void;
}

const CreateTaskModal = ({ onClose }: CreateTaskModalProps) => {
  const { state, addTask } = useApp();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDomainId, setSelectedDomainId] = useState(state.domains[0]?.id || '');
  const [selectedState, setSelectedState] = useState<TaskState>('gotta-start');
  const [deadline, setDeadline] = useState('');

  const handleCreate = () => {
    if (!title.trim()) return;

    addTask({
      title: title.trim(),
      description: description.trim(),
      domainId: selectedDomainId,
      state: selectedState,
      deadline: deadline || undefined,
    });
    
    onClose();
  };

  const taskStates: { value: TaskState; label: string; description: string }[] = [
    { value: 'gotta-start', label: 'Gotta Start', description: 'Ready to begin when you are' },
    { value: 'in-progress', label: 'In Progress', description: 'Currently working on it' },
    { value: 'nearly-done', label: 'Nearly Done', description: 'Almost finished' },
    { value: 'paused', label: 'Paused', description: 'Temporarily on hold' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content create-task-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Task</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="task-title">Task Title *</label>
            <input
              id="task-title"
              type="text"
              className="text-input"
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="task-description">Description</label>
            <textarea
              id="task-description"
              className="textarea-input"
              placeholder="Add more details about this task..."
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Domain *</label>
            <p className="field-description">Which area of your life does this belong to?</p>
            <div className="domain-options">
              {state.domains.map(domain => (
                <button
                  key={domain.id}
                  className={`domain-option ${selectedDomainId === domain.id ? 'selected' : ''}`}
                  onClick={() => setSelectedDomainId(domain.id)}
                  style={{
                    borderColor: selectedDomainId === domain.id ? domain.color : 'var(--border-color)',
                  }}
                >
                  <span 
                    className="domain-color" 
                    style={{ background: domain.color }}
                  />
                  {domain.name}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Initial State</label>
            <div className="state-options">
              {taskStates.map(state => (
                <button
                  key={state.value}
                  className={`state-option ${selectedState === state.value ? 'selected' : ''}`}
                  onClick={() => setSelectedState(state.value)}
                >
                  <div className="state-label">{state.label}</div>
                  <div className="state-description">{state.description}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="task-deadline">Deadline (Optional)</label>
            <input
              id="task-deadline"
              type="date"
              className="date-input"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="btn-primary" 
            onClick={handleCreate}
            disabled={!title.trim()}
          >
            Create Task
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTaskModal;