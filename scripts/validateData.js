const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "..", "data");

function readJson(fileName) {
  const filePath = path.join(dataDir, fileName);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

const students = readJson("students.json");
const courses = readJson("courses.json");
const assignments = readJson("assignments.json");
const submissions = readJson("submissions.json");
const progress = readJson("progress.json");

const errors = [];

const studentIds = new Set(students.map((s) => s.studentId));
const courseIds = new Set(courses.map((c) => c.courseId));
const assignmentIds = new Set(assignments.map((a) => a.assignmentId));

function checkDuplicates(items, key, label) {
  const seen = new Set();

  for (const item of items) {
    if (seen.has(item[key])) {
      errors.push(`Duplicate ${label}: ${item[key]}`);
    }
    seen.add(item[key]);
  }
}

checkDuplicates(students, "studentId", "studentId");
checkDuplicates(courses, "courseId", "courseId");
checkDuplicates(assignments, "assignmentId", "assignmentId");
checkDuplicates(submissions, "submissionId", "submissionId");

students.forEach((student) => {
  student.courseIds.forEach((courseId) => {
    if (!courseIds.has(courseId)) {
      errors.push(`Student ${student.studentId} has missing course ${courseId}`);
    }
  });
});

assignments.forEach((assignment) => {
  if (!courseIds.has(assignment.courseId)) {
    errors.push(`Assignment ${assignment.assignmentId} has missing course ${assignment.courseId}`);
  }
});

submissions.forEach((submission) => {
  if (!studentIds.has(submission.studentId)) {
    errors.push(`Submission ${submission.submissionId} has missing student ${submission.studentId}`);
  }

  if (!assignmentIds.has(submission.assignmentId)) {
    errors.push(`Submission ${submission.submissionId} has missing assignment ${submission.assignmentId}`);
  }
});

progress.forEach((record) => {
  if (!studentIds.has(record.studentId)) {
    errors.push(`Progress record has missing student ${record.studentId}`);
  }

  if (!courseIds.has(record.courseId)) {
    errors.push(`Progress record has missing course ${record.courseId}`);
  }
});

if (errors.length > 0) {
  console.log("Validation failed:\n");
  errors.forEach((error) => console.log("-", error));
  process.exit(1);
} else {
  console.log("All Week 2 checks passed.");
}