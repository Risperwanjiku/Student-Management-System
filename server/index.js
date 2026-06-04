require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

const classStreamRoutes = require('./routes/classStreams');
const studentRoutes = require('./routes/students');
const subjectRoutes = require('./routes/subjects');
const scoreRoutes = require('./routes/scores');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Student Management System API is running' });
});

app.use('/api/class-streams', classStreamRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/scores', scoreRoutes);

db.query('SELECT 1')
  .then(() => console.log('Connected to MySQL database'))
  .catch((err) => console.error('Database connection failed:', err.message));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});