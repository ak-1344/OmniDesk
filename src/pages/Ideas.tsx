import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './Ideas.css';

const Ideas = () => {
  const { state, deleteIdea } = useApp();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const activeIdeas = state.ideas.filter(idea => !idea.deletedAt);

  const filteredIdeas = activeIdeas.filter(idea =>
    idea.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateNew = () => {
    navigate('/ideas/new');
  };

  const handleOpenIdea = (ideaId: string) => {
    navigate(`/ideas/${ideaId}`);
  };

  const handleDeleteIdea = (e: React.MouseEvent, ideaId: string, title: string) => {
    e.stopPropagation();
    if (confirm(`Delete "${title}"?`)) {
      deleteIdea(ideaId);
    }
  };

  const getPreviewText = (idea: typeof activeIdeas[0]): string => {
    const textNote = idea.notes.find(n => n.type === 'text');
    if (textNote && textNote.content) {
      return textNote.content.slice(0, 120);
    }
    const imageCount = idea.notes.filter(n => n.type === 'image').length;
    const whiteboardCount = idea.notes.filter(n => n.type === 'whiteboard').length;
    const parts = [];
    if (imageCount) parts.push(`${imageCount} image${imageCount > 1 ? 's' : ''}`);
    if (whiteboardCount) parts.push(`${whiteboardCount} whiteboard${whiteboardCount > 1 ? 's' : ''}`);
    return parts.join(', ') || 'Empty note';
  };

  return (
    <div className="page ideas-page">
      <header className="page-header">
        <div>
          <h1>Ideas</h1>
          <p className="page-subtitle">Your collection of thoughts and inspirations</p>
        </div>
        <button className="btn-primary" onClick={handleCreateNew}>
          + New Idea
        </button>
      </header>

      <div className="ideas-toolbar">
        <input
          type="text"
          placeholder="Search ideas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {filteredIdeas.length > 0 ? (
        <div className="sticky-notes-grid">
          {filteredIdeas.map((idea) => (
            <div
              key={idea.id}
              className="sticky-note"
              style={{ background: idea.color || '#fef3c7' }}
              onClick={() => handleOpenIdea(idea.id)}
            >
              <div className="sticky-note-header">
                <h3 className="sticky-note-title">{idea.title}</h3>
                <button
                  onClick={(e) => handleDeleteIdea(e, idea.id, idea.title)}
                  className="btn-delete-sticky"
                  title="Delete"
                >
                  ×
                </button>
              </div>
              <div className="sticky-note-content">
                <p>{getPreviewText(idea)}</p>
              </div>
              <div className="sticky-note-footer">
                <div className="note-badges">
                  {idea.notes.map(n => (
                    <span key={n.id} className={`note-type-icon ${n.type}`}>
                      {n.type === 'text' ? '📝' : n.type === 'image' ? '🖼️' : '🎨'}
                    </span>
                  ))}
                </div>
                <span className="sticky-note-date">
                  {new Date(idea.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">💡</div>
          <h3>No ideas yet</h3>
          <p>Start creating sticky notes with your thoughts, images, and sketches!</p>
          <button className="btn-primary" onClick={handleCreateNew}>
            Create Your First Idea
          </button>
        </div>
      )}
    </div>
  );
};

export default Ideas;
