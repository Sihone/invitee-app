import React, { useEffect, useState } from 'react';
import { Table, InputGroup, FormControl, Button, Form } from 'react-bootstrap';
import axios from 'axios';

const CSVUpload = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [attendance, setAttendance] = useState({});
  const [toggleAddEntry, setToggleAddEntry] = useState(false);
  const [checkedClicked, setCheckedClicked] = useState(null);
  const [newEntry, setNewEntry] = useState({
    name: '',
    email: '',
    gender: 'Male', // Default value
    phone: '',
    status: '',
    interest: '',
    comment: '',
    present: 1,
  });
  const serverUrl = "http://localhost:5005";

  const fetchMySQLData = async () => {
    try {
      const response = await axios.get(serverUrl + '/data');
      const rows = response.data;

      setData(rows);
      setAttendance(
        rows.reduce((acc, row) => ({ ...acc, [row.id]: row.present === 1 }), {})
      );
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchMySQLData();
  }, []);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const handleCheckboxChange = (id) => {
    setAttendance(prev => {
      const updatedAttendance = { ...prev, [id]: !prev[id] };
      const updatedData = data.map((item, idx) => {
        if (item.id === id) {
          setCheckedClicked({ ...item, present: updatedAttendance[id] ? 1 : 0 });
          return { ...item, present: updatedAttendance[id] ? 1 : 0 };
        } else {
          return item;
        }
      });
      setData(updatedData);
      return updatedAttendance;
    });
  };

  useEffect(() => {
    if (checkedClicked) {
      saveAttendance(checkedClicked);
      setCheckedClicked(null);
    }
  }, [checkedClicked]);

  const saveAttendance = async (item) => {
    try {
      await axios.post(serverUrl + '/update', item);
      console.log('Attendance saved successfully.');
    } catch (error) {
      console.error('Error saving attendance:', error);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewEntry({ ...newEntry, [name]: value });
  };

  const handleAddEntry = async (event) => {
    event.preventDefault();
    try {
      await axios.post(serverUrl + '/add', newEntry);
      fetchMySQLData();
      setNewEntry({
        name: '',
        email: '',
        gender: 'Male',
        phone: '',
        status: '',
        interest: '',
        comment: '',
        present: 1,
      });
      alert('New entry added successfully.');
    } catch (error) {
      console.error('Error adding new entry:', error);
    }
  };

  const filteredData = data.filter((row) => {
    return Object.values(row).some((value) => {
      return value && value.toString().toLowerCase().includes(searchTerm);
    });
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
      
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button variant="primary" onClick={() => setToggleAddEntry(!toggleAddEntry)} className="mt-3">
          {toggleAddEntry ? 'Close Add Entry' : 'Add Entry'}
        </Button>
      </div>

      {toggleAddEntry &&
        <Form className="mt-4" onSubmit={handleAddEntry}>
          <h2>Add New Entry</h2>
          <Form.Group>
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={newEntry.name}
              onChange={handleInputChange}
              required
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={newEntry.email}
              onChange={handleInputChange}
              required
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Gender</Form.Label>
            <Form.Control as="select" name="gender" value={newEntry.gender} onChange={handleInputChange}>
              <option>Male</option>
              <option>Female</option>
            </Form.Control>
          </Form.Group>
          <Form.Group>
            <Form.Label>Phone</Form.Label>
            <Form.Control
              type="text"
              name="phone"
              value={newEntry.phone}
              onChange={handleInputChange}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Status</Form.Label>
            <Form.Control
              type="text"
              name="status"
              value={newEntry.status}
              onChange={handleInputChange}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Interest</Form.Label>
            <Form.Control
              type="text"
              name="interest"
              value={newEntry.interest}
              onChange={handleInputChange}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Comment</Form.Label>
            <Form.Control
              type="text"
              name="comment"
              value={newEntry.comment}
              onChange={handleInputChange}
            />
          </Form.Group>
          <Button variant="success" type="submit">Add Entry</Button>
        </Form>
      }

      <Table striped bordered hover className="mt-4">
        <thead>
          <tr>
            <th>Present</th>
            <th>Name</th>
            <th>Email</th>
            <th>Gender</th>
            <th>Phone</th>
            <th>Status</th>
            <th>Interest</th>
            <th>Comment</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row, index) => (
            <tr key={index}>
              <td>
                <input
                  type="checkbox"
                  checked={attendance[row.id]}
                  onChange={() => handleCheckboxChange(row.id)}
                />
              </td>
              <td>{row.name}</td>
              <td>{row.email}</td>
              <td>{row.gender}</td>
              <td>{row.phone}</td>
              <td>{row.status}</td>
              <td>{row.interest}</td>
              <td>{row.comment}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default CSVUpload;
