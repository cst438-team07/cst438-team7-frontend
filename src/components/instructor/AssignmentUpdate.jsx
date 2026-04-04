// Reece
//Displays assignment title and due date and allows instructor to edit the values.
//
// Show the id, title and due date of the assignment.
// Allow user to edit the title and due date. Buttons for Close and Save.

import { useState, useRef } from 'react';
import {GRADEBOOK_URL, REGISTRAR_URL} from '../../Constants';
import Messages from '../Messages';

const AssignmentUpdate = ({ editAssignment, onClose }) => {
  const [message, setMessage] = useState('');
  const [assignment, setAssignment] = useState({});
  const dialogRef = useRef();

  /*
   *  dialog for edit of an assignment
   */
  const editOpen = () => {
    setMessage('');
    setAssignment(editAssignment);
    // to be implemented.  invoke showModal() method on the dialog element.
    dialogRef.current.showModal();
  };

  const dialogClose = () => {
    dialogRef.current.close();
    onClose();
  };

  const editChange = (event) => {
    setAssignment({ ...assignment, [event.target.name]: event.target.value})
  };

  const onSave = async () => {
    try {
      const response = await fetch(`${GRADEBOOK_URL}/assignments`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": sessionStorage.getItem("jwt"),
        },
        body: JSON.stringify(assignment),
      });
      if (response.ok) {
        const newAssignment = await response.json();
        setMessage("Assignment " + newAssignment.title + " updated");
      } else {
        const body = await response.json();
        setMessage(body);
      }
    } catch (err) {
      setMessage(String(err));
    }
  }

return (
    <>
      <button onClick={editOpen}>Edit</button>
      <dialog ref={dialogRef}>
        <h2>Edit Course</h2>
        <Messages response={message} />
        <input type="text" name="title" value={assignment.title} placeholder="title" onChange={editChange} />
        <input type="date" name="dueDate" value={assignment.dueDate} placeholder="dueDate" onChange={editChange} />
        <button onClick={dialogClose}>Close</button>
        <button onClick={onSave}>Save</button>
      </dialog>
    </>
);
}

export default AssignmentUpdate;

