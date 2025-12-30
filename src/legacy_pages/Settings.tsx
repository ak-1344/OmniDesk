import './Settings.css';

const Settings = () => {
  return (
    <div className="page settings-page">
      <header className="page-header">
        <h1>Settings</h1>
        <p className="page-subtitle">Configure your OmniDesk preferences</p>
      </header>

      <div className="settings-container">
        <div className="settings-section">
          <h2 className="section-title">Profile</h2>
          <div className="setting-item">
            <label>Display Name</label>
            <input type="text" defaultValue="Your Name" className="setting-input" />
          </div>
          <div className="setting-item">
            <label>Email</label>
            <input type="email" defaultValue="you@example.com" className="setting-input" />
          </div>
          <div className="setting-item">
            <label>Avatar</label>
            <button className="btn-secondary">Upload Photo</button>
          </div>
        </div>

        <div className="settings-section">
          <h2 className="section-title">Appearance</h2>
          <div className="setting-item">
            <label>Theme</label>
            <select className="setting-select">
              <option>Light</option>
              <option>Dark</option>
              <option>Auto</option>
            </select>
          </div>
          <div className="setting-item">
            <label>Color Scheme</label>
            <div className="color-options">
              <div className="color-option" style={{ background: '#667eea' }}></div>
              <div className="color-option" style={{ background: '#48bb78' }}></div>
              <div className="color-option" style={{ background: '#ed8936' }}></div>
              <div className="color-option" style={{ background: '#f56565' }}></div>
              <div className="color-option" style={{ background: '#9f7aea' }}></div>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h2 className="section-title">Notifications</h2>
          <div className="setting-item toggle-item">
            <div>
              <label>Email Notifications</label>
              <p className="setting-description">Receive email updates about your tasks</p>
            </div>
            <label className="toggle">
              <input type="checkbox" defaultChecked />
              <span className="toggle-slider"></span>
            </label>
          </div>
          <div className="setting-item toggle-item">
            <div>
              <label>Desktop Notifications</label>
              <p className="setting-description">Show browser notifications for reminders</p>
            </div>
            <label className="toggle">
              <input type="checkbox" defaultChecked />
              <span className="toggle-slider"></span>
            </label>
          </div>
          <div className="setting-item toggle-item">
            <div>
              <label>Task Reminders</label>
              <p className="setting-description">Get reminded about upcoming tasks</p>
            </div>
            <label className="toggle">
              <input type="checkbox" defaultChecked />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h2 className="section-title">Preferences</h2>
          <div className="setting-item">
            <label>Default View</label>
            <select className="setting-select">
              <option>Dashboard</option>
              <option>Tasks</option>
              <option>Calendar</option>
            </select>
          </div>
          <div className="setting-item">
            <label>Date Format</label>
            <select className="setting-select">
              <option>MM/DD/YYYY</option>
              <option>DD/MM/YYYY</option>
              <option>YYYY-MM-DD</option>
            </select>
          </div>
          <div className="setting-item">
            <label>Week Starts On</label>
            <select className="setting-select">
              <option>Sunday</option>
              <option>Monday</option>
            </select>
          </div>
        </div>

        <div className="settings-section">
          <h2 className="section-title">Data & Privacy</h2>
          <div className="setting-item">
            <button className="btn-secondary">Export Data</button>
            <p className="setting-description">Download all your data as JSON</p>
          </div>
          <div className="setting-item">
            <button className="btn-danger">Delete Account</button>
            <p className="setting-description">Permanently delete your account and all data</p>
          </div>
        </div>

        <div className="settings-actions">
          <button className="btn-secondary">Cancel</button>
          <button className="btn-primary">Save Changes</button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
