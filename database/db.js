// database/db.js — SQLite using sql.js (pure JS, no native compilation)
// sql.js needs the path to its .wasm file specified explicitly in Electron.

const path = require('path');
const fs   = require('fs');

let _db   = null;
let _path = '';

async function getDb() {
  if (_db) return _db;

  // Must require electron here (not at top) because getDb() is called after app is ready
  const { app } = require('electron');

  // Locate the wasm file inside node_modules/sql.js/dist
  const wasmPath = path.join(__dirname, '..', 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm');

  const initSqlJs = require('sql.js');
  const SQL = await initSqlJs({
    locateFile: () => wasmPath  // Tell sql.js exactly where the .wasm file is
  });

  const dir = app.getPath('userData');
  fs.mkdirSync(dir, { recursive: true });
  _path = path.join(dir, 'eduportal.db');

  if (fs.existsSync(_path)) {
    _db = new SQL.Database(fs.readFileSync(_path));
  } else {
    _db = new SQL.Database();
  }

  _db.run('PRAGMA foreign_keys = ON;');
  createSchema();
  save();
  return _db;
}

function createSchema() {
  _db.run(`
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
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, price REAL NOT NULL,
      description TEXT DEFAULT '', emoji TEXT DEFAULT '📦', category TEXT DEFAULT 'General',
      badge TEXT DEFAULT '', color TEXT DEFAULT '#c084fc'
    );
    CREATE TABLE IF NOT EXISTS cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT, student_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL, quantity INTEGER DEFAULT 1,
      UNIQUE(student_id, product_id)
    );
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT, student_id INTEGER NOT NULL,
      title TEXT NOT NULL, completed INTEGER DEFAULT 0,
      priority TEXT DEFAULT 'normal', due_date TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS quiz_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT, student_id INTEGER NOT NULL,
      quiz_name TEXT NOT NULL, score INTEGER NOT NULL, total INTEGER NOT NULL,
      taken_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS store_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT, student_id INTEGER NOT NULL UNIQUE,
      full_name TEXT DEFAULT '', address TEXT DEFAULT '',
      city TEXT DEFAULT '', phone TEXT DEFAULT '', saved_at TEXT DEFAULT (datetime('now'))
    );
  `);
}

function save() {
  if (!_db || !_path) return;
  try {
    fs.writeFileSync(_path, Buffer.from(_db.export()));
  } catch (e) {
    console.error('DB save error:', e.message);
  }
}

// Normalize BigInt → Number (sql.js returns 64-bit ints as BigInt)
function normalize(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    out[k] = typeof v === 'bigint' ? Number(v) : v;
  }
  return out;
}

// Run rows through sql.js and return plain objects
function query(sql, params = []) {
  try {
    const stmt = _db.prepare(sql);
    if (params.length > 0) stmt.bind(params);
    const rows = [];
    while (stmt.step()) rows.push(normalize(stmt.getAsObject()));
    stmt.free();
    return rows;
  } catch (e) {
    console.error('query error:', e.message, '\nSQL:', sql);
    return [];
  }
}

function queryOne(sql, params = []) {
  return query(sql, params)[0] || null;
}

function run(sql, params = []) {
  try {
    _db.run(sql, params);
    save();
    const r = queryOne('SELECT last_insert_rowid() as id');
    return { lastInsertRowid: r ? Number(r.id) : null };
  } catch (e) {
    console.error('run error:', e.message, '\nSQL:', sql);
    throw e;
  }
}

module.exports = { getDb, query, queryOne, run, save };

