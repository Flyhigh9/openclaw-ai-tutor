# OpenClaw AI Tutor – Installation Guide

## 1. Overview

This guide explains how to install and run the OpenClaw AI Tutor prototype in a local development environment.

The prototype consists of:

- Node.js/Express backend
- React/Vite frontend
- OpenClaw integration
- Google Gemini integration
- Telegram integration
- mock educational data
- Vitest and Playwright tests

---

## 2. Prerequisites

Before installing the project, make sure the following tools are available:

- Git
- Node.js
- npm
- OpenClaw
- a modern web browser
- a code editor such as Visual Studio Code

For the AI and notification features, the following are also required:

- Google Gemini API key
- configured Telegram bot
- Telegram chat IDs
- OpenClaw gateway configuration

---

## 3. Clone the Repository

Clone the GitHub repository:

```bash
git clone https://github.com/Flyhigh9/openclaw-ai-tutor.git
```

Enter the project directory:

```bash
cd openclaw-ai-tutor
```

---

## 4. Install Project Dependencies

Install the root dependencies:

```bash
npm install
```

Install the backend dependencies:

```bash
cd backend
npm install
cd ..
```

Install the frontend dependencies:

```bash
cd frontend
npm install
cd ..
```

For Playwright browser testing, install Chromium:

```bash
cd frontend
npx playwright install chromium
cd ..
```

---

## 5. Configure Environment Variables

The project uses environment variables for Gemini, OpenClaw and Telegram.

Create a local `.env` file using `.env.example`:

```bash
cp .env.example .env
```

Configure the required values:

```env
GEMINI_API_KEY=your_gemini_api_key
OPENCLAW_GATEWAY_TOKEN=your_openclaw_gateway_token
TELEGRAM_CHAT_ID=your_telegram_chat_id
STUDENT_TELEGRAM_CHAT_ID=your_student_chat_id
TEACHER_TELEGRAM_CHAT_ID=your_teacher_chat_id
```

Only configure the variables required by the workflow you are testing.

Do not commit the real `.env` file to GitHub. The repository contains `.env.example` only as a configuration template.

---

## 6. Verify OpenClaw

Check that OpenClaw is installed:

```bash
openclaw --version
```

The prototype has been developed using a local OpenClaw gateway.

If necessary, restart the gateway:

```bash
openclaw gateway restart
```

OpenClaw configuration and credentials should remain outside the Git repository.

---

## 7. Start the Backend

From the project root, run:

```bash
node backend/server.js
```

The backend should start at:

```text
http://localhost:3000
```

To verify it, open the address in a browser.

You can also check an endpoint such as:

```text
http://localhost:3000/students
```

If JSON student data is returned, the backend is working.

---

## 8. Start the Frontend

Keep the backend running and open another terminal.

Move to the frontend directory:

```bash
cd frontend
```

Start the Vite development server:

```bash
npm run dev
```

Vite will display the frontend address in the terminal, normally similar to:

```text
http://localhost:5173
```

Open the displayed address in a browser.

The OpenClaw AI Tutor dashboard should now be visible.

---

## 9. Verify the Application

After starting the backend and frontend, verify that:

- the dashboard loads without errors
- the student list is visible
- courses and assignments are displayed
- progress information is displayed
- risk levels are visible
- student details can be opened
- learning trend information loads
- available AI Learning Coach information can be viewed
- teacher reports can be accessed where available

---

## 10. Run Automated Tests

### Vitest

From the project root:

```bash
npm run test:run
```

Current verified result:

```text
8 test files passed
52 tests passed
```

### Playwright

From the frontend directory:

```bash
cd frontend
npm run test:e2e
```

Current verified result:

```text
7 tests passed
```

Vitest is used mainly for application logic and service testing, while Playwright tests the main frontend workflows in a browser.

---

## 11. Basic Troubleshooting

### Backend does not start

Check whether port `3000` is already in use:

```bash
lsof -i :3000
```

### Frontend does not display data

Make sure the backend is running at:

```text
http://localhost:3000
```

### Gemini functionality does not work

Check that `GEMINI_API_KEY` is correctly configured in `.env`.

### Telegram functionality does not work

Check the Telegram chat IDs, bot configuration and OpenClaw gateway configuration.

Never share API keys, gateway tokens or other credentials while troubleshooting.

---

## 12. Deployment

These instructions describe the current local development setup.

Deployment to the CSC environment is still pending. Deployment instructions will be added after the CSC version has been configured and tested.

---

## 13. Next Documentation

For information about how to operate the Tutor features after installation, see:

```text
docs/usage.md
```

For the internal system design, see:

```text
docs/architecture.md
```

For detailed testing information, see:

```text
docs/testing.md
```