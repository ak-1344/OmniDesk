import { useState } from 'react';
import { useApp } from '../context/AppContext';
import ConvertIdeaModal from '../components/ConvertIdeaModal';
import './Ideas.css';

const Ideas = () => {
  const { state, addIdea, updateIdea, deleteIdea } = useApp();
  const [newIdeaText, setNewIdeaText] = useState('');
  const [convertingIdeaId, setConvertingIdeaId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const handleSaveIdea = () => {
    if (newIdeaText.trim()) {
      addIdea({ text: newIdeaText });
      setNewIdeaText('');
    }
  };

  const handleStartEdit = (id: string, text: string) => {
    setEditingId(id);
    setEditText(text);
  };

  const handleSaveEdit = () => {
    if (editingId && editText.trim()) {
      updateIdea(editingId, { text: editText });
      setEditingId(null);
      setEditText('');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const activeIdeas = state.ideas.filter(idea => !idea.deletedAt);

  return (
    <div className="page ideas-page">
      <header className="page-header">
        <div>
          <h1>Ideas</h1>
          <p className="page-subtitle">Brain dump — capture thoughts without pressure</p>
        </div>
      </header>

      <div className="ideas-container">
        <div className="idea-input-card">
          <h3>💭 What's on your mind?</h3>
          <textarea
            className="idea-textarea"
            placeholder="Write freely... no structure required. Just let your thoughts flow."
            rows={6}
            value={newIdeaText}
            onChange={(e) => setNewIdeaText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                handleSaveIdea();
              }
            }}
          />
          <div className="idea-input-actions">
            <span className="hint-text">Press Ctrl+Enter to save quickly</span>
            <button 
              className="btn-primary" 
              onClick={handleSaveIdea}
              disabled={!newIdeaText.trim()}
            >
              Save Idea
            </button>
          </div>
        </div>

        {activeIdeas.length > 0 ? (
          <div className="ideas-list">
            <h2 className="section-title">Your Ideas ({activeIdeas.length})</h2>
            <div className="ideas-feed">
              {activeIdeas.map((idea) => (
                <div key={idea.id} className="idea-card">
                  {editingId === idea.id ? (
                    <div className="idea-edit-mode">
                      <textarea
                        className="idea-edit-textarea"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        rows={4}
                        autoFocus
                      />
                      <div className="edit-actions">
                        <button className="btn-secondary" onClick={handleCancelEdit}>
                          Cancel
                        </button>
                        <button className="btn-primary" onClick={handleSaveEdit}>
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="idea-content">
                        <p className="idea-text">{idea.text}</p>
                        <div className="idea-meta">
                          <span className="idea-date">{formatDate(idea.createdAt)}</span>
                        </div>
                      </div>
                      <div className="idea-actions">
                        <button 
                          className="icon-btn" 
                          title="Edit"
                          onClick={() => handleStartEdit(idea.id, idea.text)}
                        >
                          ✏️
                        </button>
                        <button 
                          className="icon-btn convert-btn" 
                          title="Convert to Task"
                          onClick={() => setConvertingIdeaId(idea.id)}
                        >
                          → Task
                        </button>
                        <button 
                          className="icon-btn delete-btn" 
                          title="Delete"
                          onClick={() => deleteIdea(idea.id)}
                        >
                          🗑️
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">💡</div>
            <h3>No ideas yet</h3>
            <p>Start capturing your thoughts — they don't need to be perfect</p>
          </div>
        )}
      </div>

      {convertingIdeaId && (
        <ConvertIdeaModal
          ideaId={convertingIdeaId}
          onClose={() => setConvertingIdeaId(null)}
        />
      )}
    </div>
  );
};

export default Ideas;
