const { spawnSync } = require("child_process");

function sendTelegramMessage({
  chatId,
  message,
  gatewayToken,
}) {
  if (!chatId) {
    throw new Error(
      "Telegram chat ID is required."
    );
  }

  if (!message || !message.trim()) {
    throw new Error(
      "Telegram message cannot be empty."
    );
  }

  if (!gatewayToken) {
    throw new Error(
      "OPENCLAW_GATEWAY_TOKEN is required."
    );
  }

  const result = spawnSync(
    "openclaw",
    [
      "message",
      "send",
      "--channel",
      "telegram",
      "--target",
      chatId,
      "--message",
      message,
    ],
    {
      encoding: "utf8",
      env: {
        ...process.env,
        OPENCLAW_GATEWAY_TOKEN:
          gatewayToken,
      },
    }
  );

  if (result.error) {
    throw new Error(
      `Failed to start OpenClaw: ${result.error.message}`
    );
  }

  if (result.status !== 0) {
    const errorMessage =
      result.stderr?.trim() ||
      result.stdout?.trim() ||
      `OpenClaw exited with status ${result.status}`;

    throw new Error(
      `Telegram delivery failed: ${errorMessage}`
    );
  }

  return {
    success: true,
    stdout:
      result.stdout?.trim() || "",
  };
}

module.exports = {
  sendTelegramMessage,
};