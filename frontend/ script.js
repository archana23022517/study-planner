const API_URL = 'https://89aa3be227b0-0af42cd7-5300.ws6.app/proxy/5001/api/assignments';

let allAssignments = [];
let currentFilter = 'All';
let currentSearch = '';

// DOM Elements
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

// ============ API CALLS ============

async function fetchAssignments() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Failed to fetch');
    allAssignments = await res.json();
    renderAssignments();
  } catch (err) {
    showToast('Error loading assignments ❌', 'error');
    console.error(err);
  }
}

async function saveAssignment(data) {
  const id = editId.value;
  const url = id ? `${API_URL}/${id}` : API_URL;
  const method = id ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to save');
    showToast(id ? 'Assignment updated ✅' : 'Assignment added ✅', 'success');
    resetForm();
    fetchAssignments();
  } catch (err) {
    showToast('Error saving assignment ❌', 'error');
    console.error(err);
  }
}

async function deleteAssignment(id) {
  if (!confirm('Are you sure you want to delete this assignment?')) return;
  try {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete');
    showToast('Assignment deleted 🗑️', 'success');
    fetchAssignments();
  } catch (err) {
    showToast('Error deleting assignment ❌', 'error');
  }
}

async function updateStatus(id, currentStatus) {
  const statuses = ['Pending', 'In Progress', 'Completed'];
  const nextIndex = (statuses.indexOf(currentStatus) + 1) % statuses.length;
  const newStatus = statuses[nextIndex];

  try {
    const res = await fetch(`${API_URL}/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    if (!res.ok) throw new Error('Failed to update');
    showToast(`Status → ${newStatus} 🔄`, 'success');
    fetchAssignments();
  } catch (err) {
    showToast('Error updating status ❌', 'error');
  }
}

// ============ RENDER ============

function renderAssignments() {
  let filtered = allAssignments;

  // Filter by status
  if (currentFilter !== 'All') {
    filtered = filtered.filter(a => a.status === currentFilter);
  }

  // Search
  if (currentSearch.trim()) {
    const q = currentSearch.toLowerCase();
    filtered = filtered.filter(a =>
      a.subject.toLowerCase().includes(q) ||
      a.assignment.toLowerCase().includes(q)
    );
  }

  // Update stats
  document.getElementById('totalCount').textContent = allAssignments.length;
  document.getElementById('pendingCount').textContent =
    allAssignments.filter(a => a.status === 'Pending').length;
  document.getElementById('completedCount').textContent =
    allAssignments.filter(a => a.status === 'Completed').length;

  // Render
  if (filtered.length === 0) {
    assignmentsList.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';
  assignmentsList.innerHTML = filtered.map(a => createCard(a)).join('');

  // Attach event listeners
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

// ============ FORM HANDLING ============

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = {
    subject: subjectInput.value.trim(),
    assignment: assignmentInput.value.trim(),
    deadline: deadlineInput.value,
    status: statusInput.value
  };
  if (!data.subject || !data.assignment || !data.deadline) {
    showToast('Please fill all fields ⚠️', 'error');
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
  deadlineInput.value = a.deadline.split('T')[0];
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

// ============ SEARCH & FILTER ============

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

// ============ UTILITIES ============

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

fetchAssignments();