import { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { TaskState } from '../types';
import './ConvertIdeaModal.css';

interface ConvertIdeaModalProps {
  ideaId: string;
  onClose: () => void;
}

const ConvertIdeaModal = ({ ideaId, onClose }: ConvertIdeaModalProps) => {
  const { state, convertIdeaToTask } = useApp();
  const idea = state.ideas.find(i => i.id === ideaId);
  
  const [selectedDomainId, setSelectedDomainId] = useState(state.domains[0]?.id || '');
  const [selectedState, setSelectedState] = useState<TaskState>('gotta-start');

  if (!idea) {
    onClose();
    return null;
  }

  const handleConvert = () => {
    convertIdeaToTask(ideaId, selectedDomainId, selectedState);
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
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Convert Idea to Task</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="idea-preview">
            <label>Your Idea</label>
            <p>{idea.text}</p>
          </div>

          <div className="form-group">
            <label>Choose Domain</label>
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
            <p className="field-description">Where does this task start?</p>
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
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleConvert}>
            Create Task
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConvertIdeaModal;