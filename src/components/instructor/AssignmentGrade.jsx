// Reece
//Fetches the current grades for an assignment for all students enrolled in the
// section. Displays the student’s name and current assignment grade (may be blank)
// Allows instructor to enter a numeric score 0-100 for each student.

// Display table with columns headings as given in headers.
// For each student, display and allow the user to edit the student's score.
// Buttons for Close and Save.

import { useState, useRef } from 'react';
import {GRADEBOOK_URL, REGISTRAR_URL} from '../../Constants';
import Messages from '../Messages';

const AssignmentGrade = ({ assignment, onClose }) => {

  const [message, setMessage] = useState('');
  const [grades, setGrades] = useState([]);
  const dialogRef = useRef();

  const editOpen = () => {
    setMessage('');
    setGrades([]);
    if (assignment?.id) fetchGrades(assignment.id);
    // to be implemented.  invoke showModal() method on the dialog element.
    dialogRef.current.showModal();
  };

  const dialogClose = () => {
    dialogRef.current.close();
    if (onClose) onClose();
  };

  const fetchGrades = async (assignmentId) => {
    try {
      const response = await fetch(`${GRADEBOOK_URL}/assignments/${assignmentId}/grades`,
        {
          method: 'GET',
          headers: {
            'Authorization': sessionStorage.getItem('jwt'),
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        setGrades(data || []);
      } else {
        setMessage(data);
      }
    } catch (err) {
      setMessage(err);
    }
  }

  const editGrade = (gradeId, event) => {
    const newScore =
        event.target.value === '' ? null : Number(event.target.value);
    setGrades(
        grades.map((g) =>
            g.gradeId === gradeId
                ? { ...g, score: newScore }
                : g
        )
    );
  };

  const onSave = async () => {
    try {
      const response = await fetch(`${GRADEBOOK_URL}/grades`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": sessionStorage.getItem("jwt"),
        },
        body: JSON.stringify(grades),
      });
      if (response.ok) {
        dialogClose();
      } else {
        const body = await response.json();
        setMessage(body);
      }
    } catch (err) {
      setMessage(err);
    }
  };

  const headers = ['gradeId', 'student name', 'student email', 'score'];

  return (
    <>
      <button id="gradeButton" onClick={editOpen}>Grade</button>
      <dialog ref={dialogRef}>
        <h2>Grade Assignments</h2>
        <Messages response={message} />

        <table>
          <thead><tr>{headers.map((s, idx) => (<th key={idx}>{s}</th>))}</tr></thead>
          <tbody>{grades.length > 0 ? (grades.map((g) => (<tr key={g.gradeId}>
                    <td>{g.gradeId}</td>
                    <td>{g.studentName}</td>
                    <td>{g.studentEmail}</td>
                    <td>
                      <input type="number" value={g.score ?? ''} placeholder="score" min="0" max="100" onChange={(e) => editGrade(g.gradeId, e)}/>
                    </td>
                  </tr>))) : (<tr><td colSpan={4}>No students enrolled</td></tr>)}
          </tbody>
        </table>
        <button onClick={dialogClose}>Close</button>
        <button onClick={onSave}>Save</button>
      </dialog>
    </>
  );
};

export default AssignmentGrade;

