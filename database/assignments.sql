-- SQLite compatible schema for Study Planner
-- Note: SQLite la CREATE DATABASE illa. Adhu file-based.

CREATE TABLE IF NOT EXISTS assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject TEXT NOT NULL,
    assignment TEXT NOT NULL,
    deadline TEXT NOT NULL,
    status TEXT DEFAULT 'Pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sample Data
INSERT INTO assignments (subject, assignment, deadline, status) VALUES
('Web Technology', 'HTML Forms', '2026-09-30', 'Completed'),
('JavaScript', 'DOM Manipulation', '2026-10-03', 'In Progress'),
('PHP', 'Form Validation', '2026-10-05', 'Pending');