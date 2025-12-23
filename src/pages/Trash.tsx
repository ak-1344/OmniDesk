import { useApp } from '../context/AppContext';
import type { Task, Idea } from '../types';
import './Trash.css';

const Trash = () => {
  const { trash, restoreFromTrash, permanentlyDelete, emptyTrash } = useApp();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getItemPreview = (item: { type: string; item: Task | Idea | any }) => {
    if (!item || !item.item) return 'Unknown item';
    
    if (item.type === 'task') {
      const task = item.item as Task;
      return task.title || 'Untitled task';
    } else if (item.type === 'idea') {
      const idea = item.item as Idea;
      const textNote = idea.notes?.find(n => n.type === 'text');
      const text = textNote ? textNote.content : idea.title || 'Untitled idea';
      return text.substring(0, 100) + (text.length > 100 ? '...' : '');
    } else if (item.type === 'subtask') {
      const subtask = item.item as any;
      return subtask.title || 'Untitled subtask';
    }
    return 'Unknown item';
  };

  return (
    <div className="page trash-page">
      <header className="page-header">
        <div>
          <h1>Trash</h1>
          <p className="page-subtitle">Deleted items are kept for 30 days</p>
        </div>
        {trash.length > 0 && (
          <button className="btn-danger" onClick={emptyTrash}>
            Empty Trash
          </button>
        )}
      </header>

      {trash.length > 0 ? (
        <div className="trash-container">
          <div className="trash-items">
            {trash.map((item) => (
              <div key={item.id} className="trash-item">
                <div className="item-icon">
                  {item.type === 'task' ? '✓' : item.type === 'idea' ? '💡' : '📝'}
                </div>
                <div className="item-details">
                  <div className="item-header">
                    <h3 className="item-title">{getItemPreview(item)}</h3>
                    <span className="item-type-badge">{item.type}</span>
                  </div>
                  <div className="item-meta">
                    <span>Deleted {formatDate(item.deletedAt)}</span>
                    <span>•</span>
                    <span>By {item.deletedBy}</span>
                  </div>
                </div>
                <div className="item-actions">
                  <button 
                    className="btn-restore" 
                    onClick={() => restoreFromTrash(item.id)}
                  >
                    Restore
                  </button>
                  <button 
                    className="btn-delete-permanent" 
                    onClick={() => permanentlyDelete(item.id)}
                  >
                    Delete Forever
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">🗑️</div>
          <h3>Trash is empty</h3>
          <p>Deleted items will appear here and be kept for 30 days</p>
        </div>
      )}
    </div>
  );
};

export default Trash;
