import { useEffect, useState } from "react";

function Courses() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/courses")
      .then((res) => res.json())
      .then((data) => setCourses(data))
      .catch((err) => console.error("Courses fetch error:", err));
  }, []);

  return (
    <section className="card" id="courses">
  <h2>📚 Courses</h2>
      {courses.map((course) => (
        <p key={course.courseId}>
          {course.courseId} - {course.courseName}
        </p>
      ))}
    </section>
  );
}

export default Courses;