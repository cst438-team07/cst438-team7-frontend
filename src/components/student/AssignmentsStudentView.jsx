import { useState } from 'react';
import { GRADEBOOK_URL } from '../../Constants';
import SelectTerm from '../SelectTerm';
import Messages from '../Messages';

const AssignmentsStudentView = () => {

  const [message, setMessage] = useState('');
  const [assignments, setAssignments] = useState([]);

  const fetchData = async ({ year, semester }) => {
    try {
      const response = await fetch(`${GRADEBOOK_URL}/assignments?year=${year}&semester=${semester}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': sessionStorage.getItem('jwt'),
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setAssignments(data);
      } else {
        const rc = await response.json();
        setMessage(rc);
      }
    } catch (err) {
      setMessage(err);
    }
  }

  const headers = ['Course', 'Title', 'DueDate', 'Score'];

  return (
    <>
      <h3>Assignments</h3>
      <Messages response={message} />

      <SelectTerm buttonText="Get Assignments" onClick={fetchData} />

     <table className="Center">
  <thead>
    <tr>
      {headers.map((h, i) => <th key={i}>{h}</th>)}
    </tr>
  </thead>
  <tbody>
    {assignments.map((a) => (
      <tr key={a.id}>
        <td>{a.courseId}</td>
        <td>{a.title}</td>
        <td>{a.dueDate}</td>
        <td>{a.score !== null ? a.score : 'N/A'}</td>
      </tr>
    ))}
  </tbody>
</table>
    </>
  );
}

export default AssignmentsStudentView;