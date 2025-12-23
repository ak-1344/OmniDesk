import { useState } from 'react';
import { useApp } from '../context/AppContext';
import './FloatingTrash.css';

const FloatingTrash = () => {
  const { deleteTask } = useApp();
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      deleteTask(taskId);
      
      // Show a brief confirmation
      const trashIcon = document.querySelector('.floating-trash');
      if (trashIcon) {
        trashIcon.classList.add('shake');
        setTimeout(() => {
          trashIcon.classList.remove('shake');
        }, 500);
      }
    }
  };

  return (
    <div 
      className={`floating-trash ${isDragOver ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      title="Drag tasks here to delete"
    >
      <div className="trash-icon">
        {isDragOver ? '🗑️' : '🗑'}
      </div>
      {isDragOver && (
        <div className="trash-hint">Drop to delete</div>
      )}
    </div>
  );
};

export default FloatingTrash;
