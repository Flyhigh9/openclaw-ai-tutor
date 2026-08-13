const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(
  __dirname,
  ".."
);

const historyFile = path.join(
  projectRoot,
  "data",
  "progressHistory.json"
);

const studentId =
  process.argv[2];

if (!studentId) {
  console.error(
    "Usage: node scripts/analyzeTrend.js <studentId>"
  );

  process.exit(1);
}

if (!/^S\d+$/i.test(studentId)) {
  console.error(
    `Invalid student ID: ${studentId}`
  );

  process.exit(1);
}

function loadHistory() {
  if (!fs.existsSync(historyFile)) {
    throw new Error(
      "progressHistory.json was not found."
    );
  }

  const content = fs
    .readFileSync(historyFile, "utf8")
    .trim();

  if (!content) {
    return [];
  }

  const history =
    JSON.parse(content);

  if (!Array.isArray(history)) {
    throw new Error(
      "progressHistory.json must contain an array."
    );
  }

  return history;
}

function determineTrend(
  previous,
  current
) {
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
    overdueChange,
  };
}

try {
  const history =
    loadHistory();

  const studentHistory =
    history
      .filter(
        (entry) =>
          entry.studentId ===
          studentId
      )
      .sort(
        (a, b) =>
          new Date(
            a.recordedAt
          ) -
          new Date(
            b.recordedAt
          )
      );

  if (
    studentHistory.length === 0
  ) {
    throw new Error(
      `No progress history found for ${studentId}.`
    );
  }

  const current =
    studentHistory[
      studentHistory.length - 1
    ];

  console.log(
    "\nStudent Progress Trend"
  );

  console.log(
    "======================"
  );

  console.log(
    `Student: ${current.studentName} (${studentId})`
  );

  if (
    studentHistory.length < 2
  ) {
    console.log(
      `Current progress: ${current.averageProgress}%`
    );

    console.log(
      `Current risk: ${current.riskLevel}`
    );

    console.log("");
    console.log(
      "Trend: NOT ENOUGH HISTORY"
    );

    console.log(
      "At least two daily snapshots are required."
    );

    process.exit(0);
  }

  const previous =
    studentHistory[
      studentHistory.length - 2
    ];

  const result =
    determineTrend(
      previous,
      current
    );

  console.log(
    `Previous date: ${previous.date}`
  );

  console.log(
    `Current date: ${current.date}`
  );

  console.log("");

  console.log(
    `Previous progress: ${previous.averageProgress}%`
  );

  console.log(
    `Current progress: ${current.averageProgress}%`
  );

  const progressPrefix =
    result.progressChange > 0
      ? "+"
      : "";

  console.log(
    `Progress change: ${progressPrefix}${result.progressChange}%`
  );

  console.log("");

  console.log(
    `Previous overdue assignments: ${previous.overdueAssignments}`
  );

  console.log(
    `Current overdue assignments: ${current.overdueAssignments}`
  );

  console.log(
    `Overdue change: ${result.overdueChange}`
  );

  console.log("");

  console.log(
    `Previous risk: ${previous.riskLevel}`
  );

  console.log(
    `Current risk: ${current.riskLevel}`
  );

  console.log("");

  console.log(
    `Trend: ${result.trend}`
  );

  const trendResult = {
    studentId,

    studentName:
      current.studentName,

    previousDate:
      previous.date,

    currentDate:
      current.date,

    previousProgress:
      previous.averageProgress,

    currentProgress:
      current.averageProgress,

    progressChange:
      result.progressChange,

    previousOverdueAssignments:
      previous.overdueAssignments,

    currentOverdueAssignments:
      current.overdueAssignments,

    overdueChange:
      result.overdueChange,

    previousRisk:
      previous.riskLevel,

    currentRisk:
      current.riskLevel,

    trend:
      result.trend,
  };

  console.log("");
  console.log("JSON result:");

  console.log(
    JSON.stringify(
      trendResult,
      null,
      2
    )
  );
} catch (error) {
  console.error(
    `Trend analysis failed: ${error.message}`
  );

  process.exit(1);
}