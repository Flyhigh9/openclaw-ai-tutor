function checkNotificationCooldown({
  history,
  studentId,
  reminderType,
  cooldownHours,
  now = new Date(),
}) {
  const previous = [...history]
    .reverse()
    .find(
      (entry) =>
        entry.studentId === studentId &&
        entry.type === reminderType
    );

  if (!previous) {
    return {
      allowed: true,
      remainingHours: 0,
    };
  }

  const lastSent = new Date(previous.sentAt);

  if (Number.isNaN(lastSent.getTime())) {
    return {
      allowed: true,
      remainingHours: 0,
    };
  }

  const requiredCooldown =
    cooldownHours[reminderType];

  if (!requiredCooldown) {
    return {
      allowed: true,
      remainingHours: 0,
    };
  }

  const elapsedHours =
    (now.getTime() - lastSent.getTime()) /
    (1000 * 60 * 60);

  if (elapsedHours >= requiredCooldown) {
    return {
      allowed: true,
      remainingHours: 0,
    };
  }

  return {
    allowed: false,
    remainingHours: Math.ceil(
      requiredCooldown - elapsedHours
    ),
  };
}

module.exports = {
  checkNotificationCooldown,
};