import { useEffect, useMemo, useState } from "react";

function Dashboard() {
  const [students, setStudents] = useState([]);
  const [progress, setProgress] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
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

        const [
          studentsData,
          progressData,
          assignmentsData,
          submissionsData,
        ] = await Promise.all([
          studentsRes.json(),
          progressRes.json(),
          assignmentsRes.json(),
          submissionsRes.json(),
        ]);

        setStudents(studentsData);
        setProgress(progressData);
        setAssignments(assignmentsData);
        setSubmissions(submissionsData);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const summary = useMemo(() => {
    const progressValues = progress
      .map((item) => Number(item.progressPercentage))
      .filter((value) => Number.isFinite(value));

    const averageProgress =
      progressValues.length > 0
        ? progressValues.reduce(
            (sum, value) => sum + value,
            0
          ) / progressValues.length
        : 0;

    const riskCounts = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
    };

    for (const item of progress) {
      const risk = String(
        item.riskLevel || ""
      ).toUpperCase();

      if (riskCounts[risk] !== undefined) {
        riskCounts[risk] += 1;
      }
    }

    const submittedIds = new Set(
      submissions.map(
        (submission) =>
          submission.assignmentId
      )
    );

    const now = new Date();

    const overdueAssignments =
      assignments.filter((assignment) => {
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
          !Number.isNaN(deadline.getTime()) &&
          deadline < now
        );
      });

    return {
      averageProgress,
      riskCounts,
      overdueAssignments,
    };
  }, [
    progress,
    assignments,
    submissions,
  ]);

  const attentionStudents = useMemo(() => {
    return progress
      .filter((item) => {
        const risk = String(
          item.riskLevel || ""
        ).toUpperCase();

        return (
          risk === "MEDIUM" ||
          risk === "HIGH"
        );
      })
      .slice(0, 5);
  }, [progress]);

  if (loading) {
    return (
      <section className="hero">
        <div className="hero-content">
          <div className="hero-copy">
            <span className="hero-label">
              OpenClaw AI Tutor
            </span>

            <h1>
              Student Learning Dashboard
            </h1>

            <p>
              Loading student learning data...
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <div className="hero-copy">
            <span className="hero-label">
              OpenClaw AI Tutor
            </span>

            <h1>
              Student Learning Dashboard
            </h1>

            <p>
              Monitor student progress, identify
              learning risks, review overdue work,
              and access AI-supported insights from
              one dashboard.
            </p>
          </div>

          <div className="hero-status">
            <div>
              <span>System</span>
              <strong>Active</strong>
            </div>

            <div>
              <span>Students</span>
              <strong>
                {students.length}
              </strong>
            </div>
          </div>
        </div>
      </section>

      <section className="dashboard-summary">
        <article className="summary-card">
          <div className="summary-icon">
            👥
          </div>

          <div>
            <span className="summary-label">
              Students
            </span>

            <strong>
              {students.length}
            </strong>

            <small>
              Total students monitored
            </small>
          </div>
        </article>

        <article className="summary-card">
          <div className="summary-icon">
            📈
          </div>

          <div>
            <span className="summary-label">
              Average Progress
            </span>

            <strong>
              {summary.averageProgress.toFixed(1)}%
            </strong>

            <small>
              Across progress records
            </small>
          </div>
        </article>

        <article className="summary-card">
          <div className="summary-icon">
            ⚠️
          </div>

          <div>
            <span className="summary-label">
              Need Attention
            </span>

            <strong>
              {summary.riskCounts.HIGH +
                summary.riskCounts.MEDIUM}
            </strong>

            <small>
              Medium or high risk
            </small>
          </div>
        </article>

        <article className="summary-card">
          <div className="summary-icon">
            ⏰
          </div>

          <div>
            <span className="summary-label">
              Overdue
            </span>

            <strong>
              {
                summary
                  .overdueAssignments
                  .length
              }
            </strong>

            <small>
              Outstanding overdue work
            </small>
          </div>
        </article>
      </section>

      <section className="dashboard-panels">
        <article className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-label">
                Current Status
              </span>

              <h2>Risk Overview</h2>
            </div>

            <span className="panel-description">
              Based on student progress
            </span>
          </div>

          <div className="risk-grid">
            <div className="risk-item risk-low">
              <div>
                <span>Low Risk</span>
                <small>
                  Performing normally
                </small>
              </div>

              <strong>
                {summary.riskCounts.LOW}
              </strong>
            </div>

            <div className="risk-item risk-medium">
              <div>
                <span>Medium Risk</span>
                <small>
                  Requires monitoring
                </small>
              </div>

              <strong>
                {
                  summary
                    .riskCounts
                    .MEDIUM
                }
              </strong>
            </div>

            <div className="risk-item risk-high">
              <div>
                <span>High Risk</span>
                <small>
                  Needs attention
                </small>
              </div>

              <strong>
                {summary.riskCounts.HIGH}
              </strong>
            </div>
          </div>
        </article>

        <article className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-label">
                Priority
              </span>

              <h2>
                Students Requiring Attention
              </h2>
            </div>

            <span className="panel-description">
              Medium and high risk
            </span>
          </div>

          <div className="attention-list">
            {attentionStudents.map(
              (item) => {
                const student =
                  students.find(
                    (entry) =>
                      entry.studentId ===
                      item.studentId
                  );

                const riskClass =
                  String(
                    item.riskLevel || ""
                  ).toLowerCase();

                return (
                  <div
                    className="attention-item"
                    key={`${item.studentId}-${item.courseId}`}
                  >
                    <div className="student-avatar">
                      {(
                        student?.name ||
                        item.studentId
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="attention-student">
                      <strong>
                        {student?.name ||
                          item.studentId}
                      </strong>

                      <span>
                        {item.studentId} ·{" "}
                        {item.courseId}
                      </span>
                    </div>

                    <div className="attention-meta">
                      <strong>
                        {
                          item.progressPercentage
                        }
                        %
                      </strong>

                      <span
                        className={`badge ${riskClass}`}
                      >
                        {item.riskLevel}
                      </span>
                    </div>
                  </div>
                );
              }
            )}

            {attentionStudents.length ===
              0 && (
              <div className="empty-state">
                <strong>
                  No students currently
                  require attention.
                </strong>

                <p>
                  All monitored students are
                  currently classified as low
                  risk.
                </p>
              </div>
            )}
          </div>
        </article>
      </section>
    </>
  );
}

export default Dashboard;