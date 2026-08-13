const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const projectRoot = path.resolve(__dirname, "..");
const dataDir = path.join(projectRoot, "data");
const reportsDir = path.join(projectRoot, "reports");

function loadJson(filename) {
  const filePath = path.join(dataDir, filename);

  if (!fs.existsSync(filePath)) {
    return [];
  }

  const content = fs.readFileSync(filePath, "utf8").trim();

  if (!content) {
    return [];
  }

  return JSON.parse(content);
}

function analyzeStudent(studentId) {
  const scriptPath = path.join(
    projectRoot,
    "scripts",
    "analyzeStudent.js"
  );

  const result = spawnSync(
    process.execPath,
    [scriptPath, studentId],
    {
      cwd: projectRoot,
      encoding: "utf8",
      env: process.env,
    }
  );

  if (result.error) {
    throw new Error(
      `Could not analyze ${studentId}: ${result.error.message}`
    );
  }

  if (result.status !== 0) {
    throw new Error(
      result.stderr ||
        `Analysis failed for ${studentId}`
    );
  }

  const marker = "JSON result:";
  const markerIndex = result.stdout.indexOf(marker);

  if (markerIndex === -1) {
    throw new Error(
      `JSON result not found for ${studentId}`
    );
  }

  return JSON.parse(
    result.stdout
      .slice(markerIndex + marker.length)
      .trim()
  );
}

function getLatestTrend(studentId) {
  const history = loadJson("progressHistory.json");

  const records = history
    .filter(
      (entry) => entry.studentId === studentId
    )
    .sort(
      (a, b) =>
        new Date(a.recordedAt) -
        new Date(b.recordedAt)
    );

  if (records.length < 2) {
    return {
      trend: "NOT ENOUGH HISTORY",
      progressChange: null,
    };
  }

  const previous = records[records.length - 2];
  const current = records[records.length - 1];

  const progressChange =
    current.averageProgress -
    previous.averageProgress;

  const overdueChange =
    current.overdueAssignments -
    previous.overdueAssignments;

  let trend = "STABLE";

  if (
    progressChange >= 5 ||
    overdueChange < 0
  ) {
    trend = "IMPROVING";
  }

  if (
    progressChange <= -5 ||
    overdueChange > 0
  ) {
    trend = "DECLINING";
  }

  return {
    trend,
    progressChange,
  };
}

function getRecentNotificationStats() {
  const history = loadJson(
    "notificationHistory.json"
  );

  const sevenDaysAgo =
    Date.now() -
    7 * 24 * 60 * 60 * 1000;

  const recent = history.filter(
    (entry) => {
      const time =
        new Date(entry.sentAt).getTime();

      return (
        Number.isFinite(time) &&
        time >= sevenDaysAgo
      );
    }
  );

  const byType = {
    assignmentReminder: 0,
    progressWarning: 0,
    weeklyEncouragement: 0,
  };

  for (const entry of recent) {
    if (
      Object.prototype.hasOwnProperty.call(
        byType,
        entry.type
      )
    ) {
      byType[entry.type] += 1;
    }
  }

  return {
    total: recent.length,
    byType,
  };
}

function formatAttentionStudent(student) {
  const reasons = [];

  if (student.riskLevel === "HIGH") {
    reasons.push("HIGH risk");
  }

  if (student.trend === "DECLINING") {
    reasons.push("declining progress");
  }

  if (student.overdueAssignments > 0) {
    reasons.push(
      `${student.overdueAssignments} overdue assignment(s)`
    );
  }

  return `- ${student.studentName} (${student.studentId}): ${reasons.join(
    ", "
  )}`;
}

try {
  const students = loadJson("students.json");

  if (!students.length) {
    throw new Error(
      "No students were found."
    );
  }

  const summaries = [];

  for (const student of students) {
    const analysis =
      analyzeStudent(student.studentId);

    const trend =
      getLatestTrend(student.studentId);

    summaries.push({
      ...analysis,
      ...trend,
    });
  }

  const highRisk = summaries.filter(
    (student) =>
      student.riskLevel === "HIGH"
  );

  const mediumRisk = summaries.filter(
    (student) =>
      student.riskLevel === "MEDIUM"
  );

  const lowRisk = summaries.filter(
    (student) =>
      student.riskLevel === "LOW"
  );

  const improving = summaries.filter(
    (student) =>
      student.trend === "IMPROVING"
  );

  const stable = summaries.filter(
    (student) =>
      student.trend === "STABLE"
  );

  const declining = summaries.filter(
    (student) =>
      student.trend === "DECLINING"
  );

  const noHistory = summaries.filter(
    (student) =>
      student.trend ===
      "NOT ENOUGH HISTORY"
  );

  const averageProgress =
    summaries.reduce(
      (sum, student) =>
        sum + student.averageProgress,
      0
    ) / summaries.length;

  const totalOverdue =
    summaries.reduce(
      (sum, student) =>
        sum + student.overdueAssignments,
      0
    );

  const needsAttention =
    summaries.filter(
      (student) =>
        student.riskLevel === "HIGH" ||
        student.trend === "DECLINING" ||
        student.overdueAssignments > 0
    );

  const notificationStats =
    getRecentNotificationStats();

  const report = [
    "# Weekly AI Tutor Summary",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",

    "## Classroom Overview",
    "",
    `Students analysed: ${summaries.length}`,
    `Average progress: ${averageProgress.toFixed(1)}%`,
    `Total overdue assignments: ${totalOverdue}`,
    "",

    "## Risk Overview",
    "",
    `HIGH: ${highRisk.length}`,
    `MEDIUM: ${mediumRisk.length}`,
    `LOW: ${lowRisk.length}`,
    "",

    "## Progress Trends",
    "",
    `Improving: ${improving.length}`,
    `Stable: ${stable.length}`,
    `Declining: ${declining.length}`,
    `Not enough history: ${noHistory.length}`,
    "",

    "## Students Requiring Attention",
    "",
    needsAttention.length > 0
      ? needsAttention
          .map(formatAttentionStudent)
          .join("\n")
      : "No students currently require additional attention.",
    "",

    "## Notifications Sent During the Last 7 Days",
    "",
    `Total notifications: ${notificationStats.total}`,
    `Assignment reminders: ${notificationStats.byType.assignmentReminder}`,
    `Progress warnings: ${notificationStats.byType.progressWarning}`,
    `Weekly encouragements: ${notificationStats.byType.weeklyEncouragement}`,
    "",

    "## Suggested Teacher Actions",
    "",
    highRisk.length > 0
      ? "- Review HIGH-risk students first."
      : "- No HIGH-risk students currently identified.",

    declining.length > 0
      ? "- Review students whose progress is declining."
      : "- No declining trends currently identified.",

    totalOverdue > 0
      ? "- Follow up on overdue assignments."
      : "- No overdue assignments currently require follow-up.",

    "- Continue monitoring student progress during the next week.",
    "",
  ].join("\n");

  fs.mkdirSync(reportsDir, {
    recursive: true,
  });

  const outputPath = path.join(
    reportsDir,
    "teacher-weekly-summary.md"
  );

  fs.writeFileSync(
    outputPath,
    report,
    "utf8"
  );

  console.log(
    `Created: ${outputPath}`
  );

  console.log(
    `Students analysed: ${summaries.length}`
  );

  console.log(
    `High risk: ${highRisk.length}`
  );

  console.log(
    `Medium risk: ${mediumRisk.length}`
  );

  console.log(
    `Low risk: ${lowRisk.length}`
  );

  console.log(
    `Improving: ${improving.length}`
  );

  console.log(
    `Stable: ${stable.length}`
  );

  console.log(
    `Declining: ${declining.length}`
  );

  console.log(
    "Weekly teacher summary generated successfully."
  );
} catch (error) {
  console.error(
    `Weekly summary failed: ${error.message}`
  );

  process.exit(1);
}