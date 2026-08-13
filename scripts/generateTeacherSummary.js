const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const projectRoot = path.resolve(__dirname, "..");
const dataDir = path.join(projectRoot, "data");
const reportsDir = path.join(projectRoot, "reports");

function loadJson(filename) {
  const filePath = path.join(dataDir, filename);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing data file: ${filename}`);
  }

  const content = fs.readFileSync(filePath, "utf8").trim();

  if (!content) {
    throw new Error(`Data file is empty: ${filename}`);
  }

  return JSON.parse(content);
}

function runJsonScript(scriptName, studentId) {
  const scriptPath = path.join(
    projectRoot,
    "scripts",
    scriptName
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
      `Could not run ${scriptName} for ${studentId}: ${result.error.message}`
    );
  }

  if (result.status !== 0) {
    throw new Error(
      result.stderr ||
        `${scriptName} failed for ${studentId}`
    );
  }

  const marker = "JSON result:";
  const markerIndex = result.stdout.indexOf(marker);

  if (markerIndex === -1) {
    return null;
  }

  const jsonText = result.stdout
    .slice(markerIndex + marker.length)
    .trim();

  return JSON.parse(jsonText);
}

function analyzeStudent(studentId) {
  return runJsonScript(
    "analyzeStudent.js",
    studentId
  );
}

function analyzeTrend(studentId) {
  const scriptPath = path.join(
    projectRoot,
    "scripts",
    "analyzeTrend.js"
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
      `Could not analyse trend for ${studentId}: ${result.error.message}`
    );
  }

  if (result.status !== 0) {
    return {
      trend: "NOT ENOUGH HISTORY",
    };
  }

  const marker = "JSON result:";
  const markerIndex = result.stdout.indexOf(marker);

  if (markerIndex === -1) {
    return {
      trend: "NOT ENOUGH HISTORY",
    };
  }

  const jsonText = result.stdout
    .slice(markerIndex + marker.length)
    .trim();

  try {
    return JSON.parse(jsonText);
  } catch {
    return {
      trend: "NOT ENOUGH HISTORY",
    };
  }
}

function formatStudentLine(student) {
  const lines = [
    `- ${student.studentName} (${student.studentId})`,
    `  Progress: ${student.averageProgress}%`,
    `  Overdue assignments: ${student.overdueAssignments}`,
    `  Risk: ${student.riskLevel}`,
    `  Trend: ${student.trend}`,
  ];

  if (
    typeof student.progressChange === "number"
  ) {
    const sign =
      student.progressChange > 0 ? "+" : "";

    lines.push(
      `  Progress change: ${sign}${student.progressChange}%`
    );
  }

  lines.push(
    `  Recommended action: ${student.recommendedNotification}`
  );

  return lines.join("\n");
}

try {
  const students = loadJson("students.json");

  const studentSummaries = [];

  for (const student of students) {
    const studentId = student.studentId;

    const analysis =
      analyzeStudent(studentId);

    const trendResult =
      analyzeTrend(studentId);

    studentSummaries.push({
      ...analysis,

      trend:
        trendResult?.trend ||
        "NOT ENOUGH HISTORY",

      progressChange:
        trendResult?.progressChange,

      previousProgress:
        trendResult?.previousProgress,

      currentProgress:
        trendResult?.currentProgress,

      previousRisk:
        trendResult?.previousRisk,

      currentRisk:
        trendResult?.currentRisk,
    });
  }

  const highRisk = studentSummaries.filter(
    (student) =>
      student.riskLevel === "HIGH"
  );

  const mediumRisk = studentSummaries.filter(
    (student) =>
      student.riskLevel === "MEDIUM"
  );

  const lowRisk = studentSummaries.filter(
    (student) =>
      student.riskLevel === "LOW"
  );

  const improving = studentSummaries.filter(
    (student) =>
      student.trend === "IMPROVING"
  );

  const stable = studentSummaries.filter(
    (student) =>
      student.trend === "STABLE"
  );

  const declining = studentSummaries.filter(
    (student) =>
      student.trend === "DECLINING"
  );

  const insufficientHistory =
    studentSummaries.filter(
      (student) =>
        student.trend ===
        "NOT ENOUGH HISTORY"
    );

  const averageProgress =
    studentSummaries.length > 0
      ? studentSummaries.reduce(
          (sum, student) =>
            sum +
            student.averageProgress,
          0
        ) / studentSummaries.length
      : 0;

  const totalOverdue =
    studentSummaries.reduce(
      (sum, student) =>
        sum +
        student.overdueAssignments,
      0
    );

  const report = [
    "# Daily AI Tutor Teacher Summary",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",

    "## Classroom Overview",
    "",
    `- Students analysed: ${studentSummaries.length}`,
    `- Average progress: ${averageProgress.toFixed(1)}%`,
    `- High-risk students: ${highRisk.length}`,
    `- Medium-risk students: ${mediumRisk.length}`,
    `- Low-risk students: ${lowRisk.length}`,
    `- Total overdue assignments: ${totalOverdue}`,
    "",

    "## Progress Trends",
    "",
    `- Improving: ${improving.length}`,
    `- Stable: ${stable.length}`,
    `- Declining: ${declining.length}`,
    `- Not enough history: ${insufficientHistory.length}`,
    "",

    "## Declining Students",
    "",
    declining.length > 0
      ? declining
          .map(formatStudentLine)
          .join("\n\n")
      : "No declining students were identified.",
    "",

    "## Improving Students",
    "",
    improving.length > 0
      ? improving
          .map(formatStudentLine)
          .join("\n\n")
      : "No improving students were identified.",
    "",

    "## Stable Students",
    "",
    stable.length > 0
      ? stable
          .map(formatStudentLine)
          .join("\n\n")
      : "No stable students were identified.",
    "",

    "## Students Without Enough Trend History",
    "",
    insufficientHistory.length > 0
      ? insufficientHistory
          .map(formatStudentLine)
          .join("\n\n")
      : "All students have enough progress history.",
    "",

    "## High-Risk Students",
    "",
    highRisk.length > 0
      ? highRisk
          .map(formatStudentLine)
          .join("\n\n")
      : "No high-risk students were identified.",
    "",

    "## Medium-Risk Students",
    "",
    mediumRisk.length > 0
      ? mediumRisk
          .map(formatStudentLine)
          .join("\n\n")
      : "No medium-risk students were identified.",
    "",

    "## Low-Risk Students",
    "",
    lowRisk.length > 0
      ? lowRisk
          .map(formatStudentLine)
          .join("\n\n")
      : "No low-risk students were identified.",
    "",

    "## Recommended Teacher Priorities",
    "",

    declining.length > 0
      ? "1. Review students whose progress trend is declining."
      : "1. No students currently show a declining progress trend.",

    highRisk.length > 0
      ? "2. Contact high-risk students and review their overdue work."
      : "2. No urgent high-risk intervention is currently required.",

    mediumRisk.length > 0
      ? "3. Monitor medium-risk students and encourage assignment completion."
      : "3. Continue normal progress monitoring.",

    improving.length > 0
      ? "4. Reinforce positive progress among improving students."
      : "4. Continue monitoring for future improvement.",

    "",
  ].join("\n");

  fs.mkdirSync(reportsDir, {
    recursive: true,
  });

  const outputPath = path.join(
    reportsDir,
    "teacher-daily-summary.md"
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
    `Students analysed: ${studentSummaries.length}`
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
    `Not enough history: ${insufficientHistory.length}`
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
    "Teacher summary generated successfully."
  );
} catch (error) {
  console.error(
    `Teacher summary failed: ${error.message}`
  );

  process.exit(1);
}