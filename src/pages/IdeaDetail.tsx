import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { InfiniteCanvas } from '../components/Canvas/InfiniteCanvas';
import ConvertIdeaModal from '../components/ConvertIdeaModal';
import type { NoteContent, NoteContentType } from '../types';
import './IdeaDetail.css';

const IdeaDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, addIdea, updateIdea, deleteIdea } = useApp();
  
  const isNew = id === 'new';
  const idea = isNew ? null : state.ideas.find(i => i.id === id);
  
  const [title, setTitle] = useState(idea?.title || 'Untitled Idea');
  const [color, setColor] = useState(idea?.color || '#fef3c7');
  const [notes, setNotes] = useState<NoteContent[]>(idea?.notes || []);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [canvasEnabled, setCanvasEnabled] = useState(idea?.canvasEnabled || false);
  const [canvasData, setCanvasData] = useState<any>(idea?.canvasData);
  const [showConvertModal, setShowConvertModal] = useState(false);

  const colors = [
    { name: 'Yellow', value: '#fef3c7' },
    { name: 'Pink', value: '#fce7f3' },
    { name: 'Blue', value: '#dbeafe' },
    { name: 'Green', value: '#d1fae5' },
    { name: 'Purple', value: '#e9d5ff' },
    { name: 'Orange', value: '#fed7aa' },
  ];

  useEffect(() => {
    if (!isNew && !idea) {
      navigate('/ideas');
    }
  }, [isNew, idea, navigate]);

  const handleAddNote = (type: NoteContentType) => {
    const newNote: NoteContent = {
      id: `note-${Date.now()}`,
      type,
      content: type === 'text' ? '' : type === 'image' ? '' : '{}',
      createdAt: new Date().toISOString(),
      order: notes.length,
    };
    setNotes([...notes, newNote]);
    setActiveNoteId(newNote.id);
  };

  const handleUpdateNote = (noteId: string, content: string) => {
    setNotes(notes.map(n => n.id === noteId ? { ...n, content } : n));
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes(notes.filter(n => n.id !== noteId));
    if (activeNoteId === noteId) {
      setActiveNoteId(null);
    }
  };

  const handleCanvasSave = (snapshot: any) => {
    setCanvasData(snapshot);
  };

  const handleToggleCanvas = () => {
    const newCanvasEnabled = !canvasEnabled;
    setCanvasEnabled(newCanvasEnabled);
    
    // If enabling canvas for the first time, create initial data
    if (newCanvasEnabled && !canvasData) {
      setCanvasData(undefined); // TLDraw will initialize with empty canvas
    }
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }

    const ideaData = {
      title,
      color,
      notes,
      tags: [],
      canvasEnabled,
      canvasData: canvasEnabled ? canvasData : undefined,
    };

    if (isNew) {
      addIdea({
        ...ideaData,
        notes: notes.length > 0 ? notes : [
          {
            id: 'note-1',
            type: 'text' as NoteContentType,
            content: '',
            createdAt: new Date().toISOString(),
            order: 0,
          }
        ],
      });
      navigate('/ideas');
    } else if (idea) {
      updateIdea(idea.id, ideaData);
      navigate('/ideas');
    }
  };

  const handleDelete = () => {
    if (idea && confirm(`Delete "${idea.title}"?`)) {
      deleteIdea(idea.id);
      navigate('/ideas');
    }
  };

  const handleImageUpload = (noteId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleUpdateNote(noteId, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="page idea-detail-page">
      <header className="idea-detail-header">
        <Link to="/ideas" className="back-link">← Back to Ideas</Link>
        <div className="header-actions">
          <button 
            onClick={handleToggleCanvas} 
            className={`btn-toggle-canvas ${canvasEnabled ? 'active' : ''}`}
            title={canvasEnabled ? 'Disable infinite canvas' : 'Enable infinite canvas'}
          >
            {canvasEnabled ? '🎨 Canvas Enabled' : '📝 Enable Canvas'}
          </button>
          {!isNew && (
            <>
              <button 
                onClick={() => setShowConvertModal(true)} 
                className="btn-convert"
                title="Convert this idea to a task"
              >
                ✓ Convert to Task
              </button>
              <button onClick={handleDelete} className="btn-delete-idea">
                🗑️ Delete
              </button>
            </>
          )}
          <button onClick={handleSave} className="btn-primary">
            💾 Save Idea
          </button>
        </div>
      </header>

      <div className="idea-editor">
        <div className="idea-header-section">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="idea-title-input"
            placeholder="Idea Title..."
          />
          
          <div className="color-picker">
            <label>Color:</label>
            <div className="color-options">
              {colors.map((c) => (
                <button
                  key={c.value}
                  className={`color-option ${color === c.value ? 'active' : ''}`}
                  style={{ background: c.value }}
                  onClick={() => setColor(c.value)}
                  title={c.name}
                />
              ))}
            </div>
          </div>
        </div>

        {!isNew && idea && idea.convertedToTasks && idea.convertedToTasks.length > 0 && (
          <div className="task-lineage-section">
            <h3 className="lineage-title">📋 Tasks Created from This Idea</h3>
            <div className="lineage-tasks">
              {idea.convertedToTasks.map(taskId => {
                const task = state.tasks.find(t => t.id === taskId);
                if (!task) {
                  console.warn(`Task ${taskId} referenced by idea ${idea.id} not found`);
                  return (
                    <div key={taskId} className="lineage-task-card lineage-task-missing">
                      <span className="lineage-task-title">Task deleted or not found</span>
                      <span className="lineage-task-state">Missing</span>
                    </div>
                  );
                }
                const taskDomain = state.domains.find(d => d.id === task.domainId);
                return (
                  <Link
                    key={taskId}
                    to={`/tasks/${taskId}`}
                    className="lineage-task-card"
                  >
                    <div className="lineage-task-header">
                      <span className="lineage-task-title">{task.title}</span>
                      <span 
                        className="lineage-task-domain"
                        style={{ 
                          background: taskDomain ? `${taskDomain.color}25` : 'rgba(255,255,255,0.05)',
                          color: taskDomain?.color || 'var(--text-secondary)',
                        }}
                      >
                        {taskDomain?.name || 'No Domain'}
                      </span>
                    </div>
                    <div className="lineage-task-state">{task.state.replace('-', ' ')}</div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {canvasEnabled ? (
          <div className="canvas-mode">
            <div className="canvas-info">
              <p>✨ Infinite canvas mode - Sketch, draw, and connect your ideas spatially</p>
            </div>
            <div className="canvas-wrapper">
              <InfiniteCanvas
                ideaId={idea?.id || 'new'}
                initialData={canvasData}
                onSave={handleCanvasSave}
              />
            </div>
          </div>
        ) : (
          <>
            <div className="notes-toolbar">
              <button onClick={() => handleAddNote('text')} className="btn-add-note">
                📝 Add Text Note
              </button>
              <button onClick={() => handleAddNote('image')} className="btn-add-note">
                🖼️ Add Image
              </button>
              <button onClick={() => handleAddNote('whiteboard')} className="btn-add-note">
                🎨 Add Whiteboard
              </button>
            </div>

            <div className="notes-container">
              {notes.length === 0 ? (
                <div className="empty-notes">
                  <p>No notes yet. Add a text note, image, or whiteboard to get started!</p>
                  <p className="hint">💡 Or enable the infinite canvas above for a spatial thinking experience</p>
                </div>
              ) : (
                notes.map((note) => (
                  <div key={note.id} className={`note-card ${note.type}`} style={{ background: color }}>
                    <div className="note-header">
                      <span className="note-type-badge">{note.type}</span>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="btn-delete-note"
                      >
                        ×
                      </button>
                    </div>
                    
                    <div className="note-content">
                      {note.type === 'text' && (
                        <textarea
                          value={note.content}
                          onChange={(e) => handleUpdateNote(note.id, e.target.value)}
                          placeholder="Write your thoughts..."
                          className="note-textarea"
                          rows={6}
                        />
                      )}
                      
                      {note.type === 'image' && (
                        <div className="image-upload-container">
                          {note.content ? (
                            <div className="image-preview">
                              <img src={note.content} alt="Uploaded" />
                              <button
                                onClick={() => handleUpdateNote(note.id, '')}
                                className="btn-remove-image"
                              >
                                Remove Image
                              </button>
                            </div>
                          ) : (
                            <div className="image-upload">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(note.id, e)}
                                id={`image-${note.id}`}
                                style={{ display: 'none' }}
                              />
                              <label htmlFor={`image-${note.id}`} className="upload-label">
                                📁 Click to upload image
                              </label>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {note.type === 'whiteboard' && (
                        <div className="whiteboard-container">
                          <div className="whiteboard-placeholder">
                            💡 Enable the infinite canvas above for a full whiteboard experience
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
      
      {showConvertModal && idea && (
        <ConvertIdeaModal
          ideaId={idea.id}
          onClose={() => setShowConvertModal(false)}
        />
      )}
    </div>
  );
};

export default IdeaDetail;
