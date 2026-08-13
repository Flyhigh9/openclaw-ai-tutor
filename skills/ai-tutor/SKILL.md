---
name: ai-tutor
description: Generate AI Tutor outputs and send student reports and reminders through Telegram.
user-invocable: true
---

# AI Tutor

This skill controls the OpenClaw AI Tutor project.

Project directory:

`/Users/pabitrakunwar/Projects/openclaw-ai-tutor`

## Required execution rule

Always use the AI Tutor router.

For every command, execute:

```bash
cd /Users/pabitrakunwar/Projects/openclaw-ai-tutor &&
node scripts/aiTutor.js <user_input>
```

Pass the complete user input to `aiTutor.js`.

Do not execute these scripts directly:

- `sendTelegramReport.js`
- `sendTelegramReminder.js`
- `generateAIOutputs.js`
- `sendAllTelegramNotifications.js`

The `aiTutor.js` router decides which script should run.

## Supported commands

### Generate

Syntax:

`generate <studentId>`

Example:

`generate S101`

Execute:

```bash
node scripts/aiTutor.js generate S101
```

### Report

Syntax:

`report <studentId> <reportType>`

Allowed report types:

- `feedback`
- `teacher-report`
- `assignment-summary`
- `learning-recommendation`

Example:

`report S101 feedback`

Execute:

```bash
node scripts/aiTutor.js report S101 feedback
```

### Reminder

Syntax:

`remind <studentId> <reminderType>`

Allowed reminder types:

- `assignmentReminder`
- `progressWarning`
- `weeklyEncouragement`

Example:

`remind S102 weeklyEncouragement`

Execute:

```bash
node scripts/aiTutor.js remind S102 weeklyEncouragement
```

### All notifications

Syntax:

`all <studentId>`

Example:

`all S101`

Execute:

```bash
node scripts/aiTutor.js all S101
```

## Rules

- Always use `scripts/aiTutor.js`.
- Never call the report or reminder scripts directly.
- Never treat a reminder type as a report type.
- Require a student ID.
- Reject unknown operations.
- Return the output from `aiTutor.js`.