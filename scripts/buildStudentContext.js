const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const projectRoot = path.resolve(__dirname, "..");
const dataDir = path.join(projectRoot, "data");

const studentId = process.argv[2];

if (!studentId) {
  console.error(
    "Usage: node scripts/buildStudentContext.js <studentId>"
  );
  process.exit(1);
}

function loadJson(filename) {
  const filePath = path.join(dataDir, filename);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing data file: ${filename}`);
  }

  return JSON.parse(
    fs.readFileSync(filePath, "utf8")
  );
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
      `Could not run ${scriptName}: ${result.error.message}`
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

try {
  const students = loadJson("students.json");
  const courses = loadJson("courses.json");
  const assignments = loadJson("assignments.json");
  const submissions = loadJson("submissions.json");
  const progressRecords = loadJson("progress.json");

  const student = students.find(
    (item) => item.studentId === studentId
  );

  if (!student) {
    throw new Error(
      `Student ${studentId} was not found.`
    );
  }

  // Get deterministic analysis
  const analysis = runJsonScript(
    "analyzeStudent.js",
    studentId
  );

  if (!analysis) {
    throw new Error(
      `Could not obtain analysis for ${studentId}.`
    );
  }

  // Get this student's progress records
  const studentProgress = progressRecords.filter(
    (item) => item.studentId === studentId
  );

  // Determine which courses belong to this student
  const courseIds = new Set(
    studentProgress.map(
      (item) => item.courseId
    )
  );

  const studentCourses = courses.filter(
    (course) =>
      courseIds.has(course.courseId)
  );

  // Get assignments belonging to those courses
  const relevantAssignments =
    assignments.filter(
      (assignment) =>
        courseIds.has(
          assignment.courseId
        )
    );

  // Get actual submissions
  const studentSubmissions =
    submissions.filter(
      (submission) =>
        submission.studentId ===
        studentId
    );

  const submittedIds = new Set(
    studentSubmissions.map(
      (submission) =>
        submission.assignmentId
    )
  );

  const now = new Date();

  // Completed assignments
  const completedAssignments =
    relevantAssignments
      .filter((assignment) =>
        submittedIds.has(
          assignment.assignmentId
        )
      )
      .map((assignment) => {
        const submission =
          studentSubmissions.find(
            (item) =>
              item.assignmentId ===
              assignment.assignmentId
          );

        return {
          assignmentId:
            assignment.assignmentId,

          title:
            assignment.title,

          courseId:
            assignment.courseId,

          deadline:
            assignment.deadline,

          score:
            submission?.score ?? null,
        };
      });

  // Overdue assignments
  const overdueAssignments =
    relevantAssignments
      .filter((assignment) => {
        if (
          submittedIds.has(
            assignment.assignmentId
          )
        ) {
          return false;
        }

        if (!assignment.deadline) {
          return false;
        }

        const deadline = new Date(
          `${assignment.deadline}T23:59:59`
        );

        return (
          !Number.isNaN(
            deadline.getTime()
          ) &&
          deadline < now
        );
      })
      .map((assignment) => ({
        assignmentId:
          assignment.assignmentId,

        title:
          assignment.title,

        courseId:
          assignment.courseId,

        deadline:
          assignment.deadline,

        description:
          assignment.description,
      }));

  // Upcoming assignments
  const upcomingAssignments =
    relevantAssignments
      .filter((assignment) => {
        if (
          submittedIds.has(
            assignment.assignmentId
          )
        ) {
          return false;
        }

        if (!assignment.deadline) {
          return false;
        }

        const deadline = new Date(
          `${assignment.deadline}T23:59:59`
        );

        return (
          !Number.isNaN(
            deadline.getTime()
          ) &&
          deadline >= now
        );
      })
      .map((assignment) => ({
        assignmentId:
          assignment.assignmentId,

        title:
          assignment.title,

        courseId:
          assignment.courseId,

        deadline:
          assignment.deadline,

        description:
          assignment.description,
      }));

  // Try to obtain trend data.
  // It is okay if there is not enough history yet.
  let trend = {
    status: "NOT ENOUGH HISTORY",
  };

  try {
    const trendResult =
      runJsonScript(
        "analyzeTrend.js",
        studentId
      );

    if (trendResult) {
      trend = {
        status:
          trendResult.trend,

        previousProgress:
          trendResult.previousProgress,

        currentProgress:
          trendResult.currentProgress,

        progressChange:
          trendResult.progressChange,

        previousRisk:
          trendResult.previousRisk,

        currentRisk:
          trendResult.currentRisk,
      };
    }
  } catch {
    // Trend data is optional until enough
    // daily snapshots are available.
  }

  const context = {
    generatedAt:
      new Date().toISOString(),

    student: {
      studentId:
        student.studentId,

      name:
        student.name ||
        student.fullName ||
        "Unknown student",
    },

    learningStatus: {
      averageProgress:
        analysis.averageProgress,

      riskLevel:
        analysis.riskLevel,

      recommendedNotification:
        analysis.recommendedNotification,
    },

    statistics: {
      completedAssignments:
        completedAssignments.length,

      overdueAssignments:
        overdueAssignments.length,

      upcomingAssignments:
        upcomingAssignments.length,
    },

    courses: studentCourses.map(
      (course) => ({
        courseId:
          course.courseId,

        name:
          course.name ||
          course.courseName ||
          course.title ||
          "Unknown course",
      })
    ),

    assignments: {
      completed:
        completedAssignments,

      overdue:
        overdueAssignments,

      upcoming:
        upcomingAssignments,
    },

    trend,

    aiInstructions: {
      verifiedFactsOnly: true,

      instruction:
        "Use only facts contained in this context. Do not invent grades, teachers, deadlines, courses, assignments, feedback, or student information. If information is unavailable, state that it is unavailable.",
    },
  };

  console.log(
    "\nVerified Student Context"
  );

  console.log(
    "========================"
  );

  console.log(
    JSON.stringify(
      context,
      null,
      2
    )
  );
} catch (error) {
  console.error(
    `Student context failed: ${error.message}`
  );

  process.exit(1);
}