const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const dataDir = path.join(__dirname, "..", "data");

function readJson(fileName) {
  const filePath = path.join(dataDir, fileName);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

app.get("/", (req, res) => {
  res.json({
    message: "OpenClaw AI Tutor Backend is running",
    endpoints: [
      "/students",
      "/courses",
      "/assignments",
      "/submissions",
      "/progress",
      "/students/:studentId/progress"
    ]
  });
});

app.get("/students", (req, res) => {
  res.json(readJson("students.json"));
});

app.get("/courses", (req, res) => {
  res.json(readJson("courses.json"));
});

app.get("/assignments", (req, res) => {
  res.json(readJson("assignments.json"));
});

app.get("/submissions", (req, res) => {
  res.json(readJson("submissions.json"));
});

app.get("/progress", (req, res) => {
  res.json(readJson("progress.json"));
});

app.get("/students/:studentId/progress", (req, res) => {
  const { studentId } = req.params;

  const students = readJson("students.json");
  const courses = readJson("courses.json");
  const assignments = readJson("assignments.json");
  const submissions = readJson("submissions.json");
  const progress = readJson("progress.json");

  const student = students.find((s) => s.studentId === studentId);

  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }

  const studentProgress = progress.filter((p) => p.studentId === studentId);
  const studentSubmissions = submissions.filter((s) => s.studentId === studentId);

  const fullReport = {
    student,
    progress: studentProgress,
    submissions: studentSubmissions,
    courses,
    assignments
  };

  res.json(fullReport);
});

app.get("/reports/:studentId/:type", (req, res) => {
  const { studentId, type } = req.params;

  const allowedTypes = [
    "feedback",
    "teacher-report",
    "assignment-summary",
    "learning-recommendation",
  ];

  if (!allowedTypes.includes(type)) {
    return res.status(400).json({ error: "Invalid report type" });
  }

  const reportPath = path.join(__dirname, "..", "reports", `${studentId}-${type}.md`);

  if (!fs.existsSync(reportPath)) {
    return res.status(404).json({ error: "Report not found" });
  }

  const reportContent = fs.readFileSync(reportPath, "utf8");

  res.json({
    studentId,
    type,
    content: reportContent,
  });
});

app.listen(PORT, () => {
  console.log(`AI Tutor backend running at http://localhost:${PORT}`);
});