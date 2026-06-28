import { useEffect, useState } from "react";

function Assignments() {
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/assignments")
      .then((res) => res.json())
      .then((data) => setAssignments(data))
      .catch((err) => console.error("Assignments fetch error:", err));
  }, []);

  return (
    <section className="card">
      <h2>Assignments</h2>
      {assignments.map((assignment) => (
        <p key={assignment.assignmentId}>
          {assignment.assignmentId} - {assignment.title} | Deadline: {assignment.deadline}
        </p>
      ))}
    </section>
  );
}

export default Assignments;