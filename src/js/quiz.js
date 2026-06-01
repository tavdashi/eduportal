// js/quiz.js — Quiz page with multiple-choice questions, score, result

const QUIZZES = {
  'General Knowledge': {
    icon: '🌍',
    questions: [
      { q: 'What is the capital of France?',        opts: ['Berlin','Madrid','Paris','Rome'],     ans: 2 },
      { q: 'Which planet is closest to the Sun?',   opts: ['Venus','Mercury','Earth','Mars'],     ans: 1 },
      { q: 'How many sides does a hexagon have?',   opts: ['5','6','7','8'],                      ans: 1 },
      { q: 'Who wrote Romeo and Juliet?',           opts: ['Dickens','Shakespeare','Austen','Poe'],ans: 1 },
      { q: 'What is the largest ocean on Earth?',   opts: ['Atlantic','Indian','Arctic','Pacific'],ans: 3 },
      { q: 'What is H₂O commonly known as?',        opts: ['Salt','Water','Acid','Oxygen'],       ans: 1 },
      { q: 'How many continents are there?',        opts: ['5','6','7','8'],                      ans: 2 },
      { q: 'What is the boiling point of water?',   opts: ['90°C','100°C','110°C','120°C'],       ans: 1 },
    ]
  },
  'Computer Science': {
    icon: '💻',
    questions: [
      { q: 'What does CPU stand for?',              opts: ['Central Processing Unit','Core Power Unit','Computer Processing Unit','Central Program Utility'], ans: 0 },
      { q: 'Which language is used for web styling?',opts: ['HTML','Python','CSS','Java'],         ans: 2 },
      { q: 'What does RAM stand for?',              opts: ['Random Access Memory','Read All Memory','Run Application Mode','Random App Manager'], ans: 0 },
      { q: 'Which data structure uses LIFO?',       opts: ['Queue','Array','Stack','Linked List'], ans: 2 },
      { q: 'What is the output of 2**8 in Python?', opts: ['16','64','256','512'],                 ans: 2 },
      { q: 'What does HTTP stand for?',             opts: ['HyperText Transfer Protocol','High Transfer Text Process','HyperText Transport Program','Home Transfer Tool'], ans: 0 },
      { q: 'Which sort has O(n log n) average?',    opts: ['Bubble Sort','Selection Sort','Merge Sort','Insertion Sort'], ans: 2 },
      { q: 'What symbol starts a comment in Python?',opts: ['//','--','#','/*'],                  ans: 2 },
    ]
  },
  'Mathematics': {
    icon: '📐',
    questions: [
      { q: 'What is √144?',                         opts: ['11','12','13','14'],                  ans: 1 },
      { q: 'What is the value of π (approx)?',      opts: ['3.14','3.41','2.71','1.41'],          ans: 0 },
      { q: 'What is 15% of 200?',                   opts: ['20','25','30','35'],                  ans: 2 },
      { q: 'What is the derivative of x²?',         opts: ['x','2x','x²','2'],                   ans: 1 },
      { q: 'How many degrees in a triangle?',       opts: ['90','180','270','360'],               ans: 1 },
      { q: 'What is log₂(8)?',                      opts: ['2','3','4','8'],                      ans: 1 },
      { q: 'Solve: 3x + 6 = 21, x = ?',            opts: ['3','4','5','6'],                      ans: 2 },
      { q: 'What is the area of circle with r=7?',  opts: ['49π','14π','7π','21π'],               ans: 0 },
    ]
  },
};

window.renderQuiz = async function (container, user) {
  let pastResults = [];
  try { pastResults = await window.api.getQuizResults(user.id); } catch { /* empty */ }

  // ── HOME screen: pick a quiz ──
  function showHome() {
    container.innerHTML = `
      <div class="page-header">
        <div><h2 class="page-title">🧠 Quizzes</h2>
        <p class="page-subtitle">Test your knowledge — ${pastResults.length} quizzes taken</p></div>
      </div>

      <div class="grid-3" style="margin-bottom:2rem;">
        ${Object.entries(QUIZZES).map(([name, q]) => `
          <div class="card" style="text-align:center;cursor:pointer;transition:transform 0.2s,box-shadow 0.2s;"
               onmouseenter="this.style.transform='translateY(-4px)';this.style.boxShadow='0 12px 32px rgba(0,0,0,0.12)'"
               onmouseleave="this.style.transform='';this.style.boxShadow=''">
            <div style="font-size:3rem;margin-bottom:0.75rem;">${q.icon}</div>
            <h3 style="margin-bottom:0.5rem;">${name}</h3>
            <p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:1rem;">${q.questions.length} questions · Multiple choice</p>
            <button class="btn btn-primary w-full start-quiz-btn" data-quiz="${name}">Start Quiz →</button>
          </div>
        `).join('')}
      </div>

      ${pastResults.length > 0 ? `
        <div class="card">
          <h3 style="margin-bottom:1rem;">📊 Past Results</h3>
          <div style="display:flex;flex-direction:column;gap:0.75rem;">
            ${pastResults.slice(0, 10).map(r => {
              const pct = Math.round((r.score / r.total) * 100);
              const col = pct >= 80 ? 'var(--success)' : pct >= 50 ? 'var(--warning)' : 'var(--danger)';
              return `
                <div style="display:flex;align-items:center;gap:1rem;padding:0.75rem;background:var(--bg-secondary);border-radius:var(--radius-sm);">
                  <div style="font-size:1.5rem;">${QUIZZES[r.quiz_name]?.icon || '📝'}</div>
                  <div style="flex:1;">
                    <div style="font-weight:600;font-size:0.9rem;">${r.quiz_name}</div>
                    <div style="font-size:0.75rem;color:var(--text-muted);">${window.formatDate(r.taken_at)}</div>
                  </div>
                  <div style="text-align:right;">
                    <div style="font-weight:800;color:${col};font-size:1.1rem;">${r.score}/${r.total}</div>
                    <div style="font-size:0.75rem;color:${col};">${pct}%</div>
                  </div>
                </div>`;
            }).join('')}
          </div>
        </div>
      ` : ''}
    `;
    container.querySelectorAll('.start-quiz-btn').forEach(btn => {
      btn.addEventListener('click', () => startQuiz(btn.dataset.quiz));
    });
  }

  // ── QUIZ screen ──
  function startQuiz(name) {
    const quiz = QUIZZES[name];
    if (!quiz) return;
    let current = 0;
    const answers = new Array(quiz.questions.length).fill(-1);

    function renderQuestion() {
      const q   = quiz.questions[current];
      const pct = Math.round(((current) / quiz.questions.length) * 100);

      container.innerHTML = `
        <div style="max-width:640px;margin:0 auto;">
          <!-- Header -->
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem;">
            <button class="btn btn-ghost btn-sm" id="quit-quiz">← Back</button>
            <span style="font-weight:700;color:var(--text-muted);">Q${current+1} of ${quiz.questions.length}</span>
            <span class="badge badge-accent">${name}</span>
          </div>

          <!-- Progress -->
          <div class="progress-bar" style="margin-bottom:1.5rem;">
            <div class="progress-fill" style="width:${pct}%;transition:width 0.4s;"></div>
          </div>

          <!-- Question Card -->
          <div class="card" style="margin-bottom:1.5rem;">
            <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:0.5rem;">Question ${current+1}</div>
            <h3 style="font-size:1.15rem;line-height:1.5;">${q.q}</h3>
          </div>

          <!-- Options -->
          <div style="display:flex;flex-direction:column;gap:0.75rem;margin-bottom:1.5rem;">
            ${q.opts.map((opt, i) => `
              <button class="quiz-opt btn" data-idx="${i}"
                style="text-align:left;padding:1rem 1.25rem;border-radius:var(--radius);border:2px solid ${answers[current] === i ? 'var(--accent)' : 'var(--border)'};
                       background:${answers[current] === i ? 'var(--accent-light)' : 'var(--bg-card)'};
                       font-weight:${answers[current] === i ? '700' : '400'};
                       transition:all 0.15s;cursor:pointer;">
                <span style="display:inline-block;width:28px;height:28px;border-radius:50%;background:${answers[current] === i ? 'var(--accent)' : 'var(--bg-secondary)'};
                      color:${answers[current] === i ? '#fff' : 'var(--text-primary)'};text-align:center;line-height:28px;font-size:0.8rem;font-weight:700;margin-right:0.75rem;">${String.fromCharCode(65+i)}</span>
                ${opt}
              </button>
            `).join('')}
          </div>

          <!-- Nav -->
          <div style="display:flex;gap:0.75rem;justify-content:space-between;">
            <button class="btn btn-ghost" id="prev-btn" ${current === 0 ? 'disabled' : ''}>← Previous</button>
            <button class="btn btn-primary" id="next-btn">
              ${current === quiz.questions.length - 1 ? '🏁 Submit Quiz' : 'Next →'}
            </button>
          </div>
        </div>
      `;

      // Select option
      container.querySelectorAll('.quiz-opt').forEach(btn => {
        btn.addEventListener('click', () => {
          answers[current] = Number(btn.dataset.idx);
          renderQuestion();
        });
      });

      document.getElementById('quit-quiz')?.addEventListener('click', showHome);
      document.getElementById('prev-btn')?.addEventListener('click', () => { if (current > 0) { current--; renderQuestion(); }});
      document.getElementById('next-btn')?.addEventListener('click', () => {
        if (answers[current] === -1) { window.showToast('Please select an answer', 'warning'); return; }
        if (current < quiz.questions.length - 1) { current++; renderQuestion(); }
        else showResult();
      });
    }

    async function showResult() {
      const score = answers.filter((a, i) => a === quiz.questions[i].ans).length;
      const total = quiz.questions.length;
      const pct   = Math.round((score / total) * 100);
      const grade = pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B' : pct >= 60 ? 'C' : 'F';
      const col   = pct >= 80 ? 'var(--success)' : pct >= 60 ? 'var(--warning)' : 'var(--danger)';
      const msg   = pct >= 80 ? '🎉 Excellent work!' : pct >= 60 ? '👍 Good effort!' : '📚 Keep studying!';

      await window.api.saveQuizResult({ studentId: user.id, quiz_name: name, score, total });
      pastResults = await window.api.getQuizResults(user.id);

      container.innerHTML = `
        <div style="max-width:560px;margin:0 auto;">
          <div class="card" style="text-align:center;padding:2.5rem;">
            <div style="font-size:4rem;margin-bottom:1rem;">${pct >= 80 ? '🏆' : pct >= 60 ? '✅' : '💪'}</div>
            <h2 style="margin-bottom:0.25rem;">${msg}</h2>
            <p style="color:var(--text-muted);margin-bottom:2rem;">${name} Quiz · Complete</p>

            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;margin-bottom:2rem;">
              <div style="padding:1rem;background:var(--bg-secondary);border-radius:var(--radius-sm);">
                <div style="font-size:2rem;font-weight:800;color:${col};">${score}</div>
                <div style="font-size:0.78rem;color:var(--text-muted);">Correct</div>
              </div>
              <div style="padding:1rem;background:var(--bg-secondary);border-radius:var(--radius-sm);">
                <div style="font-size:2rem;font-weight:800;">${total - score}</div>
                <div style="font-size:0.78rem;color:var(--text-muted);">Wrong</div>
              </div>
              <div style="padding:1rem;background:var(--bg-secondary);border-radius:var(--radius-sm);">
                <div style="font-size:2rem;font-weight:800;color:${col};">${grade}</div>
                <div style="font-size:0.78rem;color:var(--text-muted);">Grade</div>
              </div>
            </div>

            <div style="margin-bottom:2rem;">
              <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem;">
                <span style="font-weight:600;">Score</span>
                <span style="font-weight:800;color:${col};">${pct}%</span>
              </div>
              <div class="progress-bar" style="height:16px;">
                <div class="progress-fill" style="width:${pct}%;background:${col};"></div>
              </div>
            </div>

            <!-- Answer Review -->
            <div style="text-align:left;margin-bottom:1.5rem;">
              <h4 style="margin-bottom:1rem;">Answer Review</h4>
              ${quiz.questions.map((q, i) => {
                const correct = q.ans === answers[i];
                return `
                  <div style="padding:0.75rem;margin-bottom:0.5rem;border-radius:var(--radius-sm);
                       background:${correct ? '#dcfce7' : '#fee2e2'};border-left:4px solid ${correct ? 'var(--success)' : 'var(--danger)'};">
                    <div style="font-weight:600;font-size:0.85rem;margin-bottom:0.25rem;">${i+1}. ${q.q}</div>
                    <div style="font-size:0.78rem;">
                      ${correct
                        ? `<span style="color:var(--success);">✓ ${q.opts[q.ans]}</span>`
                        : `<span style="color:var(--danger);">✗ Your answer: ${answers[i] >= 0 ? q.opts[answers[i]] : 'Not answered'}</span>
                           <br><span style="color:var(--success);">✓ Correct: ${q.opts[q.ans]}</span>`
                      }
                    </div>
                  </div>`;
              }).join('')}
            </div>

            <div style="display:flex;gap:0.75rem;">
              <button class="btn btn-primary" style="flex:1;" id="retry-btn">🔄 Retake Quiz</button>
              <button class="btn btn-ghost" style="flex:1;" id="back-home-btn">← Back to Quizzes</button>
            </div>
          </div>
        </div>
      `;

      document.getElementById('retry-btn')?.addEventListener('click', () => startQuiz(name));
      document.getElementById('back-home-btn')?.addEventListener('click', showHome);
    }

    renderQuestion();
  }

  showHome();
};
