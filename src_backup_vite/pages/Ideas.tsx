import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { useApp } from '../context/AppContext';
import './Ideas.css';

const Ideas = () => {
  const { state, deleteIdea, updateIdea, addIdea } = useApp();
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

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;

    if (sourceIndex === destIndex) return;

    const reorderedIdeas = Array.from(filteredIdeas);
    const [removed] = reorderedIdeas.splice(sourceIndex, 1);
    reorderedIdeas.splice(destIndex, 0, removed);

    // Update positions for all ideas
    reorderedIdeas.forEach((idea, index) => {
      const position = { x: (index % 4) * 300, y: Math.floor(index / 4) * 300 };
      updateIdea(idea.id, { position });
    });
  };

  const handleDuplicateIdea = async (e: React.MouseEvent, idea: typeof activeIdeas[0]) => {
    e.stopPropagation();
    await addIdea({
      title: `${idea.title} (Copy)`,
      color: idea.color,
      notes: idea.notes.map(n => ({
        ...n,
        id: `note-${Date.now()}-${Math.random()}`,
      })),
      tags: idea.tags,
      canvasEnabled: false, // Don't copy canvas data
    });
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
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="ideas-board" direction="horizontal">
            {(provided) => (
              <div 
                className="sticky-notes-grid"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {filteredIdeas.map((idea, index) => (
                  <Draggable key={idea.id} draggableId={idea.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`sticky-note ${snapshot.isDragging ? 'dragging' : ''}`}
                        style={{
                          ...provided.draggableProps.style,
                          background: idea.color || '#fef3c7'
                        }}
                        onClick={() => !snapshot.isDragging && handleOpenIdea(idea.id)}
                      >
                        <div className="sticky-note-header">
                          <h3 className="sticky-note-title">{idea.title}</h3>
                          <div className="sticky-note-actions">
                            <button
                              onClick={(e) => handleDuplicateIdea(e, idea)}
                              className="btn-duplicate-sticky"
                              title="Duplicate"
                            >
                              ⧉
                            </button>
                            <button
                              onClick={(e) => handleDeleteIdea(e, idea.id, idea.title)}
                              className="btn-delete-sticky"
                              title="Delete"
                            >
                              ×
                            </button>
                          </div>
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
                            {idea.canvasEnabled && (
                              <span className="note-type-icon canvas" title="Canvas enabled">
                                ✨
                              </span>
                            )}
                            {idea.convertedToTasks && idea.convertedToTasks.length > 0 && (
                              <span className="note-type-icon converted" title={`Converted to ${idea.convertedToTasks.length} task(s)`}>
                                ✓ {idea.convertedToTasks.length}
                              </span>
                            )}
                          </div>
                          <span className="sticky-note-date">
                            {new Date(idea.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
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
