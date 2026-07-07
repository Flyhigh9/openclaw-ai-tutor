import { useState } from "react";

function TeacherReports() {
  const [studentId, setStudentId] = useState("S101");
  const [reportType, setReportType] = useState("feedback");
  const [report, setReport] = useState("");

  function loadReport() {
    fetch(`http://localhost:3000/reports/${studentId}/${reportType}`)
      .then((res) => res.json())
      .then((data) => setReport(data.content || "Report not found."))
      .catch((err) => {
        console.error("Report fetch error:", err);
        setReport("Could not load report.");
      });
  }

  return (
    <section className="card" id="reports">
      <h2>👨‍🏫 Teacher Reports</h2>

      <div className="report-controls">
        <select value={studentId} onChange={(e) => setStudentId(e.target.value)}>
          <option value="S101">S101</option>
          <option value="S102">S102</option>
          <option value="S103">S103</option>
        </select>

        <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
          <option value="feedback">Student Feedback</option>
          <option value="teacher-report">Teacher Report</option>
          <option value="assignment-summary">Assignment Summary</option>
          <option value="learning-recommendation">Learning Recommendation</option>
        </select>

        <button onClick={loadReport}>Load Report</button>
      </div>

      {report && <pre className="report-box">{report}</pre>}
    </section>
  );
}

export default TeacherReports;