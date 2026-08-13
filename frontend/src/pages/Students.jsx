import { useEffect, useMemo, useState } from "react";

function Students() {
  const [students, setStudents] = useState([]);
  const [progress, setProgress] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  const [selectedStudentId, setSelectedStudentId] =
    useState(null);

  const [trendData, setTrendData] = useState(null);
  const [trendLoading, setTrendLoading] =
    useState(false);

  const [coachReport, setCoachReport] = useState("");
  const [coachLoading, setCoachLoading] =
    useState(false);
  const [coachError, setCoachError] = useState("");
  const [showCoach, setShowCoach] = useState(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [
          studentsRes,
          progressRes,
          assignmentsRes,
          submissionsRes,
        ] = await Promise.all([
          fetch("http://localhost:3000/students"),
          fetch("http://localhost:3000/progress"),
          fetch("http://localhost:3000/assignments"),
          fetch("http://localhost:3000/submissions"),
        ]);

        const studentsData = await studentsRes.json();
        const progressData = await progressRes.json();
        const assignmentsData =
          await assignmentsRes.json();
        const submissionsData =
          await submissionsRes.json();

        setStudents(
          Array.isArray(studentsData)
            ? studentsData
            : []
        );

        setProgress(
          Array.isArray(progressData)
            ? progressData
            : []
        );

        setAssignments(
          Array.isArray(assignmentsData)
            ? assignmentsData
            : []
        );

        setSubmissions(
          Array.isArray(submissionsData)
            ? submissionsData
            : []
        );
      } catch (error) {
        console.error(
          "Students fetch error:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  useEffect(() => {
    if (!selectedStudentId) {
      setTrendData(null);
      return;
    }

    async function loadTrend() {
      setTrendLoading(true);
      setTrendData(null);

      try {
        const response = await fetch(
          `http://localhost:3000/students/${selectedStudentId}/trend`
        );

        if (!response.ok) {
          throw new Error(
            "Could not load trend data."
          );
        }

        const data = await response.json();

        setTrendData(data);
      } catch (error) {
        console.error(
          "Trend fetch error:",
          error
        );

        setTrendData({
          trend: "UNAVAILABLE",
        });
      } finally {
        setTrendLoading(false);
      }
    }

    loadTrend();
  }, [selectedStudentId]);

  useEffect(() => {
    setCoachReport("");
    setCoachError("");
    setShowCoach(false);
  }, [selectedStudentId]);

  const selectedStudent = useMemo(() => {
    return students.find(
      (student) =>
        student.studentId ===
        selectedStudentId
    );
  }, [students, selectedStudentId]);

  const studentDetails = useMemo(() => {
    if (!selectedStudent) {
      return null;
    }

    const studentProgress = progress.filter(
      (item) =>
        item.studentId ===
        selectedStudent.studentId
    );

    const courseIds = new Set(
      studentProgress.map(
        (item) => item.courseId
      )
    );

    const relevantAssignments =
      assignments.filter(
        (assignment) =>
          courseIds.has(
            assignment.courseId
          )
      );

    const studentSubmissions =
      submissions.filter(
        (submission) =>
          submission.studentId ===
          selectedStudent.studentId
      );

    const submittedIds = new Set(
      studentSubmissions.map(
        (submission) =>
          submission.assignmentId
      )
    );

    const completedAssignments =
      relevantAssignments.filter(
        (assignment) =>
          submittedIds.has(
            assignment.assignmentId
          )
      );

    const now = new Date();

    const overdueAssignments =
      relevantAssignments.filter(
        (assignment) => {
          if (
            submittedIds.has(
              assignment.assignmentId
            )
          ) {
            return false;
          }

          if (!assignment.deadline) {
            return false;
          }

          const deadline = new Date(
            `${assignment.deadline}T23:59:59`
          );

          return (
            !Number.isNaN(
              deadline.getTime()
            ) &&
            deadline < now
          );
        }
      );

    const progressValues =
      studentProgress
        .map((item) =>
          Number(
            item.progressPercentage
          )
        )
        .filter((value) =>
          Number.isFinite(value)
        );

    const averageProgress =
      progressValues.length > 0
        ? progressValues.reduce(
            (sum, value) =>
              sum + value,
            0
          ) / progressValues.length
        : 0;

    const riskValues =
      studentProgress.map((item) =>
        String(
          item.riskLevel || ""
        ).toUpperCase()
      );

    let riskLevel = "LOW";

    if (
      riskValues.includes("HIGH")
    ) {
      riskLevel = "HIGH";
    } else if (
      riskValues.includes(
        "MEDIUM"
      )
    ) {
      riskLevel = "MEDIUM";
    }

    let recommendedAction =
      "Continue regular learning activities and maintain consistent progress.";

    if (riskLevel === "HIGH") {
      recommendedAction =
        "Prioritize overdue assignments and consider teacher follow-up.";
    } else if (
      riskLevel === "MEDIUM"
    ) {
      recommendedAction =
        "Monitor progress and complete outstanding assignments.";
    }

    return {
      studentProgress,
      relevantAssignments,
      completedAssignments,
      overdueAssignments,
      averageProgress,
      riskLevel,
      recommendedAction,
    };
  }, [
    selectedStudent,
    progress,
    assignments,
    submissions,
  ]);

  function getTrendClass(trend) {
    const value = String(
      trend || ""
    ).toUpperCase();

    if (value === "IMPROVING") {
      return "improving";
    }

    if (value === "DECLINING") {
      return "declining";
    }

    if (value === "STABLE") {
      return "stable";
    }

    return "unknown";
  }

  function formatChange(value) {
    if (
      value === null ||
      value === undefined
    ) {
      return "—";
    }

    const number = Number(value);

    if (!Number.isFinite(number)) {
      return "—";
    }

    if (number > 0) {
      return `+${number}%`;
    }

    return `${number}%`;
  }

  async function loadLearningCoach() {
    if (!selectedStudentId) {
      return;
    }

    if (coachReport) {
      setShowCoach(
        (current) => !current
      );
      return;
    }

    setCoachLoading(true);
    setCoachError("");

    try {
      const response = await fetch(
        `http://localhost:3000/reports/${selectedStudentId}/learning-coach`
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(
            "No AI Learning Coach report has been generated for this student yet."
          );
        }

        throw new Error(
          "Could not load the AI Learning Coach report."
        );
      }

      const data = await response.json();

      if (!data.content) {
        throw new Error(
          "AI Learning Coach report is empty."
        );
      }

      setCoachReport(data.content);
      setShowCoach(true);
    } catch (error) {
      console.error(
        "Learning Coach fetch error:",
        error
      );

      setCoachError(error.message);
    } finally {
      setCoachLoading(false);
    }
  }

  if (loading) {
    return (
      <section
        className="card"
        id="students"
      >
        <h2>Students</h2>
        <p>Loading students...</p>
      </section>
    );
  }

  return (
    <section
      className="card students-section"
      id="students"
    >
      <div className="section-heading">
        <div>
          <span className="panel-label">
            Student Monitoring
          </span>

          <h2>Students</h2>

          <p>
            Review student information and
            open individual learning details.
          </p>
        </div>
      </div>

      <div className="students-table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Email</th>
              <th>Courses</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {students.map((student) => (
              <tr
                key={
                  student.studentId
                }
              >
                <td>
                  <div className="student-table-name">
                    <div className="student-avatar">
                      {student.name
                        ?.charAt(0)
                        .toUpperCase() ||
                        "?"}
                    </div>

                    <div>
                      <strong>
                        {student.name ||
                          "Unknown"}
                      </strong>

                      <span>
                        {
                          student.studentId
                        }
                      </span>
                    </div>
                  </div>
                </td>

                <td>
                  {student.email ||
                    "—"}
                </td>

                <td>
                  {student.courseIds
                    ?.length
                    ? student.courseIds.join(
                        ", "
                      )
                    : "—"}
                </td>

                <td>
                  <button
                    type="button"
                    className="details-button"
                    onClick={() =>
                      setSelectedStudentId(
                        student.studentId
                      )
                    }
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedStudent && (
        <div className="student-detail-panel">
          <div className="student-detail-header">
            <div className="student-detail-identity">
              <div className="student-detail-avatar">
                {selectedStudent.name
                  ?.charAt(0)
                  .toUpperCase() ||
                  "?"}
              </div>

              <div>
                <span className="panel-label">
                  Student Detail
                </span>

                <h3>
                  {
                    selectedStudent.name
                  }
                </h3>

                <p>
                  {
                    selectedStudent.studentId
                  }
                  {" · "}
                  {
                    selectedStudent.email
                  }
                </p>
              </div>
            </div>

            <button
              type="button"
              className="close-details-button"
              onClick={() =>
                setSelectedStudentId(
                  null
                )
              }
            >
              Close
            </button>
          </div>

          <div className="student-detail-stats">
            <div>
              <span>
                Average Progress
              </span>

              <strong>
                {studentDetails
                  ? `${studentDetails.averageProgress.toFixed(
                      1
                    )}%`
                  : "0%"}
              </strong>
            </div>

            <div>
              <span>
                Risk Level
              </span>

              <strong
                className={`detail-risk ${
                  studentDetails
                    ?.riskLevel
                    ?.toLowerCase() ||
                  "low"
                }`}
              >
                {studentDetails
                  ?.riskLevel ||
                  "LOW"}
              </strong>
            </div>

            <div>
              <span>
                Completed
              </span>

              <strong>
                {studentDetails
                  ? `${studentDetails.completedAssignments.length}/${studentDetails.relevantAssignments.length}`
                  : "0/0"}
              </strong>
            </div>

            <div>
              <span>
                Overdue
              </span>

              <strong>
                {studentDetails
                  ? studentDetails
                      .overdueAssignments
                      .length
                  : 0}
              </strong>
            </div>
          </div>

          <div className="trend-card">
            <div className="trend-card-header">
              <div>
                <span className="panel-label">
                  Progress History
                </span>

                <h4>
                  Learning Trend
                </h4>
              </div>

              {trendLoading ? (
                <span className="trend-status unknown">
                  Loading...
                </span>
              ) : (
                <span
                  className={`trend-status ${getTrendClass(
                    trendData?.trend
                  )}`}
                >
                  {trendData?.trend ||
                    "UNAVAILABLE"}
                </span>
              )}
            </div>

            {!trendLoading && (
              <div className="trend-metrics">
                <div>
                  <span>
                    Previous
                  </span>

                  <strong>
                    {trendData
                      ?.previousProgress !==
                      null &&
                    trendData
                      ?.previousProgress !==
                      undefined
                      ? `${trendData.previousProgress}%`
                      : "—"}
                  </strong>
                </div>

                <div>
                  <span>
                    Current
                  </span>

                  <strong>
                    {trendData
                      ?.currentProgress !==
                      null &&
                    trendData
                      ?.currentProgress !==
                      undefined
                      ? `${trendData.currentProgress}%`
                      : "—"}
                  </strong>
                </div>

                <div>
                  <span>
                    Change
                  </span>

                  <strong>
                    {formatChange(
                      trendData
                        ?.progressChange
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Risk Change
                  </span>

                  <strong className="trend-risk-change">
                    {trendData
                      ?.previousRisk
                      ? `${trendData.previousRisk} → ${trendData.currentRisk}`
                      : trendData
                          ?.currentRisk ||
                        "—"}
                  </strong>
                </div>
              </div>
            )}
          </div>

          <div className="student-detail-grid">
            <div className="student-detail-block">
              <span className="panel-label">
                Courses
              </span>

              <h4>
                Enrolled Courses
              </h4>

              <div className="course-tags">
                {selectedStudent
                  .courseIds
                  ?.length ? (
                  selectedStudent.courseIds.map(
                    (courseId) => (
                      <span
                        key={
                          courseId
                        }
                      >
                        {
                          courseId
                        }
                      </span>
                    )
                  )
                ) : (
                  <span>
                    No courses
                  </span>
                )}
              </div>
            </div>

            <div className="student-detail-block">
              <span className="panel-label">
                Recommendation
              </span>

              <h4>
                Recommended Action
              </h4>

              <p>
                {studentDetails
                  ?.recommendedAction ||
                  "No recommendation available."}
              </p>
            </div>
          </div>

          <div className="student-detail-block overdue-detail-block">
            <span className="panel-label">
              Outstanding Work
            </span>

            <h4>
              Overdue Assignments
            </h4>

            {studentDetails &&
            studentDetails
              .overdueAssignments
              .length > 0 ? (
              <div className="overdue-list">
                {studentDetails.overdueAssignments.map(
                  (assignment) => (
                    <div
                      key={
                        assignment.assignmentId
                      }
                      className="overdue-item"
                    >
                      <div>
                        <strong>
                          {
                            assignment.title
                          }
                        </strong>

                        <span>
                          {
                            assignment.assignmentId
                          }
                          {" · "}
                          {
                            assignment.courseId
                          }
                        </span>
                      </div>

                      <span>
                        Due{" "}
                        {
                          assignment.deadline
                        }
                      </span>
                    </div>
                  )
                )}
              </div>
            ) : (
              <p className="no-overdue">
                No overdue assignments.
              </p>
            )}
          </div>

          <div className="learning-coach-card">
            <div className="learning-coach-header">
              <div>
                <span className="panel-label">
                  Gemini AI
                </span>

                <h4>
                  AI Learning Coach
                </h4>

                <p>
                  View personalized learning
                  guidance generated from the
                  student's verified learning
                  context.
                </p>
              </div>

              <button
                type="button"
                className="coach-button"
                onClick={
                  loadLearningCoach
                }
                disabled={
                  coachLoading
                }
              >
                {coachLoading
                  ? "Loading..."
                  : coachReport &&
                      showCoach
                    ? "Hide Coach"
                    : coachReport
                      ? "Show Coach"
                      : "View Coach"}
              </button>
            </div>

            {coachError && (
              <div className="coach-error">
                {coachError}
              </div>
            )}

            {coachReport &&
              showCoach && (
                <div className="learning-coach-content">
                  <pre>
                    {
                      coachReport
                    }
                  </pre>
                </div>
              )}
          </div>
        </div>
      )}
    </section>
  );
}

export default Students;