// main.js — Electron main process (uses sql.js for pure-JS SQLite)

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const db   = require('./database/db');

let mainWindow;

// ── Create the browser window ──
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    frame: false,
    backgroundColor: '#fdf4ff',
    show: false,
  });

  mainWindow.loadFile(path.join(__dirname, 'src/pages/login.html'));
  mainWindow.once('ready-to-show', () => mainWindow.show());
}

// ── App lifecycle ──
app.whenReady().then(async () => {
  await db.getDb(); // Initialize DB (async: loads/creates file)
  await seedIfEmpty();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ── Auto-seed on first run ──
async function seedIfEmpty() {
  const count = db.queryOne('SELECT COUNT(*) as n FROM students');
  if (count && count.n > 0) return; // already seeded

  const students = [
    { name: 'Aisha Raza', username: 'aisha', password: 'aisha123', email: 'aisha@edu.com', student_id: 'STU001', department: 'Computer Science', year: 2, avatar_color: '#f472b6' },
    { name: 'Bilal Khan', username: 'bilal', password: 'bilal123', email: 'bilal@edu.com', student_id: 'STU002', department: 'Mathematics',      year: 1, avatar_color: '#60a5fa' },
    { name: 'Sara Ahmed', username: 'sara',  password: 'sara123',  email: 'sara@edu.com',  student_id: 'STU003', department: 'Physics',           year: 3, avatar_color: '#34d399' },
    { name: 'Zain Malik', username: 'zain',  password: 'zain123',  email: 'zain@edu.com',  student_id: 'STU004', department: 'Computer Science', year: 2, avatar_color: '#fb923c' },
  ];

  for (const s of students) {
    db.run('INSERT OR IGNORE INTO students (name,username,password,email,student_id,department,year,avatar_color) VALUES (?,?,?,?,?,?,?,?)',
      [s.name, s.username, s.password, s.email, s.student_id, s.department, s.year, s.avatar_color]);
  }

  const courses = [
    ['CS101', 'Introduction to Programming',     'Dr. Nadia Hussain',    3, 'CS-101', 'Fundamentals of programming using Python.'],
    ['CS201', 'Data Structures & Algorithms',    'Prof. Imran Sheikh',   4, 'CS-201', 'Arrays, trees, graphs, and algorithm analysis.'],
    ['CS301', 'Database Systems',                'Dr. Fatima Zaidi',     3, 'CS-301', 'Relational databases, SQL, and normalization.'],
    ['MA101', 'Calculus I',                      'Prof. Tariq Mehmood',  4, 'MA-101', 'Limits, derivatives, and integrals.'],
    ['MA201', 'Linear Algebra',                  'Dr. Ayesha Siddiqui',  3, 'MA-201', 'Vectors, matrices, and linear transformations.'],
    ['PH101', 'Physics I',                       'Prof. Omar Farooq',    4, 'PH-101', 'Mechanics, thermodynamics, and waves.'],
    ['EN101', 'English Communication',           'Ms. Hina Mirza',       2, 'EN-101', 'Academic writing and presentation skills.'],
    ['CS401', 'Artificial Intelligence',         'Dr. Kamran Ali',       3, 'CS-401', 'Search, knowledge representation, and ML basics.'],
  ];

  for (const c of courses) {
    db.run('INSERT OR IGNORE INTO courses (code,name,instructor,credits,room,description) VALUES (?,?,?,?,?,?)', c);
  }

  // Enroll students
  const allStudents = db.query('SELECT id FROM students');
  const allCourses  = db.query('SELECT id FROM courses');
  const grades = ['A+','A','A-','B+','B','B-','C+','N/A'];
  let ci = 0;
  for (const s of allStudents) {
    const myCourses = allCourses.slice(ci % allCourses.length, (ci % allCourses.length) + 5);
    for (const c of myCourses) {
      const grade = grades[Math.floor(Math.random() * grades.length)];
      const progress = Math.floor(Math.random() * 60) + 40;
      db.run('INSERT OR IGNORE INTO student_courses (student_id,course_id,grade,progress) VALUES (?,?,?,?)', [s.id, c.id, grade, progress]);
    }
    ci++;
  }

  // Assignments
  const assignments = [
    [1,'Python Basics Quiz','Complete 20 MCQs on Python fundamentals.','2026-05-20',20,'Quiz'],
    [1,'Mini Calculator Project','Build a CLI calculator using Python.','2026-05-28',50,'Project'],
    [2,'Sorting Algorithms Lab','Implement bubble, merge, and quick sort.','2026-05-22',30,'Lab'],
    [2,'BST Assignment','Implement a Binary Search Tree with all operations.','2026-06-01',40,'Assignment'],
    [3,'ER Diagram Task','Draw an ER diagram for a hospital management system.','2026-05-25',25,'Assignment'],
    [4,'Calculus Problem Set 1','Solve 15 problems on limits and derivatives.','2026-05-18',30,'Assignment'],
    [5,'Matrix Operations','Perform operations on given matrices.','2026-05-30',20,'Lab'],
    [6,'Mechanics Lab Report','Write up Newton\'s laws experiment.','2026-05-21',25,'Lab'],
    [7,'Essay: Technology in Education','Write a 1000-word academic essay.','2026-05-26',50,'Assignment'],
    [8,'AI Search Algorithms','Implement BFS and DFS for a given graph.','2026-06-05',35,'Assignment'],
  ];
  for (const a of assignments) {
    db.run('INSERT OR IGNORE INTO assignments (course_id,title,description,due_date,max_marks,type) VALUES (?,?,?,?,?,?)', a);
  }

  // Announcements
  const anns = [
    ['📅 Mid-Term Exams Schedule Released','Mid-term exams will be held from June 10–20, 2026. Please check the exam timetable on the portal. All students must carry their student ID cards.','Examination Department','Exams'],
    ['🏖️ Summer Internship Fair','The annual Summer Internship Fair will be held on May 25 in the Main Auditorium from 10 AM – 4 PM. Over 30 companies will be present. Dress professionally!','Career Services','Event'],
    ['📚 Library Extended Hours','During exam season, the university library will remain open until midnight from May 15 onwards. Study rooms must be booked in advance.','Library Administration','Facility'],
    ['💻 CS Department Hackathon','The 48-hour CS Hackathon is scheduled for June 1-2. Register your team (2-4 members) by May 28. Prizes worth PKR 100,000 await!','CS Department','Event'],
    ['⚠️ Fee Submission Deadline','Last date for semester fee submission is May 31, 2026. A late fine of PKR 500/day will be charged after the deadline.','Accounts Department','Important'],
    ['🎉 Sports Week 2026 Registrations Open','Annual Sports Week runs May 20–24. Register for cricket, football, badminton, or table tennis. Represent your department!','Sports Office','Event'],
  ];
  for (const a of anns) {
    db.run('INSERT OR IGNORE INTO announcements (title,body,author,category) VALUES (?,?,?,?)', a);
  }

  // Schedule
  const sched = [
    [1,'Monday','08:00','09:30','CS-101'],
    [2,'Monday','10:00','11:30','CS-201'],
    [3,'Tuesday','08:00','09:30','CS-301'],
    [4,'Tuesday','10:00','11:30','MA-101'],
    [5,'Wednesday','08:00','09:30','MA-201'],
    [6,'Wednesday','10:00','11:30','PH-101'],
    [7,'Thursday','11:00','12:00','EN-101'],
    [8,'Thursday','13:00','14:30','CS-401'],
    [1,'Friday','09:00','10:00','CS-101'],
    [2,'Friday','10:30','12:00','CS-201'],
  ];
  for (const s of sched) {
    db.run('INSERT OR IGNORE INTO schedule (course_id,day,start_time,end_time,room) VALUES (?,?,?,?,?)', s);
  }

  // Attendance
  const aisha = db.queryOne("SELECT id FROM students WHERE username='aisha'");
  if (aisha) {
    const dates = ['2026-05-01','2026-05-05','2026-05-07','2026-05-08','2026-05-12'];
    const statuses = ['present','present','absent','present','present'];
    for (let i = 0; i < dates.length; i++) {
      for (const c of allCourses.slice(0, 5)) {
        db.run('INSERT OR IGNORE INTO attendance (student_id,course_id,date,status) VALUES (?,?,?,?)', [aisha.id, c.id, dates[i], statuses[i]]);
      }
    }
  }

  // Notifications
  const notifs = [
    [null, 'Welcome to EduPortal!',        'Your student portal is ready. Explore courses, grades, and more.','success'],
    [null, 'Mid-Term Exams Coming Up',      'Exams are scheduled for June 10-20. Start preparing!',           'warning'],
    [null, 'New Assignment Posted',         'Python Basics Quiz has been added for CS101.',                    'info'],
  ];
  for (const n of notifs) {
    db.run('INSERT OR IGNORE INTO notifications (student_id,title,body,type) VALUES (?,?,?,?)', n);
  }

  // Products for the shop
  const products = [
    ['Scientific Calculator', 12.99, 'Perfect for engineering & math courses.', '🧮', 'Stationery', 'Best Seller', '#6366f1'],
    ['Laptop Stand',          24.99, 'Ergonomic aluminum laptop stand.',         '💻', 'Electronics', 'Popular',    '#3b82f6'],
    ['Noise Cancelling Earbuds', 34.99,'Deep focus during study sessions.',       '🎧', 'Electronics', 'New',       '#8b5cf6'],
    ['Sticky Notes Pack',      3.99, '400 sticky notes in 4 pastel colors.',     '📝', 'Stationery',  '',          '#ec4899'],
    ['Backpack 20L',          29.99, 'Lightweight waterproof campus backpack.',  '🎒', 'Accessories', 'Sale',      '#f59e0b'],
    ['Water Bottle 1L',        9.99, 'Insulated stainless steel bottle.',        '💧', 'Accessories', '',          '#06b6d4'],
    ['Programming Handbook',  18.99, 'Essential algorithms & data structures.',  '📖', 'Books',       'Recommended','#10b981'],
    ['Desk Organizer',        14.99, 'Keep your desk clean and tidy.',           '🗂️', 'Stationery',  '',          '#f97316'],
    ['Graph Paper Notebook',   6.99, 'Perfect for equations and diagrams.',      '📓', 'Books',       '',          '#a855f7'],
    ['USB-C Hub 7-in-1',      22.99, 'HDMI, USB, SD card — all in one.',        '🔌', 'Electronics', 'New',       '#14b8a6'],
    ['Flash Cards Set',        7.99, 'Blank flash cards for memorization.',      '🃏', 'Stationery',  '',          '#f472b6'],
    ['Blue Light Glasses',    19.99, 'Reduce eye strain during screen time.',    '👓', 'Accessories', 'Popular',   '#60a5fa'],
  ];
  for (const p of products) {
    db.run('INSERT OR IGNORE INTO products (name,price,description,emoji,category,badge,color) VALUES (?,?,?,?,?,?,?)', p);
  }

  db.save();
  console.log('✅ Database auto-seeded with demo data.');
}

// ──────────────────────────────────────────────
// Window controls
// ──────────────────────────────────────────────
ipcMain.on('window-minimize', () => mainWindow.minimize());
ipcMain.on('window-maximize', () => mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize());
ipcMain.on('window-close', () => mainWindow.close());

// ──────────────────────────────────────────────
// AUTH
// ──────────────────────────────────────────────
ipcMain.handle('auth-login', (_e, { username, password }) => {
  const student = db.queryOne('SELECT * FROM students WHERE username = ? AND password = ?', [username, password]);
  if (student) {
    const { password: _pw, ...safe } = student;
    return { success: true, student: safe };
  }
  return { success: false, message: 'Invalid username or password.' };
});

ipcMain.handle('auth-register', (_e, data) => {
  try {
    const existing = db.queryOne('SELECT id FROM students WHERE username = ?', [data.username]);
    if (existing) return { success: false, message: 'Username already taken.' };
    const r = db.run(
      'INSERT INTO students (name,username,password,email,student_id,department,year,avatar_color) VALUES (?,?,?,?,?,?,?,?)',
      [data.name, data.username, data.password, data.email, data.student_id, data.department, data.year, data.avatar_color]
    );
    return { success: true, id: r.lastInsertRowid };
  } catch (err) {
    return { success: false, message: err.message };
  }
});

// ──────────────────────────────────────────────
// STUDENT / PROFILE
// ──────────────────────────────────────────────
ipcMain.handle('get-student', (_e, id) => {
  const s = db.queryOne('SELECT * FROM students WHERE id = ?', [id]);
  if (s) { const { password: _pw, ...safe } = s; return safe; }
  return null;
});

ipcMain.handle('update-profile', (_e, data) => {
  db.run('UPDATE students SET name=?,email=?,department=?,year=?,phone=?,bio=?,avatar_color=? WHERE id=?',
    [data.name, data.email, data.department, data.year, data.phone, data.bio, data.avatar_color, data.id]);
  return { success: true };
});

ipcMain.handle('change-password', (_e, { id, oldPassword, newPassword }) => {
  const s = db.queryOne('SELECT password FROM students WHERE id = ?', [id]);
  if (!s || s.password !== oldPassword) return { success: false, message: 'Current password is wrong.' };
  db.run('UPDATE students SET password = ? WHERE id = ?', [newPassword, id]);
  return { success: true };
});

// ──────────────────────────────────────────────
// COURSES
// ──────────────────────────────────────────────
ipcMain.handle('get-courses', (_e, studentId) => {
  return db.query(`
    SELECT c.*, sc.grade, sc.progress FROM courses c
    JOIN student_courses sc ON sc.course_id = c.id WHERE sc.student_id = ? ORDER BY c.name
  `, [studentId]);
});

ipcMain.handle('get-all-courses', () => db.query('SELECT * FROM courses ORDER BY name'));

ipcMain.handle('enroll-course', (_e, { studentId, courseId }) => {
  try {
    db.run('INSERT INTO student_courses (student_id,course_id,grade,progress) VALUES (?,?,?,?)', [studentId, courseId, 'N/A', 0]);
    return { success: true };
  } catch {
    return { success: false, message: 'Already enrolled or error.' };
  }
});

// ──────────────────────────────────────────────
// GRADES
// ──────────────────────────────────────────────
ipcMain.handle('get-grades', (_e, studentId) => {
  return db.query(`
    SELECT c.name, c.code, c.credits, sc.grade, sc.progress FROM student_courses sc
    JOIN courses c ON c.id = sc.course_id WHERE sc.student_id = ?
  `, [studentId]);
});

// ──────────────────────────────────────────────
// ASSIGNMENTS
// ──────────────────────────────────────────────
ipcMain.handle('get-assignments', (_e, studentId) => {
  return db.query(`
    SELECT a.*, c.name as course_name, c.code as course_code,
           sa.submitted, sa.submission_text, sa.grade as student_grade
    FROM assignments a
    JOIN courses c ON c.id = a.course_id
    JOIN student_courses sc ON sc.course_id = a.course_id AND sc.student_id = ?
    LEFT JOIN student_assignments sa ON sa.assignment_id = a.id AND sa.student_id = ?
    ORDER BY a.due_date ASC
  `, [studentId, studentId]);
});

ipcMain.handle('submit-assignment', (_e, { studentId, assignmentId, text }) => {
  const existing = db.queryOne('SELECT id FROM student_assignments WHERE student_id=? AND assignment_id=?', [studentId, assignmentId]);
  if (existing) {
    db.run("UPDATE student_assignments SET submitted=1, submission_text=?, submitted_at=datetime('now') WHERE student_id=? AND assignment_id=?",
      [text, studentId, assignmentId]);
  } else {
    db.run("INSERT INTO student_assignments (student_id,assignment_id,submitted,submission_text,submitted_at) VALUES (?,?,1,?,datetime('now'))",
      [studentId, assignmentId, text]);
  }
  return { success: true };
});

// ──────────────────────────────────────────────
// ANNOUNCEMENTS
// ──────────────────────────────────────────────
ipcMain.handle('get-announcements', () => db.query('SELECT * FROM announcements ORDER BY created_at DESC'));

// ──────────────────────────────────────────────
// SCHEDULE
// ──────────────────────────────────────────────
ipcMain.handle('get-schedule', (_e, studentId) => {
  return db.query(`
    SELECT s.*, c.name as course_name, c.code as course_code FROM schedule s
    JOIN courses c ON c.id = s.course_id
    JOIN student_courses sc ON sc.course_id = s.course_id AND sc.student_id = ?
    ORDER BY CASE s.day WHEN 'Monday' THEN 1 WHEN 'Tuesday' THEN 2 WHEN 'Wednesday' THEN 3
      WHEN 'Thursday' THEN 4 WHEN 'Friday' THEN 5 ELSE 6 END, s.start_time
  `, [studentId]);
});

// ──────────────────────────────────────────────
// ATTENDANCE
// ──────────────────────────────────────────────
ipcMain.handle('get-attendance', (_e, studentId) => {
  return db.query(`
    SELECT c.name, c.code,
      COUNT(a.id) as total_classes,
      SUM(CASE WHEN a.status='present' THEN 1 ELSE 0 END) as present,
      SUM(CASE WHEN a.status='absent' THEN 1 ELSE 0 END) as absent
    FROM courses c
    JOIN student_courses sc ON sc.course_id = c.id AND sc.student_id = ?
    LEFT JOIN attendance a ON a.course_id = c.id AND a.student_id = ?
    GROUP BY c.id
  `, [studentId, studentId]);
});

// ──────────────────────────────────────────────
// NOTIFICATIONS
// ──────────────────────────────────────────────
ipcMain.handle('get-notifications', (_e, studentId) => {
  return db.query('SELECT * FROM notifications WHERE student_id = ? OR student_id IS NULL ORDER BY created_at DESC LIMIT 20', [studentId]);
});

ipcMain.handle('mark-notification-read', (_e, id) => {
  db.run('UPDATE notifications SET is_read=1 WHERE id=?', [id]);
  return { success: true };
});

// ──────────────────────────────────────────────
// DASHBOARD STATS
// ──────────────────────────────────────────────
ipcMain.handle('get-dashboard-stats', (_e, studentId) => {
  const courseCount = (db.queryOne('SELECT COUNT(*) as n FROM student_courses WHERE student_id=?', [studentId]) || {}).n || 0;
  const pendingAssignments = (db.queryOne(`
    SELECT COUNT(*) as n FROM assignments a
    JOIN student_courses sc ON sc.course_id = a.course_id AND sc.student_id = ?
    LEFT JOIN student_assignments sa ON sa.assignment_id = a.id AND sa.student_id = ?
    WHERE (sa.submitted IS NULL OR sa.submitted = 0) AND a.due_date >= date('now')
  `, [studentId, studentId]) || {}).n || 0;
  const unreadNotifs = (db.queryOne("SELECT COUNT(*) as n FROM notifications WHERE (student_id=? OR student_id IS NULL) AND is_read=0", [studentId]) || {}).n || 0;
  const grades = db.query(`
    SELECT c.credits, sc.grade FROM student_courses sc
    JOIN courses c ON c.id = sc.course_id WHERE sc.student_id=? AND sc.grade != 'N/A'
  `, [studentId]);

  const gradePoints = { 'A+':4.0,'A':4.0,'A-':3.7,'B+':3.3,'B':3.0,'B-':2.7,'C+':2.3,'C':2.0,'C-':1.7,'D':1.0,'F':0.0 };
  let totalPoints = 0, totalCredits = 0;
  for (const g of grades) {
    const pts = gradePoints[g.grade];
    if (pts !== undefined) { totalPoints += pts * g.credits; totalCredits += g.credits; }
  }
  const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 'N/A';
  return { courseCount, pendingAssignments, unreadNotifs, gpa };
});

// ──────────────────────────────────────────────
// SHOP — Products & Cart
// ──────────────────────────────────────────────
ipcMain.handle('get-products', () => db.query('SELECT * FROM products ORDER BY category, name'));

ipcMain.handle('get-cart', (_e, studentId) => {
  return db.query(`
    SELECT ci.id, ci.quantity, p.name, p.price, p.emoji, p.color, p.id as product_id
    FROM cart_items ci JOIN products p ON p.id = ci.product_id
    WHERE ci.student_id = ?
  `, [studentId]);
});

ipcMain.handle('add-to-cart', (_e, { studentId, productId }) => {
  const existing = db.queryOne('SELECT id, quantity FROM cart_items WHERE student_id=? AND product_id=?', [studentId, productId]);
  if (existing) {
    db.run('UPDATE cart_items SET quantity = quantity + 1 WHERE id=?', [existing.id]);
  } else {
    db.run('INSERT INTO cart_items (student_id, product_id, quantity) VALUES (?,?,1)', [studentId, productId]);
  }
  return { success: true };
});

ipcMain.handle('remove-from-cart', (_e, { studentId, productId }) => {
  db.run('DELETE FROM cart_items WHERE student_id=? AND product_id=?', [studentId, productId]);
  return { success: true };
});

ipcMain.handle('clear-cart', (_e, studentId) => {
  db.run('DELETE FROM cart_items WHERE student_id=?', [studentId]);
  return { success: true };
});

ipcMain.handle('get-store-profile', (_e, studentId) => {
  return db.queryOne('SELECT * FROM store_profiles WHERE student_id=?', [studentId]) || {};
});

ipcMain.handle('save-store-profile', (_e, data) => {
  const existing = db.queryOne('SELECT id FROM store_profiles WHERE student_id=?', [data.studentId]);
  if (existing) {
    db.run('UPDATE store_profiles SET full_name=?,address=?,city=?,phone=? WHERE student_id=?',
      [data.full_name, data.address, data.city, data.phone, data.studentId]);
  } else {
    db.run('INSERT INTO store_profiles (student_id,full_name,address,city,phone) VALUES (?,?,?,?,?)',
      [data.studentId, data.full_name, data.address, data.city, data.phone]);
  }
  return { success: true };
});

// ──────────────────────────────────────────────
// TO-DO LIST
// ──────────────────────────────────────────────
ipcMain.handle('get-todos', (_e, studentId) => {
  return db.query('SELECT * FROM todos WHERE student_id=? ORDER BY completed ASC, created_at DESC', [studentId]);
});

ipcMain.handle('add-todo', (_e, { studentId, title, priority, due_date }) => {
  const r = db.run('INSERT INTO todos (student_id,title,priority,due_date) VALUES (?,?,?,?)',
    [studentId, title, priority || 'normal', due_date || '']);
  return { success: true, id: r.lastInsertRowid };
});

ipcMain.handle('toggle-todo', (_e, id) => {
  const t = db.queryOne('SELECT completed FROM todos WHERE id=?', [id]);
  if (t) db.run('UPDATE todos SET completed=? WHERE id=?', [t.completed ? 0 : 1, id]);
  return { success: true };
});

ipcMain.handle('delete-todo', (_e, id) => {
  db.run('DELETE FROM todos WHERE id=?', [id]);
  return { success: true };
});

// ──────────────────────────────────────────────
// QUIZ
// ──────────────────────────────────────────────
ipcMain.handle('get-quiz-results', (_e, studentId) => {
  return db.query('SELECT * FROM quiz_results WHERE student_id=? ORDER BY taken_at DESC', [studentId]);
});

ipcMain.handle('save-quiz-result', (_e, { studentId, quiz_name, score, total }) => {
  db.run('INSERT INTO quiz_results (student_id,quiz_name,score,total) VALUES (?,?,?,?)',
    [studentId, quiz_name, score, total]);
  return { success: true };
});
