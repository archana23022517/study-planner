const express = require('express');
const cors = require('cors');
const path = require('path');
const assignmentRoutes = require('./routes/assignmentRoutes');

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors());

app.use(express.json());

// ✅ Root folder la irundhu static files serve pannum (index.html, style.css, script.js)
app.use(express.static(path.join(__dirname, '..')));

// ✅ API routes
app.use('/api/assignments', assignmentRoutes);

// ✅ Root la irukkura index.html serve pannum
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// ✅ Port
const PORT = process.env.PORT || 5001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});