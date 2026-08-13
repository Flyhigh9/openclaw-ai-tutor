const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const projectRoot = path.resolve(__dirname, "..");

const dataDir = path.join(
  projectRoot,
  "data"
);

const historyFile = path.join(
  dataDir,
  "progressHistory.json"
);

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
    throw new Error(
      `Data file is empty: ${filename}`
    );
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
      "progressHistory.json must contain an array."
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

function getStudentAnalysis(studentId) {
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
        `Student analysis failed for ${studentId}`
    );
  }

  const marker = "JSON result:";

  const markerIndex =
    result.stdout.indexOf(marker);

  if (markerIndex === -1) {
    throw new Error(
      `JSON analysis result was not found for ${studentId}`
    );
  }

  const jsonText = result.stdout
    .slice(
      markerIndex + marker.length
    )
    .trim();

  return JSON.parse(jsonText);
}

function getDateKey(date = new Date()) {
  return date
    .toISOString()
    .slice(0, 10);
}

try {
  const students =
    loadJson("students.json");

  let history = loadHistory();

  const now = new Date();

  const recordedAt =
    now.toISOString();

  const dateKey =
    getDateKey(now);

  let createdCount = 0;
  let updatedCount = 0;

  console.log(
    "AI Tutor Progress Snapshot"
  );

  console.log(
    "=========================="
  );

  for (const student of students) {
    const studentId =
      student.studentId;

    if (!studentId) {
      console.warn(
        "Skipping student without studentId."
      );

      continue;
    }

    const analysis =
      getStudentAnalysis(studentId);

    const snapshot = {
      studentId:
        analysis.studentId,

      studentName:
        analysis.studentName,

      averageProgress:
        analysis.averageProgress,

      completedAssignments:
        analysis.completedAssignments,

      overdueAssignments:
        analysis.overdueAssignments,

      upcomingAssignments:
        analysis.upcomingAssignments,

      riskLevel:
        analysis.riskLevel,

      recommendedNotification:
        analysis.recommendedNotification,

      date:
        dateKey,

      recordedAt,
    };

    const existingIndex =
      history.findIndex(
        (entry) =>
          entry.studentId ===
            studentId &&
          entry.date === dateKey
      );

    if (existingIndex !== -1) {
      history[existingIndex] =
        snapshot;

      updatedCount += 1;

      console.log(
        `Updated today's snapshot for ${studentId}.`
      );
    } else {
      history.push(snapshot);

      createdCount += 1;

      console.log(
        `Saved new snapshot for ${studentId}.`
      );
    }
  }

  history.sort((a, b) =>
    a.recordedAt.localeCompare(
      b.recordedAt
    )
  );

  saveHistory(history);

  console.log("");
  console.log(
    "Progress snapshot completed."
  );

  console.log(
    `New snapshots: ${createdCount}`
  );

  console.log(
    `Updated snapshots: ${updatedCount}`
  );

  console.log(
    `Students processed: ${students.length}`
  );
} catch (error) {
  console.error(
    `Progress snapshot failed: ${error.message}`
  );

  process.exit(1);
}