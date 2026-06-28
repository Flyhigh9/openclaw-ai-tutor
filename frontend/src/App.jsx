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
      <Dashboard />
      <Students />
      <Courses />
      <Assignments />
      <Progress />
      <TeacherReports />
    </div>
  );
}

export default App;