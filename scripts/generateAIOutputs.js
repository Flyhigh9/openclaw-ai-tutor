require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { GoogleGenAI } = require("@google/genai");

if (!process.env.GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is missing. Check your .env file.");
  process.exit(1);
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const studentId = process.argv[2];

if (!studentId) {
  console.log("Please provide a student ID.");
  console.log("Example: node scripts/generateAIOutputs.js S101");
  process.exit(1);
}

const rootDir = path.join(__dirname, "..");
const promptsDir = path.join(rootDir, "prompts");
const reportsDir = path.join(rootDir, "reports");

function readFile(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function writeFile(fileName, content) {
  const outputPath = path.join(reportsDir, fileName);
  fs.writeFileSync(outputPath, content);
  console.log(`Created: ${outputPath}`);
}

async function generateText(prompt, reportData) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `${prompt}

Student report data:
${reportData}`,
  });

  return response.text;
}

async function main() {
  const studentReportPath = path.join(reportsDir, `${studentId}-report.json`);

  if (!fs.existsSync(studentReportPath)) {
    console.log(`Report not found: ${studentReportPath}`);
    console.log(`First run: node scripts/generateStudentReport.js ${studentId}`);
    process.exit(1);
  }

  const reportData = readFile(studentReportPath);

  const tasks = [
    {
      promptFile: "studentFeedbackPrompt.md",
      outputFile: `${studentId}-feedback.md`,
    },
    {
      promptFile: "teacherReportPrompt.md",
      outputFile: `${studentId}-teacher-report.md`,
    },
    {
      promptFile: "assignmentSummaryPrompt.md",
      outputFile: `${studentId}-assignment-summary.md`,
    },
    {
      promptFile: "learningRecommendationPrompt.md",
      outputFile: `${studentId}-learning-recommendation.md`,
    },
  ];

  for (const task of tasks) {
    const prompt = readFile(path.join(promptsDir, task.promptFile));
    const result = await generateText(prompt, reportData);
    writeFile(task.outputFile, result);
  }

  console.log("All AI outputs generated successfully.");
}

main().catch((error) => {
  console.error("AI generation failed:", error.message);
});