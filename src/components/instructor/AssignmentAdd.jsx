import { useState, useRef } from 'react';
import {GRADEBOOK_URL, REGISTRAR_URL} from '../../Constants';
import Messages from '../Messages';

const AssignmentAdd = ({ onClose, secNo }) => {

  const [message, setMessage] = useState('');
  const [assignment, setAssignment] = useState({ title: '', dueDate: '', secNo});
  const dialogRef = useRef();

  const dialogClose = () => {
    dialogRef.current.close();
    onClose();
  };

  const editChange = (event) => {
    setAssignment({ ...assignment, [event.target.name]: event.target.value})
  };

  /*
   *  dialog for add assignment
   */
  const editOpen = () => {
    setMessage('');
    setAssignment({ title: '', dueDate: '' ,secNo});
    // to be implemented.  invoke showModal() method on the dialog element.
    dialogRef.current.showModal();
  };

  const onSave = async () => {
    try {
      const response = await fetch(`${GRADEBOOK_URL}/assignments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": sessionStorage.getItem("jwt"),
        },
        body: JSON.stringify(assignment),
      });
      if (response.ok) {
        const newAssignment = await response.json();
        setMessage("Assignment " + newAssignment.title + " added");
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
      <button id="addAssignmentButton" onClick={editOpen}>Add Assignment</button>
      <dialog ref={dialogRef} >
        <h2>Add Assignment</h2>
        <Messages response={message} />
        <input type="text" name="title" value={assignment.title} placeholder="title" onChange={editChange} />
        <input type="date" name="dueDate" value={assignment.dueDate} placeholder="dueDate" onChange={editChange} />
        <button onClick={dialogClose}>Close</button>
        <button onClick={onSave}>Save</button>
      </dialog>
    </>
  )
}

export default AssignmentAdd;

// To be implemented. Prompt for title, due. With buttons for Close and Save.