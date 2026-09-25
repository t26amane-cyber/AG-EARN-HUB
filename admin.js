/* =================================
   AG EARN HUB — ADMIN.JS
   ================================= */


/* ===== ADMIN DATA ===== */

let adminData = {
  users: 0,
  balance: 0,
  activeTasks: 0,
  pendingWithdraw: 0
};


/* ===== LOAD DASHBOARD ===== */

function loadDashboard() {

  const users =
    document.getElementById("totalUsers");

  const balance =
    document.getElementById("totalBalance");

  const tasks =
    document.getElementById("activeTasks");

  const withdraw =
    document.getElementById("pendingWithdraw");


  if (users) {
    users.textContent = adminData.users;
  }

  if (balance) {
    balance.textContent =
      Number(adminData.balance).toFixed(2);
  }

  if (tasks) {
    tasks.textContent =
      adminData.activeTasks;
  }

  if (withdraw) {
    withdraw.textContent =
      adminData.pendingWithdraw;
  }
}


/* ===== ADMIN TOAST ===== */

function adminToast(message) {

  const box =
    document.getElementById("adminToast");

  if (!box) return;

  box.textContent = message;

  box.classList.add("show");

  clearTimeout(window.adminToastTimer);

  window.adminToastTimer =
    setTimeout(() => {
      box.classList.remove("show");
    }, 1800);
}


/* ===== ADMIN ACTIONS ===== */

function adminAction(action) {

  switch (action) {

    case "add-task":
      adminToast("➕ Add Task opened");
      break;

    case "manage-task":
      adminToast("🎯 Task Management opened");
      break;

    case "users":
      adminToast("👥 User Management opened");
      break;

    case "balance":
      adminToast("💰 Balance Management opened");
      break;

    case "withdraw":
      adminToast("💸 Withdraw Requests opened");
      break;

    case "settings":
      adminToast("⚙️ Settings opened");
      break;

    default:
      adminToast("Admin option selected");
  }
}


/* ===== START ADMIN PANEL ===== */

document.addEventListener("DOMContentLoaded", () => {

  loadDashboard();

  console.log(
    "AG EARN HUB Admin Panel loaded."
  );

});
