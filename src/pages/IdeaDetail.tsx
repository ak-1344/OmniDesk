import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
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
          {!isNew && (
            <button onClick={handleDelete} className="btn-delete-idea">
              🗑️ Delete
            </button>
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
                        🎨 Whiteboard feature coming soon!
                        <p>Sketch and draw your ideas visually</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default IdeaDetail;
