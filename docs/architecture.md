# OpenClaw AI Tutor – Architecture

## 1. Overview

OpenClaw AI Tutor is a prototype AI-assisted tutoring and student monitoring system.

The system combines mock educational data, student analysis, risk assessment, AI-generated learning support, Telegram notifications, teacher summaries, and a React-based monitoring dashboard.

The prototype follows a modular architecture so that data handling, analysis, AI services, notification services, backend APIs, and the user interface can be developed and tested separately.

At a high level, the system consists of the following parts:

```text
                    OpenClaw AI Tutor

                           │
                           ▼
                Mock Educational Data
                           │
                           ▼
              Student Analysis & Monitoring
                           │
                ┌──────────┴──────────┐
                ▼                     ▼
        Risk / Trend Analysis     AI Tutor Services
                                      │
                                      ▼
                                Google Gemini
                │
                ├─────────────────────────────┐
                ▼                             ▼
        Telegram Services              Express Backend
                                              │
                                              ▼
                                       React Dashboard
```

---

## 2. Main Architectural Components

The prototype contains the following major components:

1. Mock educational data
2. Student analysis and monitoring
3. Risk assessment
4. Progress snapshots and trend analysis
5. AI Tutor and Learning Coach
6. Telegram notification service
7. Teacher summary workflows
8. Node.js/Express backend
9. React/Vite frontend dashboard
10. Automated testing

These components work together to create the complete tutoring and monitoring workflow.

---

## 3. Mock Educational Data Layer

The prototype does not currently connect to a production learning management system.

Instead, structured JSON files are used to represent educational information.

The main data entities include:

```text
Students
Courses
Assignments
Submissions
Progress
```

The data is stored under:

```text
data/
```

Typical files include:

```text
data/students.json
data/courses.json
data/assignments.json
data/submissions.json
data/progress.json
```

This approach allows the prototype to simulate realistic educational workflows without using real student data.

The mock data is consumed by both the backend API and the automated student-analysis scripts.

---

## 4. Student Analysis Layer

Student analysis is one of the core components of the architecture.

The analysis workflow combines information from multiple datasets.

```text
Student
   │
   ├── Courses
   │
   ├── Assignments
   │
   ├── Submissions
   │
   └── Progress
          │
          ▼
     Student Analysis
```

The analysis can determine information such as:

- student progress
- completed assignments
- incomplete assignments
- overdue assignments
- upcoming assignments
- current risk level
- recommended notification action

The main student analysis logic is implemented in:

```text
scripts/analyzeStudent.js
```

Separating the analysis logic from the frontend makes it possible to test the behavior independently.

---

## 5. Risk Assessment

Risk assessment is implemented as a separate service.

The relevant service is:

```text
src/services/riskAssessment.js
```

The prototype classifies students into three risk levels:

```text
LOW
MEDIUM
HIGH
```

The classification uses available learning information such as student progress and outstanding work.

A simplified workflow is:

```text
Student Progress
       +
Outstanding Assignments
       +
Available Learning Context
       │
       ▼
Risk Assessment
       │
       ▼
LOW / MEDIUM / HIGH
```

The risk result can then be used by:

- student monitoring
- the dashboard
- notification selection
- teacher information
- AI Tutor context

Keeping risk assessment as a separate service also makes the logic easier to test with Vitest.

---

## 6. Progress Snapshot Architecture

The system can store snapshots of student progress.

The snapshot functionality is implemented through:

```text
scripts/saveProgressSnapshot.js
```

Runtime progress history is stored in:

```text
data/progressHistory.json
```

The purpose of a snapshot is to preserve the student's situation at a particular point in time.

A simplified example is:

```text
Student S102

Snapshot 1
Progress: 50%
Risk: MEDIUM
Overdue: 1

        ↓ time

Snapshot 2
Progress: 50%
Risk: MEDIUM
Overdue: 1
```

These snapshots allow the system to compare previous and current learning states.

The runtime history file is not intended to be permanent production storage and is excluded from Git.

---

## 7. Trend Analysis

Trend analysis is implemented in:

```text
scripts/analyzeTrend.js
```

The component compares progress snapshots and determines whether the student's situation is changing.

Possible trend classifications include:

```text
IMPROVING
STABLE
DECLINING
NOT ENOUGH HISTORY
```

The analysis can compare:

```text
Previous Progress
        │
        ├──────────────┐
        ▼              ▼
Current Progress    Risk Change
        │              │
        └──────┬───────┘
               ▼
       Overdue Change
               │
               ▼
         Trend Analysis
               │
               ▼
  IMPROVING / STABLE / DECLINING
```

Trend information is also exposed through the backend so that it can be displayed in the frontend student detail view.

---

## 8. Automatic Student Monitoring

The monitoring component connects several parts of the prototype.

The main monitoring script is:

```text
scripts/monitorStudents.js
```

A simplified monitoring workflow is:

```text
Educational Data
       │
       ▼
Analyze Student
       │
       ▼
Assess Risk
       │
       ▼
Check Assignments
       │
       ▼
Select Appropriate Action
       │
       ▼
Check Notification Cooldown
       │
       ▼
Send Notification if Required
```

This architecture demonstrates how a tutor automation could periodically inspect student information and respond to relevant learning conditions.

The prototype has also been used with scheduled monitoring workflows during development.

---

## 9. Notification Cooldown

One issue with automated reminders is repeated notifications.

To reduce this problem, notification cooldown logic is implemented in:

```text
src/services/notificationCooldown.js
```

Notification history is stored during runtime in:

```text
data/notificationHistory.json
```

The simplified decision process is:

```text
Notification Required?
        │
        ▼
Check Notification History
        │
        ▼
Was Similar Notification
Sent Recently?
     /       \
   Yes        No
    │          │
    ▼          ▼
  Skip       Send
```

This helps prevent students or teachers from receiving the same automated message repeatedly within a short period.

The runtime notification history is excluded from Git.

---

## 10. Telegram Integration

Telegram provides the communication layer for automated notifications.

Telegram-related functionality is separated into reusable service and script components.

The main Telegram service is:

```text
src/services/telegramService.js
```

Additional notification workflows are located in:

```text
scripts/sendTelegramReminder.js
scripts/sendTelegramReport.js
scripts/sendAllTelegramNotifications.js
scripts/sendTeacherSummary.js
scripts/sendWeeklySummary.js
```

The prototype supports separate Telegram destinations for students and teachers through environment configuration.

The communication architecture is approximately:

```text
Student Monitoring
        │
        ▼
Notification Decision
        │
        ▼
Telegram Service
        │
        ▼
Telegram Bot API
      /     \
     ▼       ▼
 Student   Teacher
```

Telegram credentials and chat identifiers are stored in environment variables rather than directly in the source code.

---

## 11. Google Gemini Integration

Google Gemini provides the generative AI functionality used by the prototype.

The Gemini service is implemented in:

```text
src/services/geminiService.js
```

The Gemini API key is loaded from the local environment:

```text
GEMINI_API_KEY
```

A simplified AI request flow is:

```text
Verified Student Context
          │
          ▼
        Prompt
          │
          ▼
    Gemini Service
          │
          ▼
    Google Gemini
          │
          ▼
 Generated Response
```

Separating Gemini access into a service makes it possible to mock the AI dependency during automated testing.

This is important because tests should not require a real Gemini API request every time they run.

---

## 12. AI Learning Coach

The AI Learning Coach builds student-specific context before requesting learning guidance from Gemini.

Important components include:

```text
scripts/buildStudentContext.js
scripts/coachStudent.js
prompts/studentCoachPrompt.md
```

The architecture is:

```text
Student
  │
  ├── Progress
  ├── Assignments
  ├── Submissions
  ├── Risk
  └── Trend
        │
        ▼
Build Student Context
        │
        ▼
Learning Coach Prompt
        │
        ▼
Gemini Service
        │
        ▼
AI Learning Coach Report
```

Generated Learning Coach reports can be stored in:

```text
reports/
```

Available reports can also be retrieved through the backend and displayed in the frontend.

The AI output is intended to provide learning support based on available student context rather than replace teacher judgment.

---

## 13. Teacher Summary Architecture

The prototype also includes teacher-oriented summary workflows.

Relevant scripts include:

```text
scripts/generateTeacherSummary.js
scripts/generateWeeklySummary.js
scripts/sendTeacherSummary.js
scripts/sendWeeklySummary.js
```

The general workflow is:

```text
Multiple Student Records
          │
          ▼
Student Analysis Results
          │
          ▼
Teacher Summary Generation
          │
          ▼
Teacher Report / Summary
          │
          ▼
Telegram Teacher Channel
```

This provides a higher-level view than an individual student reminder.

---

## 14. AI Tutor Command Router

The prototype includes an AI Tutor command interface in:

```text
scripts/aiTutor.js
```

The command router provides a simple way to access tutor functionality from the command line.

For example:

```bash
node scripts/aiTutor.js analyze S102
```

The router connects user commands with the appropriate project functionality.

Conceptually:

```text
CLI Command
    │
    ▼
AI Tutor Router
    │
    ├── Student Analysis
    ├── Risk Information
    ├── Trend Information
    └── Other Tutor Functions
```

This provides another interface to the prototype in addition to the React dashboard.

---

## 15. Backend Architecture

The backend is implemented with Node.js and Express.

The main server is:

```text
backend/server.js
```

The backend provides HTTP endpoints that allow the frontend to access educational information and generated reports.

During local development:

```text
React Frontend
      │
      │ HTTP / JSON
      ▼
Express Backend
      │
      ├── students.json
      ├── courses.json
      ├── assignments.json
      ├── submissions.json
      ├── progress.json
      ├── trend analysis
      └── generated reports
```

The backend currently runs locally on:

```text
http://localhost:3000
```

Example endpoints include:

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

The backend acts as the main interface between the frontend and the prototype data.

---

## 16. Frontend Architecture

The frontend is implemented with:

```text
React
Vite
JavaScript
CSS
```

The main frontend pages include:

```text
Dashboard.jsx
Students.jsx
Courses.jsx
Assignments.jsx
Progress.jsx
TeacherReports.jsx
```

The application structure is approximately:

```text
App.jsx
   │
   ├── Dashboard
   ├── Students
   ├── Courses
   ├── Assignments
   ├── Progress
   └── Teacher Reports
```

The frontend communicates with the Express backend using HTTP requests.

For example:

```text
Students.jsx
     │
     ▼
GET /students
     │
     ▼
Express Backend
     │
     ▼
students.json
```

The returned JSON data is then rendered in the browser.

---

## 17. Student Detail Workflow

The student detail view combines information from several parts of the system.

When a user selects a student:

```text
Select Student
      │
      ▼
Student Detail View
      │
      ├── Average Progress
      ├── Risk Level
      ├── Completed Assignments
      ├── Overdue Assignments
      ├── Learning Trend
      ├── Recommended Action
      └── AI Learning Coach
```

Trend information is requested from the backend.

AI Learning Coach reports can also be requested through the backend when they are available.

This creates a single teacher-facing view of the student's learning situation.

---

## 18. Report Architecture

AI-generated reports are stored in the development environment under:

```text
reports/
```

Examples include:

```text
student feedback
teacher reports
assignment summaries
learning recommendations
AI Learning Coach reports
teacher summaries
```

The backend provides access to supported student reports through:

```text
GET /reports/:studentId/:type
```

For example:

```text
GET /reports/S102/learning-coach
```

The frontend can then display the returned report.

---

## 19. Environment Configuration

Sensitive configuration is separated from the source code.

The project uses environment variables such as:

```text
GEMINI_API_KEY
OPENCLAW_GATEWAY_TOKEN
TELEGRAM_CHAT_ID
STUDENT_TELEGRAM_CHAT_ID
TEACHER_TELEGRAM_CHAT_ID
```

The real values are stored in:

```text
.env
```

The `.env` file is excluded from Git.

A safe template is provided through:

```text
.env.example
```

This prevents API keys, gateway tokens, and Telegram identifiers from being committed to the repository.

---

## 20. Testing Architecture

Testing is divided into two main automated levels.

### Vitest

Vitest tests application logic and service-level behavior.

The test suite covers:

- student analysis
- risk assessment
- trend analysis
- notification cooldown
- AI Tutor router
- Telegram service
- Gemini service
- mocked Gemini behavior

Current verified result:

```text
8 test files passed
52 tests passed
```

The structure is:

```text
Application Logic
       │
       ▼
    Vitest
       │
       ▼
Expected Behavior
```

### Playwright

Playwright tests the frontend from a browser/user perspective.

Current E2E coverage includes:

- dashboard loading
- student list
- student detail opening
- progress and risk information
- learning trend
- AI Learning Coach
- closing student details

Current verified result:

```text
7 Playwright tests passed
```

The structure is:

```text
Playwright
    │
    ▼
Browser
    │
    ▼
React Frontend
    │
    ▼
Express Backend
    │
    ▼
Mock Data / Reports
```

Together, the two approaches test different layers:

```text
Vitest
  ↓
Logic and services

Playwright
  ↓
Frontend workflows

Manual Review
  ↓
Overall prototype behavior
```

---

## 21. Complete Prototype Data Flow

The overall data flow can be represented as:

```text
              Mock Educational Data
                       │
                       ▼
                Student Analysis
                       │
             ┌─────────┴─────────┐
             ▼                   ▼
      Risk Assessment      Progress Snapshot
             │                   │
             │                   ▼
             │             Trend Analysis
             │                   │
             └─────────┬─────────┘
                       ▼
               Student Context
                       │
             ┌─────────┴─────────┐
             ▼                   ▼
      Notification Logic     AI Learning Coach
             │                   │
             ▼                   ▼
      Cooldown Check         Google Gemini
             │                   │
             ▼                   ▼
     Telegram Service       AI-generated Report
             │                   │
        ┌────┴────┐              │
        ▼         ▼              │
     Student    Teacher           │
                                  ▼
                            Express Backend
                                  │
                                  ▼
                           React Dashboard
```

Not every workflow must execute all components. For example, the dashboard can retrieve mock data directly through the backend without triggering a Telegram notification or Gemini request.

---

## 22. Architectural Design Decisions

### Mock Data Instead of Production Student Data

Mock educational data was selected because the project is a prototype.

This allows functionality to be developed and tested safely without depending on real institutional student information.

### Separate Service Modules

Risk assessment, Telegram communication, Gemini communication, and notification cooldown are implemented separately.

This improves:

- maintainability
- testability
- reuse
- debugging

### Separate Frontend and Backend

The React frontend and Express backend are separate components.

This makes the communication boundary clear and allows browser workflows to be tested independently.

### Environment-Based Secrets

API keys and Telegram identifiers are stored outside the repository.

This reduces the risk of accidentally exposing credentials through GitHub.

### Mocked AI Testing

Gemini behavior can be mocked during automated tests.

This makes testing:

- faster
- repeatable
- independent of API availability
- independent of API usage costs

### Multiple Testing Levels

Vitest and Playwright are intentionally used for different purposes.

Vitest verifies internal logic and services, while Playwright verifies important browser workflows.

---

## 23. Current Deployment Architecture

The prototype currently operates primarily as a local development system.

The current environment is:

```text
Developer Computer
       │
       ├── OpenClaw
       ├── Node.js Scripts
       ├── Express Backend
       ├── React/Vite Frontend
       ├── Mock JSON Data
       └── Generated Reports
              │
              ├── Google Gemini API
              └── Telegram
```

The required CSC deployment has not yet been finalized.

Therefore, this document does not describe CSC as part of the completed architecture.

The deployment architecture should be documented separately once the CSC deployment has been implemented and tested.

---

## 24. Current Limitations

The current architecture has several prototype-level limitations:

- JSON files are used instead of a production database
- educational information is mock data
- no production learning management system integration exists
- authentication and authorization are not production-ready
- progress history is stored locally
- notification history is stored locally
- generated reports are stored locally during development
- AI functionality depends on external Gemini availability
- Telegram functionality depends on valid bot configuration
- deployment to CSC is still pending
- the frontend is intended for prototype demonstration rather than production-scale use

These limitations are acceptable for the current prototype but would need to be addressed before production use.

---

## 25. Future Production Architecture

A more mature implementation could replace prototype components with production services.

For example:

```text
Current Prototype              Possible Production Version

JSON Mock Data        →        Database / LMS Integration

Local History Files   →        Persistent Database

Local Reports         →        Database / Object Storage

Local Backend         →        Hosted Backend Service

Development Frontend  →        Deployed Web Application

Manual User Mapping   →        Authentication / Authorization
```

These are possible future improvements and are not part of the currently completed prototype.

---

## 26. Architecture Summary

The OpenClaw AI Tutor prototype uses a modular architecture that separates educational data, analysis, AI functionality, notifications, backend services, frontend visualization, and automated testing.

The core architecture can be summarized as:

```text
Educational Data
      ↓
Student Analysis
      ↓
Risk + Trend
      ↓
Tutor Decision
   ↙       ↘
Gemini    Telegram
   ↓         ↓
AI Help   Notifications
   \         /
    \       /
     Backend API
         ↓
   React Dashboard
```

This architecture supports the main purpose of the prototype: demonstrating how an automated tutor can analyze student information, identify learning needs, provide AI-assisted guidance, communicate relevant information, and present results to users through a dashboard.