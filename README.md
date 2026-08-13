# OpenClaw AI Tutor

OpenClaw AI Tutor is a prototype AI-assisted tutoring and student monitoring system developed as part of the OpenClaw Tutor summer project.

The prototype explores how educational data, automated student monitoring, AI-generated learning support, teacher summaries, and Telegram notifications can be combined into a single tutoring workflow.

The system uses mock educational data representing students, courses, assignments, submissions, and student progress. This data is analyzed to identify student progress, overdue assignments, risk levels, and learning trends.

Google Gemini is used to generate AI-assisted learning content, while Telegram is used for automated student and teacher notifications. A React dashboard provides a visual interface for reviewing student information and AI Tutor results.

---

## 1. Project Goals

The main goals of the prototype are to:

- monitor student learning progress
- detect overdue and incomplete assignments
- classify students using LOW, MEDIUM, and HIGH risk levels
- analyze changes in student progress over time
- generate personalized AI learning guidance
- generate teacher-oriented summaries
- send automated Telegram notifications
- prevent unnecessary repeated notifications
- provide a dashboard for viewing student information
- demonstrate automated testing of both application logic and frontend workflows

The project is intended as a prototype and uses mock educational data rather than production student information.

---

## 2. Main Features

### Student Data

The prototype contains structured mock data for:

- students
- courses
- assignments
- submissions
- progress records

The mock dataset allows the tutor system to be developed and tested without requiring access to real educational systems.

### Student Progress Analysis

The system analyzes individual student information and calculates information such as:

- average progress
- completed assignments
- unsubmitted assignments
- overdue assignments
- upcoming assignments
- assignment identifiers
- current risk level
- recommended notification type

Example analysis:

```text
Student: Liam Nguyen
Average progress: 50%
Overdue assignments: 1
Risk level: MEDIUM
Recommended notification: assignmentReminder
```

### Risk Assessment

Students can be classified into:

```text
LOW
MEDIUM
HIGH
```

The risk assessment uses available learning information such as progress and outstanding assignments to help identify students who may require additional attention.

The risk classification is implemented separately from the user interface so that the logic can be tested independently.

### Progress Snapshots

The system can save snapshots of student progress.

These snapshots provide historical information that can later be compared to determine whether a student's situation is changing.

Progress history is stored locally in:

```text
data/progressHistory.json
```

This runtime history file is excluded from Git because it is generated while the application is running.

### Learning Trend Analysis

Saved progress snapshots are used to analyze student trends.

Possible trend results include:

```text
IMPROVING
STABLE
DECLINING
NOT ENOUGH HISTORY
```

The trend analysis can compare information such as:

- previous progress
- current progress
- progress change
- previous risk level
- current risk level
- previous overdue assignments
- current overdue assignments

The frontend dashboard displays this information in the individual student detail view.

### AI Learning Coach

The AI Learning Coach uses student learning context to generate personalized learning guidance.

The workflow combines available student information before sending the context to Google Gemini.

Generated Learning Coach reports are stored in the `reports/` directory during development.

Depending on the available student data, the coach can provide guidance related to:

- current learning situation
- learning priorities
- assignment focus
- study recommendations
- short-term learning plans
- areas where additional support may be useful

The dashboard allows available Learning Coach reports to be viewed directly from the selected student's detail panel.

### AI-Generated Reports

Google Gemini is used to generate several forms of AI-assisted educational content.

Examples include:

- student feedback
- teacher reports
- assignment summaries
- learning recommendations
- AI Learning Coach reports

The generated reports can be accessed through the backend and displayed in the frontend.

### Teacher Summaries

The prototype includes functionality for generating teacher-oriented summaries.

This includes daily and weekly summary workflows that provide teachers with a broader overview of student learning information.

### Telegram Notifications

Telegram integration is used to demonstrate automated communication.

The prototype contains workflows for:

- assignment reminders
- student progress warnings
- weekly encouragement messages
- student notifications
- teacher summaries

Student and teacher Telegram flows can use separate chat identifiers.

### Notification Cooldown

Notification history is tracked to help prevent the same reminder from being sent repeatedly within a short period.

Runtime notification history is stored in:

```text
data/notificationHistory.json
```

This generated file is excluded from Git.

### Automatic Student Monitoring

The project contains an automatic monitoring workflow that combines several parts of the system.

A typical workflow is:

```text
Mock Educational Data
        ↓
Student Analysis
        ↓
Risk Assessment
        ↓
Progress / Assignment Evaluation
        ↓
Notification Decision
        ↓
Cooldown Check
        ↓
Telegram Notification
```

This allows the prototype to demonstrate how a future tutor automation could periodically monitor students and respond to relevant learning conditions.

---

## 3. Frontend Dashboard

The frontend is built with React and Vite.

The dashboard provides a visual interface for exploring the prototype data and tutor results.

Current dashboard functionality includes:

- student overview
- course information
- assignment information
- student progress
- risk levels
- student detail view
- overdue assignments
- recommended actions
- progress trend information
- AI Learning Coach information
- teacher reports

The student detail view combines multiple pieces of information so that a teacher can review a student's current learning situation from one interface.

---

## 4. Backend API

The backend is implemented using Node.js and Express.

During local development, it runs at:

```text
http://localhost:3000
```

Current API routes include:

```text
GET /students
GET /courses
GET /assignments
GET /submissions
GET /progress
GET /students/:studentId/progress
GET /students/:studentId/trend
GET /reports/:studentId/:type
```

Examples:

```text
GET /students/S102/progress
GET /students/S102/trend
GET /reports/S102/learning-coach
```

The API provides the connection between the mock educational data and the React frontend.

---

## 5. Technology Stack

### Automation and AI

- OpenClaw
- Google Gemini
- Telegram Bot integration

### Backend

- Node.js
- Express
- JSON-based mock educational data

### Frontend

- React
- Vite
- JavaScript
- CSS

### Testing

- Vitest
- Playwright
- mock data
- mocked Gemini behavior

### Development and Version Control

- Git
- GitHub
- npm

---

## 6. Project Structure

A simplified structure of the repository is:

```text
openclaw-ai-tutor/
│
├── backend/
│   ├── server.js
│   └── services/
│
├── data/
│   ├── students.json
│   ├── courses.json
│   ├── assignments.json
│   ├── submissions.json
│   ├── progress.json
│   ├── progressHistory.json
│   └── notificationHistory.json
│
├── frontend/
│   ├── e2e/
│   │   └── dashboard.spec.js
│   ├── src/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── App.css
│   ├── playwright.config.js
│   └── package.json
│
├── prompts/
│   └── studentCoachPrompt.md
│
├── reports/
│
├── scripts/
│   ├── aiTutor.js
│   ├── analyzeStudent.js
│   ├── analyzeTrend.js
│   ├── autoReminder.js
│   ├── buildStudentContext.js
│   ├── coachStudent.js
│   ├── generateTeacherSummary.js
│   ├── generateWeeklySummary.js
│   ├── monitorStudents.js
│   ├── saveProgressSnapshot.js
│   ├── sendAllTelegramNotifications.js
│   ├── sendTeacherSummary.js
│   ├── sendTelegramReminder.js
│   ├── sendTelegramReport.js
│   └── sendWeeklySummary.js
│
├── skills/
│   └── ai-tutor/
│       └── SKILL.md
│
├── src/
│   └── services/
│       ├── geminiService.js
│       ├── notificationCooldown.js
│       ├── riskAssessment.js
│       └── telegramService.js
│
├── tests/
│   ├── aiTutorRouter.test.js
│   ├── analyzeStudent.test.js
│   ├── analyzeTrend.test.js
│   ├── geminiService.mock.test.js
│   ├── geminiService.test.js
│   ├── notificationCooldown.test.js
│   ├── riskAssessment.test.js
│   └── telegramService.test.js
│
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

Some runtime-generated files and reports are intentionally excluded from Git.

---

## 7. Environment Variables

Create a local `.env` file based on `.env.example`.

The project uses environment variables such as:

```text
GEMINI_API_KEY
OPENCLAW_GATEWAY_TOKEN
TELEGRAM_CHAT_ID
STUDENT_TELEGRAM_CHAT_ID
TEACHER_TELEGRAM_CHAT_ID
```

Do not commit the real `.env` file or API credentials to GitHub.

The repository should contain only:

```text
.env.example
```

with placeholder values or variable names.

---

## 8. Installation

Clone the repository:

```bash
git clone https://github.com/Flyhigh9/openclaw-ai-tutor.git
cd openclaw-ai-tutor
```

Install the root dependencies:

```bash
npm install
```

Install backend dependencies:

```bash
cd backend
npm install
cd ..
```

Install frontend dependencies:

```bash
cd frontend
npm install
cd ..
```

Create your local environment configuration from `.env.example` and provide the required credentials.

---

## 9. Running the Backend

From the project root:

```bash
node backend/server.js
```

The backend should start at:

```text
http://localhost:3000
```

You can verify it by opening the address in a browser.

---

## 10. Running the Frontend

Open another terminal:

```bash
cd frontend
npm run dev
```

Vite will display the local frontend URL in the terminal.

Open that URL in your browser to access the OpenClaw AI Tutor dashboard.

---

## 11. AI Tutor CLI

The project contains an AI Tutor command router:

```text
scripts/aiTutor.js
```

For example, student analysis can be run with:

```bash
node scripts/aiTutor.js analyze S102
```

Example output:

```text
Overdue assignments: 1
Upcoming assignments: 0
Risk level: MEDIUM
Recommended notification: assignmentReminder
```

The command also returns structured student analysis information.

Other scripts in the `scripts/` directory provide functionality for monitoring, trend analysis, progress snapshots, Learning Coach generation, teacher summaries, and Telegram workflows.

---

## 12. Automated Testing

The project uses two complementary automated testing approaches.

### Vitest

Vitest is used primarily for application logic and service-level testing.

The current test suite covers areas including:

- student analysis
- risk assessment
- trend analysis
- notification cooldown
- AI Tutor command routing
- Telegram service
- Gemini service
- mocked Gemini behavior

Run the tests from the project root:

```bash
npm run test:run
```

Current verified result:

```text
Test Files: 8 passed
Tests: 52 passed
```

### Playwright

Playwright is used for browser-based end-to-end testing of the final frontend dashboard.

Run:

```bash
cd frontend
npm run test:e2e
```

The current Playwright suite contains 7 end-to-end tests covering:

1. dashboard loading
2. student list visibility
3. opening a student detail view
4. progress and risk information
5. learning trend information
6. opening the AI Learning Coach
7. closing the student detail view

Current verified result:

```text
7 passed
```

Together, Vitest and Playwright provide testing at different levels:

```text
Vitest
    ↓
Application logic and services

Playwright
    ↓
Browser and user workflow

Manual testing
    ↓
Prototype behavior and integration
```

At the current stage, the project has:

```text
52 passing Vitest tests
7 passing Playwright tests
```

---

## 13. Example Student Workflow

A typical student-monitoring workflow is:

```text
Student data
    ↓
Assignment and submission data
    ↓
Progress calculation
    ↓
Risk assessment
    ↓
Progress snapshot
    ↓
Trend analysis
    ↓
Recommended action
    ↓
AI Learning Coach
    ↓
Telegram notification / teacher information
```

The React dashboard provides a visual representation of several results from this workflow.

---

## 14. AI Safety and Data Handling

The prototype is designed around mock educational data.

AI-generated information is treated as learning support rather than authoritative academic assessment.

The project separates verified student context from generated AI output where possible. The AI Tutor should base recommendations on the available student information rather than inventing unsupported student facts.

Sensitive credentials such as Gemini API keys, Telegram identifiers, and OpenClaw gateway tokens must remain in local environment configuration and must not be committed to the repository.

---

## 15. Current Prototype Status

The following major prototype functionality has been implemented:

- OpenClaw setup and experimentation
- Telegram integration
- Google Gemini integration
- mock educational dataset
- Node.js/Express backend
- React/Vite frontend
- student progress analysis
- risk classification
- overdue-assignment detection
- progress snapshots
- trend analysis
- automatic student monitoring
- notification cooldown
- student Telegram workflows
- teacher Telegram workflows
- AI Learning Coach
- teacher summaries
- dashboard student detail view
- AI report viewing
- automated Vitest testing
- automated Playwright E2E testing

---

## 16. Remaining Work

The prototype is still being finalized.

Important remaining project activities include:

- deployment to the required CSC environment
- testing the deployed version
- final documentation review
- second-person prototype testing/review
- recording reviewer/tester information
- demo video creation
- linking final documentation and demo material in Teams
- preparing the OAMK publication version
- final project-plan/version-history verification
- final Hourlog verification
- final meeting memo verification

These items should not be considered completed until they have been tested or documented.

---

## 17. Prototype Limitations

This project is a prototype rather than a production learning management system.

Current limitations include:

- educational information is primarily mock data
- no production educational institution integration
- no production authentication/authorization system
- local JSON files are used for several prototype workflows
- generated reports are stored locally during development
- notification history is stored locally
- progress history is stored locally
- AI output depends on Gemini availability and configuration
- Telegram integration depends on valid bot and chat configuration
- deployment is not yet finalized
- the dashboard is designed for prototype demonstration rather than production-scale use

---

## 18. Testing and Review

### Developer / Assignee

Pabitra Kunwar

### Reviewer / Tester

To be assigned.

### Review Status

Pending final second-person review.

The reviewer/tester should verify:

- prototype behavior
- student dashboard
- student detail workflow
- progress and risk information
- learning trend
- AI Learning Coach
- Telegram workflow where applicable
- setup and usage instructions
- architecture documentation
- automated test results

The reviewer/tester name and review outcome should be recorded after the review is completed.

---

## 19. Documentation

Additional project documentation is maintained in:

```text
docs/
```

Planned documentation includes:

```text
docs/architecture.md
docs/installation.md
docs/usage.md
docs/testing.md
docs/limitations.md
```

These documents provide more detailed information than the README and are intended to support project review, testing, demonstration, and handover.

---

## 20. Repository

Project repository:

https://github.com/Flyhigh9/openclaw-ai-tutor

The repository contains the prototype source code, tests, mock data structures, prompts, scripts, frontend, backend, and project documentation.

---

## 21. Project Status

**Status:** Prototype finalization

The main functional prototype and automated testing are operational. Current work focuses on documentation, review, deployment, demonstration, and final project deliverables.