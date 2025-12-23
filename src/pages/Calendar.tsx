import { useState } from 'react';
import { useApp } from '../context/AppContext';
import './Calendar.css';

interface CalendarItem {
  id: string;
  title: string;
  type: 'task' | 'event' | 'deadline';
  date: string;
  time?: string;
  description?: string;
  taskId?: string;
  priority?: string;
}

const Calendar = () => {
  const { state, updateTask, addEvent, updateEvent, deleteEvent } = useApp();
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);
  const [selectedDate, setSelectedDate] = useState<Date | null>(today);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [draggedItem, setDraggedItem] = useState<CalendarItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemType, setNewItemType] = useState<'event' | 'task' | 'deadline'>('event');
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemTime, setNewItemTime] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');
  
  const currentMonth = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const currentYear = currentDate.getFullYear();
  const currentMonthIndex = currentDate.getMonth();
  
  // Gather all calendar items from tasks and events
  const getCalendarItems = (): CalendarItem[] => {
    const items: CalendarItem[] = [];
    
    // Add task deadlines
    state.tasks.filter(t => !t.deletedAt && t.deadline).forEach(task => {
      items.push({
        id: `task-${task.id}`,
        title: task.title,
        type: 'deadline',
        date: task.deadline!,
        taskId: task.id,
        description: task.description,
        priority: task.state
      });
    });
    
    // Add calendar events
    state.events.forEach(event => {
      items.push({
        id: event.id,
        title: event.title,
        type: 'event',
        date: event.date,
        time: event.startTime,
        description: event.description
      });
    });
    
    return items;
  };

  const calendarItems = getCalendarItems();

  // Calculate calendar grid
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const firstDayOfMonth = new Date(currentYear, currentMonthIndex, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonthIndex + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();
  
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonthIndex - 1, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonthIndex + 1, 1));
  };
  
  const isToday = (day: number) => {
    return day === today.getDate() && 
           currentMonthIndex === today.getMonth() && 
           currentYear === today.getFullYear();
  };

  const isSelectedDate = (day: number) => {
    if (!selectedDate) return false;
    return day === selectedDate.getDate() &&
           currentMonthIndex === selectedDate.getMonth() &&
           currentYear === selectedDate.getFullYear();
  };

  const handleDateClick = (day: number) => {
    const newSelectedDate = new Date(currentYear, currentMonthIndex, day);
    setSelectedDate(newSelectedDate);
  };

  const getItemsForDate = (date: Date): CalendarItem[] => {
    return calendarItems.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate.getDate() === date.getDate() &&
             itemDate.getMonth() === date.getMonth() &&
             itemDate.getFullYear() === date.getFullYear();
    });
  };

  const selectedDateItems = selectedDate ? getItemsForDate(selectedDate) : [];

  const handleEditStart = (item: CalendarItem) => {
    setEditingItem(item.id);
    setEditTitle(item.title);
    setEditTime(item.time || '');
    setEditDescription(item.description || '');
  };

  const handleEditSave = (item: CalendarItem) => {
    if (item.type === 'event') {
      updateEvent(item.id, {
        title: editTitle,
        startTime: editTime,
        description: editDescription
      });
    } else if (item.type === 'deadline' && item.taskId) {
      const task = state.tasks.find(t => t.id === item.taskId);
      if (task) {
        updateTask(item.taskId, {
          title: editTitle,
          description: editDescription
        });
      }
    }
    setEditingItem(null);
  };

  const handleDeleteItem = (item: CalendarItem) => {
    if (confirm(`Delete "${item.title}"?`)) {
      if (item.type === 'event') {
        deleteEvent(item.id);
      } else if (item.type === 'deadline' && item.taskId) {
        updateTask(item.taskId, { deadline: undefined });
      }
    }
  };

  const handleDragStart = (item: CalendarItem, e: React.DragEvent) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (day: number, e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedItem) return;

    const newDate = new Date(currentYear, currentMonthIndex, day);
    const newDateString = newDate.toISOString().split('T')[0];

    if (draggedItem.type === 'event') {
      updateEvent(draggedItem.id, {
        date: newDateString
      });
    } else if (draggedItem.type === 'deadline' && draggedItem.taskId) {
      updateTask(draggedItem.taskId, {
        deadline: newDateString
      });
    }

    setDraggedItem(null);
  };

  const handleAddItem = () => {
    if (!selectedDate || !newItemTitle.trim()) return;

    const dateString = selectedDate.toISOString().split('T')[0];

    if (newItemType === 'event') {
      addEvent({
        title: newItemTitle,
        description: newItemDescription,
        date: dateString,
        startTime: newItemTime,
        type: 'personal-event'
      });
    }

    setNewItemTitle('');
    setNewItemTime('');
    setNewItemDescription('');
    setShowAddModal(false);
  };

  return (
    <div className="page calendar-page">
      <header className="page-header">
        <div>
          <h1>Calendar</h1>
          <p className="page-subtitle">Tasks and events overview</p>
        </div>
        <div className="calendar-controls">
          <button className="nav-btn" onClick={handlePrevMonth}>←</button>
          <h2 className="current-month">{currentMonth}</h2>
          <button className="nav-btn" onClick={handleNextMonth}>→</button>
        </div>
      </header>

      <div className="calendar-container">
        <div className="calendar-grid">
          <div className="calendar-header">
            {daysOfWeek.map((day) => (
              <div key={day} className="calendar-day-name">{day}</div>
            ))}
          </div>
          <div className="calendar-days">
            {/* Empty cells for alignment */}
            {Array.from({ length: startingDayOfWeek }, (_, i) => (
              <div key={`empty-${i}`} className="calendar-day empty"></div>
            ))}
            {/* Days */}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const dayDate = new Date(currentYear, currentMonthIndex, day);
              const dayItems = getItemsForDate(dayDate);
              
              return (
                <div 
                  key={day} 
                  className={`calendar-day ${isToday(day) ? 'today' : ''} ${isSelectedDate(day) ? 'selected' : ''}`}
                  onClick={() => handleDateClick(day)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(day, e)}
                >
                  <div className="day-number">{day}</div>
                  <div className="day-events">
                    {dayItems.slice(0, 3).map((item) => (
                      <div 
                        key={item.id} 
                        className={`event-dot ${item.type}`} 
                        title={`${item.title}${item.time ? ` at ${item.time}` : ''}`}
                      ></div>
                    ))}
                    {dayItems.length > 3 && (
                      <span className="more-events">+{dayItems.length - 3}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="events-sidebar">
          {selectedDate ? (
            <>
              <div className="sidebar-header">
                <h3>{selectedDate.toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                })}</h3>
                <button 
                  className="btn-add-item"
                  onClick={() => setShowAddModal(true)}
                  title="Add new event"
                >
                  +
                </button>
              </div>

              {showAddModal && (
                <div className="add-item-modal">
                  <h4>Add New Item</h4>
                  <select 
                    value={newItemType}
                    onChange={(e) => setNewItemType(e.target.value as any)}
                    className="item-type-select"
                  >
                    <option value="event">Event</option>
                    <option value="task">Task</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Title"
                    value={newItemTitle}
                    onChange={(e) => setNewItemTitle(e.target.value)}
                    className="item-input"
                  />
                  <input
                    type="time"
                    value={newItemTime}
                    onChange={(e) => setNewItemTime(e.target.value)}
                    className="item-input"
                  />
                  <textarea
                    placeholder="Description (optional)"
                    value={newItemDescription}
                    onChange={(e) => setNewItemDescription(e.target.value)}
                    className="item-textarea"
                    rows={2}
                  />
                  <div className="modal-actions">
                    <button onClick={handleAddItem} className="btn-primary btn-sm">
                      Add
                    </button>
                    <button 
                      onClick={() => {
                        setShowAddModal(false);
                        setNewItemTitle('');
                        setNewItemTime('');
                        setNewItemDescription('');
                      }} 
                      className="btn-secondary btn-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="events-list">
                {selectedDateItems.length > 0 ? (
                  selectedDateItems.map((item) => (
                    <div 
                      key={item.id} 
                      className={`event-item ${item.type}`}
                      draggable
                      onDragStart={(e) => handleDragStart(item, e)}
                    >
                      {editingItem === item.id ? (
                        <div className="edit-mode">
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="edit-input"
                          />
                          <input
                            type="time"
                            value={editTime}
                            onChange={(e) => setEditTime(e.target.value)}
                            className="edit-input"
                          />
                          <textarea
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            className="edit-textarea"
                            rows={2}
                          />
                          <div className="edit-actions">
                            <button 
                              onClick={() => handleEditSave(item)}
                              className="btn-save"
                            >
                              Save
                            </button>
                            <button 
                              onClick={() => setEditingItem(null)}
                              className="btn-cancel"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="event-header">
                            <span className="event-type-badge">{item.type}</span>
                            {item.priority && (
                              <span className={`priority-badge priority-${item.priority.toLowerCase()}`}>
                                {item.priority}
                              </span>
                            )}
                          </div>
                          <h4 className="event-title">{item.title}</h4>
                          {item.description && (
                            <p className="event-description">{item.description}</p>
                          )}
                          <div className="event-meta">
                            {item.time && <span>🕒 {item.time}</span>}
                          </div>
                          <div className="event-actions">
                            <button 
                              onClick={() => handleEditStart(item)}
                              className="btn-edit"
                              title="Edit"
                            >
                              ✏️
                            </button>
                            <button 
                              onClick={() => handleDeleteItem(item)}
                              className="btn-delete"
                              title="Delete"
                            >
                              🗑️
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="no-events">
                    <p>No events or deadlines for this day</p>
                    <button 
                      className="btn-primary btn-sm"
                      onClick={() => setShowAddModal(true)}
                    >
                      Add Event
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="no-selection">
              <p>Select a date to view and manage events</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
