require("dotenv").config({
  quiet: true,
  override: true,
});

const fs = require("fs");
const path = require("path");

const {
  sendTelegramMessage,
} = require("../src/services/telegramService");

const {
  checkNotificationCooldown,
} = require("../src/services/notificationCooldown");

const projectRoot = path.resolve(__dirname, "..");

const dataDir = path.join(
  projectRoot,
  "data"
);

const templatesDir = path.join(
  projectRoot,
  "templates",
  "telegram"
);

const historyFile = path.join(
  dataDir,
  "notificationHistory.json"
);

const studentId = process.argv[2];
const reminderType = process.argv[3];

const allowedReminderTypes = [
  "assignmentReminder",
  "progressWarning",
  "weeklyEncouragement",
];

const cooldownHours = {
  assignmentReminder: 24,
  progressWarning: 72,
  weeklyEncouragement: 168,
};

const templateFiles = {
  assignmentReminder:
    "assignmentReminder.txt",

  progressWarning:
    "progressWarning.txt",

  weeklyEncouragement:
    "weeklyEncouragement.txt",
};

if (!studentId || !reminderType) {
  console.error(
    "Usage: node scripts/sendTelegramReminder.js <studentId> <reminderType>"
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
  !allowedReminderTypes.includes(
    reminderType
  )
) {
  console.error(
    `Unsupported reminder type: ${reminderType}`
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

function loadJson(filename) {
  const filePath = path.join(
    dataDir,
    filename
  );

  if (!fs.existsSync(filePath)) {
    throw new Error(
      `Missing data file: ${filename}`
    );
  }

  const content = fs
    .readFileSync(filePath, "utf8")
    .trim();

  if (!content) {
    return [];
  }

  return JSON.parse(content);
}

function loadHistory() {
  if (!fs.existsSync(historyFile)) {
    return [];
  }

  const content = fs
    .readFileSync(historyFile, "utf8")
    .trim();

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
    JSON.stringify(
      history,
      null,
      2
    ),
    "utf8"
  );
}

function replaceTemplateValues(
  template,
  values
) {
  return template.replace(
    /{{(.*?)}}/g,
    (match, key) => {
      const cleanKey = key.trim();

      if (
        Object.prototype.hasOwnProperty.call(
          values,
          cleanKey
        )
      ) {
        return String(
          values[cleanKey]
        );
      }

      return match;
    }
  );
}

try {
  /*
   * STEP 1:
   * Check notification history BEFORE
   * doing any Telegram delivery.
   */

  const history = loadHistory();

  const cooldownResult =
    checkNotificationCooldown({
      history,
      studentId,
      reminderType,
      cooldownHours,
      now: new Date(),
    });

  if (!cooldownResult.allowed) {
    console.log("");
    console.log("Reminder skipped.");

    console.log(
      `${reminderType} was already sent recently to ${studentId}.`
    );

    console.log(
      `Approximately ${cooldownResult.remainingHours} hour(s) remaining before this reminder can be sent again.`
    );

    process.exit(0);
  }

  /*
   * STEP 2:
   * Load verified project data.
   */

  const students =
    loadJson("students.json");

  const assignments =
    loadJson("assignments.json");

  const submissions =
    loadJson("submissions.json");

  const progressRecords =
    loadJson("progress.json");

  const student = students.find(
    (item) =>
      item.studentId === studentId
  );

  if (!student) {
    throw new Error(
      `Student ${studentId} was not found.`
    );
  }

  const studentName =
    student.name ||
    student.fullName ||
    "Student";

  const studentProgress =
    progressRecords.filter(
      (item) =>
        item.studentId === studentId
    );

  const relevantCourseIds =
    new Set(
      studentProgress.map(
        (item) => item.courseId
      )
    );

  const relevantAssignments =
    assignments.filter(
      (assignment) =>
        relevantCourseIds.has(
          assignment.courseId
        )
    );

  const studentSubmissions =
    submissions.filter(
      (submission) =>
        submission.studentId ===
        studentId
    );

  const submittedAssignmentIds =
    new Set(
      studentSubmissions.map(
        (submission) =>
          submission.assignmentId
      )
    );

  const completedAssignments =
    relevantAssignments.filter(
      (assignment) =>
        submittedAssignmentIds.has(
          assignment.assignmentId
        )
    );

  const now = new Date();

  const overdueAssignments =
    relevantAssignments.filter(
      (assignment) => {
        if (
          submittedAssignmentIds.has(
            assignment.assignmentId
          )
        ) {
          return false;
        }

        if (!assignment.deadline) {
          return false;
        }

        const deadline =
          new Date(
            `${assignment.deadline}T23:59:59`
          );

        return (
          !Number.isNaN(
            deadline.getTime()
          ) &&
          deadline < now
        );
      }
    );

  const percentages =
    studentProgress
      .map(
        (item) =>
          Number(
            item.progressPercentage
          )
      )
      .filter(
        (value) =>
          Number.isFinite(value)
      );

  const averageProgress =
    percentages.length > 0
      ? percentages.reduce(
          (sum, value) =>
            sum + value,
          0
        ) / percentages.length
      : 0;

  const firstOverdueAssignment =
    overdueAssignments[0];

  /*
   * STEP 3:
   * Build reminder message.
   */

  const templateFilename =
    templateFiles[reminderType];

  const templatePath =
    path.join(
      templatesDir,
      templateFilename
    );

  if (!fs.existsSync(templatePath)) {
    throw new Error(
      `Reminder template was not found: ${templatePath}`
    );
  }

  const template =
    fs.readFileSync(
      templatePath,
      "utf8"
    );

  const templateValues = {
    studentId,

    studentName,

    completedAssignments:
      completedAssignments.length,

    totalAssignments:
      relevantAssignments.length,

    progressPercentage:
      Number(
        averageProgress.toFixed(1)
      ),

    overdueAssignments:
      overdueAssignments.length,

    assignmentTitle:
      firstOverdueAssignment?.title ||
      "your outstanding assignment",

    assignmentId:
      firstOverdueAssignment?.assignmentId ||
      "",

    deadline:
      firstOverdueAssignment?.deadline ||
      "",
  };

  const message =
    replaceTemplateValues(
      template,
      templateValues
    );

  /*
   * STEP 4:
   * Deliver using centralized Telegram service.
   */

  console.log(
    `Sending ${reminderType} to ${studentId}...`
  );

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

  /*
   * STEP 5:
   * Only save history AFTER successful delivery.
   */

  history.push({
    studentId,

    type:
      reminderType,

    sentAt:
      new Date().toISOString(),
  });

  saveHistory(history);

  console.log(
    `${reminderType} sent successfully for ${studentId}.`
  );

  console.log(
    "Notification history updated."
  );

  if (delivery.stdout) {
    console.log(
      delivery.stdout
    );
  }
} catch (error) {
  console.error(
    `Telegram reminder failed: ${error.message}`
  );

  process.exit(1);
}