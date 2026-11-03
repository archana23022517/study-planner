const express = require('express');
const cors = require('cors');
const path = require('path');
const assignmentRoutes = require('./routes/assignmentRoutes');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

app.use('/api/assignments', assignmentRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});