import { useState } from 'react';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { REGISTRAR_URL } from '../../Constants';
import SelectTerm from '../SelectTerm';
import Messages from '../Messages';

/*
 * Component: ScheduleView
 * --------------------------------------------------
 * Purpose:
 *  - Allows a student to view their enrolled courses for a selected term
 *  - Displays enrollment details in a table format
 *  - Provides functionality to drop a course with confirmation
 */
const ScheduleView = () => {

  // Stores enrollment records returned from the backend
  const [enrollments, setEnrollments] = useState([]);

  // Stores success or error messages to display to the user
  const [message, setMessage] = useState('');

  // Stores the selected term (year and semester)
  const [term, setTerm] = useState({});

  /*
   * prefetchEnrollments
   * --------------------------------------------------
   * Triggered when user selects a term
   * Saves the term and initiates data retrieval
   */
  const prefetchEnrollments = ({ year, semester }) => {
    setTerm({ year, semester });
    fetchEnrollments(year, semester);
  }

  /*
   * fetchEnrollments
   * --------------------------------------------------
   * Calls backend API to retrieve enrollments for a given term
   */
  const fetchEnrollments = async (year, semester) => {
    try {
      const response = await fetch(
          `${REGISTRAR_URL}/enrollments?year=${year}&semester=${semester}`,
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

        // Update enrollments state with API response
        setEnrollments(data);

        // Clear any previous messages
        setMessage('');
      } else {
        const body = await response.json();

        // Display backend error message if available
        setMessage(body.message || 'Error fetching schedule.');
      }
    } catch (err) {
      // Handle network or unexpected errors
      setMessage(err.toString());
    }
  }

  /*
   * dropEnrollment
   * --------------------------------------------------
   * Sends DELETE request to backend to remove enrollment
   * Uses enrollmentId (primary key) as required
   */
  const dropEnrollment = async (enrollmentId) => {
    try {
      const response = await fetch(
          `${REGISTRAR_URL}/enrollments/${enrollmentId}`,
          {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': sessionStorage.getItem('jwt'),
            },
          }
      );

      if (response.ok) {
        // Inform user of successful drop
        setMessage("Course dropped.");

        // Refresh enrollment list for current term
        fetchEnrollments(term.year, term.semester);
      } else {
        const body = await response.json();

        // Display backend error message if available
        setMessage(body.message || 'Error dropping course.');
      }
    } catch (err) {
      setMessage(err.toString());
    }
  };

  /*
   * onDrop
   * --------------------------------------------------
   * Displays confirmation dialog before dropping a course
   * Prevents accidental deletions
   */
  const onDrop = (enrollmentId) => {
    confirmAlert({
      title: "Confirm Drop",
      message: "Do you want to drop this course?",
      buttons: [
        {
          label: "Yes",
          onClick: () => dropEnrollment(enrollmentId),
        },
        {
          label: "No",
        },
      ],
    });
  };

  /*
   * Table column headers
   * --------------------------------------------------
   * Includes both internal (secNo) and display (secId) identifiers
   * as defined by the assignment template
   */
  const headings = ["enrollmentId", "sectionNo", "courseId", "sectionId", "building", "room", "times", ""];

  return (
      <div>

        {/* Displays success or error messages */}
        <Messages response={message} />

        {/* Term selection component */}
        <SelectTerm buttonText="Get Schedule" onClick={prefetchEnrollments} />

        {/* Conditional rendering for empty vs populated data */}
        {enrollments.length === 0 ? (
            <p>No enrollments found.</p>
        ) : (
            <table className="table table-striped" style={{ marginTop: '20px' }}>
              <thead>
              <tr>
                {headings.map((h, idx) => (
                    <th key={idx}>{h}</th>
                ))}
              </tr>
              </thead>

              <tbody>
              {enrollments.map((e) => (
                  <tr key={e.enrollmentId}>
                    <td>{e.enrollmentId}</td>

                    {/* Internal primary key (not user-facing) */}
                    <td>{e.sectionNo}</td>

                    <td>{e.courseId}</td>

                    {/* User-facing section identifier */}
                    <td>{e.sectionId}</td>

                    <td>{e.building}</td>
                    <td>{e.room}</td>
                    <td>{e.times}</td>

                    {/* Drop button triggers confirmation workflow */}
                    <td>
                      <button
                          className="btn btn-danger"
                          onClick={() => onDrop(e.enrollmentId)}
                      >
                        Drop
                      </button>
                    </td>
                  </tr>
              ))}
              </tbody>
            </table>
        )}

      </div>
  );
}

export default ScheduleView;