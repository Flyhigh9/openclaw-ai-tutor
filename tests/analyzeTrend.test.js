import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
} from "vitest";

import { createRequire } from "module";

const require =
  createRequire(import.meta.url);

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const projectRoot = path.resolve(
  process.cwd()
);

const historyFile = path.join(
  projectRoot,
  "data",
  "progressHistory.json"
);

let originalHistory = null;

function runTrend(studentId) {
  const scriptPath = path.join(
    projectRoot,
    "scripts",
    "analyzeTrend.js"
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
  const markerIndex =
    stdout.indexOf(marker);

  if (markerIndex === -1) {
    return null;
  }

  return JSON.parse(
    stdout
      .slice(
        markerIndex + marker.length
      )
      .trim()
  );
}

function writeHistory(history) {
  fs.writeFileSync(
    historyFile,
    JSON.stringify(history, null, 2),
    "utf8"
  );
}

describe("analyzeTrend.js", () => {
  beforeEach(() => {
    if (fs.existsSync(historyFile)) {
      originalHistory =
        fs.readFileSync(
          historyFile,
          "utf8"
        );
    } else {
      originalHistory = null;
    }
  });

  afterEach(() => {
    if (originalHistory !== null) {
      fs.writeFileSync(
        historyFile,
        originalHistory,
        "utf8"
      );
    } else if (
      fs.existsSync(historyFile)
    ) {
      fs.unlinkSync(historyFile);
    }
  });

  it("reports IMPROVING when progress increases by at least 5 percent", () => {
    writeHistory([
      {
        studentId: "S900",
        studentName: "Test Student",
        averageProgress: 40,
        overdueAssignments: 1,
        riskLevel: "MEDIUM",
        date: "2026-08-01",
        recordedAt:
          "2026-08-01T08:00:00.000Z",
      },
      {
        studentId: "S900",
        studentName: "Test Student",
        averageProgress: 50,
        overdueAssignments: 1,
        riskLevel: "MEDIUM",
        date: "2026-08-02",
        recordedAt:
          "2026-08-02T08:00:00.000Z",
      },
    ]);

    const result =
      runTrend("S900");

    expect(result.status).toBe(0);

    const trend =
      extractJsonResult(
        result.stdout
      );

    expect(trend.trend).toBe(
      "IMPROVING"
    );

    expect(
      trend.progressChange
    ).toBe(10);
  });

  it("reports IMPROVING when overdue assignments decrease", () => {
    writeHistory([
      {
        studentId: "S900",
        studentName: "Test Student",
        averageProgress: 60,
        overdueAssignments: 2,
        riskLevel: "HIGH",
        date: "2026-08-01",
        recordedAt:
          "2026-08-01T08:00:00.000Z",
      },
      {
        studentId: "S900",
        studentName: "Test Student",
        averageProgress: 60,
        overdueAssignments: 1,
        riskLevel: "MEDIUM",
        date: "2026-08-02",
        recordedAt:
          "2026-08-02T08:00:00.000Z",
      },
    ]);

    const result =
      runTrend("S900");

    expect(result.status).toBe(0);

    const trend =
      extractJsonResult(
        result.stdout
      );

    expect(trend.trend).toBe(
      "IMPROVING"
    );

    expect(
      trend.overdueChange
    ).toBe(-1);
  });

  it("reports DECLINING when progress decreases by at least 5 percent", () => {
    writeHistory([
      {
        studentId: "S900",
        studentName: "Test Student",
        averageProgress: 70,
        overdueAssignments: 0,
        riskLevel: "MEDIUM",
        date: "2026-08-01",
        recordedAt:
          "2026-08-01T08:00:00.000Z",
      },
      {
        studentId: "S900",
        studentName: "Test Student",
        averageProgress: 60,
        overdueAssignments: 0,
        riskLevel: "MEDIUM",
        date: "2026-08-02",
        recordedAt:
          "2026-08-02T08:00:00.000Z",
      },
    ]);

    const result =
      runTrend("S900");

    expect(result.status).toBe(0);

    const trend =
      extractJsonResult(
        result.stdout
      );

    expect(trend.trend).toBe(
      "DECLINING"
    );

    expect(
      trend.progressChange
    ).toBe(-10);
  });

  it("reports DECLINING when overdue assignments increase", () => {
    writeHistory([
      {
        studentId: "S900",
        studentName: "Test Student",
        averageProgress: 60,
        overdueAssignments: 0,
        riskLevel: "MEDIUM",
        date: "2026-08-01",
        recordedAt:
          "2026-08-01T08:00:00.000Z",
      },
      {
        studentId: "S900",
        studentName: "Test Student",
        averageProgress: 60,
        overdueAssignments: 1,
        riskLevel: "MEDIUM",
        date: "2026-08-02",
        recordedAt:
          "2026-08-02T08:00:00.000Z",
      },
    ]);

    const result =
      runTrend("S900");

    expect(result.status).toBe(0);

    const trend =
      extractJsonResult(
        result.stdout
      );

    expect(trend.trend).toBe(
      "DECLINING"
    );

    expect(
      trend.overdueChange
    ).toBe(1);
  });

  it("reports STABLE when changes are small", () => {
    writeHistory([
      {
        studentId: "S900",
        studentName: "Test Student",
        averageProgress: 60,
        overdueAssignments: 1,
        riskLevel: "MEDIUM",
        date: "2026-08-01",
        recordedAt:
          "2026-08-01T08:00:00.000Z",
      },
      {
        studentId: "S900",
        studentName: "Test Student",
        averageProgress: 62,
        overdueAssignments: 1,
        riskLevel: "MEDIUM",
        date: "2026-08-02",
        recordedAt:
          "2026-08-02T08:00:00.000Z",
      },
    ]);

    const result =
      runTrend("S900");

    expect(result.status).toBe(0);

    const trend =
      extractJsonResult(
        result.stdout
      );

    expect(trend.trend).toBe(
      "STABLE"
    );
  });

  it("reports not enough history when only one snapshot exists", () => {
    writeHistory([
      {
        studentId: "S900",
        studentName: "Test Student",
        averageProgress: 60,
        overdueAssignments: 1,
        riskLevel: "MEDIUM",
        date: "2026-08-01",
        recordedAt:
          "2026-08-01T08:00:00.000Z",
      },
    ]);

    const result =
      runTrend("S900");

    expect(result.status).toBe(0);

    expect(
      result.stdout
    ).toContain(
      "NOT ENOUGH HISTORY"
    );
  });

  it("fails for a student with no history", () => {
    writeHistory([]);

    const result =
      runTrend("S999");

    expect(result.status).not.toBe(0);

    expect(
      result.stderr
    ).toContain(
      "No progress history found"
    );
  });
});