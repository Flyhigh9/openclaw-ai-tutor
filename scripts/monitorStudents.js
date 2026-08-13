require("dotenv").config({
  quiet: true,
  override: true,
});

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const projectRoot = path.resolve(__dirname, "..");
const studentsFile = path.join(projectRoot, "data", "students.json");

function loadStudents() {
  if (!fs.existsSync(studentsFile)) {
    throw new Error("students.json was not found.");
  }

  const data = JSON.parse(fs.readFileSync(studentsFile, "utf8"));

  if (!Array.isArray(data)) {
    throw new Error("students.json must contain an array.");
  }

  return data;
}

function getStudentId(student) {
  return student.studentId || student.id;
}

function runAutoReminder(studentId) {
  const scriptPath = path.join(
    projectRoot,
    "scripts",
    "autoReminder.js"
  );

  console.log("\n--------------------------------");
  console.log(`Monitoring ${studentId}`);
  console.log("--------------------------------");

  const result = spawnSync(
    process.execPath,
    [scriptPath, studentId],
    {
      cwd: projectRoot,
      stdio: "inherit",
      env: process.env,
    }
  );

  if (result.error) {
    console.error(
      `Could not monitor ${studentId}: ${result.error.message}`
    );

    return false;
  }

  if (result.status !== 0) {
    console.error(
      `Monitoring failed for ${studentId}.`
    );

    return false;
  }

  return true;
}

try {
  const students = loadStudents();

  console.log("AI Tutor Student Monitor");
  console.log("========================");

  console.log(`Students found: ${students.length}`);

  let successful = 0;
  let failed = 0;

  for (const student of students) {
    const studentId = getStudentId(student);

    if (!studentId) {
      console.error(
        "\nSkipping student because no studentId was found."
      );

      failed++;
      continue;
    }

    const success = runAutoReminder(studentId);

    if (success) {
      successful++;
    } else {
      failed++;
    }
  }

  console.log("\n========================");
  console.log("Monitoring completed");
  console.log("========================");

  console.log(`Successful: ${successful}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total: ${students.length}`);

  if (failed > 0) {
    process.exitCode = 1;
  }
} catch (error) {
  console.error(`Monitor failed: ${error.message}`);
  process.exit(1);
}