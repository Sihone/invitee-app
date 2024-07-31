// src/components/CSVUpload.js
import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import { Table, InputGroup, FormControl, Button } from 'react-bootstrap';
import axios from 'axios';

const CSVUpload = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [attendance, setAttendance] = useState({});
  const serverUrl = "http://localhost:5005";

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Upload file to server
    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post(serverUrl + '/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Fetch the uploaded file
      fetchCSVData();
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const fetchCSVData = async () => {
    try {
      const response = await axios.get(serverUrl + '/data', {
        responseType: 'blob'
      });

      Papa.parse(response.data, {
        header: true,
        complete: (results) => {
          const dataWithAttendance = results.data.map(row => ({
            ...row
          }));
          setData(dataWithAttendance);
          // Initialize attendance state
          setAttendance(dataWithAttendance.reduce((acc, row, index) => ({
            ...acc,
            [index]: row.attended
          }), {}));
        },
        skipEmptyLines: true,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  
  useEffect(() => {
    fetchCSVData();
  }, []);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const handleCheckboxChange = (index) => {
    setAttendance(prev => {
      const updatedAttendance = { ...prev, [index]: !prev[index] };
      // Update local data
      const updatedData = data.map((item, idx) =>
        idx === index ? { ...item, attended: updatedAttendance[index] } : item
      );
      setData(updatedData);
      return updatedAttendance;
    });
  };

  const saveAttendance = async () => {
    // Convert data to CSV format
    const csv = Papa.unparse(data);

    // Upload updated CSV to server
    try {
      const formData = new FormData();
      formData.append('file', new Blob([csv], { type: 'text/csv' }), 'data.csv');

      await axios.post(serverUrl + '/update', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Attendance saved successfully.');
    } catch (error) {
      console.error('Error saving attendance:', error);
    }
  };

  const filteredData = data.filter((row) => {
    return Object.values(row).some(
      (value) => value.toLowerCase().includes(searchTerm)
    );
  });

  return (
    <div className="container mt-4">
      <h1>AI & TECH CAREER ORIENTATION 2024 SEMINAR</h1>
      <InputGroup className="mb-3">
        <FormControl
          placeholder="Search..."
          aria-label="Search"
          onChange={handleSearch}
        />
      </InputGroup>
      <input type="file" accept=".csv" onChange={handleFileUpload} />
      <Button variant="primary" onClick={saveAttendance} className="mt-3">Save Attendance</Button>
      <Table striped bordered hover className="mt-4">
        <thead>
          <tr>
            <th>Present</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Status</th>
            <th>Comment</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row, index) => (
            <tr key={index}>
              <td>
                <input
                  type="checkbox"
                  checked={attendance[index] === "true" || false}
                  onChange={() => handleCheckboxChange(index)}
                />
              </td>
              <td>{row['Name / Nom ']}</td>
              <td>{row['Email Address']}</td>
              <td>{row['Phone number / Numéro de téléphone']}</td>
              <td>{row['Status / Statut']}</td>
              <td>{row["What do you hope gain from this seminar? Qu'espérez-vous de ce séminaire ?"]}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default CSVUpload;
