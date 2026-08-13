const fs = require("fs");
const path = require("path");

const {
  assessRisk,
} = require("../src/services/riskAssessment");

const projectRoot = path.resolve(__dirname, "..");
const dataDir = path.join(projectRoot, "data");

const studentId = process.argv[2];

if (!studentId) {
  console.error(
    "Usage: node scripts/analyzeStudent.js <studentId>"
  );
  process.exit(1);
}

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

try {
  const students = loadJson("students.json");
  const assignments = loadJson("assignments.json");
  const submissions = loadJson("submissions.json");
  const progressRecords = loadJson("progress.json");

  const student = students.find(
    (item) => item.studentId === studentId
  );

  if (!student) {
    throw new Error(`Student ${studentId} was not found.`);
  }

  const studentProgress = progressRecords.filter(
    (item) => item.studentId === studentId
  );

  const studentSubmissions = submissions.filter(
    (item) => item.studentId === studentId
  );

  const submittedAssignmentIds = new Set(
    studentSubmissions.map(
      (item) => item.assignmentId
    )
  );

  const completedAssignments =
    submittedAssignmentIds.size;

  const relevantCourseIds = new Set(
    studentProgress.map(
      (item) => item.courseId
    )
  );

  const relevantAssignments = assignments.filter(
    (assignment) =>
      relevantCourseIds.has(assignment.courseId)
  );

  const now = new Date();

  const unsubmittedAssignments =
    relevantAssignments.filter(
      (assignment) =>
        !submittedAssignmentIds.has(
          assignment.assignmentId
        )
    );

  const overdueAssignments =
    unsubmittedAssignments.filter(
      (assignment) => {
        if (!assignment.deadline) {
          return false;
        }

        const deadline = new Date(
          `${assignment.deadline}T23:59:59`
        );

        return (
          !Number.isNaN(deadline.getTime()) &&
          deadline < now
        );
      }
    );

  const upcomingAssignments =
    unsubmittedAssignments.filter(
      (assignment) => {
        if (!assignment.deadline) {
          return false;
        }

        const deadline = new Date(
          `${assignment.deadline}T23:59:59`
        );

        return (
          !Number.isNaN(deadline.getTime()) &&
          deadline >= now
        );
      }
    );

  const assignmentsWithoutDeadline =
    unsubmittedAssignments.filter(
      (assignment) =>
        !assignment.deadline ||
        Number.isNaN(
          new Date(
            `${assignment.deadline}T23:59:59`
          ).getTime()
        )
    );

  const percentages = studentProgress
    .map((item) =>
      Number(item.progressPercentage)
    )
    .filter((value) =>
      Number.isFinite(value)
    );

  const averageProgress =
    percentages.length > 0
      ? percentages.reduce(
          (sum, value) => sum + value,
          0
        ) / percentages.length
      : 0;

  const {
  riskLevel,
  recommendedNotification,
  } = assessRisk({
  averageProgress,
  overdueAssignments:
    overdueAssignments.length,
  });

  const analysis = {
    studentId,

    studentName:
      student.name ||
      student.fullName ||
      "Unknown student",

    averageProgress: Number(
      averageProgress.toFixed(1)
    ),

    completedAssignments,

    totalRelevantAssignments:
      relevantAssignments.length,

    unsubmittedAssignments:
      unsubmittedAssignments.length,

    overdueAssignments:
      overdueAssignments.length,

    upcomingAssignments:
      upcomingAssignments.length,

    assignmentsWithoutDeadline:
      assignmentsWithoutDeadline.length,

    overdueAssignmentIds:
      overdueAssignments.map(
        (assignment) =>
          assignment.assignmentId
      ),

    upcomingAssignmentIds:
      upcomingAssignments.map(
        (assignment) =>
          assignment.assignmentId
      ),

    riskLevel,

    recommendedNotification,
  };

  console.log("\nStudent Analysis");
  console.log("================");

  console.log(
    `Student: ${analysis.studentName} (${analysis.studentId})`
  );

  console.log(
    `Average progress: ${analysis.averageProgress}%`
  );

  console.log(
    `Completed assignments: ${analysis.completedAssignments}`
  );

  console.log(
    `Total relevant assignments: ${analysis.totalRelevantAssignments}`
  );

  console.log(
    `Unsubmitted assignments: ${analysis.unsubmittedAssignments}`
  );

  console.log(
    `Overdue assignments: ${analysis.overdueAssignments}`
  );

  console.log(
    `Upcoming assignments: ${analysis.upcomingAssignments}`
  );

  if (
    analysis.assignmentsWithoutDeadline > 0
  ) {
    console.log(
      `Assignments without valid deadlines: ${analysis.assignmentsWithoutDeadline}`
    );
  }

  console.log(
    `Risk level: ${analysis.riskLevel}`
  );

  console.log(
    `Recommended notification: ${analysis.recommendedNotification}`
  );

  console.log("\nJSON result:");
  console.log(
    JSON.stringify(analysis, null, 2)
  );
} catch (error) {
  console.error(
    `Analysis failed: ${error.message}`
  );

  process.exit(1);
}