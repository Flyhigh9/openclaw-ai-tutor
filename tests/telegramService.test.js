import {
  describe,
  it,
  expect,
} from "vitest";

import { createRequire } from "module";

const require =
  createRequire(import.meta.url);

const {
  sendTelegramMessage,
} = require(
  "../src/services/telegramService"
);

describe("telegramService validation", () => {
  it("rejects a missing chat ID", () => {
    expect(() =>
      sendTelegramMessage({
        chatId: "",
        message: "Hello",
        gatewayToken: "test-token",
      })
    ).toThrow(
      "Telegram chat ID is required"
    );
  });

  it("rejects an empty message", () => {
    expect(() =>
      sendTelegramMessage({
        chatId: "12345",
        message: "",
        gatewayToken: "test-token",
      })
    ).toThrow(
      "Telegram message cannot be empty"
    );
  });

  it("rejects a missing gateway token", () => {
    expect(() =>
      sendTelegramMessage({
        chatId: "12345",
        message: "Hello",
        gatewayToken: "",
      })
    ).toThrow(
      "OPENCLAW_GATEWAY_TOKEN is required"
    );
  });
});
