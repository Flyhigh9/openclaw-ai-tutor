require("dotenv").config({
  quiet: true,
  override: true,
});

const path = require("path");
const { spawnSync } = require("child_process");

const projectRoot = path.resolve(__dirname, "..");

const allowedReportTypes = new Set([
  "feedback",
  "teacher-report",
  "assignment-summary",
  "learning-recommendation",
]);

const allowedReminderTypes = new Set([
  "assignmentReminder",
  "progressWarning",
  "weeklyEncouragement",
]);

const [operation, studentId, type] = process.argv.slice(2);

function showUsage() {
  console.log(`
AI Tutor command router

Usage:
  node scripts/aiTutor.js generate <studentId>
  node scripts/aiTutor.js report <studentId> <reportType>
  node scripts/aiTutor.js remind <studentId> <reminderType>
  node scripts/aiTutor.js analyze <studentId>
  node scripts/aiTutor.js auto-remind <studentId>
  node scripts/aiTutor.js all <studentId>
  node scripts/aiTutor.js coach <studentId>
  node scripts/aiTutor.js coach-send <studentId>
  node scripts/aiTutor.js monitor
  node scripts/aiTutor.js teacher-summary
  node scripts/aiTutor.js teacher-summary-send
  node scripts/aiTutor.js snapshot
  node scripts/aiTutor.js trend <studentId> 
  node scripts/aiTutor.js weekly-summary
  node scripts/aiTutor.js weekly-summary-send

Examples:
  node scripts/aiTutor.js generate S101
  node scripts/aiTutor.js report S101 feedback
  node scripts/aiTutor.js remind S101 weeklyEncouragement
  node scripts/aiTutor.js analyze S101
  node scripts/aiTutor.js auto-remind S101
  node scripts/aiTutor.js all S101
  node scripts/aiTutor.js coach S102
  node scripts/aiTutor.js monitor
  node scripts/aiTutor.js teacher-summary
  node scripts/aiTutor.js teacher-summary-send
  node scripts/aiTutor.js snapshot
  node scripts/aiTutor.js trend S102
  node scripts/aiTutor.js weekly-summary
node scripts/aiTutor.js weekly-summary-send
`);
}

function fail(message) {
  console.error(`Error: ${message}`);
  showUsage();
  process.exit(1);
}

function validateStudentId(value) {
  if (!value) {
    fail("A student ID is required.");
  }

  if (!/^S\d+$/i.test(value)) {
    fail(`Invalid student ID: ${value}`);
  }
}

function runScript(scriptName, args = []) {
  const scriptPath = path.join(
    projectRoot,
    "scripts",
    scriptName
  );

  console.log(
    `Running ${scriptName}${args.length ? ` ${args.join(" ")}` : ""}`
  );

  const result = spawnSync(
    process.execPath,
    [scriptPath, ...args],
    {
      cwd: projectRoot,
      stdio: "inherit",
      env: process.env,
    }
  );

  if (result.error) {
    console.error(
      `Failed to start ${scriptName}: ${result.error.message}`
    );
    process.exit(1);
  }

  if (result.status !== 0) {
    console.error(
      `${scriptName} failed with exit code ${result.status}.`
    );
    process.exit(result.status || 1);
  }

  console.log("AI Tutor operation completed successfully.");
}

if (!operation) {
  fail("An operation is required.");
}

const normalizedOperation = operation.toLowerCase();

const operationsWithoutStudentId = new Set([
  "monitor",
  "snapshot",
  "teacher-summary",
  "teacher-summary-send",
  "weekly-summary",
  "weekly-summary-send",
]);

if (!operationsWithoutStudentId.has(normalizedOperation)) {
  validateStudentId(studentId);
}

switch (normalizedOperation) {
  case "generate": {
    if (type) {
      fail(
        "The generate operation only accepts a student ID."
      );
    }

    runScript("generateAIOutputs.js", [studentId]);
    break;
  }

  case "report": {
    if (!type) {
      fail("A report type is required.");
    }

    if (!allowedReportTypes.has(type)) {
      fail(
        `Unsupported report type: ${type}. Allowed types: ${[
          ...allowedReportTypes,
        ].join(", ")}`
      );
    }

    runScript("sendTelegramReport.js", [
      studentId,
      type,
    ]);
    break;
  }

  case "remind": {
    if (!type) {
      fail("A reminder type is required.");
    }

    if (!allowedReminderTypes.has(type)) {
      fail(
        `Unsupported reminder type: ${type}. Allowed types: ${[
          ...allowedReminderTypes,
        ].join(", ")}`
      );
    }

    runScript("sendTelegramReminder.js", [
      studentId,
      type,
    ]);
    break;
  }

  case "analyze": {
    if (type) {
      fail(
        "The analyze operation only accepts a student ID."
      );
    }

    runScript("analyzeStudent.js", [studentId]);
    break;
  }

  case "auto-remind": {
    if (type) {
      fail(
        "The auto-remind operation only accepts a student ID."
      );
    }

    runScript("autoReminder.js", [studentId]);
    break;
  }

  case "all": {
    if (type) {
      fail(
        "The all operation only accepts a student ID."
      );
    }

    runScript(
      "sendAllTelegramNotifications.js",
      [studentId]
    );
    break;
  }

  case "coach": {
    if (type) {
      fail(
        "The coach operation only accepts a student ID."
      );
    }

    runScript("coachStudent.js", [studentId]);
    break;
  }

  case "monitor": {
    if (studentId || type) {
      fail(
        "The monitor operation does not accept additional arguments."
      );
    }

    runScript("monitorStudents.js");
    break;
  }

  case "teacher-summary": {
  if (studentId || type) {
    fail(
      "The teacher-summary operation does not accept additional arguments."
    );
  }

  runScript("generateTeacherSummary.js");
  break;
  }

  case "teacher-summary-send": {
  if (studentId || type) {
    fail(
      "The teacher-summary-send operation does not accept additional arguments."
    );
  }

  runScript("generateTeacherSummary.js");

  runScript("sendTeacherSummary.js");

  break;
  }

  case "trend": {
  if (type) {
    fail(
      "The trend operation only accepts a student ID."
    );
  }

  runScript(
    "analyzeTrend.js",
    [studentId]
  );

  break;
  }

  case "snapshot": {
  if (studentId || type) {
    fail(
      "The snapshot operation does not accept additional arguments."
    );
  }

  runScript(
    "saveProgressSnapshot.js"
  );

  break;
  }
  
  case "weekly-summary": {
  if (studentId || type) {
    fail(
      "The weekly-summary operation does not accept additional arguments."
    );
  }

  runScript(
    "generateWeeklySummary.js"
  );

  break;
  }

  case "weekly-summary-send": {
  if (studentId || type) {
    fail(
      "The weekly-summary-send operation does not accept additional arguments."
    );
  }

  runScript("generateWeeklySummary.js");

  runScript("sendWeeklySummary.js");

  break;
  }
  
  default:
    fail(
      `Unknown operation: ${operation}. Allowed operations: generate, report, remind, analyze, auto-remind, all, coach, monitor`
    );
}