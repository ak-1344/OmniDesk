import { useState } from 'react';
import './Ideas.css';

const Ideas = () => {
  const [ideas] = useState([
    { id: 1, text: 'Build a mobile app for OmniDesk with offline support', date: '2024-01-08', tags: ['mobile', 'feature'] },
    { id: 2, text: 'Add AI-powered task suggestions based on calendar and habits', date: '2024-01-07', tags: ['ai', 'enhancement'] },
    { id: 3, text: 'Create a browser extension for quick task capture', date: '2024-01-06', tags: ['extension', 'productivity'] },
    { id: 4, text: 'Implement collaborative workspaces for team projects', date: '2024-01-05', tags: ['collaboration', 'feature'] },
    { id: 5, text: 'Dark mode theme with customizable color schemes', date: '2024-01-04', tags: ['ui', 'theme'] },
  ]);

  return (
    <div className="page ideas-page">
      <header className="page-header">
        <div>
          <h1>Ideas</h1>
          <p className="page-subtitle">Free-text diary for capturing thoughts and ideas</p>
        </div>
        <button className="btn-primary">+ New Idea</button>
      </header>

      <div className="ideas-container">
        <div className="idea-input-card">
          <h3>Capture a new idea</h3>
          <textarea
            className="idea-textarea"
            placeholder="Write down your thoughts, ideas, or inspiration..."
            rows={6}
          ></textarea>
          <div className="idea-input-actions">
            <input type="text" placeholder="Add tags (comma separated)" className="tags-input" />
            <div className="action-buttons">
              <button className="btn-secondary">Save as Idea</button>
              <button className="btn-primary">Convert to Task</button>
            </div>
          </div>
        </div>

        <div className="ideas-list">
          <h2 className="section-title">Recent Ideas ({ideas.length})</h2>
          {ideas.map((idea) => (
            <div key={idea.id} className="idea-card">
              <div className="idea-content">
                <p className="idea-text">{idea.text}</p>
                <div className="idea-meta">
                  <span className="idea-date">{idea.date}</span>
                  <div className="idea-tags">
                    {idea.tags.map((tag) => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="idea-actions">
                <button className="icon-btn" title="Edit">✏️</button>
                <button className="icon-btn" title="Convert to Task">→</button>
                <button className="icon-btn" title="Delete">🗑️</button>
              </div>
            </div>
          ))}
        </div>

        {ideas.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">💡</div>
            <h3>No ideas yet</h3>
            <p>Start capturing your thoughts and ideas here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Ideas;
