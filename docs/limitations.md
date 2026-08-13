# OpenClaw AI Tutor – Prototype Limitations

## 1. Overview

OpenClaw AI Tutor is an educational prototype developed to demonstrate automated student monitoring, AI-assisted learning support, teacher summaries, Telegram notifications, and a student progress dashboard.

The current system is intended for development, testing, and demonstration. It is not a production learning management system.

The following limitations describe the current scope of the prototype.

---

## 2. Mock Educational Data

The prototype currently uses JSON-based mock educational data for:

- students
- courses
- assignments
- submissions
- progress

The system is not connected to a real Learning Management System (LMS) or institutional student information system.

This approach allows the Tutor workflows to be developed and tested without using real student data.

---

## 3. Local File Storage

Several parts of the prototype use local files instead of a production database.

For example:

```text
data/progressHistory.json
data/notificationHistory.json
reports/
```

These files are suitable for prototype testing but are not designed for concurrent users, large datasets, or production-scale persistence.

A production implementation would require persistent database or storage services.

---

## 4. AI-Generated Content

Google Gemini is used to generate learning-related content such as:

- student feedback
- learning recommendations
- assignment summaries
- teacher reports
- AI Learning Coach content

AI-generated information may be incomplete or inaccurate.

The prototype attempts to provide verified student context to the AI before generation, but generated content should still be treated as supporting information rather than an authoritative academic assessment.

Important academic decisions should remain under human supervision.

---

## 5. External Service Dependency

Some functionality depends on external services.

These include:

```text
Google Gemini
Telegram
OpenClaw
```

If an external service is unavailable, incorrectly configured, or rate-limited, the related functionality may not work.

For example, Gemini-generated reports require a valid API configuration, while Telegram notifications require the bot, chat IDs, and OpenClaw integration to be configured correctly.

---

## 6. Telegram Notifications

Telegram is currently used as the main prototype notification channel.

This has several limitations:

- users require Telegram
- correct chat IDs must be configured
- bot configuration must be valid
- delivery depends on the external Telegram service
- the current implementation is intended for prototype communication rather than production educational messaging

Notification cooldown logic reduces repeated messages, but it does not represent a complete production notification management system.

---

## 7. Authentication and Authorization

The current dashboard does not provide a production-level authentication and authorization system.

The prototype does not currently implement complete role-based access control for students, teachers, administrators, or other institutional users.

This would be required before the system could handle real educational information.

---

## 8. Frontend Scope

The React dashboard is designed primarily to demonstrate the Tutor's monitoring and reporting functionality.

It currently focuses on:

- student information
- progress
- risk levels
- overdue assignments
- progress trends
- recommended actions
- AI Learning Coach information
- teacher reports

The dashboard is not intended to provide all functionality of a complete LMS.

---

## 9. Risk Assessment

Student risk is currently classified using prototype rules and available mock educational information.

The supported levels are:

```text
LOW
MEDIUM
HIGH
```

These classifications demonstrate how an automated monitoring system could identify students requiring attention.

They should not be interpreted as validated educational or psychological assessments.

---

## 10. Progress Trend Analysis

Trend analysis depends on saved progress snapshots.

Possible results include:

```text
IMPROVING
STABLE
DECLINING
NOT ENOUGH HISTORY
```

If insufficient progress history exists, the system cannot determine a meaningful trend.

The current trend model is intentionally simple and is designed for prototype demonstration.

---

## 11. Automated Monitoring

The monitoring workflow can analyze student information and determine whether a notification should be sent.

However, the current monitoring system is prototype-level.

It does not provide a production job queue, distributed scheduler, monitoring infrastructure, or guaranteed message delivery.

Local scheduling used during development is also dependent on the developer environment.

---

## 12. Testing Limitations

The project currently includes:

```text
52 passing Vitest tests
7 passing Playwright tests
```

These tests provide coverage for important logic, services, and dashboard workflows, but they do not guarantee that every possible application scenario is error-free.

Some external integrations still require manual testing, particularly:

- real Telegram message delivery
- OpenClaw gateway behavior
- real Gemini responses
- complete environment configuration

Second-person prototype review is also required before final project completion.

---

## 13. Deployment Status

The prototype has primarily been developed and tested in a local development environment.

CSC deployment is still pending.

Therefore, the current documentation should not describe the application as fully deployed or production-ready.

Deployment behavior and deployment-specific limitations should be updated after the CSC environment has been configured and tested.

---

## 14. Security and Privacy

The project uses environment variables for sensitive configuration such as:

```text
GEMINI_API_KEY
OPENCLAW_GATEWAY_TOKEN
TELEGRAM_CHAT_ID
STUDENT_TELEGRAM_CHAT_ID
TEACHER_TELEGRAM_CHAT_ID
```

Real credentials are excluded from Git.

However, the prototype has not undergone a complete production security review.

Because the project currently uses mock educational data, it has also not been designed or validated for storing real student personal information.

A production educational system would require additional work related to:

- authentication
- authorization
- data protection
- privacy
- secure storage
- access logging
- credential management

---

## 15. Scalability

The current architecture is designed for prototype-scale usage.

JSON files and locally generated reports are sufficient for demonstrating the system with a small mock dataset, but they are not suitable for a large number of students or simultaneous users.

A production implementation would require more scalable data storage and infrastructure.

---

## 16. Current Prototype Scope

The current prototype successfully demonstrates the main concept:

```text
Educational Data
       ↓
Student Analysis
       ↓
Risk and Trend Assessment
       ↓
Automated Tutor Decision
       ↓
AI Learning Support / Notifications
       ↓
Teacher and Student Information
       ↓
Dashboard
```

The goal of the project is to demonstrate and evaluate this workflow rather than build a complete production educational platform.

---

## 17. Possible Future Improvements

Possible future development could include:

- integration with a real LMS
- database-backed storage
- user authentication
- role-based authorization
- improved scheduling infrastructure
- additional notification channels
- more advanced risk assessment
- longer-term progress analytics
- expanded frontend functionality
- production security improvements
- deployed monitoring and logging

These are possible future improvements and are not requirements that have already been implemented.

---

## 18. Summary

The OpenClaw AI Tutor should currently be considered a **functional prototype**.

It demonstrates:

- student analysis
- progress and risk monitoring
- progress snapshots and trends
- automated reminders
- AI-generated learning support
- teacher summaries
- Telegram communication
- a React monitoring dashboard
- automated testing with Vitest and Playwright

Its main limitations are the use of mock data, local file storage, dependence on external AI and messaging services, lack of production authentication and security controls, and pending CSC deployment.

These limitations define the boundary between the current prototype and a future production-ready educational system.