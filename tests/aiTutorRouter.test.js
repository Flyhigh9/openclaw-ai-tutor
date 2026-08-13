import {
  describe,
  it,
  expect,
} from "vitest";

import { createRequire } from "module";

const require =
  createRequire(import.meta.url);

const path = require("path");
const { spawnSync } = require("child_process");

const projectRoot = path.resolve(
  process.cwd()
);

const aiTutorPath = path.join(
  projectRoot,
  "scripts",
  "aiTutor.js"
);

function runRouter(args = []) {
  return spawnSync(
    process.execPath,
    [aiTutorPath, ...args],
    {
      cwd: projectRoot,
      encoding: "utf8",
      env: process.env,
    }
  );
}

describe("aiTutor.js command router", () => {
  it("rejects an unknown operation", () => {
    const result = runRouter([
      "unknown-command",
      "S101",
    ]);

    expect(result.status).not.toBe(0);

    expect(result.stderr).toContain(
      "Unknown operation"
    );
  });

  it("requires a student ID for student-specific operations", () => {
    const result = runRouter([
      "analyze",
    ]);

    expect(result.status).not.toBe(0);

    expect(result.stderr).toContain(
      "A student ID is required"
    );
  });

  it("rejects an invalid student ID format", () => {
    const result = runRouter([
      "analyze",
      "ABC",
    ]);

    expect(result.status).not.toBe(0);

    expect(result.stderr).toContain(
      "Invalid student ID"
    );
  });

  it("successfully routes the analyze operation", () => {
    const result = runRouter([
      "analyze",
      "S101",
    ]);

    expect(result.status).toBe(0);

    expect(result.stdout).toContain(
      "Running analyzeStudent.js S101"
    );

    expect(result.stdout).toContain(
      "AI Tutor operation completed successfully"
    );
  });

  it("rejects an unsupported report type", () => {
    const result = runRouter([
      "report",
      "S101",
      "weeklyEncouragement",
    ]);

    expect(result.status).not.toBe(0);

    expect(result.stderr).toContain(
      "Unsupported report type"
    );
  });

  it("rejects an unsupported reminder type", () => {
    const result = runRouter([
      "remind",
      "S101",
      "feedback",
    ]);

    expect(result.status).not.toBe(0);

    expect(result.stderr).toContain(
      "Unsupported reminder type"
    );
  });

  it("allows monitor without a student ID", () => {
    const result = runRouter([
      "monitor",
      "EXTRA_ARGUMENT",
    ]);

    expect(result.status).not.toBe(0);

    expect(
      `${result.stdout}${result.stderr}`
    ).toContain(
      "monitor operation does not accept additional arguments"
    );
  });

  it("allows snapshot without a student ID", () => {
    const result = runRouter([
      "snapshot",
      "EXTRA_ARGUMENT",
    ]);

    expect(result.status).not.toBe(0);

    expect(
      `${result.stdout}${result.stderr}`
    ).toContain(
      "snapshot operation does not accept additional arguments"
    );
  });

  it("requires a student ID for trend", () => {
    const result = runRouter([
      "trend",
    ]);

    expect(result.status).not.toBe(0);

    expect(result.stderr).toContain(
      "A student ID is required"
    );
  });

  it("rejects extra arguments for analyze", () => {
    const result = runRouter([
      "analyze",
      "S101",
      "extra",
    ]);

    expect(result.status).not.toBe(0);

    expect(result.stderr).toContain(
      "analyze operation only accepts a student ID"
    );
  });
});