const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const dataDir = path.join(__dirname, "..", "data");
const reportsDir = path.join(__dirname, "..", "reports");

function readJson(fileName) {
  const filePath = path.join(dataDir, fileName);

  if (!fs.existsSync(filePath)) {
    return [];
  }

  const content = fs.readFileSync(filePath, "utf8").trim();

  if (!content) {
    return [];
  }

  return JSON.parse(content);
}

function getStudentTrend(studentId) {
  const history = readJson("progressHistory.json");

  const studentHistory = history
    .filter(
      (entry) =>
        entry.studentId === studentId
    )
    .sort(
      (a, b) =>
        new Date(a.recordedAt) -
        new Date(b.recordedAt)
    );

  if (studentHistory.length === 0) {
    return {
      studentId,
      trend: "NO HISTORY",
      previousProgress: null,
      currentProgress: null,
      progressChange: null,
      previousRisk: null,
      currentRisk: null,
      previousOverdueAssignments: null,
      currentOverdueAssignments: null,
    };
  }

  const current =
    studentHistory[
      studentHistory.length - 1
    ];

  if (studentHistory.length < 2) {
    return {
      studentId,

      trend: "NOT ENOUGH HISTORY",

      previousProgress: null,

      currentProgress:
        current.averageProgress,

      progressChange: null,

      previousRisk: null,

      currentRisk:
        current.riskLevel,

      previousOverdueAssignments: null,

      currentOverdueAssignments:
        current.overdueAssignments,
    };
  }

  const previous =
    studentHistory[
      studentHistory.length - 2
    ];

  const progressChange =
    Number(current.averageProgress) -
    Number(previous.averageProgress);

  const overdueChange =
    Number(current.overdueAssignments) -
    Number(previous.overdueAssignments);

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
    studentId,

    trend,

    previousProgress:
      previous.averageProgress,

    currentProgress:
      current.averageProgress,

    progressChange,

    previousRisk:
      previous.riskLevel,

    currentRisk:
      current.riskLevel,

    previousOverdueAssignments:
      previous.overdueAssignments,

    currentOverdueAssignments:
      current.overdueAssignments,
  };
}

app.get("/", (req, res) => {
  res.json({
    message:
      "OpenClaw AI Tutor Backend is running",

    endpoints: [
      "/students",
      "/courses",
      "/assignments",
      "/submissions",
      "/progress",
      "/students/:studentId/progress",
      "/students/:studentId/trend",
      "/reports/:studentId/:type",
    ],
  });
});

app.get("/students", (req, res) => {
  res.json(
    readJson("students.json")
  );
});

app.get("/courses", (req, res) => {
  res.json(
    readJson("courses.json")
  );
});

app.get("/assignments", (req, res) => {
  res.json(
    readJson("assignments.json")
  );
});

app.get("/submissions", (req, res) => {
  res.json(
    readJson("submissions.json")
  );
});

app.get("/progress", (req, res) => {
  res.json(
    readJson("progress.json")
  );
});

app.get(
  "/students/:studentId/progress",
  (req, res) => {
    const { studentId } = req.params;

    const students =
      readJson("students.json");

    const courses =
      readJson("courses.json");

    const assignments =
      readJson("assignments.json");

    const submissions =
      readJson("submissions.json");

    const progress =
      readJson("progress.json");

    const student =
      students.find(
        (item) =>
          item.studentId === studentId
      );

    if (!student) {
      return res
        .status(404)
        .json({
          error:
            "Student not found",
        });
    }

    const studentProgress =
      progress.filter(
        (item) =>
          item.studentId === studentId
      );

    const studentSubmissions =
      submissions.filter(
        (item) =>
          item.studentId === studentId
      );

    const fullReport = {
      student,

      progress:
        studentProgress,

      submissions:
        studentSubmissions,

      courses,

      assignments,
    };

    res.json(fullReport);
  }
);

app.get(
  "/students/:studentId/trend",
  (req, res) => {
    const { studentId } = req.params;

    const students =
      readJson("students.json");

    const student =
      students.find(
        (item) =>
          item.studentId === studentId
      );

    if (!student) {
      return res
        .status(404)
        .json({
          error:
            "Student not found",
        });
    }

    try {
      const trend =
        getStudentTrend(
          studentId
        );

      res.json(trend);
    } catch (error) {
      console.error(
        "Trend endpoint error:",
        error
      );

      res
        .status(500)
        .json({
          error:
            "Could not calculate student trend",
        });
    }
  }
);

app.get(
  "/reports/:studentId/:type",
  (req, res) => {
    const {
      studentId,
      type,
    } = req.params;

    const allowedTypes = [
      "feedback",
      "teacher-report",
      "assignment-summary",
      "learning-recommendation",
      "learning-coach",
    ];

    if (
      !allowedTypes.includes(
        type
      )
    ) {
      return res
        .status(400)
        .json({
          error:
            "Invalid report type",
        });
    }

    const reportPath =
      path.join(
        reportsDir,
        `${studentId}-${type}.md`
      );

    if (
      !fs.existsSync(
        reportPath
      )
    ) {
      return res
        .status(404)
        .json({
          error:
            "Report not found",
        });
    }

    const reportContent =
      fs.readFileSync(
        reportPath,
        "utf8"
      );

    res.json({
      studentId,
      type,
      content:
        reportContent,
    });
  }
);

app.listen(PORT, () => {
  console.log(
    `AI Tutor backend running at http://localhost:${PORT}`
  );
});