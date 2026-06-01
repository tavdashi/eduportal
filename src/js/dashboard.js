// js/dashboard.js — Dashboard page renderer

window.renderDashboard = async function (container, user) {
  try {
    const [stats, assignments, announcements, schedule] = await Promise.all([
      window.api.getDashboardStats(user.id),
      window.api.getAssignments(user.id),
      window.api.getAnnouncements(),
      window.api.getSchedule(user.id),
    ]);

    // Get today's classes
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const today = days[new Date().getDay()];
    const todayClasses = schedule.filter(s => s.day === today);

    // Upcoming assignments (not submitted, due soon)
    const pending = assignments.filter(a => !a.submitted).slice(0, 5);

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    container.innerHTML = `
      <!-- Greeting Banner -->
      <div class="greeting-banner">
        <h2>${greeting}, ${user.name.split(' ')[0]}! 👋</h2>
        <p>Welcome back to your student portal. Here's your overview for today.</p>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card purple">
          <div class="stat-icon">📚</div>
          <div class="stat-value" id="stat-courses">-</div>
          <div class="stat-label">Enrolled Courses</div>
        </div>
        <div class="stat-card pink">
          <div class="stat-icon">📝</div>
          <div class="stat-value" id="stat-assignments">-</div>
          <div class="stat-label">Pending Assignments</div>
        </div>
        <div class="stat-card green">
          <div class="stat-icon">⭐</div>
          <div class="stat-value" id="stat-gpa">-</div>
          <div class="stat-label">Current GPA</div>
        </div>
        <div class="stat-card orange">
          <div class="stat-icon">🔔</div>
          <div class="stat-value" id="stat-notifs">-</div>
          <div class="stat-label">Unread Notifications</div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions" aria-label="Quick actions">
        <button class="quick-action-btn" onclick="window.navigateTo('courses')">📚 My Courses</button>
        <button class="quick-action-btn" onclick="window.navigateTo('assignments')">📝 Assignments</button>
        <button class="quick-action-btn" onclick="window.navigateTo('grades')">📊 View Grades</button>
        <button class="quick-action-btn" onclick="window.navigateTo('schedule')">📅 Timetable</button>
        <button class="quick-action-btn" onclick="window.navigateTo('announcements')">📢 Notices</button>
      </div>

      <!-- Main Grid -->
      <div class="dashboard-grid">

        <!-- Left column -->
        <div>
          <!-- Upcoming Assignments -->
          <div class="card mb-2">
            <div class="page-header" style="margin-bottom:1rem;">
              <h3>📝 Upcoming Assignments</h3>
              <button class="btn btn-ghost btn-sm" onclick="window.navigateTo('assignments')">View All</button>
            </div>
            <div id="dash-assignments">
              ${pending.length === 0
                ? `<div class="empty-state"><div class="icon">🎉</div><p>No pending assignments! You're all caught up.</p></div>`
                : pending.map(a => {
                    const days = window.daysUntil(a.due_date);
                    const isUrgent = days <= 2;
                    const colors = ['#f472b6','#60a5fa','#34d399','#fb923c','#a78bfa'];
                    const color = colors[a.id % colors.length];
                    return `
                      <div class="assignment-item">
                        <div class="assignment-dot" style="background:${color};"></div>
                        <div class="assignment-info">
                          <div class="assignment-title">${a.title}</div>
                          <div class="assignment-course">${a.course_code} · ${a.course_name}</div>
                        </div>
                        <div class="assignment-due ${isUrgent ? 'urgent' : ''}">
                          ${days < 0 ? 'Overdue' : days === 0 ? 'Today!' : `${days}d`}
                        </div>
                        <span class="badge badge-${a.type === 'Quiz' ? 'warning' : a.type === 'Project' ? 'info' : 'muted'}">${a.type}</span>
                      </div>`;
                  }).join('')
              }
            </div>
          </div>

          <!-- Announcements -->
          <div class="card">
            <div class="page-header" style="margin-bottom:1rem;">
              <h3>📢 Latest Announcements</h3>
              <button class="btn btn-ghost btn-sm" onclick="window.navigateTo('announcements')">View All</button>
            </div>
            <div>
              ${announcements.slice(0, 3).map(a => `
                <div class="announcement-item" onclick="window.navigateTo('announcements')">
                  <div class="ann-header">
                    <div class="ann-title">${a.title}</div>
                    <span class="badge badge-${a.category === 'Exams' ? 'danger' : a.category === 'Event' ? 'info' : a.category === 'Important' ? 'warning' : 'accent'}">${a.category}</span>
                  </div>
                  <div class="ann-body">${a.body}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Right column -->
        <div>
          <!-- Today's Classes -->
          <div class="card mb-2">
            <h3 style="margin-bottom:1rem;">📅 Today's Classes</h3>
            ${todayClasses.length === 0
              ? `<div class="empty-state" style="padding:1.5rem;"><div class="icon">☀️</div><p>No classes today — enjoy your day!</p></div>`
              : todayClasses.map(s => `
                  <div class="schedule-item">
                    <div class="schedule-time">${s.start_time} – ${s.end_time}</div>
                    <div>
                      <div class="schedule-name">${s.course_name}</div>
                      <div class="schedule-room">📍 ${s.room}</div>
                    </div>
                  </div>
                `).join('')
            }
          </div>

          <!-- Student Info Card -->
          <div class="card">
            <div style="text-align:center; margin-bottom:1rem;">
              <div class="avatar avatar-lg" style="background:${user.avatar_color};margin:0 auto 0.75rem;">
                ${window.getInitials(user.name)}
              </div>
              <h3>${user.name}</h3>
              <p class="text-muted">${user.department} · Year ${user.year}</p>
              <span class="badge badge-accent" style="margin-top:0.35rem;">${user.student_id}</span>
            </div>
            <div class="divider"></div>
            <div style="display:flex;justify-content:space-between;font-size:0.85rem;">
              <span class="text-muted">Email</span>
              <span style="font-weight:600;overflow:hidden;text-overflow:ellipsis;max-width:160px;">${user.email}</span>
            </div>
            <div class="mt-1" style="display:flex;justify-content:space-between;font-size:0.85rem;">
              <span class="text-muted">Department</span>
              <span style="font-weight:600;">${user.department}</span>
            </div>
            <div class="mt-1 mb-2" style="display:flex;justify-content:space-between;font-size:0.85rem;">
              <span class="text-muted">Year</span>
              <span style="font-weight:600;">Year ${user.year}</span>
            </div>
            <button class="btn btn-secondary w-full" onclick="window.navigateTo('profile')">
              ✏️ Edit Profile
            </button>
          </div>
        </div>

      </div>
    `;

    // Animate stats
    window.animateCount(document.getElementById('stat-courses'),     stats.courseCount);
    window.animateCount(document.getElementById('stat-assignments'), stats.pendingAssignments);
    window.animateCount(document.getElementById('stat-gpa'),         stats.gpa);
    window.animateCount(document.getElementById('stat-notifs'),      stats.unreadNotifs);

  } catch (err) {
    container.innerHTML = `<div class="empty-state"><div class="icon">❌</div><p>Failed to load dashboard: ${err.message}</p></div>`;
  }
};
