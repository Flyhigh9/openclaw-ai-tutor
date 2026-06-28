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
    <section className="card">
      <h2>Progress</h2>
      {progress.map((item, index) => (
        <p key={index}>
          {item.studentId} | {item.courseId} | {item.progressPercentage}% | Risk: {item.riskLevel}
        </p>
      ))}
    </section>
  );
}

export default Progress;