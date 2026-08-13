require("dotenv").config({
  quiet: true,
  override: true,
});

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const {
  generateText,
} = require("../src/services/geminiService");

const projectRoot = path.resolve(__dirname, "..");
const promptsDir = path.join(projectRoot, "prompts");
const reportsDir = path.join(projectRoot, "reports");

const studentId = process.argv[2];

if (!studentId) {
  console.error(
    "Usage: node scripts/coachStudent.js <studentId>"
  );
  process.exit(1);
}

if (!/^S\d+$/i.test(studentId)) {
  console.error(
    `Invalid student ID: ${studentId}`
  );
  process.exit(1);
}

function getVerifiedStudentContext(id) {
  const scriptPath = path.join(
    projectRoot,
    "scripts",
    "buildStudentContext.js"
  );

  const result = spawnSync(
    process.execPath,
    [scriptPath, id],
    {
      cwd: projectRoot,
      encoding: "utf8",
      env: process.env,
    }
  );

  if (result.error) {
    throw new Error(
      `Could not build student context: ${result.error.message}`
    );
  }

  if (result.status !== 0) {
    throw new Error(
      result.stderr ||
        "Student context generation failed."
    );
  }

  const marker =
    "Verified Student Context";

  const markerIndex =
    result.stdout.indexOf(marker);

  if (markerIndex === -1) {
    throw new Error(
      "Verified student context was not found."
    );
  }

  const separator =
    "========================";

  const separatorIndex =
    result.stdout.indexOf(
      separator,
      markerIndex
    );

  if (separatorIndex === -1) {
    throw new Error(
      "Could not locate student context JSON."
    );
  }

  const jsonText =
    result.stdout
      .slice(
        separatorIndex +
          separator.length
      )
      .trim();

  try {
    return JSON.parse(jsonText);
  } catch (error) {
    throw new Error(
      `Could not parse verified student context: ${error.message}`
    );
  }
}

function buildCoachPrompt(
  basePrompt,
  context
) {
  return `
${basePrompt}

## Verified Data Rules

Use ONLY the verified student context supplied below.

Do not invent:

- grades
- assignment scores
- teacher names
- teacher contact details
- courses
- assignments
- deadlines
- feedback
- attendance
- strengths
- weaknesses
- learning difficulties
- personal information

If information is not included in the verified context, do not claim that it exists.

When discussing positive progress, use only measurable information such as:

- completed assignments
- progress percentage
- reduced overdue assignments
- improved risk status
- positive progress trend

When discussing areas requiring attention, use only:

- overdue assignments
- upcoming assignments
- progress percentage
- risk level
- progress trend

If trend.status is "NOT ENOUGH HISTORY", do not claim that the student is improving or declining.

## Verified Student Context

${JSON.stringify(context, null, 2)}
`;
}

async function main() {
  const promptPath = path.join(
    promptsDir,
    "studentCoachPrompt.md"
  );

  if (!fs.existsSync(promptPath)) {
    throw new Error(
      `Prompt file was not found: ${promptPath}`
    );
  }

  fs.mkdirSync(
    reportsDir,
    {
      recursive: true,
    }
  );

  console.log(
    `Building verified student context for ${studentId}...`
  );

  const context =
    getVerifiedStudentContext(
      studentId
    );

  console.log(
    `Verified context created for ${context.student.name}.`
  );

  console.log(
    `Progress: ${context.learningStatus.averageProgress}%`
  );

  console.log(
    `Risk: ${context.learningStatus.riskLevel}`
  );

  console.log(
    `Trend: ${context.trend.status}`
  );

  const basePrompt =
    fs.readFileSync(
      promptPath,
      "utf8"
    );

  const prompt =
    buildCoachPrompt(
      basePrompt,
      context
    );

  console.log(
    `Generating AI Learning Coach report for ${studentId}...`
  );

  const report =
    await generateText({
      prompt,
      model: "gemini-2.5-flash",
    });

  const outputPath = path.join(
    reportsDir,
    `${studentId}-learning-coach.md`
  );

  fs.writeFileSync(
    outputPath,
    report,
    "utf8"
  );

  console.log(
    `Created: ${outputPath}`
  );

  console.log(
    "AI Learning Coach report generated successfully."
  );
}

main().catch((error) => {
  console.error(
    `Learning coach generation failed: ${error.message}`
  );

  process.exit(1);
});