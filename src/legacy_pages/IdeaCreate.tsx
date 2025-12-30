import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { NoteContent, NoteContentType } from '../types';
import './IdeaCreate.css';

const STICKY_COLORS = [
  '#fef3c7', // yellow
  '#fecaca', // red
  '#d1fae5', // green
  '#ddd6fe', // purple
  '#bfdbfe', // blue
  '#fbcfe8', // pink
  '#fed7aa', // orange
];

const IdeaCreate = () => {
  const navigate = useNavigate();
  const { addIdea } = useApp();
  
  const [title, setTitle] = useState('');
  const [color, setColor] = useState(STICKY_COLORS[0]);
  const [notes, setNotes] = useState<Omit<NoteContent, 'id' | 'createdAt'>[]>([
    { type: 'text', content: '', order: 0 }
  ]);

  const handleAddNote = (type: NoteContentType) => {
    const newNote: Omit<NoteContent, 'id' | 'createdAt'> = {
      type,
      content: '',
      order: notes.length
    };
    setNotes([...notes, newNote]);
  };

  const handleUpdateNote = (index: number, content: string) => {
    const updated = [...notes];
    updated[index].content = content;
    setNotes(updated);
  };

  const handleDeleteNote = (index: number) => {
    setNotes(notes.filter((_, i) => i !== index));
  };

  const handleImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleUpdateNote(index, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert('Please add a title for your idea');
      return;
    }

    const processedNotes: NoteContent[] = notes
      .filter(note => note.content.trim() || note.type === 'whiteboard')
      .map((note, idx) => ({
        ...note,
        id: `note-${Date.now()}-${idx}`,
        createdAt: new Date().toISOString(),
      }));

    if (processedNotes.length === 0) {
      alert('Please add at least one note');
      return;
    }

    addIdea({
      title,
      color,
      notes: processedNotes,
      tags: [],
    });

    navigate('/ideas');
  };

  return (
    <div className="page idea-create-page">
      <header className="page-header">
        <div>
          <h1>Create New Idea</h1>
          <p className="page-subtitle">Capture your thoughts with text, images, and sketches</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={() => navigate('/ideas')}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleSave}>
            Save Idea
          </button>
        </div>
      </header>

      <div className="idea-create-container">
        <div className="idea-meta-section">
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              className="title-input"
              placeholder="Give your idea a name..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Sticky Note Color</label>
            <div className="color-picker">
              {STICKY_COLORS.map((c) => (
                <button
                  key={c}
                  className={`color-option ${color === c ? 'selected' : ''}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Add Content</label>
            <div className="add-content-buttons">
              <button
                className="btn-add-content"
                onClick={() => handleAddNote('text')}
              >
                📝 Text Note
              </button>
              <button
                className="btn-add-content"
                onClick={() => handleAddNote('image')}
              >
                🖼️ Image
              </button>
              <button
                className="btn-add-content"
                onClick={() => handleAddNote('whiteboard')}
              >
                🎨 Whiteboard
              </button>
            </div>
          </div>
        </div>

        <div className="idea-preview-section">
          <h3>Preview</h3>
          <div className="sticky-note-preview" style={{ backgroundColor: color }}>
            <div className="sticky-note-header">
              <h4>{title || 'Untitled Idea'}</h4>
            </div>
            <div className="sticky-note-content">
              {notes.map((note, index) => (
                <div key={index} className="note-item">
                  {note.type === 'text' && (
                    <div className="text-note">
                      <textarea
                        placeholder="Write your thoughts..."
                        value={note.content}
                        onChange={(e) => handleUpdateNote(index, e.target.value)}
                        rows={4}
                      />
                      <button
                        className="btn-delete-note"
                        onClick={() => handleDeleteNote(index)}
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  
                  {note.type === 'image' && (
                    <div className="image-note">
                      {note.content ? (
                        <div className="image-preview">
                          <img src={note.content} alt="Note" />
                          <button
                            className="btn-delete-note"
                            onClick={() => handleDeleteNote(index)}
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="image-upload">
                          <label htmlFor={`image-${index}`} className="upload-label">
                            <span>📤 Click to upload image</span>
                          </label>
                          <input
                            id={`image-${index}`}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(index, e)}
                            style={{ display: 'none' }}
                          />
                          <button
                            className="btn-delete-note"
                            onClick={() => handleDeleteNote(index)}
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {note.type === 'whiteboard' && (
                    <div className="whiteboard-note">
                      <div className="whiteboard-placeholder">
                        <p>🎨 Whiteboard</p>
                        <small>Drawing canvas (coming soon)</small>
                      </div>
                      <button
                        className="btn-delete-note"
                        onClick={() => handleDeleteNote(index)}
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {notes.length === 0 && (
                <p className="empty-notes">Add some content to your idea</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdeaCreate;
