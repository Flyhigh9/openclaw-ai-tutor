import {
  describe,
  it,
  expect,
} from "vitest";

import { createRequire } from "module";

const require =
  createRequire(import.meta.url);

const {
  generateText,
} = require(
  "../src/services/geminiService"
);

describe("geminiService validation", () => {
  it("rejects an empty prompt", async () => {
    await expect(
      generateText({
        prompt: "",
      })
    ).rejects.toThrow(
      "Gemini prompt cannot be empty"
    );
  });

  it("rejects whitespace-only prompts", async () => {
    await expect(
      generateText({
        prompt: "   ",
      })
    ).rejects.toThrow(
      "Gemini prompt cannot be empty"
    );
  });

  it("rejects a missing prompt", async () => {
    await expect(
      generateText({})
    ).rejects.toThrow(
      "Gemini prompt cannot be empty"
    );
  });
});