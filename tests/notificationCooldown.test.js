import {
  describe,
  it,
  expect,
} from "vitest";

import { createRequire } from "module";

const require =
  createRequire(import.meta.url);

const {
  checkNotificationCooldown,
} = require(
  "../src/services/notificationCooldown"
);

const cooldownHours = {
  assignmentReminder: 24,
  progressWarning: 72,
  weeklyEncouragement: 168,
};

const now = new Date(
  "2026-08-11T10:00:00.000Z"
);

describe("notificationCooldown", () => {
  it("allows a reminder when no previous history exists", () => {
    const result =
      checkNotificationCooldown({
        history: [],
        studentId: "S101",
        reminderType:
          "weeklyEncouragement",
        cooldownHours,
        now,
      });

    expect(result).toEqual({
      allowed: true,
      remainingHours: 0,
    });
  });

  it("blocks weekly encouragement within seven days", () => {
    const history = [
      {
        studentId: "S101",
        type: "weeklyEncouragement",
        sentAt:
          "2026-08-10T10:00:00.000Z",
      },
    ];

    const result =
      checkNotificationCooldown({
        history,
        studentId: "S101",
        reminderType:
          "weeklyEncouragement",
        cooldownHours,
        now,
      });

    expect(result.allowed).toBe(false);

    expect(result.remainingHours).toBe(
      144
    );
  });

  it("allows weekly encouragement after seven days", () => {
    const history = [
      {
        studentId: "S101",
        type: "weeklyEncouragement",
        sentAt:
          "2026-08-04T10:00:00.000Z",
      },
    ];

    const result =
      checkNotificationCooldown({
        history,
        studentId: "S101",
        reminderType:
          "weeklyEncouragement",
        cooldownHours,
        now,
      });

    expect(result.allowed).toBe(true);
  });

  it("blocks assignment reminder within 24 hours", () => {
    const history = [
      {
        studentId: "S102",
        type: "assignmentReminder",
        sentAt:
          "2026-08-11T00:00:00.000Z",
      },
    ];

    const result =
      checkNotificationCooldown({
        history,
        studentId: "S102",
        reminderType:
          "assignmentReminder",
        cooldownHours,
        now,
      });

    expect(result.allowed).toBe(false);
  });

  it("allows assignment reminder after 24 hours", () => {
    const history = [
      {
        studentId: "S102",
        type: "assignmentReminder",
        sentAt:
          "2026-08-10T09:00:00.000Z",
      },
    ];

    const result =
      checkNotificationCooldown({
        history,
        studentId: "S102",
        reminderType:
          "assignmentReminder",
        cooldownHours,
        now,
      });

    expect(result.allowed).toBe(true);
  });

  it("blocks progress warning within 72 hours", () => {
    const history = [
      {
        studentId: "S103",
        type: "progressWarning",
        sentAt:
          "2026-08-10T10:00:00.000Z",
      },
    ];

    const result =
      checkNotificationCooldown({
        history,
        studentId: "S103",
        reminderType:
          "progressWarning",
        cooldownHours,
        now,
      });

    expect(result.allowed).toBe(false);
  });

  it("ignores another student's history", () => {
    const history = [
      {
        studentId: "S999",
        type: "weeklyEncouragement",
        sentAt:
          "2026-08-11T09:00:00.000Z",
      },
    ];

    const result =
      checkNotificationCooldown({
        history,
        studentId: "S101",
        reminderType:
          "weeklyEncouragement",
        cooldownHours,
        now,
      });

    expect(result.allowed).toBe(true);
  });

  it("ignores a different reminder type", () => {
    const history = [
      {
        studentId: "S101",
        type: "assignmentReminder",
        sentAt:
          "2026-08-11T09:00:00.000Z",
      },
    ];

    const result =
      checkNotificationCooldown({
        history,
        studentId: "S101",
        reminderType:
          "weeklyEncouragement",
        cooldownHours,
        now,
      });

    expect(result.allowed).toBe(true);
  });

  it("uses the most recent matching notification", () => {
    const history = [
      {
        studentId: "S101",
        type: "weeklyEncouragement",
        sentAt:
          "2026-07-20T10:00:00.000Z",
      },
      {
        studentId: "S101",
        type: "weeklyEncouragement",
        sentAt:
          "2026-08-10T10:00:00.000Z",
      },
    ];

    const result =
      checkNotificationCooldown({
        history,
        studentId: "S101",
        reminderType:
          "weeklyEncouragement",
        cooldownHours,
        now,
      });

    expect(result.allowed).toBe(false);
  });
});