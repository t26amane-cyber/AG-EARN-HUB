/* =================================
   AG EARN HUB — ADMIN.JS
   ================================= */

const API_URL = "https://ag-earn-hub.onrender.com";

const tg = window.Telegram?.WebApp;

let adminAuthenticated = false;
let editingTaskId = null;
let taskCache = [];

/* ===== TELEGRAM ===== */

if (tg) {
  tg.ready();
  tg.expand();
}

/* ===== TOAST ===== */

function toast(message) {
  const box = document.getElementById("adminToast");

  if (!box) return;

  box.textContent = message;
  box.classList.add("show");

  clearTimeout(window.__toastTimer);

  window.__toastTimer = setTimeout(() => {
    box.classList.remove("show");
  }, 2200);
}

/* ===== API HEADERS ===== */

function apiHeaders() {

  const headers = {
    "Content-Type": "application/json"
  };

  if (tg?.initData) {
    headers["X-Telegram-Init-Data"] = tg.initData;
  }

  return headers;
}

/* ===== API REQUEST ===== */

async function api(path, options = {}) {

  const response = await fetch(API_URL + path, {
    ...options,

    headers: {
      ...apiHeaders(),
      ...(options.headers || {})
    }
  });

  let data = {};

  try {
    data = await response.json();
  } catch (error) {
    data = {};
  }

  if (!response.ok || data.ok === false) {

    throw new Error(
      data.message ||
      `Request failed (${response.status})`
    );

  }

  return data;
}

/* =================================
   ADMIN LOGIN
   ================================= */

async function adminLogin() {

  const status =
    document.getElementById("adminStatus");

  const loginState =
    document.getElementById("loginState");

  const dashboard =
    document.getElementById("dashboardView");

  if (!tg || !tg.initData) {

    if (status) {
      status.textContent = "🔴 TELEGRAM REQUIRED";
    }

    if (loginState) {
      loginState.classList.remove("hidden");
    }

    if (dashboard) {
      dashboard.classList.add("hidden");
    }

    return false;
  }

  try {

    if (status) {
      status.textContent = "🟡 CHECKING";
    }

    const result = await api(
      "/api/admin/auth",
      {
        method: "POST",

        body: JSON.stringify({
          initData: tg.initData
        })
      }
    );

    if (!result.admin) {

      throw new Error("Access denied");

    }

    adminAuthenticated = true;

    if (status) {
      status.textContent = "🟢 ADMIN";
    }

    if (loginState) {
      loginState.classList.add("hidden");
    }

    if (dashboard) {
      dashboard.classList.remove("hidden");
    }

    await loadAll();

    toast("✅ Admin Login Successful");

    return true;

  } catch (error) {

    adminAuthenticated = false;

    if (status) {
      status.textContent = "🔴 DENIED";
    }

    if (loginState) {
      loginState.classList.remove("hidden");
    }

    if (dashboard) {
      dashboard.classList.add("hidden");
    }

    toast("❌ " + error.message);

    return false;
  }
}

/* =================================
   LOAD EVERYTHING
   ================================= */

async function loadAll() {

  if (!adminAuthenticated) {
    return;
  }

  await Promise.allSettled([
    loadStats(),
    loadTasks()
  ]);
}

/* =================================
   DASHBOARD STATS
   ================================= */

async function loadStats() {

  try {

    const data =
      await api("/api/admin/stats");

    const stats =
      data.stats || data;

    const users =
      document.getElementById("totalUsers");

    const balance =
      document.getElementById("totalBalance");

    const tasks =
      document.getElementById("activeTasks");

    const withdraw =
      document.getElementById("pendingWithdraw");

    if (users) {
      users.textContent =
        stats.users ?? 0;
    }

    if (balance) {
      balance.textContent =
        Number(stats.balance || 0)
          .toFixed(2);
    }

    if (tasks) {
      tasks.textContent =
        stats.activeTasks ??
        stats.active_tasks ??
        0;
    }

    if (withdraw) {
      withdraw.textContent =
        stats.pendingWithdraw ??
        stats.pending_withdraw ??
        0;
    }

  } catch (error) {

    console.log(
      "Stats API:",
      error.message
    );

  }
}

/* =================================
   LOAD TASKS
   ================================= */

async function loadTasks() {

  try {

    const data =
      await api("/api/admin/tasks");

    taskCache =
      data.tasks || [];

  } catch (error) {

    console.log(
      "Task API:",
      error.message
    );

    taskCache = [];
  }
}

/* =================================
   SHOW ADMIN SECTION
   ================================= */

function showSection(section) {

  const content =
    document.getElementById(
      "contentSection"
    );

  const title =
    document.getElementById(
      "contentTitle"
    );

  const subtitle =
    document.getElementById(
      "contentSubtitle"
    );

  const body =
    document.getElementById(
      "contentBody"
    );

  if (!content || !title || !subtitle || !body) {
    return;
  }

  content.classList.remove("hidden");

  const sections = {

    tasks: [
      "🎯 Task Management",
      "Create and control earning tasks"
    ],

    users: [
      "👥 Users",
      "User list and account information"
    ],

    balance: [
      "💰 Balance",
      "Balance management"
    ],

    withdraw: [
      "💸 Withdraw Requests",
      "Review withdrawal requests"
    ],

    settings: [
      "⚙️ Settings",
      "Platform configuration"
    ],

    announcement: [
      "📢 Announcement",
      "Publish platform announcements"
    ]

  };

  const data =
    sections[section] ||
    ["Management", ""];

  title.textContent = data[0];

  subtitle.textContent = data[1];

  if (section === "tasks") {

    renderTasks(body);

  }

  else if (section === "users") {

    renderUsers(body);

  }

  else if (section === "balance") {

    renderBalance(body);

  }

  else if (section === "withdraw") {

    renderWithdraw(body);

  }

  else if (section === "settings") {

    renderSettings(body);

  }

  else if (section === "announcement") {

    renderAnnouncement(body);

  }

  content.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

/* =================================
   CLOSE SECTION
   ================================= */

function closeSection() {

  const content =
    document.getElementById(
      "contentSection"
    );

  if (content) {
    content.classList.add("hidden");
  }
}

/* =================================
   RENDER TASKS
   ================================= */

function renderTasks(body) {

  if (!taskCache.length) {

    body.innerHTML = `
      <div class="panel">

        <div class="empty-icon">
          🎯
        </div>

        <h2>
          No Tasks Loaded
        </h2>

        <p>
          No tasks were returned by
          the Admin Task API.
        </p>

        <button
          class="admin-btn primary full"
          onclick="openTaskModal()">

          ➕ Create Task

        </button>

      </div>
    `;

    return;
  }

  body.innerHTML =
    taskCache
      .map(task => {

        const title =
          escapeHTML(
            task.title ||
            task.name ||
            task.id
          );

        const category =
          escapeHTML(
            task.category ||
            task.network ||
            "TASK"
          );

        const reward =
          Number(task.reward || 0)
            .toFixed(2);

        const active =
          task.active !== false;

        return `
          <div class="list-card">

            <div class="list-row">

              <div>

                <strong>
                  ${title}
                </strong>

                <div class="muted">

                  ${category}
                  ·
                  ৳${reward}

                </div>

              </div>

              <span class="badge">

                ${
                  active
                    ? "🟢 ON"
                    : "🔴 OFF"
                }

              </span>

            </div>

            <div
              class="admin-actions"
              style="margin-top:10px">

              <button
                class="admin-btn"
                onclick="editTask('${escapeHTML(task.id)}')">

                ✏️ Edit

              </button>

              <button
                class="admin-btn"
                onclick="toggleTask(
                  '${escapeHTML(task.id)}',
                  ${!active}
                )">

                ${
                  active
                    ? "🔴 Disable"
                    : "🟢 Activate"
                }

              </button>

            </div>

          </div>
        `;
      })
      .join("");
}

/* =================================
   USERS
   ================================= */

function renderUsers(body) {

  body.innerHTML = `

    <div class="panel">

      <div class="empty-icon">
        👥
      </div>

      <h2>
        User Management
      </h2>

      <p>
        Registered users can be
        managed from the Admin API.
      </p>

      <button
        class="admin-btn primary full"
        onclick="loadUsers()">

        🔄 Load Users

      </button>

    </div>

  `;
}

/* =================================
   BALANCE
   ================================= */

function renderBalance(body) {

  body.innerHTML = `

    <div class="panel">

      <div class="empty-icon">
        💰
      </div>

      <h2>
        Balance Management
      </h2>

      <p>
        Balance changes should be
        processed server-side and
        recorded in the ledger.
      </p>

    </div>

  `;
}

/* =================================
   WITHDRAW
   ================================= */

function renderWithdraw(body) {

  body.innerHTML = `

    <div class="panel">

      <div class="empty-icon">
        💸
      </div>

      <h2>
        Withdraw Requests
      </h2>

      <p>
        Review and process pending
        withdrawal requests here.
      </p>

      <button
        class="admin-btn primary full"
        onclick="loadWithdrawals()">

        🔄 Load Withdrawals

      </button>

    </div>

  `;
}

/* =================================
   SETTINGS
   ================================= */

function renderSettings(body) {

  body.innerHTML = `

    <div class="panel">

      <div class="empty-icon">
        ⚙️
      </div>

      <h2>
        Platform Settings
      </h2>

      <p>
        Normal user:
        <strong>22 tasks</strong>
        <br>
        VIP user:
        <strong>50 tasks</strong>
      </p>

      <button
        class="admin-btn primary full"
        onclick="toast('⚙️ Settings ready')">

        💾 Save Settings

      </button>

    </div>

  `;
}

/* =================================
   ANNOUNCEMENT
   ================================= */

function renderAnnouncement(body) {

  body.innerHTML = `

    <div class="panel">

      <div class="empty-icon">
        📢
      </div>

      <h2>
        Announcement
      </h2>

      <p>
        Create a platform announcement
        for users.
      </p>

      <button
        class="admin-btn primary full"
        onclick="createAnnouncement()">

        📢 Create Announcement

      </button>

    </div>

  `;
}

/* =================================
   TASK MODAL
   ================================= */

function openTaskModal(task = null) {

  editingTaskId =
    task?.id || null;

  const modal =
    document.getElementById("modal");

  const title =
    document.getElementById("modalTitle");

  if (!modal) return;

  if (title) {

    title.textContent =
      task
        ? "Edit Task"
        : "Add Task";

  }

  document.getElementById(
    "taskTitle"
  ).value =
    task?.title || "";

  document.getElementById(
    "taskCategory"
  ).value =
    task?.category ||
    "WATCH / ADS";

  document.getElementById(
    "taskReward"
  ).value =
    task?.reward ?? 5;

  document.getElementById(
    "taskUrl"
  ).value =
    task?.url || "";

  document.getElementById(
    "taskAccess"
  ).value =
    task?.access || "all";

  document.getElementById(
    "taskVerification"
  ).value =
    task?.verification ||
    "manual";

  document.getElementById(
    "taskActive"
  ).checked =
    task?.active !== false;

  modal.classList.remove(
    "hidden"
  );
}

/* =================================
   EDIT TASK
   ================================= */

function editTask(id) {

  const task =
    taskCache.find(
      item =>
        String(item.id) ===
        String(id)
    );

  if (!task) {

    toast("❌ Task not found");

    return;
  }

  openTaskModal(task);
}

/* =================================
   CLOSE MODAL
   ================================= */

function closeModal() {

  const modal =
    document.getElementById("modal");

  if (modal) {
    modal.classList.add("hidden");
  }

  editingTaskId = null;
}

/* =================================
   SAVE TASK
   ================================= */

async function saveTask(event) {

  event.preventDefault();

  const payload = {

    id: editingTaskId,

    title:
      document.getElementById(
        "taskTitle"
      ).value.trim(),

    category:
      document.getElementById(
        "taskCategory"
      ).value,

    reward:
      Number(
        document.getElementById(
          "taskReward"
        ).value
      ),

    url:
      document.getElementById(
        "taskUrl"
      ).value.trim(),

    access:
      document.getElementById(
        "taskAccess"
      ).value,

    verification:
      document.getElementById(
        "taskVerification"
      ).value,

    active:
      document.getElementById(
        "taskActive"
      ).checked

  };

  if (!payload.title) {

    toast("❌ Task title required");

    return;
  }

  try {

    const endpoint =
      editingTaskId
        ? "/api/admin/tasks/update"
        : "/api/admin/tasks/create";

    await api(
      endpoint,
      {
        method: "POST",

        body:
          JSON.stringify(payload)
      }
    );

    closeModal();

    toast(
      "✅ Task saved successfully"
    );

    await loadTasks();

    showSection("tasks");

    await loadStats();

  } catch (error) {

    toast(
      "❌ " + error.message
    );
  }
}

/* =================================
   ENABLE / DISABLE TASK
   ================================= */

async function toggleTask(
  id,
  active
) {

  try {

    await api(
      "/api/admin/tasks/toggle",
      {
        method: "POST",

        body: JSON.stringify({
          task_id: id,
          active: active
        })
      }
    );

    toast(
      active
        ? "🟢 Task activated"
        : "🔴 Task disabled"
    );

    await loadTasks();

    showSection("tasks");

    await loadStats();

  } catch (error) {

    toast(
      "❌ " + error.message
    );
  }
}

/* =================================
   LOAD USERS
   ================================= */

async function loadUsers() {

  try {

    const data =
      await api(
        "/api/admin/users"
      );

    const body =
      document.getElementById(
        "contentBody"
      );

    const users =
      data.users || [];

    if (!users.length) {

      body.innerHTML = `
        <div class="panel">
          <div class="empty-icon">👥</div>
          <h2>No Users</h2>
          <p>No users found.</p>
        </div>
      `;

      return;
    }

    body.innerHTML =
      users
        .map(user => `

          <div class="list-card">

            <div class="list-row">

              <div>

                <strong>
                  ${escapeHTML(
                    user.first_name ||
                    user.username ||
                    user.id
                  )}
                </strong>

                <div class="muted">

                  ID:
                  ${escapeHTML(
                    user.id
                  )}

                </div>

              </div>

              <span class="badge">

                ${
                  user.is_premium
                    ? "💎 VIP"
                    : "👤 NORMAL"
                }

              </span>

            </div>

          </div>

        `)
        .join("");

  } catch (error) {

    toast(
      "❌ " + error.message
    );
  }
}

/* =================================
   LOAD WITHDRAWALS
   ================================= */

async function loadWithdrawals() {

  try {

    const data =
      await api(
        "/api/admin/withdrawals"
      );

    const body =
      document.getElementById(
        "contentBody"
      );

    const withdrawals =
      data.withdrawals || [];

    if (!withdrawals.length) {

      body.innerHTML = `
        <div class="panel">
          <div class="empty-icon">💸</div>
          <h2>No Pending Requests</h2>
          <p>No withdrawal requests found.</p>
        </div>
      `;

      return;
    }

    body.innerHTML =
      withdrawals
        .map(item => `

          <div class="list-card">

            <div class="list-row">

              <div>

                <strong>
                  ৳${Number(
                    item.amount || 0
                  ).toFixed(2)}
                </strong>

                <div class="muted">

                  User:
                  ${escapeHTML(
                    item.user_id
                  )}

                </div>

              </div>

              <span class="badge">
                ${escapeHTML(
                  item.status ||
                  "pending"
                )}
              </span>

            </div>

          </div>

        `)
        .join("");

  } catch (error) {

    toast(
      "❌ " + error.message
    );
  }
}

/* =================================
   ANNOUNCEMENT
   ================================= */

async function createAnnouncement() {

  const message =
    prompt(
      "Enter announcement:"
    );

  if (!message) return;

  try {

    await api(
      "/api/admin/announcement",
      {
        method: "POST",

        body: JSON.stringify({
          message: message
        })
      }
    );

    toast(
      "✅ Announcement published"
    );

  } catch (error) {

    toast(
      "❌ " + error.message
    );
  }
}

/* =================================
   HTML ESCAPE
   ================================= */

function escapeHTML(value) {

  return String(
    value ?? ""
  ).replace(
    /[&<>"']/g,
    function(char) {

      const map = {

        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"

      };

      return map[char];

    }
  );
}

/* =================================
   START
   ================================= */

document.addEventListener(
  "DOMContentLoaded",
  function() {

    console.log(
      "AG EARN HUB Admin Panel loaded."
    );

    adminLogin();

  }
);
