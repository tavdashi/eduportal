// js/todo.js — To-Do List page

window.renderTodo = async function (container, user) {

  async function render(filter = 'all') {
    const todos = await window.api.getTodos(user.id);
    const filtered = filter === 'all' ? todos
      : filter === 'pending'   ? todos.filter(t => !t.completed)
      : todos.filter(t => t.completed);

    const pending   = todos.filter(t => !t.completed).length;
    const completed = todos.filter(t =>  t.completed).length;

    const priorityColor = { high: 'var(--danger)', normal: 'var(--accent)', low: 'var(--success)' };
    const priorityLabel = { high: '🔴 High', normal: '🟡 Normal', low: '🟢 Low' };

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h2 class="page-title">✅ To-Do List</h2>
          <p class="page-subtitle">${pending} pending · ${completed} completed</p>
        </div>
      </div>

      <!-- Add task form -->
      <div class="card" style="margin-bottom:1.5rem;">
        <h3 style="margin-bottom:1rem;">➕ Add New Task</h3>
        <form id="add-todo-form" style="display:grid;grid-template-columns:1fr auto auto auto;gap:0.75rem;align-items:end;flex-wrap:wrap;">
          <div class="form-group" style="margin:0;">
            <input class="form-input" type="text" id="todo-title" placeholder="What do you need to do?" required />
          </div>
          <div class="form-group" style="margin:0;">
            <select class="form-input" id="todo-priority">
              <option value="high">🔴 High</option>
              <option value="normal" selected>🟡 Normal</option>
              <option value="low">🟢 Low</option>
            </select>
          </div>
          <div class="form-group" style="margin:0;">
            <input class="form-input" type="date" id="todo-due" />
          </div>
          <button type="submit" class="btn btn-primary">Add Task</button>
        </form>
      </div>

      <!-- Filter tabs -->
      <div style="display:flex;gap:0.5rem;margin-bottom:1.25rem;">
        ${['all','pending','completed'].map(f => `
          <button class="btn btn-${f === filter ? 'primary' : 'ghost'} btn-sm filter-tab" data-filter="${f}">
            ${f.charAt(0).toUpperCase() + f.slice(1)}
            <span style="opacity:0.7;font-size:0.75rem;">(${
              f === 'all' ? todos.length : f === 'pending' ? pending : completed
            })</span>
          </button>
        `).join('')}
      </div>

      <!-- Todo list -->
      <div id="todo-list">
        ${filtered.length === 0
          ? `<div class="empty-state"><div class="icon">${filter === 'completed' ? '🎉' : '📋'}</div>
             <p>${filter === 'completed' ? 'No completed tasks yet' : 'All clear! Add a task above'}</p></div>`
          : filtered.map(t => `
            <div class="card" style="display:flex;align-items:flex-start;gap:1rem;margin-bottom:0.75rem;
                 opacity:${t.completed ? '0.65' : '1'};transition:opacity 0.2s;border-left:4px solid ${priorityColor[t.priority] || 'var(--accent)'};">
              <!-- Checkbox -->
              <button class="todo-check" data-id="${t.id}"
                style="width:24px;height:24px;border-radius:50%;border:2.5px solid ${t.completed ? 'var(--success)' : 'var(--border)'};
                       background:${t.completed ? 'var(--success)' : 'transparent'};flex-shrink:0;cursor:pointer;
                       display:flex;align-items:center;justify-content:center;transition:all 0.2s;margin-top:2px;">
                ${t.completed ? '<span style="color:#fff;font-size:0.75rem;">✓</span>' : ''}
              </button>

              <div style="flex:1;min-width:0;">
                <div style="font-weight:600;${t.completed ? 'text-decoration:line-through;' : ''}">${t.title}</div>
                <div style="display:flex;gap:0.75rem;margin-top:0.35rem;font-size:0.75rem;color:var(--text-muted);flex-wrap:wrap;">
                  <span>${priorityLabel[t.priority] || '🟡 Normal'}</span>
                  ${t.due_date ? `<span>📅 Due ${t.due_date}</span>` : ''}
                  <span>Added ${window.formatDate(t.created_at)}</span>
                </div>
              </div>

              <button class="btn btn-ghost btn-sm todo-del" data-id="${t.id}"
                style="color:var(--danger);padding:4px 8px;" title="Delete task">🗑️</button>
            </div>
          `).join('')}
      </div>
    `;

    // Add task
    document.getElementById('add-todo-form')?.addEventListener('submit', async e => {
      e.preventDefault();
      const title = document.getElementById('todo-title').value.trim();
      if (!title) return;
      await window.api.addTodo({
        studentId: user.id,
        title,
        priority: document.getElementById('todo-priority').value,
        due_date: document.getElementById('todo-due').value,
      });
      window.showToast('Task added! 📋', 'success');
      render(filter);
    });

    // Toggle complete
    container.querySelectorAll('.todo-check').forEach(btn => {
      btn.addEventListener('click', async () => {
        await window.api.toggleTodo(Number(btn.dataset.id));
        render(filter);
      });
    });

    // Delete
    container.querySelectorAll('.todo-del').forEach(btn => {
      btn.addEventListener('click', async () => {
        await window.api.deleteTodo(Number(btn.dataset.id));
        window.showToast('Task deleted', 'info');
        render(filter);
      });
    });

    // Filter tabs
    container.querySelectorAll('.filter-tab').forEach(btn => {
      btn.addEventListener('click', () => render(btn.dataset.filter));
    });
  }

  try {
    render();
  } catch (err) {
    container.innerHTML = `<div class="empty-state"><div class="icon">❌</div><p>${err.message}</p></div>`;
  }
};
