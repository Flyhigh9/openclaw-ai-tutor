import { useEffect, useState } from "react";

function Progress() {
  const [progress, setProgress] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/progress")
      .then((res) => res.json())
      .then((data) => setProgress(data))
      .catch((err) => console.error("Progress fetch error:", err));
  }, []);

  return (
    <section className="card" id="progress">
      <h2>📈 Progress</h2>

      <table>
        <thead>
          <tr>
            <th>Student ID</th>
            <th>Course ID</th>
            <th>Progress</th>
            <th>Risk Level</th>
          </tr>
        </thead>

        <tbody>
          {progress.map((item, index) => (
            <tr key={index}>
              <td>{item.studentId}</td>
              <td>{item.courseId}</td>
              <td>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${item.progressPercentage}%` }}
                  ></div>
                </div>
                <small>{item.progressPercentage}%</small>
              </td>
              <td>
                <span className={`badge ${item.riskLevel}`}>
                  {item.riskLevel}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default Progress;