// ==================== PAGE SWITCHING ====================
function switchAdminPage(pageId) {
  // Hide all pages
  document.querySelectorAll('.admin-page').forEach(page => {
    page.classList.remove('active');
  });

  // Show selected page
  document.getElementById(pageId).classList.add('active');

  // Update nav active state
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
  });
  document.querySelector(`.nav-link[data-page="${pageId}"]`).classList.add('active');

  // Update page title
  const titles = {
    dashboard: 'Dashboard',
    users: 'Users Management',
    tasks: 'Tasks Management',
    withdrawals: 'Withdrawals',
    referrals: 'Referrals',
    settings: 'Settings'
  };
  document.getElementById('page-title').textContent = titles[pageId] || 'Admin';

  // Close sidebar on mobile
  document.getElementById('sidebar').classList.remove('open');
}

// ==================== SIDEBAR TOGGLE (Mobile) ====================
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

// ==================== TOAST ====================
function showToast(msg) {
  const toast = document.getElementById('admin-toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

// ==================== USERS ====================
function searchUsers() {
  const query = document.getElementById('user-search').value.toLowerCase();
  const rows = document.querySelectorAll('#users-table tr');
  
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(query) ? '' : 'none';
  });
}

function banUser(id) {
  if (confirm(`Are you sure you want to ban user #${id}?`)) {
    showToast(`User #${id} has been banned`);
  }
}

function unbanUser(id) {
  showToast(`User #${id} has been unbanned`);
}

function viewUser(id) {
  showToast(`Viewing details of user #${id}`);
}

// ==================== TASKS ====================
function openAddTaskModal() {
  document.getElementById('addTaskModal').classList.add('show');
}

function closeAddTaskModal() {
  document.getElementById('addTaskModal').classList.remove('show');
}

function addNewTask() {
  const title = document.getElementById('task-title').value;
  const type = document.getElementById('task-type').value;
  const reward = document.getElementById('task-reward').value;
  const time = document.getElementById('task-time').value;

  if (!title || !reward) {
    showToast('Please fill all required fields');
    return;
  }

  showToast(`Task "${title}" added successfully!`);
  closeAddTaskModal();

  // Clear form
  document.getElementById('task-title').value = '';
  document.getElementById('task-reward').value = '';
  document.getElementById('task-time').value = '';
}

function editTask(id) {
  showToast(`Editing task #${id}`);
}

function deleteTask(id) {
  if (confirm(`Delete task #${id}?`)) {
    showToast(`Task #${id} deleted`);
  }
}

// ==================== WITHDRAWALS ====================
function filterWithdrawals(status, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const rows = document.querySelectorAll('#withdrawals-table tr');
  rows.forEach(row => {
    if (status === 'all' || row.dataset.status === status) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
}

function approveWithdraw(id) {
  if (confirm(`Approve withdrawal ${id}?`)) {
    showToast(`Withdrawal ${id} approved & marked as Paid`);
  }
}

function rejectWithdraw(id) {
  if (confirm(`Reject withdrawal ${id}?`)) {
    showToast(`Withdrawal ${id} rejected`);
  }
}

// ==================== SETTINGS ====================
function saveSettings() {
  const minWithdraw = document.getElementById('min-withdraw').value;
  const refReward = document.getElementById('ref-reward').value;
  const status = document.getElementById('app-status').value;

  showToast('Settings saved successfully!');
  console.log({ minWithdraw, refReward, status });
}

function changePassword() {
  const newPass = document.getElementById('new-password').value;
  const confirmPass = document.getElementById('confirm-password').value;

  if (!newPass || newPass.length < 6) {
    showToast('Password must be at least 6 characters');
    return;
  }
  if (newPass !== confirmPass) {
    showToast('Passwords do not match');
    return;
  }

  showToast('Password changed successfully!');
  document.getElementById('new-password').value = '';
  document.getElementById('confirm-password').value = '';
}

// ==================== LOGOUT ====================
function adminLogout() {
  if (confirm('Are you sure you want to logout?')) {
    showToast('Logged out successfully');
    // window.location.href = 'login.html';
  }
}

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', () => {
  console.log('AG EARN HUB Admin Panel loaded');
});
