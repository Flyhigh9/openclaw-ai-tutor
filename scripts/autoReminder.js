require("dotenv").config({
  quiet: true,
  override: true,
});

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const projectRoot = path.resolve(__dirname, "..");
const studentId = process.argv[2];

const historyFile = path.join(
  projectRoot,
  "data",
  "notificationHistory.json"
);

// Cooldown periods in hours
const reminderCooldownHours = {
  assignmentReminder: 24,
  progressWarning: 72,
  weeklyEncouragement: 168, // 7 days
};

if (!studentId) {
  console.error(
    "Usage: node scripts/autoReminder.js <studentId>"
  );
  process.exit(1);
}

if (!/^S\d+$/i.test(studentId)) {
  console.error(`Invalid student ID: ${studentId}`);
  process.exit(1);
}

function loadHistory() {
  if (!fs.existsSync(historyFile)) {
    fs.writeFileSync(historyFile, "[]", "utf8");
    return [];
  }

  const content = fs.readFileSync(historyFile, "utf8").trim();

  if (!content) {
    return [];
  }

  const history = JSON.parse(content);

  if (!Array.isArray(history)) {
    throw new Error(
      "notificationHistory.json must contain an array."
    );
  }

  return history;
}

function saveHistory(history) {
  fs.writeFileSync(
    historyFile,
    JSON.stringify(history, null, 2),
    "utf8"
  );
}

function analyzeStudent(id) {
  const analysisScript = path.join(
    projectRoot,
    "scripts",
    "analyzeStudent.js"
  );

  const result = spawnSync(
    process.execPath,
    [analysisScript, id],
    {
      cwd: projectRoot,
      encoding: "utf8",
      env: process.env,
    }
  );

  if (result.error) {
    throw new Error(
      `Could not run student analysis: ${result.error.message}`
    );
  }

  if (result.status !== 0) {
    throw new Error(
      result.stderr || "Student analysis failed."
    );
  }

  const marker = "JSON result:";
  const markerIndex = result.stdout.indexOf(marker);

  if (markerIndex === -1) {
    throw new Error(
      "Could not find JSON result from student analysis."
    );
  }

  const jsonText = result.stdout
    .slice(markerIndex + marker.length)
    .trim();

  return JSON.parse(jsonText);
}

function getLastNotification(history, id, reminderType) {
  return [...history]
    .reverse()
    .find(
      (item) =>
        item.studentId === id &&
        item.type === reminderType
    );
}

function canSendReminder(history, id, reminderType) {
  const previous = getLastNotification(
    history,
    id,
    reminderType
  );

  if (!previous) {
    return {
      allowed: true,
      remainingHours: 0,
    };
  }

  const cooldown =
    reminderCooldownHours[reminderType];

  if (!cooldown) {
    return {
      allowed: true,
      remainingHours: 0,
    };
  }

  const lastSent = new Date(previous.sentAt);

  if (Number.isNaN(lastSent.getTime())) {
    return {
      allowed: true,
      remainingHours: 0,
    };
  }

  const now = new Date();

  const elapsedHours =
    (now.getTime() - lastSent.getTime()) /
    (1000 * 60 * 60);

  if (elapsedHours >= cooldown) {
    return {
      allowed: true,
      remainingHours: 0,
    };
  }

  return {
    allowed: false,
    remainingHours: Math.ceil(
      cooldown - elapsedHours
    ),
  };
}

function sendReminder(id, reminderType) {
  const reminderScript = path.join(
    projectRoot,
    "scripts",
    "sendTelegramReminder.js"
  );

  console.log(
    `Sending ${reminderType} to ${id}...`
  );

  const result = spawnSync(
    process.execPath,
    [reminderScript, id, reminderType],
    {
      cwd: projectRoot,
      stdio: "inherit",
      env: process.env,
    }
  );

  if (result.error) {
    throw new Error(
      `Could not send reminder: ${result.error.message}`
    );
  }

  if (result.status !== 0) {
    throw new Error(
      `Reminder script failed with exit code ${result.status}.`
    );
  }
}

try {
  console.log(`Analyzing student ${studentId}...`);

  const analysis = analyzeStudent(studentId);

  console.log("\nAutomatic Reminder Decision");
  console.log("===========================");

  console.log(
    `Student: ${analysis.studentName} (${analysis.studentId})`
  );

  console.log(
    `Average progress: ${analysis.averageProgress}%`
  );

  console.log(
  `Overdue assignments: ${analysis.overdueAssignments}`
  );

  console.log(
    `Risk level: ${analysis.riskLevel}`
  );

  console.log(
    `Selected reminder: ${analysis.recommendedNotification}`
  );

  const history = loadHistory();

  const reminderCheck = canSendReminder(
    history,
    studentId,
    analysis.recommendedNotification
  );

  if (!reminderCheck.allowed) {
    console.log("\nReminder skipped.");
    console.log(
      `${analysis.recommendedNotification} was already sent recently.`
    );

    console.log(
      `Approximately ${reminderCheck.remainingHours} hour(s) remaining before it can be sent again.`
    );

    process.exit(0);
  }

  sendReminder(
    studentId,
    analysis.recommendedNotification
  );

  history.push({
    studentId,
    type: analysis.recommendedNotification,
    riskLevel: analysis.riskLevel,
    sentAt: new Date().toISOString(),
  });

  saveHistory(history);

  console.log(
    "\nNotification history updated."
  );

  console.log(
    "Automatic reminder completed successfully."
  );
} catch (error) {
  console.error(
    `Auto reminder failed: ${error.message}`
  );

  process.exit(1);
}