require("dotenv").config({
  quiet: true,
  override: true,
});

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const studentId = process.argv[2];
const reportType = process.argv[3] || "feedback";

const allowedReportTypes = [
  "feedback",
  "teacher-report",
  "assignment-summary",
  "learning-recommendation",
];

if (!studentId) {
  console.error("Please provide a student ID.");
  console.error(
    "Example: node scripts/sendTelegramReport.js S101 feedback"
  );
  process.exit(1);
}

if (!allowedReportTypes.includes(reportType)) {
  console.error(`Invalid report type: ${reportType}`);
  console.error(`Allowed types: ${allowedReportTypes.join(", ")}`);
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

const projectRoot = path.join(__dirname, "..");
const reportPath = path.join(
  projectRoot,
  "reports",
  `${studentId}-${reportType}.md`
);

if (!fs.existsSync(reportPath)) {
  console.error(`Report not found: ${reportPath}`);
  process.exit(1);
}

const reportContent = fs.readFileSync(reportPath, "utf8").trim();

if (!reportContent) {
  console.error("The report file is empty.");
  process.exit(1);
}

const reportTitles = {
  feedback: "Student Feedback",
  "teacher-report": "Teacher Report",
  "assignment-summary": "Assignment Summary",
  "learning-recommendation": "Learning Recommendation",
};

const message = [
  "🎓 OpenClaw AI Tutor",
  "",
  `Student ID: ${studentId}`,
  `Report Type: ${reportTitles[reportType]}`,
  "",
  reportContent,
].join("\n");

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
    encoding: "utf8",
    stdio: "inherit",
    env: {
      ...process.env,
      OPENCLAW_GATEWAY_TOKEN: process.env.OPENCLAW_GATEWAY_TOKEN,
    },
  }
);

if (result.error) {
  console.error("Failed to run OpenClaw:", result.error.message);
  process.exit(1);
}

if (result.status !== 0) {
  console.error("Telegram message could not be sent.");
  process.exit(result.status || 1);
}

console.log(
  `${reportTitles[reportType]} for ${studentId} sent successfully.`
);