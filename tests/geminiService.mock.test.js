import {
  describe,
  it,
  expect,
  vi,
} from "vitest";

import { createRequire } from "module";

const require =
  createRequire(import.meta.url);

const {
  generateText,
} = require(
  "../src/services/geminiService"
);

describe(
  "geminiService mocked behavior",
  () => {
    it(
      "returns generated text from Gemini",
      async () => {
        const generateContent =
          vi.fn().mockResolvedValue({
            text:
              "Generated learning advice",
          });

        const fakeClient = {
          models: {
            generateContent,
          },
        };

        const result =
          await generateText({
            prompt:
              "Generate learning advice.",

            client: fakeClient,
          });

        expect(result).toBe(
          "Generated learning advice"
        );

        expect(
          generateContent
        ).toHaveBeenCalledTimes(1);
      }
    );

    it(
      "passes the correct prompt to Gemini",
      async () => {
        const generateContent =
          vi.fn().mockResolvedValue({
            text: "AI response",
          });

        const fakeClient = {
          models: {
            generateContent,
          },
        };

        await generateText({
          prompt:
            "Analyze student progress.",

          client: fakeClient,
        });

        expect(
          generateContent
        ).toHaveBeenCalledWith({
          model:
            "gemini-2.5-flash",

          contents:
            "Analyze student progress.",
        });
      }
    );

    it(
      "allows a custom model",
      async () => {
        const generateContent =
          vi.fn().mockResolvedValue({
            text: "AI response",
          });

        const fakeClient = {
          models: {
            generateContent,
          },
        };

        await generateText({
          prompt: "Test prompt",

          model:
            "gemini-test-model",

          client: fakeClient,
        });

        expect(
          generateContent
        ).toHaveBeenCalledWith({
          model:
            "gemini-test-model",

          contents:
            "Test prompt",
        });
      }
    );

    it(
      "throws when Gemini returns an empty response",
      async () => {
        const generateContent =
          vi.fn().mockResolvedValue({
            text: "",
          });

        const fakeClient = {
          models: {
            generateContent,
          },
        };

        await expect(
          generateText({
            prompt: "Test prompt",

            client: fakeClient,
          })
        ).rejects.toThrow(
          "Gemini returned an empty response"
        );
      }
    );

    it(
      "throws when Gemini returns whitespace only",
      async () => {
        const generateContent =
          vi.fn().mockResolvedValue({
            text: "   ",
          });

        const fakeClient = {
          models: {
            generateContent,
          },
        };

        await expect(
          generateText({
            prompt: "Test prompt",

            client: fakeClient,
          })
        ).rejects.toThrow(
          "Gemini returned an empty response"
        );
      }
    );

    it(
      "handles Gemini API errors",
      async () => {
        const generateContent =
          vi.fn().mockRejectedValue(
            new Error(
              "API unavailable"
            )
          );

        const fakeClient = {
          models: {
            generateContent,
          },
        };

        await expect(
          generateText({
            prompt: "Test prompt",

            client: fakeClient,
          })
        ).rejects.toThrow(
          "Gemini generation failed: API unavailable"
        );
      }
    );

    it(
      "handles rate limit errors",
      async () => {
        const generateContent =
          vi.fn().mockRejectedValue(
            new Error(
              "429 Too Many Requests"
            )
          );

        const fakeClient = {
          models: {
            generateContent,
          },
        };

        await expect(
          generateText({
            prompt: "Test prompt",

            client: fakeClient,
          })
        ).rejects.toThrow(
          "Gemini generation failed: 429 Too Many Requests"
        );
      }
    );
  }
);