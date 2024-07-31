const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const { createObjectCsvWriter } = require('csv-writer');

const app = express();
const port = 5005;

// Middleware
app.use(cors());
app.use(express.json());
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

// Endpoint to add a new entry
app.post('/add', (req, res) => {
  const newEntry = req.body;
  const filePath = path.join(__dirname, 'public/uploads/data.csv');

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('CSV file not found.');
  }

  const csvWriter = createObjectCsvWriter({
    path: filePath,
    header: [
      { id: 'name', title: 'Name / Nom ' },
      { id: 'email', title: 'Email Address' },
      { id: 'phone', title: 'Phone number / Numéro de téléphone' },
      { id: 'status', title: 'Status / Statut' },
      { id: 'comment', title: "What do you hope gain from this seminar? Qu'espérez-vous de ce séminaire ?" },
      { id: 'attended', title: 'attended' }
    ],
    append: true
  });

  csvWriter.writeRecords([newEntry])
    .then(() => {
      res.status(200).json({ message: 'New entry added successfully.' });
    })
    .catch((err) => {
      console.error('Error writing to CSV:', err);
      res.status(500).json({ error: 'Failed to add new entry.' });
    });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
