const express = require('express');
const cors = require('cors');
const path = require('path');
const assignmentRoutes = require('./routes/assignmentRoutes'); // 1. Route import

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// 2. Frontend files (index.html, script.js) serve panna
app.use(express.static(path.join(__dirname, '..')));

// 3. ✅ Intha line thaan miss aagirunthathu! API routes-ai connect pannum
app.use('/api/assignments', assignmentRoutes); 

// 4. Root URL-ku index.html anuppa
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});