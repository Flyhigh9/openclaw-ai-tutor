require("dotenv").config({
  quiet: true,
  override: true,
});

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const studentId = process.argv[2];
const reminderType = process.argv[3];

const allowedTypes = [
  "assignmentReminder",
  "progressWarning",
  "weeklyEncouragement",
];

if (!studentId || !reminderType) {
  console.error(
    "Usage: node scripts/sendTelegramReminder.js <studentId> <reminderType>"
  );
  process.exit(1);
}

if (!allowedTypes.includes(reminderType)) {
  console.error(`Allowed reminder types: ${allowedTypes.join(", ")}`);
  process.exit(1);
}

if (!process.env.OPENCLAW_GATEWAY_TOKEN) {
  console.error("OPENCLAW_GATEWAY_TOKEN is missing from .env");
  process.exit(1);
}

if (!process.env.TELEGRAM_CHAT_ID) {
  console.error("TELEGRAM_CHAT_ID is missing from .env");
  process.exit(1);
}

const rootDir = path.join(__dirname, "..");
const dataDir = path.join(rootDir, "data");
const templateDir = path.join(rootDir, "templates", "telegram");

function readJson(fileName) {
  return JSON.parse(
    fs.readFileSync(path.join(dataDir, fileName), "utf8")
  );
}

function readTemplate(fileName) {
  return fs.readFileSync(
    path.join(templateDir, fileName),
    "utf8"
  );
}

function replaceVariables(template, values) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return values[key] ?? "";
  });
}

const students = readJson("students.json");
const courses = readJson("courses.json");
const assignments = readJson("assignments.json");
const progress = readJson("progress.json");

const student = students.find((item) => item.studentId === studentId);

if (!student) {
  console.error(`Student ${studentId} not found.`);
  process.exit(1);
}

const studentProgress = progress.find(
  (item) => item.studentId === studentId
);

const course = courses.find(
  (item) => item.courseId === studentProgress?.courseId
);

const assignment = assignments.find(
  (item) => item.courseId === studentProgress?.courseId
);

const templates = {
  assignmentReminder: "assignmentReminder.txt",
  progressWarning: "progressWarning.txt",
  weeklyEncouragement: "weeklyEncouragement.txt",
};

const template = readTemplate(templates[reminderType]);

const values = {
  studentName: student.name,
  assignmentTitle: assignment?.title || "Upcoming assignment",
  deadline: assignment?.deadline || "Not specified",
  courseName: course?.courseName || "Current course",
  progressPercentage: studentProgress?.progressPercentage ?? 0,
  riskLevel: studentProgress?.riskLevel || "unknown",
  recommendation:
    studentProgress?.riskLevel === "high"
      ? "Contact the teacher and review incomplete work."
      : "Continue regular study and assignment completion.",
  completedAssignments: studentProgress?.completedAssignments ?? 0,
  totalAssignments: studentProgress?.totalAssignments ?? 0,
};

const message = replaceVariables(template, values);

const result = spawnSync(
  "openclaw",
  [
    "message",
    "send",
    "--channel",
    "telegram",
    "--target",
    process.env.TELEGRAM_CHAT_ID,
    "--message",
    message,
  ],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      OPENCLAW_GATEWAY_TOKEN: process.env.OPENCLAW_GATEWAY_TOKEN,
    },
  }
);

if (result.status !== 0) {
  console.error("Reminder could not be sent.");
  process.exit(result.status || 1);
}

console.log(`${reminderType} sent successfully for ${studentId}.`);