import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/tasks', label: 'Tasks', icon: '✓' },
    { path: '/all-tasks', label: 'All Tasks', icon: '📋' },
    { path: '/ideas', label: 'Ideas', icon: '💡' },
    { path: '/calendar', label: 'Calendar', icon: '📅' },
    { path: '/terminal', label: 'Terminal', icon: '⌨️' },
    { path: '/trash', label: 'Trash', icon: '🗑️' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-title">OmniDesk</h1>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
