// localStorage version — no backend needed

let allAssignments = [];
let currentFilter = 'All';
let currentSearch = '';

const form = document.getElementById('assignmentForm');
const editId = document.getElementById('editId');
const subjectInput = document.getElementById('subject');
const assignmentInput = document.getElementById('assignment');
const deadlineInput = document.getElementById('deadline');
const statusInput = document.getElementById('status');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');
const formTitle = document.getElementById('formTitle');
const assignmentsList = document.getElementById('assignmentsList');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const filterTabs = document.getElementById('filterTabs');
const toast = document.getElementById('toast');

// ============ LOCALSTORAGE ============

const STORAGE_KEY = 'study_planner_assignments';

function loadFromStorage() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      allAssignments = JSON.parse(data);
    } else {
      allAssignments = [
        { id: 1, subject: 'Web Technology', assignment: 'HTML Forms', deadline: '2026-09-30', status: 'Completed' },
        { id: 2, subject: 'JavaScript', assignment: 'DOM Manipulation', deadline: '2026-10-03', status: 'In Progress' },
        { id: 3, subject: 'PHP', assignment: 'Form Validation', deadline: '2026-10-05', status: 'Pending' }
      ];
      saveToStorage();
    }
  } catch (err) {
    console.error('Load error:', err);
    allAssignments = [];
  }
}

function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allAssignments));
  } catch (err) {
    console.error('Save error:', err);
  }
}

function getNextId() {
  if (allAssignments.length === 0) return 1;
  return Math.max(...allAssignments.map(a => a.id)) + 1;
}

// ============ RENDER ============

function renderAssignments() {
  let filtered = allAssignments;

  if (currentFilter !== 'All') {
    filtered = filtered.filter(a => a.status === currentFilter);
  }

  if (currentSearch.trim()) {
    const q = currentSearch.toLowerCase();
    filtered = filtered.filter(a =>
      a.subject.toLowerCase().includes(q) ||
      a.assignment.toLowerCase().includes(q)
    );
  }

  document.getElementById('totalCount').textContent = allAssignments.length;
  document.getElementById('pendingCount').textContent =
    allAssignments.filter(a => a.status === 'Pending').length;
  document.getElementById('completedCount').textContent =
    allAssignments.filter(a => a.status === 'Completed').length;

  if (filtered.length === 0) {
    assignmentsList.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';
  assignmentsList.innerHTML = filtered.map(a => createCard(a)).join('');

  document.querySelectorAll('[data-action="status"]').forEach(btn =>
    btn.addEventListener('click', () => updateStatus(btn.dataset.id, btn.dataset.status))
  );
  document.querySelectorAll('[data-action="edit"]').forEach(btn =>
    btn.addEventListener('click', () => startEdit(btn.dataset.id))
  );
  document.querySelectorAll('[data-action="delete"]').forEach(btn =>
    btn.addEventListener('click', () => deleteAssignment(btn.dataset.id))
  );
}

function createCard(a) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadlineDate = new Date(a.deadline);
  const isOverdue = deadlineDate < today && a.status !== 'Completed';

  const formattedDeadline = deadlineDate.toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric'
  });

  const statusClass = a.status.replace(/\s/g, '-');

  return `
    <div class="assignment-card status-${statusClass}">
      <div class="card-header">
        <span class="card-subject">${escapeHtml(a.subject)}</span>
        <span class="status-badge status-${statusClass}">${a.status}</span>
      </div>
      <h3 class="card-title">${escapeHtml(a.assignment)}</h3>
      <div class="card-deadline ${isOverdue ? 'overdue' : ''}">
        📅 <span>${formattedDeadline}${isOverdue ? ' (Overdue!)' : ''}</span>
      </div>
      <div class="card-actions">
        <button class="icon-btn btn-status" data-action="status" data-id="${a.id}" data-status="${a.status}">🔄 Status</button>
        <button class="icon-btn btn-edit" data-action="edit" data-id="${a.id}">✏️ Edit</button>
        <button class="icon-btn btn-delete" data-action="delete" data-id="${a.id}">🗑️</button>
      </div>
    </div>
  `;
}

// ============ CRUD ============

function saveAssignment(data) {
  const id = editId.value;
  if (id) {
    const i = allAssignments.findIndex(a => a.id == id);
    if (i > -1) allAssignments[i] = { ...allAssignments[i], ...data };
    showToast('Assignment updated ✅', 'success');
  } else {
    allAssignments.push({ id: getNextId(), ...data });
    showToast('Assignment added ✅', 'success');
  }
  saveToStorage();
  resetForm();
  renderAssignments();
}

function deleteAssignment(id) {
  if (!confirm('Delete this assignment?')) return;
  allAssignments = allAssignments.filter(a => a.id != id);
  saveToStorage();
  renderAssignments();
  showToast('Deleted 🗑️', 'success');
}

function updateStatus(id, currentStatus) {
  const statuses = ['Pending', 'In Progress', 'Completed'];
  const nextIndex = (statuses.indexOf(currentStatus) + 1) % statuses.length;
  const newStatus = statuses[nextIndex];
  const i = allAssignments.findIndex(a => a.id == id);
  if (i > -1) {
    allAssignments[i].status = newStatus;
    saveToStorage();
    renderAssignments();
    showToast(`Status → ${newStatus} 🔄`, 'success');
  }
}

// ============ FORM ============

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = {
    subject: subjectInput.value.trim(),
    assignment: assignmentInput.value.trim(),
    deadline: deadlineInput.value,
    status: statusInput.value
  };
  if (!data.subject || !data.assignment || !data.deadline) {
    showToast('Fill all fields ⚠️', 'error');
    return;
  }
  saveAssignment(data);
});

function startEdit(id) {
  const a = allAssignments.find(x => x.id == id);
  if (!a) return;
  editId.value = a.id;
  subjectInput.value = a.subject;
  assignmentInput.value = a.assignment;
  deadlineInput.value = a.deadline;
  statusInput.value = a.status;
  formTitle.textContent = '✏️ Edit Assignment';
  submitBtn.textContent = 'Update Assignment';
  cancelBtn.style.display = 'inline-block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetForm() {
  form.reset();
  editId.value = '';
  formTitle.textContent = '➕ Add New Assignment';
  submitBtn.textContent = 'Add Assignment';
  cancelBtn.style.display = 'none';
}

cancelBtn.addEventListener('click', resetForm);

searchInput.addEventListener('input', (e) => {
  currentSearch = e.target.value;
  renderAssignments();
});

filterTabs.addEventListener('click', (e) => {
  if (!e.target.classList.contains('filter-btn')) return;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  e.target.classList.add('active');
  currentFilter = e.target.dataset.filter;
  renderAssignments();
});

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

let toastTimer;
function showToast(msg, type = 'success') {
  toast.textContent = msg;
  toast.className = `toast ${type} show`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}

// ============ INIT ============

loadFromStorage();
renderAssignments();