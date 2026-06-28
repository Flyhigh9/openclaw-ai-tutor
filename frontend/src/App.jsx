import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Courses from "./pages/Courses";
import Assignments from "./pages/Assignments";
import Progress from "./pages/Progress";
import TeacherReports from "./pages/TeacherReports";
import "./App.css";

function App() {
  return (
    <div className="app">
      <nav className="navbar">
        <h2>🤖 OpenClaw Tutor</h2>
        <div>
          <a href="#students">Students</a>
          <a href="#courses">Courses</a>
          <a href="#assignments">Assignments</a>
          <a href="#progress">Progress</a>
          <a href="#reports">Reports</a>
        </div>
      </nav>

      <Dashboard />

      <div className="grid">
        <Students />
        <Courses />
      </div>

      <Assignments />
      <Progress />
      <TeacherReports />
    </div>
  );
}

export default App;