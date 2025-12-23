import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import TaskDetail from './pages/TaskDetail';
import Ideas from './pages/Ideas';
import AllTasks from './pages/AllTasks';
import Calendar from './pages/Calendar';
import Terminal from './pages/Terminal';
import Trash from './pages/Trash';
import Settings from './pages/Settings';
import Portfolio from './pages/Portfolio';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/tasks/:id" element={<TaskDetail />} />
            <Route path="/ideas" element={<Ideas />} />
            <Route path="/all-tasks" element={<AllTasks />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/terminal" element={<Terminal />} />
            <Route path="/trash" element={<Trash />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/portfolio" element={<Portfolio />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
