require("dotenv").config({
  quiet: true,
  override: true,
});

const fs = require("fs");
const path = require("path");

const {
  sendTelegramMessage,
} = require("../src/services/telegramService");

const projectRoot = path.resolve(__dirname, "..");

const reportsDir = path.join(
  projectRoot,
  "reports"
);

const studentId = process.argv[2];
const reportType = process.argv[3];

const allowedReportTypes = [
  "feedback",
  "teacher-report",
  "assignment-summary",
  "learning-recommendation",
];

const reportTitles = {
  feedback: "AI Feedback",
  "teacher-report": "Teacher Report",
  "assignment-summary": "Assignment Summary",
  "learning-recommendation": "Learning Recommendation",
};

if (!studentId || !reportType) {
  console.error(
    "Usage: node scripts/sendTelegramReport.js <studentId> <reportType>"
  );

  process.exit(1);
}

if (!/^S\d+$/i.test(studentId)) {
  console.error(
    `Invalid student ID: ${studentId}`
  );

  process.exit(1);
}

if (
  !allowedReportTypes.includes(
    reportType
  )
) {
  console.error(
    `Unsupported report type: ${reportType}`
  );

  console.error(
    `Allowed report types: ${allowedReportTypes.join(", ")}`
  );

  process.exit(1);
}

if (
  !process.env.OPENCLAW_GATEWAY_TOKEN
) {
  console.error(
    "OPENCLAW_GATEWAY_TOKEN is missing from .env"
  );

  process.exit(1);
}

if (
  !process.env.STUDENT_TELEGRAM_CHAT_ID
) {
  console.error(
    "STUDENT_TELEGRAM_CHAT_ID is missing from .env"
  );

  process.exit(1);
}

try {
  const reportPath = path.join(
    reportsDir,
    `${studentId}-${reportType}.md`
  );

  if (!fs.existsSync(reportPath)) {
    throw new Error(
      `Report was not found: ${reportPath}`
    );
  }

  const reportContent = fs
    .readFileSync(
      reportPath,
      "utf8"
    )
    .trim();

  if (!reportContent) {
    throw new Error(
      `Report is empty: ${reportPath}`
    );
  }

  const reportTitle =
    reportTitles[reportType];

  const message = [
    `📘 ${reportTitle}`,
    "",
    `Student: ${studentId}`,
    "",
    reportContent,
    "",
    "– OpenClaw AI Tutor",
  ].join("\n");

  console.log(
    `Sending ${reportType} report for ${studentId}...`
  );

  /*
   * Telegram delivery is handled
   * by the shared Telegram service.
   *
   * Student-facing reports use
   * STUDENT_TELEGRAM_CHAT_ID.
   */
  const delivery =
    sendTelegramMessage({
      chatId:
        process.env
          .STUDENT_TELEGRAM_CHAT_ID,

      message,

      gatewayToken:
        process.env
          .OPENCLAW_GATEWAY_TOKEN,
    });

  console.log(
    `${reportTitle} for ${studentId} sent successfully.`
  );

  if (delivery.stdout) {
    console.log(
      delivery.stdout
    );
  }
} catch (error) {
  console.error(
    `Telegram report failed: ${error.message}`
  );

  process.exit(1);
}