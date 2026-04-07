import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { GRADEBOOK_URL } from '../../Constants';
import Messages from '../Messages';

const EnrollmentsView = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [message, setMessage] = useState('');

  const location = useLocation();
  const { secNo, courseId, secId } = location.state;

  const fetchEnrollments = async () => {
    try {
      const response = await fetch(`${GRADEBOOK_URL}/sections/${secNo}/enrollments`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': sessionStorage.getItem('jwt'),
        },
      });
      if (response.ok) {
        const data = await response.json();
        setEnrollments(data);
      } else {
        const body = await response.json();
        setMessage(body.message || "Failed to fetch enrollments");
      }
    } catch (err) {
      setMessage(err.toString());
    }
  }

  useEffect(() => {
    fetchEnrollments();
  }, []);

  // Update the grade in the local state when the user types
  const onGradeChange = (e, index) => {
    const newEnrollments = [...enrollments];
    newEnrollments[index].grade = e.target.value;
    setEnrollments(newEnrollments);
  };

  // Save all grades back to the server
  const saveGrades = async () => {
    try {
      const response = await fetch(`${GRADEBOOK_URL}/enrollments`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': sessionStorage.getItem('jwt'),
        },
        body: JSON.stringify(enrollments),
      });
      if (response.ok) {
        setMessage("Grades saved successfully!");
      } else {
        const body = await response.json();
        setMessage(body.message || "Error saving grades");
      }
    } catch (err) {
      setMessage(err.toString());
    }
  };

  return (
    <div className="container">
      <h3> {courseId}-{secId} Enrollments</h3>
      <Messages response={message} />
      
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Enrollment ID</th>
            <th>Student Name</th>
            <th>Email</th>
            <th>Grade</th>
          </tr>
        </thead>
        <tbody>
          {enrollments.map((row, index) => (
            <tr key={row.enrollmentId}>
              <td>{row.enrollmentId}</td>
              <td>{row.name}</td>
              <td>{row.email}</td>
              <td>
                <input 
                  type="text" 
                  value={row.grade || ''} 
                  onChange={(e) => onGradeChange(e, index)} 
                  style={{width: '50px'}}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <button className="btn btn-primary" onClick={saveGrades}>
        Save All Grades
      </button>
    </div>
  );
}

export default EnrollmentsView;
