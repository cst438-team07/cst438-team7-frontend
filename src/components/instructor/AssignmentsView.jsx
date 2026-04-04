// Reece
// Fetches assignments for a section. Displays assignments using table format
// Allows instructor to edit, delete, grade an assignment or add a new assignment
//
// Display a table. Column headings are as given in headers.
// For each row, show the id, title, due date of the assignment
// along with buttons to edit and delete the assignment

import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom'
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import {GRADEBOOK_URL, REGISTRAR_URL} from '../../Constants';
import AssignmentAdd from './AssignmentAdd';
import AssignmentUpdate from './AssignmentUpdate';
import AssignmentGrade from './AssignmentGrade';
import Messages from '../Messages';
import UserUpdate from "../admin/UserUpdate.jsx";
import UserAdd from "../admin/UserAdd.jsx";
import CourseUpdate from "../admin/CourseUpdate.jsx";


const AssignmentsView = () => {

  const [assignments, setAssignments] = useState([]);
  const [message, setMessage] = useState('');

  const location = useLocation();
  const { secNo, courseId, secId } = location.state;


  const fetchAssignments = async () => {

    try {
      const response = await fetch(`${GRADEBOOK_URL}/sections/${secNo}/assignments`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': sessionStorage.getItem("jwt"),
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setAssignments(data);
      } else {
        const body = await response.json();
        setMessage(body);
      }
    } catch (err) {
      setMessage(err);
    }
  }

  useEffect(() => {
    fetchAssignments()
  }, []);

  const onDelete = (assignmentId) => {
    confirmAlert({
      title: "Confirm to delete",
      message: "Do you really want to delete?",
      buttons: [
        {
          label: "Yes",
          onClick: () => deleteAssignment(assignmentId),
        },
        {
          label: "No",
        },
      ],
    });
  };

  const deleteAssignment = async (assignmentId) => {
    try {
      const response = await fetch(`${GRADEBOOK_URL}/assignments/${assignmentId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": sessionStorage.getItem("jwt"),
        },
      });
      if (response.ok) {
        setMessage("Assignment deleted");
        await fetchAssignments();
      } else {
        const body = await response.json();
        setMessage(body);
      }
    } catch (err) {
      setMessage(err);
    }
  };

  // Convert date format for display
  // Fix off by one error
  const formatDueDate = (dateString) => {
    if (!dateString) return '';
    // Parse as YYYY-MM-DD, assume local time
    const [year, month, day] = dateString.split('-').map(Number);
    const d = new Date(year, month - 1, day); // month is 0‑indexed
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const yy = String(d.getFullYear()).slice(-2);
    return `${mm}-${dd}-${yy}`;
  };

  const headers = ['id', 'Title', 'Due Date', '', '', ''];

return (
    <>
      <h3>Assignment View</h3>
      <Messages response={message} />
      <table className="Center">
        <thead>
        <tr>
          {headers.map((s, idx) => (
              <th key={idx}>{s}</th>
          ))}
        </tr>
        </thead>
        <tbody>
        {assignments.map((assignment) => (
            <tr key={assignment.id}>
              <td>{assignment.id}</td>
              <td>{assignment.title}</td>
              <td>{formatDueDate(assignment.dueDate)}</td>
              <td><AssignmentGrade assignment = {assignment} onClose={fetchAssignments} /></td>
              <td><AssignmentUpdate editAssignment={assignment} onClose={fetchAssignments} /></td>
              <td><button onClick={() => onDelete(assignment.id)}>Delete</button></td>
            </tr>
        ))}
        </tbody>
      </table>
      <AssignmentAdd secNo={secNo} onClose={fetchAssignments} />
    </>
);
}
export default AssignmentsView;

