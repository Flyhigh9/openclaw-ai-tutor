---
OpenClaw AI Tutor – Usage Guide
1. Overview

This document explains how to use the main features of the OpenClaw AI Tutor prototype after installation.

The project provides a command-line router through:

scripts/aiTutor.js

The router connects individual commands to the appropriate AI Tutor scripts.

Commands are executed from the project root:

cd openclaw-ai-tutor

The general command structure is:

node scripts/aiTutor.js <operation> [studentId] [type]
2. Student IDs

Student-specific commands require a valid student ID.

The expected format is:

S101
S102
S103

The router validates IDs using the format:

S followed by numbers

For example:

node scripts/aiTutor.js analyze S102

An invalid ID such as:

ABC

will be rejected.

3. Generate AI Reports

Use:

node scripts/aiTutor.js generate <studentId>

Example:

node scripts/aiTutor.js generate S102

This runs:

scripts/generateAIOutputs.js

The generation workflow creates AI-assisted student reports using the configured Gemini integration.

Generated outputs may include:

student feedback
teacher report
assignment summary
learning recommendation

The generated files are stored under:

reports/
4. Send a Student Report to Telegram

Use:

node scripts/aiTutor.js report <studentId> <reportType>

Supported report types are:

feedback
teacher-report
assignment-summary
learning-recommendation

Example:

node scripts/aiTutor.js report S102 feedback

Another example:

node scripts/aiTutor.js report S102 teacher-report

This runs:

scripts/sendTelegramReport.js

A valid Telegram configuration and OpenClaw gateway configuration are required.

5. Send a Student Reminder

Use:

node scripts/aiTutor.js remind <studentId> <reminderType>

Supported reminder types are:

assignmentReminder
progressWarning
weeklyEncouragement

Example:

node scripts/aiTutor.js remind S101 weeklyEncouragement

This runs:

scripts/sendTelegramReminder.js

The notification workflow also uses notification cooldown logic to reduce repeated messages.

6. Analyze a Student

Use:

node scripts/aiTutor.js analyze <studentId>

Example:

node scripts/aiTutor.js analyze S102

This runs:

scripts/analyzeStudent.js

The analysis can return information such as:

student name
average progress
completed assignments
total relevant assignments
unsubmitted assignments
overdue assignments
upcoming assignments
overdue assignment IDs
upcoming assignment IDs
risk level
recommended notification

Example result:

Student: Liam Nguyen
Average progress: 50%
Overdue assignments: 1
Risk level: MEDIUM
Recommended notification: assignmentReminder

The analysis command is useful when checking a student's current learning situation manually.

7. Automatically Decide and Send a Reminder

Use:

node scripts/aiTutor.js auto-remind <studentId>

Example:

node scripts/aiTutor.js auto-remind S102

This runs:

scripts/autoReminder.js

The workflow:

Student Data
     ↓
Student Analysis
     ↓
Risk Assessment
     ↓
Recommended Notification
     ↓
Cooldown Check
     ↓
Send or Skip Reminder

If the same notification was sent recently, the system can skip the reminder.

Example:

Reminder skipped.
assignmentReminder was already sent recently.
8. Send All Available Student Notifications and Reports

Use:

node scripts/aiTutor.js all <studentId>

Example:

node scripts/aiTutor.js all S102

This runs:

scripts/sendAllTelegramNotifications.js

The workflow attempts to send the available student reports and supported reminder types.

This command is mainly useful for prototype testing and demonstration.

Because it can send multiple Telegram messages, it should be used carefully.

9. Generate AI Learning Coach

Use:

node scripts/aiTutor.js coach <studentId>

Example:

node scripts/aiTutor.js coach S102

This runs:

scripts/coachStudent.js

The Learning Coach first uses verified student context and then requests AI-generated learning guidance from Gemini.

The workflow is:

Student Data
     ↓
Verified Student Context
     ↓
Learning Coach Prompt
     ↓
Gemini Service
     ↓
Learning Coach Report

The generated report is stored under:

reports/

For example:

reports/S102-learning-coach.md

Available Learning Coach reports can also be viewed through the frontend dashboard.

10. Monitor All Students

Use:

node scripts/aiTutor.js monitor

This command does not require a student ID.

It runs:

scripts/monitorStudents.js

The monitoring workflow checks multiple students and determines whether action is required.

A simplified workflow is:

All Students
     ↓
Analyze Each Student
     ↓
Evaluate Risk
     ↓
Determine Notification
     ↓
Check Cooldown
     ↓
Send if Required

This command is used for automatic student monitoring.

11. Generate Teacher Daily Summary

Use:

node scripts/aiTutor.js teacher-summary

This runs:

scripts/generateTeacherSummary.js

The command generates a teacher-oriented summary using the available student information.

No student ID is required.

12. Generate and Send Teacher Daily Summary

Use:

node scripts/aiTutor.js teacher-summary-send

The command performs two operations:

generateTeacherSummary.js
        ↓
sendTeacherSummary.js

The summary is first generated and then sent using the configured teacher Telegram destination.

The following environment variables are required for Telegram delivery:

OPENCLAW_GATEWAY_TOKEN
TEACHER_TELEGRAM_CHAT_ID
13. Save Progress Snapshot

Use:

node scripts/aiTutor.js snapshot

This runs:

scripts/saveProgressSnapshot.js

The command saves the current student learning situation into progress history.

Progress history is stored during runtime in:

data/progressHistory.json

Snapshots allow the system to compare student progress at different points in time.

A snapshot can contain information such as:

Student ID
Average progress
Risk level
Overdue assignments
Recorded time
14. Analyze Student Trend

Use:

node scripts/aiTutor.js trend <studentId>

Example:

node scripts/aiTutor.js trend S102

This runs:

scripts/analyzeTrend.js

The command compares available progress history for the selected student.

Possible trend results include:

IMPROVING
STABLE
DECLINING
NOT ENOUGH HISTORY

Example:

Student: S102

Previous progress: 50%
Current progress: 50%
Progress change: 0%

Previous risk: MEDIUM
Current risk: MEDIUM

Trend: STABLE

Trend analysis requires stored progress history.

15. Generate Weekly Teacher Summary

Use:

node scripts/aiTutor.js weekly-summary

This runs:

scripts/generateWeeklySummary.js

The command generates a weekly summary using the available student information.

No student ID is required.

16. Generate and Send Weekly Teacher Summary

Use:

node scripts/aiTutor.js weekly-summary-send

This performs:

generateWeeklySummary.js
        ↓
sendWeeklySummary.js

The generated weekly summary is sent to the configured teacher Telegram destination.

17. Main Command Reference

The currently implemented commands are:

generate <studentId>
report <studentId> <reportType>
remind <studentId> <reminderType>
analyze <studentId>
auto-remind <studentId>
all <studentId>
coach <studentId>
monitor
teacher-summary
teacher-summary-send
snapshot
trend <studentId>
weekly-summary
weekly-summary-send

Examples:

node scripts/aiTutor.js generate S101
node scripts/aiTutor.js report S101 feedback
node scripts/aiTutor.js remind S101 weeklyEncouragement
node scripts/aiTutor.js analyze S102
node scripts/aiTutor.js auto-remind S102
node scripts/aiTutor.js coach S102
node scripts/aiTutor.js monitor
node scripts/aiTutor.js teacher-summary
node scripts/aiTutor.js teacher-summary-send
node scripts/aiTutor.js snapshot
node scripts/aiTutor.js trend S102
node scripts/aiTutor.js weekly-summary
node scripts/aiTutor.js weekly-summary-send
18. Dashboard Usage

The React frontend provides a visual interface for several Tutor features.

Start the backend:

node backend/server.js

In another terminal:

cd frontend
npm run dev

Open the Vite address shown in the terminal.

The dashboard contains sections for:

students
courses
assignments
progress
teacher reports
19. Student Detail View

In the Students section:

locate the student
click View Details
review the student information

The detail view displays information such as:

Average Progress
Risk Level
Completed Assignments
Overdue Assignments
Learning Trend
Courses
Recommended Action

For students with an available Learning Coach report, click:

View Coach

The generated AI Learning Coach content will be displayed inside the student detail view.

Click:

Close

to close the detail panel.

20. Progress Trend in the Dashboard

The frontend retrieves trend information from:

GET /students/:studentId/trend

For example:

GET /students/S102/trend

The student detail view can show:

Previous Progress
Current Progress
Progress Change
Risk Change
Trend

Example:

Previous: 50%
Current: 50%
Change: 0%
Risk: MEDIUM → MEDIUM
Trend: STABLE
21. Teacher Reports in the Dashboard

The Teacher Reports section allows generated reports to be viewed through the frontend.

Supported report types include:

Student Feedback
Teacher Progress Report
Assignment Summary
Learning Recommendation

Select:

student
report type
Load Report

The frontend retrieves the report from:

GET /reports/:studentId/:type
22. Backend API Usage

The backend runs locally at:

http://localhost:3000

Main endpoints include:

GET /students
GET /courses
GET /assignments
GET /submissions
GET /progress
GET /students/:studentId/progress
GET /students/:studentId/trend
GET /reports/:studentId/:type

These endpoints are mainly consumed by the React frontend, but they can also be opened directly in a browser or tested using tools such as curl.

Example:

curl http://localhost:3000/students/S102/trend
23. Notification Cooldown

Automated notifications should not be sent continuously.

The cooldown logic uses:

src/services/notificationCooldown.js

and runtime notification history:

data/notificationHistory.json

If a reminder was sent recently, the Tutor can skip it.

Example:

Reminder skipped.
weeklyEncouragement was already sent recently.

This behavior is important when using:

remind
auto-remind
monitor
24. Testing the Tutor

To verify the core application logic:

npm run test:run

Current verified result:

52 Vitest tests passed

To verify frontend workflows:

cd frontend
npm run test:e2e

Current verified result:

7 Playwright tests passed

See:

docs/testing.md

for detailed testing documentation.

25. Recommended Demonstration Workflow

For a short project demonstration, the following sequence can be used.

1. Analyze a Student
node scripts/aiTutor.js analyze S102

Show:

progress
overdue assignment
risk level
recommended notification
2. Show Trend
node scripts/aiTutor.js trend S102

Explain how progress snapshots allow changes to be compared over time.

3. Generate Learning Coach
node scripts/aiTutor.js coach S102

Show the generated report.

4. Open Dashboard

Start backend and frontend and open the student detail view.

Show:

progress
risk
trend
overdue assignments
recommended action
Learning Coach
5. Show Teacher Report

Use the Teacher Reports section of the dashboard.

6. Show Automated Tests

Run:

npm run test:run

and:

cd frontend
npm run test:e2e

This demonstrates both internal logic testing and browser-based testing.

26. Important Usage Notes
Generated AI Content

AI-generated content should be treated as learning support rather than authoritative academic assessment.

Mock Data

The current prototype primarily uses mock educational data.

Telegram

Telegram delivery requires valid bot, chat and OpenClaw gateway configuration.

Progress Trends

Meaningful trend analysis requires multiple progress snapshots.

Local Environment

The current usage instructions describe the local prototype.

CSC deployment remains a separate project task.


27. Usage Summary

The OpenClaw AI Tutor can currently be operated through two main interfaces:

Command Line
     ↓
scripts/aiTutor.js
     ↓
Analysis / Monitoring / AI / Notifications

and

Web Browser
     ↓
React Dashboard
     ↓
Students / Progress / Trends / Reports

Together, these interfaces demonstrate the core behavior of the prototype and allow the system to be tested, reviewed and demonstrated without requiring access to real educational systems.
---