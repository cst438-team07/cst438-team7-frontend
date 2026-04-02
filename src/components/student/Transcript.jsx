import { useState, useEffect } from 'react';
import { REGISTRAR_URL } from '../../Constants';
import Messages from '../Messages';


const Transcript = () => {

  const [message, setMessage] = useState('');
  const [courses, setCourses] = useState([]);

  const fetchData = async () => {
    try {
      const response = await fetch(`${REGISTRAR_URL}/transcripts`,
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
        setCourses(data);
      } else {
        const body = await response.json();
        setMessage(body);
      }
    } catch (err) {
      setMessage(err);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const headers = ['Year', 'Semester', 'CourseId', 'Section', 'Title', 'Credits', 'Grade'];

  return (
      <>
        <h3>Transcript</h3>
        <p>To be implemented.  Display a table showing the course a student has taken.
          The table columns are given in headers.
        </p>

      </>
  );
}

export default Transcript;