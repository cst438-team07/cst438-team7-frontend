import { useState, useEffect } from 'react';
import { REGISTRAR_URL } from '../../Constants';
import Messages from '../Messages';

const Transcript = () => {
  const [message, setMessage] = useState('');
  const [courses, setCourses] = useState([]);

  const fetchData = async () => {
    try {
      const response = await fetch(`${REGISTRAR_URL}/transcripts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': sessionStorage.getItem('jwt'),
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      } else {
        const body = await response.json();
        setMessage(body.message || 'Error fetching transcript.');
      }
    } catch (err) {
      setMessage(err.toString());
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const headers = ['Year', 'Semester', 'CourseId', 'Section', 'Title', 'Credits', 'Grade'];

  // Extract student metadata from first row (if exists)
  const studentId = courses.length > 0 ? courses[0].studentId : '';
  const studentName = courses.length > 0 ? courses[0].name : '';

  return (
      <>
        <h3>Transcript</h3>

        {message && <Messages message={message} />}

        {courses.length === 0 ? (
            <p>No transcript data found.</p>
        ) : (
            <>
              <h5>Student id : {studentId}</h5>
              <h5>Student name : {studentName}</h5>

              <table className="table table-striped" style={{ marginTop: '20px' }}>
                <thead>
                <tr>
                  {headers.map((h) => (
                      <th key={h}>{h}</th>
                  ))}
                </tr>
                </thead>

                <tbody>
                {courses.map((c, idx) => (
                    <tr key={idx}>
                      <td>{c.year}</td>
                      <td>{c.semester}</td>
                      <td>{c.courseId}</td>
                      <td>{c.sectionNo}</td>
                      <td>{c.title}</td>
                      <td>{c.credits}</td>
                      <td>{c.grade}</td>
                    </tr>
                ))}
                </tbody>
              </table>
            </>
        )}
      </>
  );
};

export default Transcript;