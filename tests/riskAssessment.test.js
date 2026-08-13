import {
  describe,
  it,
  expect,
} from "vitest";

import { createRequire } from "module";

const require =
  createRequire(import.meta.url);

const {
  assessRisk,
} = require(
  "../src/services/riskAssessment"
);

describe("riskAssessment", () => {
  it("returns LOW for strong progress with no overdue assignments", () => {
    const result = assessRisk({
      averageProgress: 90,
      overdueAssignments: 0,
    });

    expect(result).toEqual({
      riskLevel: "LOW",
      recommendedNotification:
        "weeklyEncouragement",
    });
  });

  it("returns MEDIUM when progress is between 50 and 74", () => {
    const result = assessRisk({
      averageProgress: 60,
      overdueAssignments: 0,
    });

    expect(result).toEqual({
      riskLevel: "MEDIUM",
      recommendedNotification:
        "assignmentReminder",
    });
  });

  it("returns MEDIUM for one overdue assignment", () => {
    const result = assessRisk({
      averageProgress: 100,
      overdueAssignments: 1,
    });

    expect(result).toEqual({
      riskLevel: "MEDIUM",
      recommendedNotification:
        "assignmentReminder",
    });
  });

  it("returns HIGH when progress is below 50", () => {
    const result = assessRisk({
      averageProgress: 40,
      overdueAssignments: 0,
    });

    expect(result).toEqual({
      riskLevel: "HIGH",
      recommendedNotification:
        "progressWarning",
    });
  });

  it("returns HIGH for two overdue assignments", () => {
    const result = assessRisk({
      averageProgress: 90,
      overdueAssignments: 2,
    });

    expect(result).toEqual({
      riskLevel: "HIGH",
      recommendedNotification:
        "progressWarning",
    });
  });

  it("treats exactly 50 percent as MEDIUM", () => {
    const result = assessRisk({
      averageProgress: 50,
      overdueAssignments: 0,
    });

    expect(result.riskLevel).toBe(
      "MEDIUM"
    );
  });

  it("treats exactly 75 percent as LOW when there are no overdue assignments", () => {
    const result = assessRisk({
      averageProgress: 75,
      overdueAssignments: 0,
    });

    expect(result.riskLevel).toBe(
      "LOW"
    );
  });
});