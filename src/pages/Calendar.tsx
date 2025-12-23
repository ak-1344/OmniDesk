import './Calendar.css';

const Calendar = () => {
  const currentMonth = 'January 2024';
  
  const events = [
    { id: 1, title: 'Team standup', type: 'meeting', date: '2024-01-10', time: '09:00 AM' },
    { id: 2, title: 'Design review', type: 'meeting', date: '2024-01-10', time: '02:00 PM' },
    { id: 3, title: 'Submit landing page design', type: 'task', date: '2024-01-15', priority: 'High' },
    { id: 4, title: 'Client presentation', type: 'meeting', date: '2024-01-12', time: '03:00 PM' },
    { id: 5, title: 'Fix authentication bug', type: 'task', date: '2024-01-10', priority: 'Critical' },
  ];

  // Simple calendar grid (placeholder)
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="page calendar-page">
      <header className="page-header">
        <div>
          <h1>Calendar</h1>
          <p className="page-subtitle">Tasks and events overview</p>
        </div>
        <div className="calendar-controls">
          <button className="nav-btn">←</button>
          <h2 className="current-month">{currentMonth}</h2>
          <button className="nav-btn">→</button>
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
            {Array.from({ length: 0 }, (_, i) => (
              <div key={`empty-${i}`} className="calendar-day empty"></div>
            ))}
            {/* Days */}
            {daysInMonth.map((day) => {
              const dayEvents = events.filter(e => {
                const eventDay = parseInt(e.date.split('-')[2]);
                return eventDay === day;
              });
              
              return (
                <div key={day} className={`calendar-day ${day === 10 ? 'today' : ''}`}>
                  <div className="day-number">{day}</div>
                  <div className="day-events">
                    {dayEvents.slice(0, 2).map((event) => (
                      <div key={event.id} className={`event-dot ${event.type}`} title={event.title}></div>
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="more-events">+{dayEvents.length - 2}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="events-sidebar">
          <h3>Upcoming Events</h3>
          <div className="events-list">
            {events.map((event) => (
              <div key={event.id} className={`event-item ${event.type}`}>
                <div className="event-header">
                  <span className="event-type-badge">{event.type}</span>
                  {event.priority && (
                    <span className={`priority-badge priority-${event.priority.toLowerCase()}`}>
                      {event.priority}
                    </span>
                  )}
                </div>
                <h4 className="event-title">{event.title}</h4>
                <div className="event-meta">
                  <span>📅 {event.date}</span>
                  {event.time && <span>🕒 {event.time}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
