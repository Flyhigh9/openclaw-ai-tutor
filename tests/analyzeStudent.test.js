import { describe, it, expect } from "vitest";

import { createRequire } from "module";

const require = createRequire(import.meta.url);

const { spawnSync } = require("child_process");
const path = require("path");
const { fileURLToPath } = require("url");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, "..");

function runAnalysis(studentId) {
  const scriptPath = path.join(
    projectRoot,
    "scripts",
    "analyzeStudent.js"
  );

  return spawnSync(
    process.execPath,
    [scriptPath, studentId],
    {
      cwd: projectRoot,
      encoding: "utf8",
      env: process.env,
    }
  );
}

function extractJsonResult(stdout) {
  const marker = "JSON result:";
  const markerIndex = stdout.indexOf(marker);

  if (markerIndex === -1) {
    throw new Error(
      "JSON result marker was not found in analyzeStudent.js output."
    );
  }

  const jsonText = stdout
    .slice(markerIndex + marker.length)
    .trim();

  return JSON.parse(jsonText);
}

describe("analyzeStudent.js", () => {
  it("successfully analyzes a valid student", () => {
    const result = runAnalysis("S101");

    expect(result.status).toBe(0);

    const analysis = extractJsonResult(
      result.stdout
    );

    expect(analysis.studentId).toBe("S101");

    expect(
      typeof analysis.averageProgress
    ).toBe("number");

    expect([
      "LOW",
      "MEDIUM",
      "HIGH",
    ]).toContain(
      analysis.riskLevel
    );
  });

  it("returns a risk level and recommended notification", () => {
    const result = runAnalysis("S102");

    expect(result.status).toBe(0);

    const analysis = extractJsonResult(
      result.stdout
    );

    expect([
      "LOW",
      "MEDIUM",
      "HIGH",
    ]).toContain(
      analysis.riskLevel
    );

    expect([
      "weeklyEncouragement",
      "assignmentReminder",
      "progressWarning",
    ]).toContain(
      analysis.recommendedNotification
    );
  });

  it("returns assignment statistics", () => {
    const result = runAnalysis("S102");

    expect(result.status).toBe(0);

    const analysis = extractJsonResult(
      result.stdout
    );

    expect(
      typeof analysis.completedAssignments
    ).toBe("number");

    expect(
      typeof analysis.overdueAssignments
    ).toBe("number");

    expect(
      typeof analysis.upcomingAssignments
    ).toBe("number");

    expect(
      analysis.completedAssignments
    ).toBeGreaterThanOrEqual(0);

    expect(
      analysis.overdueAssignments
    ).toBeGreaterThanOrEqual(0);

    expect(
      analysis.upcomingAssignments
    ).toBeGreaterThanOrEqual(0);
  });

  it("returns assignment ID arrays", () => {
    const result = runAnalysis("S101");

    expect(result.status).toBe(0);

    const analysis = extractJsonResult(
      result.stdout
    );

    expect(
      Array.isArray(
        analysis.overdueAssignmentIds
      )
    ).toBe(true);

    expect(
      Array.isArray(
        analysis.upcomingAssignmentIds
      )
    ).toBe(true);
  });

  it("fails for an unknown student", () => {
    const result = runAnalysis("S999");

    expect(result.status).not.toBe(0);

    expect(
      result.stderr
    ).toContain(
      "Student S999 was not found"
    );
  });

  it("fails when no student ID is provided", () => {
    const scriptPath = path.join(
      projectRoot,
      "scripts",
      "analyzeStudent.js"
    );

    const result = spawnSync(
      process.execPath,
      [scriptPath],
      {
        cwd: projectRoot,
        encoding: "utf8",
        env: process.env,
      }
    );

    expect(result.status).not.toBe(0);

    expect(
      result.stderr
    ).toContain(
      "Usage: node scripts/analyzeStudent.js"
    );
  });
});