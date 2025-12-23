import { useState } from 'react';
import './Terminal.css';

const Terminal = () => {
  const [output] = useState([
    '> Welcome to OmniDesk Terminal',
    '> Type "help" to see available commands',
    '',
    '> help',
    'Available commands:',
    '  add task [title] - Create a new task',
    '  add idea [text] - Create a new idea',
    '  list tasks - Show all tasks',
    '  list ideas - Show all ideas',
    '  complete [task-id] - Mark task as complete',
    '  delete [task-id] - Delete a task',
    '  clear - Clear terminal output',
    '',
  ]);

  return (
    <div className="page terminal-page">
      <header className="page-header">
        <div>
          <h1>Terminal</h1>
          <p className="page-subtitle">Bulk input and quick actions via command line</p>
        </div>
        <button className="btn-secondary">Clear History</button>
      </header>

      <div className="terminal-container">
        <div className="terminal-window">
          <div className="terminal-header">
            <div className="terminal-buttons">
              <span className="terminal-btn close"></span>
              <span className="terminal-btn minimize"></span>
              <span className="terminal-btn maximize"></span>
            </div>
            <div className="terminal-title">OmniDesk Terminal</div>
          </div>
          
          <div className="terminal-body">
            <div className="terminal-output">
              {output.map((line, index) => (
                <div key={index} className="output-line">
                  {line}
                </div>
              ))}
            </div>
            
            <div className="terminal-input-line">
              <span className="prompt">&gt;</span>
              <input
                type="text"
                className="terminal-input"
                placeholder="Enter command..."
                autoFocus
              />
            </div>
          </div>
        </div>

        <div className="terminal-help">
          <h3>Quick Reference</h3>
          <div className="help-section">
            <h4>Task Commands</h4>
            <ul>
              <li><code>add task Design homepage</code> - Create task</li>
              <li><code>list tasks</code> - Show all tasks</li>
              <li><code>complete 1</code> - Mark task #1 complete</li>
              <li><code>delete 1</code> - Delete task #1</li>
            </ul>
          </div>
          
          <div className="help-section">
            <h4>Idea Commands</h4>
            <ul>
              <li><code>add idea Build mobile app</code> - Create idea</li>
              <li><code>list ideas</code> - Show all ideas</li>
              <li><code>convert idea 1</code> - Convert idea to task</li>
            </ul>
          </div>

          <div className="help-section">
            <h4>Bulk Operations</h4>
            <ul>
              <li><code>import tasks file.csv</code> - Import from CSV</li>
              <li><code>export tasks</code> - Export tasks to CSV</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terminal;
