function assessRisk({
  averageProgress,
  overdueAssignments,
}) {
  let riskLevel = "LOW";
  let recommendedNotification =
    "weeklyEncouragement";

  if (
    averageProgress < 50 ||
    overdueAssignments >= 2
  ) {
    riskLevel = "HIGH";
    recommendedNotification =
      "progressWarning";
  } else if (
    averageProgress < 75 ||
    overdueAssignments === 1
  ) {
    riskLevel = "MEDIUM";
    recommendedNotification =
      "assignmentReminder";
  }

  return {
    riskLevel,
    recommendedNotification,
  };
}

module.exports = {
  assessRisk,
};