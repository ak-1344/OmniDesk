import './Trash.css';

const Trash = () => {
  const trashedItems = [
    { id: 1, title: 'Old marketing campaign', type: 'task', deletedDate: '2024-01-08', deletedBy: 'You' },
    { id: 2, title: 'Outdated feature idea', type: 'idea', deletedDate: '2024-01-07', deletedBy: 'You' },
    { id: 3, title: 'Cancelled project plan', type: 'task', deletedDate: '2024-01-05', deletedBy: 'You' },
  ];

  return (
    <div className="page trash-page">
      <header className="page-header">
        <div>
          <h1>Trash</h1>
          <p className="page-subtitle">Deleted items are kept for 30 days</p>
        </div>
        <button className="btn-danger">Empty Trash</button>
      </header>

      {trashedItems.length > 0 ? (
        <div className="trash-container">
          <div className="trash-actions">
            <button className="btn-secondary">Select All</button>
            <button className="btn-secondary">Restore Selected</button>
            <button className="btn-danger-outline">Delete Selected</button>
          </div>

          <div className="trash-items">
            {trashedItems.map((item) => (
              <div key={item.id} className="trash-item">
                <input type="checkbox" className="item-checkbox" />
                <div className="item-icon">
                  {item.type === 'task' ? '✓' : '💡'}
                </div>
                <div className="item-details">
                  <h3 className="item-title">{item.title}</h3>
                  <div className="item-meta">
                    <span className="item-type">{item.type}</span>
                    <span>•</span>
                    <span>Deleted {item.deletedDate}</span>
                    <span>•</span>
                    <span>By {item.deletedBy}</span>
                  </div>
                </div>
                <div className="item-actions">
                  <button className="btn-restore">Restore</button>
                  <button className="btn-delete-permanent">Delete Permanently</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">🗑️</div>
          <h3>Trash is empty</h3>
          <p>Deleted items will appear here</p>
        </div>
      )}
    </div>
  );
};

export default Trash;
