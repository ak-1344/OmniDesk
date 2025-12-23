import { useParams, Link } from 'react-router-dom';
import './TaskDetail.css';

const TaskDetail = () => {
  const { id } = useParams();

  const task = {
    id: id,
    title: 'Design new landing page',
    description: 'Create mockups for the new landing page with modern design patterns',
    priority: 'High',
    status: 'In Progress',
    dueDate: '2024-01-15',
  };

  const subtasks = [
    { id: 1, title: 'Research competitor designs', status: 'completed' },
    { id: 2, title: 'Create wireframes', status: 'in-progress' },
    { id: 3, title: 'Design hero section', status: 'in-progress' },
    { id: 4, title: 'Design features section', status: 'todo' },
    { id: 5, title: 'Design testimonials', status: 'todo' },
    { id: 6, title: 'Design footer', status: 'todo' },
    { id: 7, title: 'Get stakeholder approval', status: 'todo' },
  ];

  const kanbanColumns = [
    { id: 'todo', title: 'To Do', items: subtasks.filter(s => s.status === 'todo') },
    { id: 'in-progress', title: 'In Progress', items: subtasks.filter(s => s.status === 'in-progress') },
    { id: 'completed', title: 'Completed', items: subtasks.filter(s => s.status === 'completed') },
  ];

  return (
    <div className="page task-detail-page">
      <div className="task-detail-header">
        <Link to="/tasks" className="back-link">← Back to Tasks</Link>
        <div className="task-detail-title">
          <h1>{task.title}</h1>
          <div className="task-detail-badges">
            <span className={`priority-badge priority-${task.priority.toLowerCase()}`}>
              {task.priority}
            </span>
            <span className={`status-badge status-${task.status.toLowerCase().replace(' ', '-')}`}>
              {task.status}
            </span>
          </div>
        </div>
        <p className="task-detail-description">{task.description}</p>
        <div className="task-detail-meta">
          <span>Due: {task.dueDate}</span>
          <span>•</span>
          <span>{subtasks.length} subtasks</span>
        </div>
      </div>

      <div className="kanban-board">
        {kanbanColumns.map((column) => (
          <div key={column.id} className="kanban-column">
            <div className="kanban-column-header">
              <h3>{column.title}</h3>
              <span className="item-count">{column.items.length}</span>
            </div>
            <div className="kanban-items">
              {column.items.map((item) => (
                <div key={item.id} className="kanban-item">
                  <div className="kanban-item-checkbox">
                    <input type="checkbox" checked={item.status === 'completed'} readOnly />
                  </div>
                  <div className="kanban-item-content">
                    <span>{item.title}</span>
                  </div>
                </div>
              ))}
              {column.items.length === 0 && (
                <div className="kanban-empty">
                  <p>No items</p>
                </div>
              )}
              <button className="kanban-add-btn">+ Add subtask</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskDetail;
