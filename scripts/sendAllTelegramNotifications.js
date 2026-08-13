require("dotenv").config({
  quiet: true,
  override: true,
});

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const studentId = process.argv[2];

if (!studentId) {
  console.error(
    "Usage: node scripts/sendAllTelegramNotifications.js <studentId>"
  );
  process.exit(1);
}

if (!process.env.OPENCLAW_GATEWAY_TOKEN) {
  console.error(
    "OPENCLAW_GATEWAY_TOKEN is missing from .env"
  );
  process.exit(1);
}

if (!process.env.TELEGRAM_CHAT_ID) {
  console.error(
    "TELEGRAM_CHAT_ID is missing from .env"
  );
  process.exit(1);
}

const projectRoot = path.join(__dirname, "..");
const reportsDir = path.join(projectRoot, "reports");

const reportTypes = [
  "feedback",
  "teacher-report",
  "assignment-summary",
  "learning-recommendation",
  "learning-coach",
];

function runScript(scriptName, args = []) {
  console.log(
    `\nRunning ${scriptName}${args.length ? ` ${args.join(" ")}` : ""}...`
  );

  const result = spawnSync(
    process.execPath,
    [path.join(__dirname, scriptName), ...args],
    {
      cwd: projectRoot,
      stdio: "inherit",
      env: {
        ...process.env,
        OPENCLAW_GATEWAY_TOKEN:
          process.env.OPENCLAW_GATEWAY_TOKEN,
        TELEGRAM_CHAT_ID:
          process.env.TELEGRAM_CHAT_ID,
      },
    }
  );

  if (result.error) {
    console.error(
      `Failed to run ${scriptName}: ${result.error.message}`
    );
    return false;
  }

  if (result.status !== 0) {
    console.error(
      `${scriptName} exited with status ${result.status}.`
    );
    return false;
  }

  return true;
}

function reportExists(reportType) {
  const reportPath = path.join(
    reportsDir,
    `${studentId}-${reportType}.md`
  );

  return fs.existsSync(reportPath);
}

console.log(
  `Starting Telegram notification workflow for ${studentId}.`
);

let successCount = 0;
let failureCount = 0;
let skippedCount = 0;

// Send all available reports
for (const reportType of reportTypes) {
  if (!reportExists(reportType)) {
    console.warn(
      `Skipping ${reportType}: reports/${studentId}-${reportType}.md was not found.`
    );

    skippedCount += 1;
    continue;
  }

  const success = runScript(
    "sendTelegramReport.js",
    [studentId, reportType]
  );

  if (success) {
    successCount += 1;
  } else {
    failureCount += 1;
  }
}

// Run ONE smart reminder decision
console.log(
  "\nRunning automatic reminder decision..."
);

const reminderSuccess = runScript(
  "autoReminder.js",
  [studentId]
);

if (reminderSuccess) {
  successCount += 1;
} else {
  failureCount += 1;
}

console.log(
  "\nTelegram notification workflow completed."
);

console.log(`Successful: ${successCount}`);
console.log(`Failed: ${failureCount}`);
console.log(`Skipped reports: ${skippedCount}`);

if (failureCount > 0) {
  process.exit(1);
}