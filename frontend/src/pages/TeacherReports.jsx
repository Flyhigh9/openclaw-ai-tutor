import { useState } from "react";

function formatReportText(text) {
  const lines = text.split("\n");

  return lines.map((line, index) => {
    const trimmed = line.trim();

    if (!trimmed) {
      return <div key={index} className="report-spacer" />;
    }

    if (trimmed === "---") {
      return <hr key={index} className="report-divider" />;
    }

    if (trimmed.startsWith("### ")) {
      return (
        <h3 key={index} className="report-heading-3">
          {trimmed.replace("### ", "")}
        </h3>
      );
    }

    if (trimmed.startsWith("## ")) {
      return (
        <h2 key={index} className="report-heading-2">
          {trimmed.replace("## ", "")}
        </h2>
      );
    }

    if (trimmed.startsWith("# ")) {
      return (
        <h1 key={index} className="report-heading-1">
          {trimmed.replace("# ", "")}
        </h1>
      );
    }

    if (trimmed.startsWith("* ")) {
      return (
        <div key={index} className="report-list-item">
          <span className="report-bullet">•</span>
          <span>
            {trimmed
              .replace("* ", "")
              .replace(/\*\*/g, "")}
          </span>
        </div>
      );
    }

    return (
      <p key={index} className="report-paragraph">
        {trimmed.replace(/\*\*/g, "")}
      </p>
    );
  });
}

function TeacherReports() {
  const [studentId, setStudentId] = useState("S101");
  const [reportType, setReportType] = useState("teacher-report");
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadReport() {
    setLoading(true);
    setError("");
    setReport("");

    try {
      const response = await fetch(
        `http://localhost:3000/reports/${studentId}/${reportType}`
      );

      if (!response.ok) {
        throw new Error("Report could not be loaded.");
      }

      const data = await response.json();

      if (!data.content) {
        throw new Error("Report content was not found.");
      }

      setReport(data.content);
    } catch (err) {
      console.error("Report fetch error:", err);
      setError(
        err.message || "Could not load the selected report."
      );
    } finally {
      setLoading(false);
    }
  }

  const reportLabels = {
    feedback: "Student Feedback",
    "teacher-report": "Teacher Progress Report",
    "assignment-summary": "Assignment Summary",
    "learning-recommendation": "Learning Recommendation",
  };

  return (
    <section className="card teacher-reports" id="reports">
      <div className="teacher-report-header">
        <div>
          <span className="panel-label">
            AI Tutor Reports
          </span>

          <h2>Teacher Reports</h2>

          <p>
            Review generated student feedback, progress
            summaries and learning recommendations.
          </p>
        </div>
      </div>

      <div className="report-controls">
        <div className="report-field">
          <label htmlFor="student-select">
            Student
          </label>

          <select
            id="student-select"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
          >
            <option value="S101">
              S101 — Emma Virtanen
            </option>

            <option value="S102">
              S102 — Liam Nguyen
            </option>

            <option value="S103">
              S103 — Sara Ahmed
            </option>
          </select>
        </div>

        <div className="report-field report-type-field">
          <label htmlFor="report-select">
            Report Type
          </label>

          <select
            id="report-select"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="feedback">
              Student Feedback
            </option>

            <option value="teacher-report">
              Teacher Progress Report
            </option>

            <option value="assignment-summary">
              Assignment Summary
            </option>

            <option value="learning-recommendation">
              Learning Recommendation
            </option>
          </select>
        </div>

        <button
          type="button"
          onClick={loadReport}
          disabled={loading}
        >
          {loading ? "Loading..." : "Load Report"}
        </button>
      </div>

      {error && (
        <div className="report-error">
          {error}
        </div>
      )}

      {report && (
        <article className="formatted-report">
          <div className="formatted-report-topbar">
            <div>
              <span>Student</span>
              <strong>{studentId}</strong>
            </div>

            <div>
              <span>Report</span>
              <strong>
                {reportLabels[reportType]}
              </strong>
            </div>
          </div>

          <div className="formatted-report-content">
            {formatReportText(report)}
          </div>
        </article>
      )}

      {!report && !loading && !error && (
        <div className="report-placeholder">
          Select a student and report type, then choose
          <strong> Load Report</strong>.
        </div>
      )}
    </section>
  );
}

export default TeacherReports;