// js/portfolio.js — Student portfolio page

window.renderPortfolio = async function (container, user) {
  try {
    const [fresh, grades] = await Promise.all([
      window.api.getStudent(user.id),
      window.api.getGrades(user.id),
    ]);
    if (fresh) Object.assign(user, fresh);

    // Compute GPA for portfolio
    const gradePoints = { 'A+':4.0,'A':4.0,'A-':3.7,'B+':3.3,'B':3.0,'B-':2.7,'C+':2.3,'C':2.0,'C-':1.7,'D':1.0,'F':0.0 };
    let tp = 0, tc = 0;
    for (const g of grades) {
      const p = gradePoints[g.grade];
      if (p !== undefined) { tp += p * g.credits; tc += g.credits; }
    }
    const gpa = tc > 0 ? (tp / tc).toFixed(2) : 'N/A';

    // Department → skills mapping
    const skillsMap = {
      'Computer Science': ['Python','JavaScript','Data Structures','Algorithms','Database Design','OOP','Git','Linux'],
      'Mathematics':      ['Calculus','Linear Algebra','Statistics','Probability','Numerical Methods','LaTeX','MATLAB'],
      'Physics':          ['Mechanics','Thermodynamics','Quantum Physics','Lab Techniques','MATLAB','Data Analysis'],
      'Engineering':      ['Circuit Design','Thermodynamics','CAD','MATLAB','Problem Solving','Project Management'],
      'Business':         ['Accounting','Marketing','Management','Economics','Data Analysis','Communication'],
      'Arts':             ['Critical Thinking','Research','Writing','Presentation','Creative Design','Communication'],
    };
    const skills = skillsMap[user.department] || ['Critical Thinking','Research','Communication','Problem Solving','Teamwork'];

    const achievements = [
      gpa !== 'N/A' && parseFloat(gpa) >= 3.5 ? '🏆 Dean\'s List — GPA ' + gpa : null,
      grades.length >= 4 ? `📚 Enrolled in ${grades.length} courses` : null,
      '🎓 EduPortal Student',
      user.year >= 2 ? `📅 Year ${user.year} Student` : null,
      user.department ? `🏛️ ${user.department} Major` : null,
    ].filter(Boolean);

    container.innerHTML = `
      <!-- Navigation tabs -->
      <div style="display:flex;gap:0.5rem;margin-bottom:1.5rem;border-bottom:2px solid var(--border);padding-bottom:0.75rem;">
        ${['Home','About','Skills','Contact'].map((tab, i) => `
          <button class="btn btn-${i === 0 ? 'primary' : 'ghost'} btn-sm port-tab" data-tab="${tab.toLowerCase()}">${tab}</button>
        `).join('')}
      </div>

      <!-- ── HOME SECTION ── -->
      <div id="port-home" class="port-section">
        <div class="card" style="background:linear-gradient(135deg, var(--accent)22, var(--accent)08);border:none;padding:3rem;text-align:center;margin-bottom:1.5rem;position:relative;overflow:hidden;">
          <!-- Background decorative circles -->
          <div style="position:absolute;width:200px;height:200px;border-radius:50%;background:var(--accent)0D;top:-60px;right:-60px;"></div>
          <div style="position:absolute;width:120px;height:120px;border-radius:50%;background:var(--accent)0D;bottom:-30px;left:-30px;"></div>

          <!-- Avatar -->
          <div style="width:100px;height:100px;border-radius:50%;background:${user.avatar_color || '#c084fc'};
               display:flex;align-items:center;justify-content:center;font-size:2.5rem;font-weight:800;
               color:#fff;margin:0 auto 1.25rem;border:4px solid #fff;box-shadow:0 8px 24px rgba(0,0,0,0.15);position:relative;z-index:1;">
            ${window.getInitials(user.name)}
          </div>

          <h1 style="font-size:2rem;margin-bottom:0.25rem;position:relative;z-index:1;">${user.name}</h1>
          <p style="color:var(--accent);font-weight:700;font-size:1.1rem;margin-bottom:0.75rem;position:relative;z-index:1;">
            ${user.department} Student · Year ${user.year}
          </p>
          <p style="color:var(--text-muted);max-width:480px;margin:0 auto 1.5rem;position:relative;z-index:1;">
            ${user.bio || `A dedicated ${user.department} student passionate about learning and growing. Currently in Year ${user.year} at EduPortal University.`}
          </p>

          <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;position:relative;z-index:1;">
            <span style="padding:0.5rem 1.25rem;background:var(--accent);color:#fff;border-radius:999px;font-weight:700;font-size:0.85rem;">
              GPA: ${gpa}
            </span>
            <span style="padding:0.5rem 1.25rem;background:var(--bg-card);border:2px solid var(--border);border-radius:999px;font-size:0.85rem;font-weight:600;">
              📧 ${user.email}
            </span>
            <span style="padding:0.5rem 1.25rem;background:var(--bg-card);border:2px solid var(--border);border-radius:999px;font-size:0.85rem;font-weight:600;">
              🆔 ${user.student_id}
            </span>
          </div>
        </div>

        <!-- Quick stats -->
        <div class="grid-3">
          ${[
            ['📚', grades.length, 'Courses'],
            ['🎓', gpa, 'GPA'],
            [user.department === 'Computer Science' ? '💻' : '🏛️', user.year, 'Year'],
          ].map(([icon, val, label]) => `
            <div class="card" style="text-align:center;padding:1.5rem;">
              <div style="font-size:2rem;margin-bottom:0.5rem;">${icon}</div>
              <div style="font-size:1.75rem;font-weight:800;color:var(--accent);">${val}</div>
              <div style="font-size:0.8rem;color:var(--text-muted);">${label}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- ── ABOUT SECTION ── -->
      <div id="port-about" class="port-section" style="display:none;">
        <div class="grid-2">
          <div class="card">
            <h3 style="margin-bottom:1.25rem;">👤 About Me</h3>
            <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1.25rem;">
              <div style="width:64px;height:64px;border-radius:50%;background:${user.avatar_color || '#c084fc'};
                   display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:800;color:#fff;">
                ${window.getInitials(user.name)}
              </div>
              <div>
                <h4>${user.name}</h4>
                <p style="color:var(--text-muted);font-size:0.85rem;">${user.department} · Year ${user.year}</p>
              </div>
            </div>
            <p style="color:var(--text-secondary);line-height:1.7;margin-bottom:1rem;">
              ${user.bio || `Hi! I'm ${user.name.split(' ')[0]}, a Year ${user.year} student in the ${user.department} department at EduPortal University. I'm passionate about my field and dedicated to academic excellence.`}
            </p>
            ${[
              ['📧', 'Email', user.email],
              ['📱', 'Phone', user.phone || 'Not provided'],
              ['🏛️', 'Department', user.department],
              ['📅', 'Year', `Year ${user.year}`],
              ['🆔', 'Student ID', user.student_id],
            ].map(([icon, label, val]) => `
              <div style="display:flex;justify-content:space-between;padding:0.5rem 0;border-bottom:1px solid var(--border);font-size:0.875rem;">
                <span style="color:var(--text-muted);">${icon} ${label}</span>
                <span style="font-weight:600;">${val}</span>
              </div>
            `).join('')}
          </div>

          <div class="card">
            <h3 style="margin-bottom:1.25rem;">🏆 Achievements</h3>
            <div style="display:flex;flex-direction:column;gap:0.75rem;margin-bottom:1.5rem;">
              ${achievements.map(a => `
                <div style="padding:0.875rem;background:var(--accent-light);border-radius:var(--radius-sm);border-left:4px solid var(--accent);font-weight:600;font-size:0.875rem;">
                  ${a}
                </div>
              `).join('')}
            </div>

            <h3 style="margin-bottom:1rem;">📊 Grade Summary</h3>
            ${grades.slice(0, 5).map(g => {
              const pct = g.progress || 0;
              const col = g.grade === 'N/A' ? 'var(--text-muted)' : parseFloat(gradePoints[g.grade]) >= 3.3 ? 'var(--success)' : parseFloat(gradePoints[g.grade]) >= 2.0 ? 'var(--warning)' : 'var(--danger)';
              return `
                <div style="margin-bottom:0.75rem;">
                  <div style="display:flex;justify-content:space-between;margin-bottom:0.3rem;font-size:0.8rem;">
                    <span style="font-weight:600;">${g.code} — ${g.name}</span>
                    <span style="font-weight:700;color:${col};">${g.grade}</span>
                  </div>
                  <div class="progress-bar" style="height:6px;">
                    <div class="progress-fill" style="width:${pct}%;background:${col};"></div>
                  </div>
                </div>`;
            }).join('')}
          </div>
        </div>
      </div>

      <!-- ── SKILLS SECTION ── -->
      <div id="port-skills" class="port-section" style="display:none;">
        <div class="grid-2">
          <div class="card">
            <h3 style="margin-bottom:1.25rem;">⚡ Technical Skills</h3>
            <div style="display:flex;flex-wrap:wrap;gap:0.5rem;margin-bottom:1.5rem;">
              ${skills.map(s => `
                <span style="padding:0.5rem 1rem;background:var(--accent-light);color:var(--accent);
                      border-radius:999px;font-weight:600;font-size:0.82rem;border:1.5px solid var(--accent)33;">
                  ${s}
                </span>
              `).join('')}
            </div>

            <h3 style="margin-bottom:1rem;">🌟 Soft Skills</h3>
            ${['Communication','Teamwork','Problem Solving','Time Management','Leadership','Adaptability'].map(s => `
              <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.75rem;">
                <span style="font-size:0.875rem;min-width:130px;">${s}</span>
                <div class="progress-bar" style="flex:1;height:8px;">
                  <div class="progress-fill" style="width:${70 + Math.random()*25 | 0}%;"></div>
                </div>
              </div>
            `).join('')}
          </div>

          <div class="card">
            <h3 style="margin-bottom:1.25rem;">🏅 Certifications & Activities</h3>
            ${[
              { icon: '🎓', title: 'EduPortal University', sub: `${user.department} · Year ${user.year}`, type: 'Education' },
              { icon: '📜', title: 'Academic Excellence Award', sub: 'GPA above 3.0', type: 'Achievement' },
              { icon: '🤝', title: 'Study Group Leader', sub: user.department + ' Department', type: 'Activity' },
              { icon: '💡', title: `${user.department} Club Member`, sub: 'Active Member', type: 'Club' },
            ].map(item => `
              <div style="display:flex;gap:1rem;padding:1rem;background:var(--bg-secondary);border-radius:var(--radius-sm);margin-bottom:0.75rem;">
                <div style="font-size:1.75rem;">${item.icon}</div>
                <div>
                  <div style="font-weight:700;font-size:0.9rem;">${item.title}</div>
                  <div style="font-size:0.78rem;color:var(--text-muted);">${item.sub}</div>
                  <span class="badge badge-accent" style="margin-top:4px;font-size:0.65rem;">${item.type}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- ── CONTACT SECTION ── -->
      <div id="port-contact" class="port-section" style="display:none;">
        <div class="grid-2">
          <div class="card">
            <h3 style="margin-bottom:1.25rem;">📬 Get In Touch</h3>
            <form id="contact-form">
              <div class="form-group">
                <label class="form-label">Your Name</label>
                <input class="form-input" type="text" id="c-name" placeholder="Your full name" required />
              </div>
              <div class="form-group">
                <label class="form-label">Your Email</label>
                <input class="form-input" type="email" id="c-email" placeholder="your@email.com" required />
              </div>
              <div class="form-group">
                <label class="form-label">Subject</label>
                <input class="form-input" type="text" id="c-subject" placeholder="What's this about?" required />
              </div>
              <div class="form-group">
                <label class="form-label">Message</label>
                <textarea class="form-input" id="c-msg" rows="4" placeholder="Write your message…" required></textarea>
              </div>
              <button type="submit" class="btn btn-primary w-full">📨 Send Message</button>
            </form>
          </div>

          <div class="card">
            <h3 style="margin-bottom:1.25rem;">📍 Contact Info</h3>
            ${[
              ['📧', 'Email', user.email],
              ['📱', 'Phone', user.phone || 'Not provided'],
              ['🏛️', 'Department', user.department],
              ['🎓', 'University', 'EduPortal University'],
            ].map(([icon, label, val]) => `
              <div style="display:flex;gap:1rem;padding:1rem;background:var(--bg-secondary);border-radius:var(--radius-sm);margin-bottom:0.75rem;align-items:center;">
                <span style="font-size:1.5rem;">${icon}</span>
                <div>
                  <div style="font-size:0.75rem;color:var(--text-muted);">${label}</div>
                  <div style="font-weight:600;">${val}</div>
                </div>
              </div>
            `).join('')}

            <div style="margin-top:1rem;padding:1rem;background:var(--accent-light);border-radius:var(--radius-sm);border:1.5px solid var(--accent)33;text-align:center;">
              <div style="font-size:2rem;margin-bottom:0.5rem;">🌐</div>
              <p style="font-size:0.85rem;color:var(--text-secondary);">This portfolio is hosted on EduPortal · Your academic profile is visible to staff</p>
            </div>
          </div>
        </div>
      </div>
    `;

    // Tab switching
    function showTab(name) {
      document.querySelectorAll('.port-section').forEach(s => s.style.display = 'none');
      document.getElementById(`port-${name}`)?.style.setProperty('display', 'block');
      document.querySelectorAll('.port-tab').forEach(t => {
        t.className = `btn btn-${t.dataset.tab === name ? 'primary' : 'ghost'} btn-sm port-tab`;
      });
    }
    container.querySelectorAll('.port-tab').forEach(btn => {
      btn.addEventListener('click', () => showTab(btn.dataset.tab));
    });

    // Contact form submit
    document.getElementById('contact-form')?.addEventListener('submit', e => {
      e.preventDefault();
      window.showToast(`✉️ Message sent to ${user.name}!`, 'success');
      document.getElementById('contact-form').reset();
    });

  } catch (err) {
    container.innerHTML = `<div class="empty-state"><div class="icon">❌</div><p>${err.message}</p></div>`;
  }
};
