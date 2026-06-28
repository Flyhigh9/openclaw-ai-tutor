import { useEffect, useState } from "react";

function Students() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/students")
      .then((res) => res.json())
      .then((data) => setStudents(data))
      .catch((err) => console.error("Students fetch error:", err));
  }, []);

  return (
    <section className="card">
      <h2>Students</h2>
      {students.map((student) => (
        <p key={student.studentId}>
          {student.studentId} - {student.name}
        </p>
      ))}
    </section>
  );
}

export default Students;