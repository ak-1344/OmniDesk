import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Sidebar from './components/Sidebar';
import FloatingTrash from './components/FloatingTrash';
import { ConnectionStatus } from './components/ConnectionStatus';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import TaskDetail from './pages/TaskDetail';
import Ideas from './pages/Ideas';
import IdeaCreate from './pages/IdeaCreate';
import AllTasks from './pages/AllTasks';
import Calendar from './pages/Calendar';
import Terminal from './pages/Terminal';
import Trash from './pages/Trash';
import Settings from './pages/Settings';
import './App.css';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="app">
          <Sidebar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/tasks/:id" element={<TaskDetail />} />
              <Route path="/ideas" element={<Ideas />} />
              <Route path="/ideas/new" element={<IdeaCreate />} />
              <Route path="/all-tasks" element={<AllTasks />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/terminal" element={<Terminal />} />
              <Route path="/trash" element={<Trash />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
          <FloatingTrash />
          <ConnectionStatus />
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
