# OpenClaw AI Tutor – Testing Documentation

## 1. Overview

Testing is used in the OpenClaw AI Tutor project to verify that the prototype behaves as expected and that changes do not break previously implemented functionality.

The project currently uses three testing approaches:

1. Vitest for application logic and service-level testing
2. Playwright for frontend end-to-end testing
3. Manual testing for integrations and overall prototype behavior

The automated tests are stored alongside the source code in the GitHub repository.

---

## 2. Testing Strategy

Different parts of the prototype require different types of testing.

The overall testing approach is:

```text
                    Prototype Testing
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
           Vitest      Playwright     Manual
              │            │            │
              ▼            ▼            ▼
          Logic &       Browser       External
          Services      Workflows    Integrations
```

Vitest is used for isolated application behavior.

Playwright is used to test important user workflows through the browser.

Manual testing is used where real external services such as Telegram, OpenClaw and Gemini are involved.

---

## 3. Vitest

Vitest is used as the main automated testing framework for application logic and services.

The root project contains:

```text
tests/
```

The current test files are:

```text
tests/aiTutorRouter.test.js
tests/analyzeStudent.test.js
tests/analyzeTrend.test.js
tests/geminiService.mock.test.js
tests/geminiService.test.js
tests/notificationCooldown.test.js
tests/riskAssessment.test.js
tests/telegramService.test.js
```

The tests can be run from the project root with:

```bash
npm run test:run
```

The script is defined in `package.json` as:

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run"
  }
}
```

---

## 4. Current Vitest Result

The latest verified test run produced:

```text
Test Files  8 passed (8)
Tests       52 passed (52)
```

Therefore, the current automated service and logic test suite contains:

```text
8 test files
52 passing tests
0 failing tests
```

---

## 5. Student Analysis Testing

Student analysis tests are located in:

```text
tests/analyzeStudent.test.js
```

Current number of tests:

```text
6
```

These tests verify the student analysis functionality used by the Tutor.

The analysis combines information such as:

- student data
- assignments
- submissions
- progress
- overdue work
- risk information

This helps verify that the monitoring system receives consistent student information before making decisions.

---

## 6. Risk Assessment Testing

Risk assessment tests are located in:

```text
tests/riskAssessment.test.js
```

Current number of tests:

```text
7
```

The risk assessment component classifies students into:

```text
LOW
MEDIUM
HIGH
```

The tests verify the behavior of the risk classification logic under different student conditions.

Risk assessment is tested separately from the frontend so that the core decision logic can be verified independently.

---

## 7. Trend Analysis Testing

Trend tests are located in:

```text
tests/analyzeTrend.test.js
```

Current number of tests:

```text
7
```

Trend analysis uses saved progress history to determine whether a student's situation is changing.

Possible results include:

```text
IMPROVING
STABLE
DECLINING
NOT ENOUGH HISTORY
```

The tests verify the comparison of previous and current student progress information.

---

## 8. Notification Cooldown Testing

Notification cooldown tests are located in:

```text
tests/notificationCooldown.test.js
```

Current number of tests:

```text
9
```

The cooldown functionality is important because automatic monitoring could otherwise send the same Telegram notification repeatedly.

The tests verify behavior related to notification history and whether a notification should be allowed or skipped.

This functionality was particularly important after repeated weekly notifications were observed during development.

---

## 9. Telegram Service Testing

Telegram service tests are located in:

```text
tests/telegramService.test.js
```

Current number of tests:

```text
3
```

These tests verify the reusable Telegram service behavior without requiring every automated test to send a real Telegram message.

Real Telegram delivery has also been checked manually during development.

---

## 10. Gemini Service Testing

Gemini testing is divided into two files:

```text
tests/geminiService.test.js
tests/geminiService.mock.test.js
```

The current test counts are:

```text
geminiService.test.js       3 tests
geminiService.mock.test.js  7 tests
```

The Gemini service tests verify the behavior of the AI integration layer.

The mocked tests allow Gemini-related behavior to be tested without depending on a real API request.

This makes the tests:

- repeatable
- faster
- independent of network availability
- independent of Gemini service availability
- safer for automated development testing

The mocked tests also verify error situations such as empty AI responses and API failures.

---

## 11. AI Tutor Router Testing

The command router tests are located in:

```text
tests/aiTutorRouter.test.js
```

Current number of tests:

```text
10
```

The command router provides access to Tutor operations through:

```text
scripts/aiTutor.js
```

The tests verify command handling and validation behavior.

The router is responsible for directing supported operations to the correct scripts.

---

## 12. Why Vitest Was Used

Vitest was selected because the project contains JavaScript-based application logic and services that can be tested independently from the browser.

It is suitable for testing:

- student analysis
- risk calculations
- trend analysis
- notification cooldown
- service behavior
- command routing
- mocked external dependencies

Vitest provides fast feedback while developing and changing these components.

---

## 13. Playwright End-to-End Testing

Playwright is used for browser-based end-to-end testing of the React dashboard.

The Playwright tests are located in:

```text
frontend/e2e/
```

The main test file is:

```text
frontend/e2e/dashboard.spec.js
```

Playwright was added after the main dashboard functionality was finalized.

This allows the project to test the prototype from a user's perspective rather than only testing individual functions.

---

## 14. Running Playwright Tests

Move to the frontend directory:

```bash
cd frontend
```

Run:

```bash
npm run test:e2e
```

Playwright launches the configured browser and executes the dashboard workflows.

---

## 15. Current Playwright Result

The latest verified Playwright run produced:

```text
Running 7 tests using 1 worker

7 passed
```

Therefore, the current E2E suite contains:

```text
7 tests
7 passing
0 failing
```

---

## 16. Playwright Test Coverage

The current Playwright suite verifies seven important dashboard workflows.

### Test 1 – Dashboard Loads

Verifies that the OpenClaw AI Tutor dashboard loads successfully.

### Test 2 – Student List Is Displayed

Verifies that the Students section is visible and student information appears in the interface.

### Test 3 – Student Detail View Opens

Verifies that the user can select a student and open the detailed student information.

### Test 4 – Progress and Risk Information

Verifies that the student detail view contains important monitoring information such as:

- average progress
- risk level
- overdue information
- recommended action

### Test 5 – Learning Trend

Verifies that student trend information can be displayed in the detail view.

### Test 6 – AI Learning Coach

Verifies that available AI Learning Coach information can be opened through the student interface.

### Test 7 – Close Student Detail

Verifies that the student detail interface can be closed correctly.

---

## 17. Why Playwright Was Added

Vitest and Playwright solve different testing problems.

Vitest verifies internal application logic.

For example:

```text
Input
  ↓
Risk Assessment Function
  ↓
Expected Risk Level
```

However, Vitest does not verify whether a user can successfully use the completed dashboard through a real browser.

Playwright verifies:

```text
Browser
   ↓
React Dashboard
   ↓
User Interaction
   ↓
Backend Request
   ↓
Displayed Result
```

For this reason, Playwright was added after the dashboard reached a sufficiently mature state.

---

## 18. Vitest and Playwright Together

The two frameworks provide complementary testing.

| Testing level | Tool | Purpose |
|---|---|---|
| Logic and services | Vitest | Verify internal application behavior |
| Browser workflow | Playwright | Verify frontend user workflows |
| External integrations | Manual testing | Verify real services and complete prototype behavior |

The project therefore does not use Playwright as a replacement for Vitest.

Both tools test different layers of the system.

---

## 19. Total Automated Testing

The current verified automated testing results are:

```text
Vitest
52 tests passed

Playwright
7 tests passed
```

This gives:

```text
59 automated tests/checks passing
```

The number represents tests from two different testing levels and should not be interpreted as 59 identical types of tests.

---

## 20. Manual Testing

Some parts of the prototype have also been tested manually during development.

Manual testing has been particularly useful for external integrations and complete workflows.

Areas checked manually during development include:

- OpenClaw installation and gateway operation
- Telegram bot pairing
- Telegram student notifications
- Telegram teacher notifications
- Gemini-generated reports
- AI Learning Coach output
- teacher summaries
- progress snapshots
- trend results
- backend API responses
- React dashboard behavior
- student detail view
- teacher report display

Manual testing remains important because automated tests do not fully reproduce all external service behavior.

---

## 21. Mock Data Testing

The prototype primarily uses mock educational data.

This allows the system to test realistic workflows without requiring real student information.

The mock data represents entities such as:

```text
Students
Courses
Assignments
Submissions
Progress
```

The mock dataset is used by:

- student analysis
- risk assessment
- trend analysis
- backend API
- dashboard
- AI Tutor workflows

This makes the prototype repeatable and suitable for demonstration.

---

## 22. Mocked Gemini Testing

Real AI APIs are not ideal for every automated test because responses may vary and external services may temporarily be unavailable.

Therefore, the project includes mocked Gemini tests.

The mocked tests simulate responses from the Gemini service.

A simplified test architecture is:

```text
Test
  ↓
Mock Gemini Response
  ↓
Gemini Service
  ↓
Expected Application Behavior
```

This allows AI-related application behavior to be tested without sending real Gemini API requests.

---

## 23. Testing External Services

External services require additional care.

### Google Gemini

Automated tests verify service behavior and mocked responses.

Real Gemini generation has also been tested manually.

### Telegram

Service behavior is tested automatically.

Actual message delivery is checked manually because it requires a configured Telegram bot and chat destination.

### OpenClaw

OpenClaw gateway and Telegram integration are primarily checked through integration and manual testing.

---

## 24. Testing Generated Runtime Files

The prototype creates runtime information such as:

```text
data/notificationHistory.json
data/progressHistory.json
```

These files are excluded from Git because they change while the application runs.

Testing should not depend on committing a developer's personal runtime history to the repository.

Generated Learning Coach and teacher summary files may also be excluded depending on the project `.gitignore` configuration.

---

## 25. Testing After Code Changes

After changing core Tutor logic, run:

```bash
npm run test:run
```

If frontend functionality was changed, also run:

```bash
cd frontend
npm run test:e2e
```

A useful development workflow is:

```text
Change Code
    ↓
Run Vitest
    ↓
Run Playwright when UI/workflow is affected
    ↓
Manual Integration Check if Required
    ↓
Commit Changes
```

Changes should not be considered finalized when important automated tests are failing.

---

## 26. Failed Tests During Development

Automated tests also helped identify problems during development.

For example, Playwright initially reported ambiguous selectors because some labels and student names appeared in multiple locations on the dashboard.

The selectors were then scoped more precisely to the relevant dashboard section.

After the corrections:

```text
7 Playwright tests passed
```

Gemini mocked tests also initially required corrections to the mocking approach.

After correcting the test implementation:

```text
52 Vitest tests passed
```

These examples demonstrate that the tests were actively used during development rather than being added only as documentation.

---

## 27. Second-Person Testing and Review

The automated test suites verify many technical behaviors, but the project also requires a second-person review of the mature prototype and documentation.

Current status:

```text
Developer / Assignee:
Pabitra Kunwar

Reviewer / Tester:
To be assigned

Review status:
Pending
```

The reviewer should verify at least:

- application starts using the documented instructions
- dashboard loads
- students are displayed
- student details open correctly
- progress information is understandable
- risk information is displayed
- trend information is displayed
- AI Learning Coach can be viewed where available
- automated tests can be executed
- architecture documentation is understandable
- usage instructions are understandable

After review, record:

```text
Reviewer / Tester:
[Name]

Review date:
[Date]

Result:
Passed / Changes requested

Comments:
[Short comments]
```

---

## 28. Current Testing Limitations

The current testing approach has some prototype-level limitations.

These include:

- external Gemini behavior is not completely covered by deterministic automated tests
- actual Telegram delivery still requires real integration testing
- OpenClaw gateway behavior is mainly integration/manual tested
- the project uses mock educational data rather than production data
- CSC deployment has not yet been tested
- browser E2E coverage focuses on the main dashboard workflows rather than every possible UI interaction
- second-person review is still pending

These limitations should be considered when evaluating the prototype.

---

## 29. CSC Deployment Testing

CSC deployment is currently pending.

After deployment, additional checks should verify:

- deployed service starts successfully
- required environment configuration is available
- mock educational data can be accessed
- Tutor functionality works in the deployed environment
- frontend/backend communication works as intended
- relevant external integrations work where required

Deployment should not be marked as tested until these checks have actually been completed.

---

## 30. Testing Summary

The OpenClaw AI Tutor currently uses a layered testing strategy:

```text
                 OpenClaw AI Tutor
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
       Vitest        Playwright       Manual
          │              │              │
     52 tests         7 tests      Integrations
          │              │              │
          └──────────────┼──────────────┘
                         ▼
                 Prototype Quality
```

Current verified automated results:

```text
Vitest:
8 test files passed
52 tests passed

Playwright:
7 tests passed

Current automated total:
59 passing tests/checks
```

The next testing milestone is second-person review and, after deployment, verification of the prototype in the CSC environment.