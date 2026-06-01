// preload.js — Secure bridge between Electron main process and renderer (UI)
//
// contextBridge exposes ONLY selected APIs to the renderer.
// The renderer cannot access Node.js or Electron directly — this is a security model.
// Every ipcRenderer.invoke() call here maps to an ipcMain.handle() in main.js.

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // Window controls
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close:    () => ipcRenderer.send('window-close'),

  // Auth
  login:    (data) => ipcRenderer.invoke('auth-login', data),
  register: (data) => ipcRenderer.invoke('auth-register', data),

  // Student / Profile
  getStudent:     (id)   => ipcRenderer.invoke('get-student', id),
  updateProfile:  (data) => ipcRenderer.invoke('update-profile', data),
  changePassword: (data) => ipcRenderer.invoke('change-password', data),

  // Courses
  getCourses:    (studentId) => ipcRenderer.invoke('get-courses', studentId),
  getAllCourses:  ()          => ipcRenderer.invoke('get-all-courses'),
  enrollCourse:  (data)      => ipcRenderer.invoke('enroll-course', data),

  // Grades
  getGrades: (studentId) => ipcRenderer.invoke('get-grades', studentId),

  // Assignments
  getAssignments:   (studentId) => ipcRenderer.invoke('get-assignments', studentId),
  submitAssignment: (data)      => ipcRenderer.invoke('submit-assignment', data),

  // Announcements
  getAnnouncements: () => ipcRenderer.invoke('get-announcements'),

  // Schedule
  getSchedule: (studentId) => ipcRenderer.invoke('get-schedule', studentId),

  // Attendance
  getAttendance: (studentId) => ipcRenderer.invoke('get-attendance', studentId),

  // Notifications
  getNotifications:      (studentId) => ipcRenderer.invoke('get-notifications', studentId),
  markNotificationRead:  (id)        => ipcRenderer.invoke('mark-notification-read', id),

  // Dashboard
  getDashboardStats: (studentId) => ipcRenderer.invoke('get-dashboard-stats', studentId),

  // Shop
  getProducts:       ()           => ipcRenderer.invoke('get-products'),
  getCart:           (studentId)  => ipcRenderer.invoke('get-cart', studentId),
  addToCart:         (data)       => ipcRenderer.invoke('add-to-cart', data),
  removeFromCart:    (data)       => ipcRenderer.invoke('remove-from-cart', data),
  clearCart:         (studentId)  => ipcRenderer.invoke('clear-cart', studentId),
  getStoreProfile:   (studentId)  => ipcRenderer.invoke('get-store-profile', studentId),
  saveStoreProfile:  (data)       => ipcRenderer.invoke('save-store-profile', data),

  // To-Do
  getTodos:    (studentId) => ipcRenderer.invoke('get-todos', studentId),
  addTodo:     (data)      => ipcRenderer.invoke('add-todo', data),
  toggleTodo:  (id)        => ipcRenderer.invoke('toggle-todo', id),
  deleteTodo:  (id)        => ipcRenderer.invoke('delete-todo', id),

  // Quiz
  getQuizResults:  (studentId) => ipcRenderer.invoke('get-quiz-results', studentId),
  saveQuizResult:  (data)      => ipcRenderer.invoke('save-quiz-result', data),
});
