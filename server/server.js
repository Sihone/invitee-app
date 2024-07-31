// server/server.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const port = 5005;

// Middleware
app.use(cors());
app.use(express.static('public'));

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads');
  },
  filename: (req, file, cb) => {
    cb(null, 'data.csv'); // Static file name
  }
});

const upload = multer({ storage });

// Endpoint to handle file uploads
app.post('/upload', upload.single('file'), (req, res) => {
  res.send('File uploaded successfully.');
});

// Endpoint to get the CSV file
app.get('/data', (req, res) => {
  const filePath = path.join(__dirname, 'public/uploads/data.csv');
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('File not found.');
  }
});

// Endpoint to update the CSV file
app.post('/update', upload.single('file'), (req, res) => {
  res.send('File updated successfully.');
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
