const express = require('express');
const cors = require('cors');
const path = require('path');
const assignmentRoutes = require('./routes/assignmentRoutes');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// ✅ Root folder-la irukura files-ai (index.html, css, js) serve panna
app.use(express.static(path.join(__dirname, '..')));

// API Routes
app.use('/api/assignments', assignmentRoutes);

// ✅ Root-la index.html anuppa
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});