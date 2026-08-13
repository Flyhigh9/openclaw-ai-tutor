require("dotenv").config({
  quiet: true,
  override: true,
});

const fs = require("fs");
const path = require("path");

const {
  sendTelegramMessage,
} = require("../src/services/telegramService");

const projectRoot = path.resolve(__dirname, "..");

const summaryPath = path.join(
  projectRoot,
  "reports",
  "teacher-daily-summary.md"
);

if (!process.env.OPENCLAW_GATEWAY_TOKEN) {
  console.error(
    "OPENCLAW_GATEWAY_TOKEN is missing from .env"
  );
  process.exit(1);
}

if (!process.env.TEACHER_TELEGRAM_CHAT_ID) {
  console.error(
    "TEACHER_TELEGRAM_CHAT_ID is missing from .env"
  );
  process.exit(1);
}

try {
  if (!fs.existsSync(summaryPath)) {
    throw new Error(
      `Teacher summary was not found: ${summaryPath}`
    );
  }

  const summaryContent = fs
    .readFileSync(
      summaryPath,
      "utf8"
    )
    .trim();

  if (!summaryContent) {
    throw new Error(
      "Teacher summary file is empty."
    );
  }

  const message = [
    "📊 OpenClaw AI Tutor",
    "",
    "Teacher Daily Summary",
    "",
    summaryContent,
    "",
    "– OpenClaw AI Tutor",
  ].join("\n");

  console.log(
    "Sending teacher daily summary..."
  );

  const delivery =
    sendTelegramMessage({
      chatId:
        process.env
          .TEACHER_TELEGRAM_CHAT_ID,

      message,

      gatewayToken:
        process.env
          .OPENCLAW_GATEWAY_TOKEN,
    });

  console.log(
    "Teacher daily summary sent successfully."
  );

  if (delivery.stdout) {
    console.log(
      delivery.stdout
    );
  }
} catch (error) {
  console.error(
    `Teacher summary delivery failed: ${error.message}`
  );

  process.exit(1);
}