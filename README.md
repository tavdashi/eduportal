# EduPortal — Student Web Portal

A full-featured desktop student management portal built with **Electron**, **SQLite**, and **vanilla JavaScript**.

![Electron](https://img.shields.io/badge/Electron-29-47848F?logo=electron&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-sql.js-003B57?logo=sqlite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?logo=javascript&logoColor=black)
![CSS3](https://img.shields.io/badge/CSS3-Custom_Properties-1572B6?logo=css3&logoColor=white)

---

## Features

### Academic Tools
- **Dashboard** — GPA overview, pending assignments, daily schedule, announcements
- **Courses** — Browse, enroll, track progress per course
- **Grades & GPA** — Cumulative GPA calculation (4.0 scale), grade distribution
- **Assignments** — Submit assignments, filter by status, overdue detection
- **Schedule** — Weekly timetable view
- **Attendance** — Per-course attendance tracking with 75% warnings

### Extras
- **Campus Shop** — Product listing, add-to-cart, checkout with saved delivery details
- **To-Do List** — Add tasks with priority & due dates, toggle complete, filter
- **Quizzes** — 3 quiz topics (GK, CS, Math), 8 MCQs each, score & grade display
- **Portfolio** — Auto-generated student portfolio with About, Skills, Contact form

### UI & Design
- **4 Themes** — Spring Pastel (default), Dark Mode, Mint, Peach
- **Animated UI** — Smooth transitions, hover effects, count-up animations
- **Responsive layout** — Sidebar + content area SPA navigation
- **Custom titlebar** — Frameless Electron window with custom controls

### Auth & Data
- **Login / Register** — Persistent user accounts stored in SQLite
- **Session management** — sessionStorage-based auth guard
- **Auto-seed** — Demo data populates automatically on first launch

---

## How to Run

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)

### Setup
```bash
# 1. Clone this repo
git clone https://github.com/YOUR_USERNAME/eduportal.git
cd eduportal

# 2. Install dependencies
npm install

# 3. Launch the app
npm start
```

### Demo Accounts
| Username | Password | Department |
|----------|----------|-----------|
| `aisha` | `aisha123` | Computer Science |
| `bilal` | `bilal123` | Mathematics |
| `sara` | `sara123` | Physics |
| `zain` | `zain123` | Computer Science |

Or create a new account from the Register tab.

---

## Project Structure

```
eduportal/
├── main.js              ← Electron main process + IPC handlers
├── preload.js           ← Security bridge (contextBridge)
├── package.json         ← Dependencies & scripts
├── database/
│   ├── db.js            ← SQLite setup (sql.js) + schema
│   └── seed.js          ← Standalone seed script
└── src/
    ├── pages/
    │   ├── login.html       ← Login & register page
    │   └── dashboard.html   ← Main app shell (sidebar + content)
    ├── css/
    │   ├── global.css       ← Design system, themes, variables
    │   ├── sidebar.css      ← Sidebar & titlebar styles
    │   ├── login.css        ← Auth page styles
    │   └── dashboard.css    ← Dashboard component styles
    └── js/
        ├── theme.js         ← Theme switcher (4 themes)
        ├── utils.js         ← Toast, modal, GPA calc, session
        ├── auth.js          ← Login & register logic
        ├── renderer.js      ← SPA router
        ├── dashboard.js     ← Dashboard page
        ├── courses.js       ← Courses page
        ├── grades.js        ← Grades & GPA page
        ├── assignments.js   ← Assignments page
        ├── schedule.js      ← Timetable page
        ├── attendance.js    ← Attendance tracker
        ├── announcements.js ← Announcements page
        ├── notifications.js ← Notifications page
        ├── profile.js       ← Profile editor
        ├── shop.js          ← E-commerce shop
        ├── todo.js          ← To-do list
        ├── quiz.js          ← Quiz system
        └── portfolio.js     ← Student portfolio
```

---

## Tech Stack

| Technology | Role |
|-----------|------|
| **Electron 29** | Desktop app framework (Chromium + Node.js) |
| **sql.js 1.11** | Pure-JS SQLite via WebAssembly (no native compilation) |
| **HTML5 / CSS3** | UI structure & styling with CSS Custom Properties |
| **Vanilla JavaScript** | All logic — no frameworks |
| **Google Fonts (Nunito)** | Typography |

---

## Architecture

```
┌─────────────────────────────────────────┐
│            Electron App                 │
│                                         │
│  ┌────────────┐   IPC   ┌───────────┐  │
│  │  main.js   │◄───────►│ preload   │  │
│  │  (Node.js) │ messages│   .js     │  │
│  │  + DB ops  │         │ (bridge)  │  │
│  └─────┬──────┘         └─────┬─────┘  │
│        │                      │         │
│   SQLite DB              window.api     │
│   (sql.js)                    │         │
│                         ┌─────▼─────┐   │
│                         │ Renderer  │   │
│                         │ HTML/CSS/ │   │
│                         │ JS files  │   │
│                         └───────────┘   │
└─────────────────────────────────────────┘
```

---

## License

MIT
