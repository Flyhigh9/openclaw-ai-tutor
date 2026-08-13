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
  "teacher-weekly-summary.md"
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
      `Weekly teacher summary was not found: ${summaryPath}`
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
      "Weekly teacher summary file is empty."
    );
  }

  const message = [
    "📊 OpenClaw AI Tutor",
    "",
    "Weekly Teacher Summary",
    "",
    summaryContent,
    "",
    "– OpenClaw AI Tutor",
  ].join("\n");

  console.log(
    "Sending weekly teacher summary..."
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
    "Weekly teacher summary sent successfully."
  );

  if (delivery.stdout) {
    console.log(
      delivery.stdout
    );
  }
} catch (error) {
  console.error(
    `Weekly teacher summary delivery failed: ${error.message}`
  );

  process.exit(1);
}