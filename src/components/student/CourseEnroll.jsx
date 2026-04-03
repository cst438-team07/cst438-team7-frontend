import { useState, useEffect } from 'react';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { REGISTRAR_URL } from '../../Constants';
import Messages from '../Messages';

/*
 * Component: CourseEnroll
 * -----------------------------------------
 * Purpose:
 *  - Display all open sections available for enrollment
 *  - Allow a student to enroll in a section
 *  - Confirm enrollment action before submitting
 *  - Display success/error messages from backend
 */
const CourseEnroll = () => {

  // Holds list of available sections
  const [sections, setSections] = useState([]);

  // Holds response messages (success/error)
  const [message, setMessage] = useState('');

  /*
   * Fetch open sections from backend API
   * -----------------------------------------
   * Called on initial page load and after enrollment
   */
  const fetchSections = async () => {
    try {
      const response = await fetch(`${REGISTRAR_URL}/sections/open`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': sessionStorage.getItem('jwt'), // JWT for authentication
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSections(data);   // update state with section list
        setMessage('');      // clear any previous messages
      } else {
        const body = await response.json();

        // Handle structured backend errors
        setMessage(body.errors ? body.errors.join(", ") : body.message);
      }

    } catch (err) {
      // Handle network or unexpected errors
      setMessage(err.toString());
    }
  };

  /*
   * useEffect
   * -----------------------------------------
   * Runs once when component mounts
   * Loads available sections automatically
   */
  useEffect(() => {
    fetchSections();
  }, []);

  /*
   * enrollCourse
   * -----------------------------------------
   * Sends POST request to enroll student in selected section
   * @param secId - unique section identifier
   */
  const enrollCourse = async (secId) => {
    try {
      const response = await fetch(
          `${REGISTRAR_URL}/enrollments/sections/${secId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": sessionStorage.getItem("jwt"),
            },
          }
      );

      if (response.ok) {
        const data = await response.json();

        // Display success message
        setMessage("Section added. Enrollment id = " + data.enrollmentId);

        // Refresh section list after enrollment
        fetchSections();

      } else {
        const body = await response.json();

        // Display clean error message
        setMessage(body.errors ? body.errors.join(", ") : body.message);
      }

    } catch (err) {
      setMessage(err.toString());
    }
  };

  /*
   * onEnroll
   * -----------------------------------------
   * Displays confirmation dialog before enrolling
   * Prevents accidental enrollments
   */
  const onEnroll = (secId) => {
    confirmAlert({
      title: "Confirm Enrollment",
      message: "Do you want to enroll in this course?",
      buttons: [
        {
          label: "Yes",
          onClick: () => enrollCourse(secId),
        },
        {
          label: "No",
        },
      ],
    });
  };

  /*
   * Table column headers
   * Note: Removed duplicate "Section" column for cleaner UI
   */
  const headers = [
    'Section No',
    'Year',
    'Semester',
    'Course Id',
    'Title',
    'Building',
    'Room',
    'Times',
    'Instructor',
    ''
  ];

  return (
      <div>
        {/* Display success/error messages */}
        <Messages response={message} />

        <h3>Open Sections Available for Enrollment</h3>

        <table className="table table-striped">
          <thead>
          <tr>
            {headers.map((h, idx) => (
                <th key={idx}>{h}</th>
            ))}
          </tr>
          </thead>

          <tbody>
          {/* Handle case where no sections are available */}
          {sections.length === 0 && (
              <tr>
                <td colSpan="10">No sections available</td>
              </tr>
          )}

          {/* Render each section */}
          {sections.map((s) => (
              <tr key={s.secId}>
                <td>{s.secId}</td>
                <td>{s.year}</td>
                <td>{s.semester}</td>
                <td>{s.courseId}</td>
                <td>{s.title}</td>
                <td>{s.building}</td>
                <td>{s.room}</td>
                <td>{s.times}</td>

                {/* Display instructor username (before @) or fallback */}
                <td>
                  {s.instructorEmail
                      ? s.instructorEmail.split("@")[0]
                      : "TBA"}
                </td>

                {/* Enroll button */}
                <td>
                  <button
                      className="btn btn-primary"
                      onClick={() => onEnroll(s.secId)}
                  >
                    Add Course
                  </button>
                </td>
              </tr>
          ))}
          </tbody>

        </table>
      </div>
  );
};

export default CourseEnroll;