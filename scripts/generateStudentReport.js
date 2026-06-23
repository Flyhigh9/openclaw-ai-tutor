const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "..", "data");
const reportsDir = path.join(__dirname, "..", "reports");

function readJson(fileName) {
  const filePath = path.join(dataDir, fileName);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function ensureReportsFolder() {
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir);
  }
}

const studentId = process.argv[2];

if (!studentId) {
  console.log("Please provide a student ID.");
  console.log("Example: node scripts/generateStudentReport.js S101");
  process.exit(1);
}

const students = readJson("students.json");
const courses = readJson("courses.json");
const assignments = readJson("assignments.json");
const submissions = readJson("submissions.json");
const progress = readJson("progress.json");

const student = students.find((s) => s.studentId === studentId);

if (!student) {
  console.log(`Student ${studentId} not found.`);
  process.exit(1);
}

const studentProgress = progress.filter((p) => p.studentId === studentId);
const studentSubmissions = submissions.filter((s) => s.studentId === studentId);

const totalPoints = studentSubmissions.reduce((sum, sub) => sum + sub.points, 0);
const averageScore =
  studentSubmissions.length > 0
    ? Math.round(totalPoints / studentSubmissions.length)
    : 0;

const report = {
  student,
  progress: studentProgress,
  submissions: studentSubmissions,
  summary: {
    totalSubmissions: studentSubmissions.length,
    averageScore,
    riskLevels: studentProgress.map((p) => p.riskLevel),
  },
  aiTutorInput: {
    task: "Analyze this student progress and generate feedback, risk assessment, and recommendations.",
  },
};

ensureReportsFolder();

const outputPath = path.join(reportsDir, `${studentId}-report.json`);

fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));

console.log(`Student report generated successfully: ${outputPath}`);