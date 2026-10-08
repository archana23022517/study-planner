const express = require('express');
const router = express.Router();
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'study_planner.db');

let db;
let dbReady = false;

async function initDB() {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`
  CREATE TABLE IF NOT EXISTS assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject TEXT NOT NULL,
    assignment TEXT NOT NULL,
    deadline TEXT NOT NULL,
    status TEXT DEFAULT 'Pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

  const result = db.exec('SELECT COUNT(*) as c FROM assignments');
  const count = result[0]?.values[0][0] || 0;

  if (count === 0) {
    db.run("INSERT INTO assignments (subject, assignment, deadline, status) VALUES (?, ?, ?, ?)",
      ['Web Technology', 'HTML Forms', '2026-09-30', 'Completed']);
    db.run("INSERT INTO assignments (subject, assignment, deadline, status) VALUES (?, ?, ?, ?)",
      ['JavaScript', 'DOM Manipulation', '2026-10-03', 'In Progress']);
    db.run("INSERT INTO assignments (subject, assignment, deadline, status) VALUES (?, ?, ?, ?)",
      ['PHP', 'Form Validation', '2026-10-05', 'Pending']);
  }

  saveDB();
  dbReady = true;
  console.log('✅ SQLite database ready');
}

function saveDB() {
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

function toJSON(result) {
  if (!result || result.length === 0) return [];
  const cols = result[0].columns;
  return result[0].values.map(row => {
    const obj = {};
    cols.forEach((col, i) => obj[col] = row[i]);
    return obj;
  });
}

initDB().catch(err => console.error('DB init error:', err));

router.get('/', (req, res) => {
  if (!dbReady) return res.status(503).json({ error: 'DB not ready' });
  try {
    const result = db.exec('SELECT * FROM assignments ORDER BY deadline ASC');
    res.json(toJSON(result));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', (req, res) => {
  if (!dbReady) return res.status(503).json({ error: 'DB not ready' });
  try {
    const stmt = db.prepare('SELECT * FROM assignments WHERE id = ?');
    stmt.bind([req.params.id]);
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', (req, res) => {
  if (!dbReady) return res.status(503).json({ error: 'DB not ready' });
  const { subject, assignment, deadline, status } = req.body;
  if (!subject || !assignment || !deadline) {
    return res.status(400).json({ error: 'Required fields missing' });
  }
  try {
    db.run("INSERT INTO assignments (subject, assignment, deadline, status) VALUES (?, ?, ?, ?)",
      [subject, assignment, deadline, status || 'Pending']);
    const idResult = db.exec('SELECT last_insert_rowid() as id');
    const newId = idResult[0].values[0][0];
    saveDB();
    res.status(201).json({ id: newId, subject, assignment, deadline, status: status || 'Pending' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', (req, res) => {
  if (!dbReady) return res.status(503).json({ error: 'DB not ready' });
  const { subject, assignment, deadline, status } = req.body;
  try {
    db.run("UPDATE assignments SET subject=?, assignment=?, deadline=?, status=? WHERE id=?",
      [subject, assignment, deadline, status, req.params.id]);
    saveDB();
    res.json({ message: 'Updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/status', (req, res) => {
  if (!dbReady) return res.status(503).json({ error: 'DB not ready' });
  const { status } = req.body;
  try {
    db.run('UPDATE assignments SET status=? WHERE id=?', [status, req.params.id]);
    saveDB();
    res.json({ message: 'Status updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', (req, res) => {
  if (!dbReady) return res.status(503).json({ error: 'DB not ready' });
  try {
    db.run('DELETE FROM assignments WHERE id=?', [req.params.id]);
    saveDB();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;