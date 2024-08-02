const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(express.json());
const { format } = require('date-fns');
app.use(cors());

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: 'srv1168.hstgr.io', // Update with your host
  user: 'u209577136_invitees',      // Update with your MySQL username
  password: 'Zoorp=5213!',      // Update with your MySQL password
  database: 'u209577136_invitees', // Update with your database name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// GET data
app.get('/data', (req, res) => {
  pool.query('SELECT * FROM invitees ORDER BY id DESC', (error, results) => {
    if (error) {
      console.error('Error fetching data:', error);
      res.status(500).send('Error fetching data');
    } else {
      res.json(results);
    }
  });
});

// POST add new entry
app.post('/add', (req, res) => {
  const { email, name, gender, phone, status, interest, gain, comments, present } = req.body;
  const sql = `INSERT INTO invitees (timestamp, email, name, gender, phone, status, interest, hear, gain, comments, present) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  pool.query(sql, [format(new Date(), 'M/d/yyyy HH:mm:ss'), email, name, gender, phone, status, interest, "N/A", gain, comments, present], (error, results) => {
    if (error) {
      console.error('Error adding new entry:', error);
      res.status(500).send('Error adding new entry');
    } else {
      res.send('New entry added successfully');
    }
  });
});

// POST update attendance
app.post('/update', (req, res) => {
  const { id, present, community } = req.body;
  const sql = 'UPDATE invitees SET present = ?, community = ? WHERE id = ?';
  pool.query(sql, [present, community, id], (error, results) => {
    if (error) {
      console.error('Error updating entry:', error);
      res.status(500).send('Error updating entry');
    } else {
      res.send('Attendance updated successfully');
    }
  });
});

// Start the server
const port = 5005;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
