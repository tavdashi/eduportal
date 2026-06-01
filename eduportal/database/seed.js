// database/seed.js — Seeds the database with demo data
// Run via: node database/seed.js
// This populates sample students, courses, assignments, announcements etc.
// Safe to run multiple times (uses INSERT OR IGNORE).

const Database = require('better-sqlite3');
const path = require('path');
const os = require('os');

// Replicate userData path logic
const appDataPath = path.join(os.homedir(), 'AppData', 'Roaming', 'eduportal');
require('fs').mkdirSync(appDataPath, { recursive: true });
const dbPath = path.join(appDataPath, 'eduportal.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables (same as db.js)
db.exec(`
  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL, email TEXT NOT NULL, student_id TEXT NOT NULL UNIQUE,
    department TEXT DEFAULT 'General', year INTEGER DEFAULT 1,
    phone TEXT DEFAULT '', bio TEXT DEFAULT '', avatar_color TEXT DEFAULT '#c084fc',
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT, code TEXT NOT NULL UNIQUE, name TEXT NOT NULL,
    instructor TEXT NOT NULL, credits INTEGER DEFAULT 3, room TEXT DEFAULT 'TBD', description TEXT DEFAULT ''
  );
  CREATE TABLE IF NOT EXISTS student_courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT, student_id INTEGER NOT NULL, course_id INTEGER NOT NULL,
    grade TEXT DEFAULT 'N/A', progress INTEGER DEFAULT 0, UNIQUE(student_id, course_id)
  );
  CREATE TABLE IF NOT EXISTS assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT, course_id INTEGER NOT NULL, title TEXT NOT NULL,
    description TEXT DEFAULT '', due_date TEXT NOT NULL, max_marks INTEGER DEFAULT 100, type TEXT DEFAULT 'Assignment'
  );
  CREATE TABLE IF NOT EXISTS student_assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT, student_id INTEGER NOT NULL, assignment_id INTEGER NOT NULL,
    submitted INTEGER DEFAULT 0, submission_text TEXT DEFAULT '', submitted_at TEXT,
    grade TEXT DEFAULT 'Pending', UNIQUE(student_id, assignment_id)
  );
  CREATE TABLE IF NOT EXISTS announcements (
    id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, body TEXT NOT NULL,
    author TEXT DEFAULT 'Admin', category TEXT DEFAULT 'General', created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS schedule (
    id INTEGER PRIMARY KEY AUTOINCREMENT, course_id INTEGER NOT NULL, day TEXT NOT NULL,
    start_time TEXT NOT NULL, end_time TEXT NOT NULL, room TEXT DEFAULT 'TBD'
  );
  CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT, student_id INTEGER NOT NULL, course_id INTEGER NOT NULL,
    date TEXT NOT NULL, status TEXT DEFAULT 'present'
  );
  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT, student_id INTEGER, title TEXT NOT NULL,
    body TEXT NOT NULL, type TEXT DEFAULT 'info', is_read INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

// ── Seed Students ──
const students = [
  { name: 'Aisha Raza', username: 'aisha', password: 'aisha123', email: 'aisha@edu.com', student_id: 'STU001', department: 'Computer Science', year: 2, avatar_color: '#f472b6' },
  { name: 'Bilal Khan', username: 'bilal', password: 'bilal123', email: 'bilal@edu.com', student_id: 'STU002', department: 'Mathematics', year: 1, avatar_color: '#60a5fa' },
  { name: 'Sara Ahmed', username: 'sara',  password: 'sara123',  email: 'sara@edu.com',  student_id: 'STU003', department: 'Physics', year: 3, avatar_color: '#34d399' },
  { name: 'Zain Malik', username: 'zain',  password: 'zain123',  email: 'zain@edu.com',  student_id: 'STU004', department: 'Computer Science', year: 2, avatar_color: '#fb923c' },
];

const insertStudent = db.prepare(`
  INSERT OR IGNORE INTO students (name, username, password, email, student_id, department, year, avatar_color)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);
for (const s of students) {
  insertStudent.run(s.name, s.username, s.password, s.email, s.student_id, s.department, s.year, s.avatar_color);
}

// ── Seed Courses ──
const courses = [
  { code: 'CS101', name: 'Introduction to Programming', instructor: 'Dr. Nadia Hussain', credits: 3, room: 'CS-101', description: 'Fundamentals of programming using Python.' },
  { code: 'CS201', name: 'Data Structures & Algorithms', instructor: 'Prof. Imran Sheikh', credits: 4, room: 'CS-201', description: 'Arrays, trees, graphs, and algorithm analysis.' },
  { code: 'CS301', name: 'Database Systems', instructor: 'Dr. Fatima Zaidi', credits: 3, room: 'CS-301', description: 'Relational databases, SQL, and normalization.' },
  { code: 'MA101', name: 'Calculus I', instructor: 'Prof. Tariq Mehmood', credits: 4, room: 'MA-101', description: 'Limits, derivatives, and integrals.' },
  { code: 'MA201', name: 'Linear Algebra', instructor: 'Dr. Ayesha Siddiqui', credits: 3, room: 'MA-201', description: 'Vectors, matrices, and linear transformations.' },
  { code: 'PH101', name: 'Physics I', instructor: 'Prof. Omar Farooq', credits: 4, room: 'PH-101', description: 'Mechanics, thermodynamics, and waves.' },
  { code: 'EN101', name: 'English Communication', instructor: 'Ms. Hina Mirza', credits: 2, room: 'EN-101', description: 'Academic writing and presentation skills.' },
  { code: 'CS401', name: 'Artificial Intelligence', instructor: 'Dr. Kamran Ali', credits: 3, room: 'CS-401', description: 'Search, knowledge representation, and ML basics.' },
];

const insertCourse = db.prepare(`
  INSERT OR IGNORE INTO courses (code, name, instructor, credits, room, description) VALUES (?, ?, ?, ?, ?, ?)
`);
for (const c of courses) {
  insertCourse.run(c.code, c.name, c.instructor, c.credits, c.room, c.description);
}

// ── Enroll students in courses ──
const allStudents = db.prepare('SELECT id FROM students').all();
const allCourses  = db.prepare('SELECT id FROM courses').all();
const insertEnroll = db.prepare('INSERT OR IGNORE INTO student_courses (student_id, course_id, grade, progress) VALUES (?, ?, ?, ?)');

const gradeOptions = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'N/A'];
let ci = 0;
for (const s of allStudents) {
  // Enroll each student in 4-5 courses
  const myCourses = allCourses.slice(ci % allCourses.length, (ci % allCourses.length) + 5);
  for (const c of myCourses) {
    const grade = gradeOptions[Math.floor(Math.random() * gradeOptions.length)];
    const progress = Math.floor(Math.random() * 60) + 40;
    insertEnroll.run(s.id, c.id, grade, progress);
  }
  ci++;
}

// ── Assignments ──
const assignments = [
  { course_id: 1, title: 'Python Basics Quiz', description: 'Complete 20 MCQs on Python fundamentals.', due_date: '2026-05-20', max_marks: 20, type: 'Quiz' },
  { course_id: 1, title: 'Mini Calculator Project', description: 'Build a CLI calculator using Python.', due_date: '2026-05-28', max_marks: 50, type: 'Project' },
  { course_id: 2, title: 'Sorting Algorithms Lab', description: 'Implement bubble, merge, and quick sort.', due_date: '2026-05-22', max_marks: 30, type: 'Lab' },
  { course_id: 2, title: 'BST Assignment', description: 'Implement a Binary Search Tree with all operations.', due_date: '2026-06-01', max_marks: 40, type: 'Assignment' },
  { course_id: 3, title: 'ER Diagram Task', description: 'Draw an ER diagram for a hospital management system.', due_date: '2026-05-25', max_marks: 25, type: 'Assignment' },
  { course_id: 4, title: 'Calculus Problem Set 1', description: 'Solve 15 problems on limits and derivatives.', due_date: '2026-05-18', max_marks: 30, type: 'Assignment' },
  { course_id: 5, title: 'Matrix Operations', description: 'Perform operations on given matrices and find eigenvalues.', due_date: '2026-05-30', max_marks: 20, type: 'Lab' },
  { course_id: 6, title: 'Mechanics Lab Report', description: 'Write up Newton\'s laws experiment.', due_date: '2026-05-21', max_marks: 25, type: 'Lab' },
  { course_id: 7, title: 'Essay: Technology in Education', description: 'Write a 1000-word academic essay.', due_date: '2026-05-26', max_marks: 50, type: 'Assignment' },
  { course_id: 8, title: 'AI Search Algorithms', description: 'Implement BFS and DFS for a given graph.', due_date: '2026-06-05', max_marks: 35, type: 'Assignment' },
];

const insertAssignment = db.prepare('INSERT OR IGNORE INTO assignments (course_id, title, description, due_date, max_marks, type) VALUES (?,?,?,?,?,?)');
for (const a of assignments) {
  insertAssignment.run(a.course_id, a.title, a.description, a.due_date, a.max_marks, a.type);
}

// ── Announcements ──
const announcements = [
  { title: '📅 Mid-Term Exams Schedule Released', body: 'Mid-term exams will be held from June 10–20, 2026. Please check the exam timetable on the portal. All students must carry their student ID cards.', author: 'Examination Department', category: 'Exams' },
  { title: '🏖️ Summer Internship Fair', body: 'The annual Summer Internship Fair will be held on May 25, 2026 in the Main Auditorium from 10 AM – 4 PM. Over 30 companies will be present. Dress professionally!', author: 'Career Services', category: 'Event' },
  { title: '📚 Library Extended Hours', body: 'During exam season, the university library will remain open until midnight (12:00 AM) from May 15 onwards. Study rooms must be booked in advance.', author: 'Library Administration', category: 'Facility' },
  { title: '💻 CS Department Hackathon', body: 'The 48-hour CS Hackathon is scheduled for June 1-2. Register your team (2-4 members) by May 28. Prizes worth PKR 100,000 await!', author: 'CS Department', category: 'Event' },
  { title: '⚠️ Fee Submission Deadline', body: 'Last date for semester fee submission is May 31, 2026. A late fine of PKR 500/day will be charged after the deadline. Contact the accounts office for queries.', author: 'Accounts Department', category: 'Important' },
  { title: '🎉 Sports Week 2026 Registrations Open', body: 'Annual Sports Week runs May 20–24. Register for cricket, football, badminton, or table tennis. Represent your department!', author: 'Sports Office', category: 'Event' },
];

const insertAnn = db.prepare('INSERT OR IGNORE INTO announcements (title, body, author, category) VALUES (?,?,?,?)');
for (const a of announcements) {
  insertAnn.run(a.title, a.body, a.author, a.category);
}

// ── Schedule / Timetable ──
const scheduleItems = [
  { course_id: 1, day: 'Monday',    start_time: '08:00', end_time: '09:30', room: 'CS-101' },
  { course_id: 2, day: 'Monday',    start_time: '10:00', end_time: '11:30', room: 'CS-201' },
  { course_id: 3, day: 'Tuesday',   start_time: '08:00', end_time: '09:30', room: 'CS-301' },
  { course_id: 4, day: 'Tuesday',   start_time: '10:00', end_time: '11:30', room: 'MA-101' },
  { course_id: 5, day: 'Wednesday', start_time: '08:00', end_time: '09:30', room: 'MA-201' },
  { course_id: 6, day: 'Wednesday', start_time: '10:00', end_time: '11:30', room: 'PH-101' },
  { course_id: 7, day: 'Thursday',  start_time: '11:00', end_time: '12:00', room: 'EN-101' },
  { course_id: 8, day: 'Thursday',  start_time: '13:00', end_time: '14:30', room: 'CS-401' },
  { course_id: 1, day: 'Friday',    start_time: '09:00', end_time: '10:00', room: 'CS-101' },
  { course_id: 2, day: 'Friday',    start_time: '10:30', end_time: '12:00', room: 'CS-201' },
];

const insertSchedule = db.prepare('INSERT OR IGNORE INTO schedule (course_id, day, start_time, end_time, room) VALUES (?,?,?,?,?)');
for (const s of scheduleItems) {
  insertSchedule.run(s.course_id, s.day, s.start_time, s.end_time, s.room);
}

// ── Attendance for student 1 (aisha) ──
const aisha = db.prepare("SELECT id FROM students WHERE username='aisha'").get();
if (aisha) {
  const dates = ['2026-05-01','2026-05-05','2026-05-07','2026-05-08','2026-05-12'];
  const statuses = ['present','present','absent','present','present'];
  const insertAtt = db.prepare('INSERT OR IGNORE INTO attendance (student_id, course_id, date, status) VALUES (?,?,?,?)');
  for (let i = 0; i < dates.length; i++) {
    for (const c of allCourses.slice(0, 5)) {
      insertAtt.run(aisha.id, c.id, dates[i], statuses[i]);
    }
  }
}

// ── Global Notifications ──
const notifs = [
  { title: 'Welcome to EduPortal!', body: 'Your student portal is ready. Explore courses, grades, and more.', type: 'success' },
  { title: 'Mid-Term Exams Coming Up', body: 'Exams are scheduled for June 10-20. Start preparing!', type: 'warning' },
  { title: 'New Assignment Posted', body: 'Python Basics Quiz has been added for CS101.', type: 'info' },
];

const insertNotif = db.prepare('INSERT OR IGNORE INTO notifications (student_id, title, body, type) VALUES (?,?,?,?)');
for (const n of notifs) {
  insertNotif.run(null, n.title, n.body, n.type);
}

console.log('✅ Database seeded successfully!');
console.log('📌 Demo accounts:');
console.log('   aisha / aisha123');
console.log('   bilal / bilal123');
console.log('   sara  / sara123');
console.log('   zain  / zain123');
