import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import type { TaskState } from '../types';
import './Terminal.css';

interface OutputLine {
  text: string;
  type: 'command' | 'output' | 'error' | 'success';
}

const Terminal = () => {
  const { state, addTask, addIdea, updateTask } = useApp();
  const [output, setOutput] = useState<OutputLine[]>([
    { text: '> Welcome to OmniDesk Terminal', type: 'output' },
    { text: '> Type "help" to see available commands', type: 'output' },
    { text: '', type: 'output' },
  ]);
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom when output changes
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const addOutput = (text: string, type: OutputLine['type'] = 'output') => {
    setOutput(prev => [...prev, { text, type }]);
  };

  const showHelp = () => {
    addOutput('Available commands:', 'output');
    addOutput('  add task <title> - Create a new task', 'output');
    addOutput('  add idea <text> - Create a new idea', 'output');
    addOutput('  list tasks - Show all active tasks', 'output');
    addOutput('  list ideas - Show all ideas', 'output');
    addOutput('  complete <task-id> - Mark task as complete', 'output');
    addOutput('  delete task <task-id> - Delete a task', 'output');
    addOutput('  clear - Clear terminal output', 'output');
    addOutput('', 'output');
  };

  const executeCommand = async (cmd: string) => {
    const trimmedCmd = cmd.trim();
    if (!trimmedCmd) return;

    addOutput(`> ${trimmedCmd}`, 'command');
    const parts = trimmedCmd.split(' ');
    const command = parts[0].toLowerCase();
    const subCommand = parts[1]?.toLowerCase();
    const args = parts.slice(2).join(' ');

    try {
      switch (command) {
        case 'help':
          showHelp();
          break;

        case 'clear':
          setOutput([]);
          break;

        case 'add':
          if (subCommand === 'task') {
            if (!args) {
              addOutput('Error: Task title is required', 'error');
              addOutput('Usage: add task <title>', 'error');
              break;
            }
            const domain = state.domains[0];
            if (!domain) {
              addOutput('Error: No domains found. Please create a domain first.', 'error');
              break;
            }
            await addTask({
              title: args,
              description: '',
              domainId: domain.id,
              state: 'gotta-start' as TaskState,
            });
            addOutput(`✓ Task "${args}" created successfully`, 'success');
          } else if (subCommand === 'idea') {
            if (!args) {
              addOutput('Error: Idea text is required', 'error');
              addOutput('Usage: add idea <text>', 'error');
              break;
            }
            await addIdea({
              title: args,
              notes: [{
                id: `note-${Date.now()}`,
                type: 'text',
                content: args,
                createdAt: new Date().toISOString(),
                order: 0,
              }],
              tags: [],
            });
            addOutput(`✓ Idea "${args}" created successfully`, 'success');
          } else {
            addOutput(`Error: Unknown subcommand "${subCommand}"`, 'error');
            addOutput('Usage: add task <title> | add idea <text>', 'error');
          }
          break;

        case 'list':
          if (subCommand === 'tasks') {
            const activeTasks = state.tasks.filter(t => !t.deletedAt);
            if (activeTasks.length === 0) {
              addOutput('No tasks found', 'output');
            } else {
              addOutput(`Found ${activeTasks.length} task(s):`, 'output');
              activeTasks.forEach((task, i) => {
                const domain = state.domains.find(d => d.id === task.domainId);
                addOutput(`  ${i + 1}. [${task.state}] ${task.title} (${domain?.name || 'No Domain'})`, 'output');
              });
            }
          } else if (subCommand === 'ideas') {
            const activeIdeas = state.ideas.filter(i => !i.deletedAt);
            if (activeIdeas.length === 0) {
              addOutput('No ideas found', 'output');
            } else {
              addOutput(`Found ${activeIdeas.length} idea(s):`, 'output');
              activeIdeas.forEach((idea, i) => {
                addOutput(`  ${i + 1}. ${idea.title}`, 'output');
              });
            }
          } else {
            addOutput(`Error: Unknown list type "${subCommand}"`, 'error');
            addOutput('Usage: list tasks | list ideas', 'error');
          }
          break;

        case 'complete':
          if (!subCommand) {
            addOutput('Error: Task index is required', 'error');
            addOutput('Usage: complete <task-number>', 'error');
            break;
          }
          const taskIndex = parseInt(subCommand) - 1;
          const activeTasks = state.tasks.filter(t => !t.deletedAt);
          if (taskIndex < 0 || taskIndex >= activeTasks.length) {
            addOutput(`Error: Task ${subCommand} not found`, 'error');
            break;
          }
          const taskToComplete = activeTasks[taskIndex];
          await updateTask(taskToComplete.id, { state: 'completed' as TaskState });
          addOutput(`✓ Task "${taskToComplete.title}" marked as completed`, 'success');
          break;

        case 'delete':
          if (subCommand === 'task') {
            if (!args) {
              addOutput('Error: Task index is required', 'error');
              addOutput('Usage: delete task <task-number>', 'error');
              break;
            }
            const delTaskIndex = parseInt(args) - 1;
            const tasks = state.tasks.filter(t => !t.deletedAt);
            if (delTaskIndex < 0 || delTaskIndex >= tasks.length) {
              addOutput(`Error: Task ${args} not found`, 'error');
              break;
            }
            const taskToDelete = tasks[delTaskIndex];
            await updateTask(taskToDelete.id, { deletedAt: new Date().toISOString() });
            addOutput(`✓ Task "${taskToDelete.title}" deleted`, 'success');
          } else {
            addOutput(`Error: Unknown delete type "${subCommand}"`, 'error');
            addOutput('Usage: delete task <task-number>', 'error');
          }
          break;

        default:
          addOutput(`Error: Unknown command "${command}"`, 'error');
          addOutput('Type "help" to see available commands', 'output');
      }
    } catch (error) {
      addOutput(`Error: ${error instanceof Error ? error.message : 'Command failed'}`, 'error');
    }

    addOutput('', 'output');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand(input);
      setCommandHistory(prev => [...prev, input]);
      setHistoryIndex(-1);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  const handleClearHistory = () => {
    setOutput([
      { text: '> Welcome to OmniDesk Terminal', type: 'output' },
      { text: '> Type "help" to see available commands', type: 'output' },
      { text: '', type: 'output' },
    ]);
  };

  return (
    <div className="page terminal-page">
      <header className="page-header">
        <div>
          <h1>Terminal</h1>
          <p className="page-subtitle">Bulk input and quick actions via command line</p>
        </div>
        <button className="btn-secondary" onClick={handleClearHistory}>Clear History</button>
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
            <div className="terminal-output" ref={outputRef}>
              {output.map((line, index) => (
                <div key={index} className={`output-line ${line.type}`}>
                  {line.text}
                </div>
              ))}
            </div>
            
            <div className="terminal-input-line">
              <span className="prompt">&gt;</span>
              <input
                ref={inputRef}
                type="text"
                className="terminal-input"
                placeholder="Enter command..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
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
              <li><code>delete task 1</code> - Delete task #1</li>
            </ul>
          </div>
          
          <div className="help-section">
            <h4>Idea Commands</h4>
            <ul>
              <li><code>add idea Build mobile app</code> - Create idea</li>
              <li><code>list ideas</code> - Show all ideas</li>
            </ul>
          </div>

          <div className="help-section">
            <h4>Tips</h4>
            <ul>
              <li>Use ↑ and ↓ arrows to navigate command history</li>
              <li>Type <code>clear</code> to clear the terminal</li>
              <li>Type <code>help</code> to see all commands</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terminal;
