const tg = window.Telegram?.WebApp;

if (tg) {
  tg.ready();
  tg.expand();
}

const STORAGE_KEY = "AG_EARN_HUB_DATA_V1";

const defaultData = {
  coins: 0,
  completed: [],
  premiumUntil: 0,
  referrals: 0
};

let data = loadData();

const tasks = [
  {
    id: 1,
    title: "Task 1",
    description: "Open the task link and complete the required action.",
    reward: 5,
    url: "https://t.me/AG_EARN_HUB_BOT"
  },
  {
    id: 2,
    title: "Task 2",
    description: "Open the task link and complete the required action.",
    reward: 5,
    url: "https://t.me/AG_EARN_HUB_BOT"
  },
  {
    id: 3,
    title: "Task 3",
    description: "Open the task link and complete the required action.",
    reward: 5,
    url: "https://t.me/AG_EARN_HUB_BOT"
  },
  {
    id: 4,
    title: "Task 4",
    description: "Open the task link and complete the required action.",
    reward: 5,
    url: "https://t.me/AG_EARN_HUB_BOT"
  },
  {
    id: 5,
    title: "Task 5",
    description: "Open the task link and complete the required action.",
    reward: 5,
    url: "https://t.me/AG_EARN_HUB_BOT"
  },
  {
    id: 6,
    title: "Task 6",
    description: "Open the task link and complete the required action.",
    reward: 5,
    url: "https://t.me/AG_EARN_HUB_BOT"
  },
  {
    id: 7,
    title: "Task 7",
    description: "Open the task link and complete the required action.",
    reward: 5,
    url: "https://t.me/AG_EARN_HUB_BOT"
  },
  {
    id: 8,
    title: "Task 8",
    description: "Open the task link and complete the required action.",
    reward: 5,
    url: "https://t.me/AG_EARN_HUB_BOT"
  },
  {
    id: 9,
    title: "Task 9",
    description: "Open the task link and complete the required action.",
    reward: 5,
    url: "https://t.me/AG_EARN_HUB_BOT"
  },
  {
    id: 10,
    title: "Task 10",
    description: "Open the task link and complete the required action.",
    reward: 5,
    url: "https://t.me/AG_EARN_HUB_BOT"
  }
];

function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return {...defaultData};
    }

    return {
      ...defaultData,
      ...JSON.parse(saved)
    };

  } catch (error) {
    return {...defaultData};
  }
}

function saveData() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(data)
  );
}

function getTelegramUser() {

  const user = tg?.initDataUnsafe?.user;

  if (!user) {
    return {
      name: "AG User",
      username: "@user",
      initials: "AG"
    };
  }

  const name =
    [user.first_name, user.last_name]
      .filter(Boolean)
      .join(" ") || "Telegram User";

  const username =
    user.username ? "@" + user.username : "@user";

  const initials =
    name
      .split(" ")
      .map(x => x[0])
      .join("")
      .slice(0,2)
      .toUpperCase();

  return {
    name,
    username,
    initials
  };
}

function updateUser() {

  const user = getTelegramUser();

  document.getElementById("homeName").textContent = user.name;
  document.getElementById("homeUsername").textContent = user.username;

  document.getElementById("profileName").textContent = user.name;
  document.getElementById("profileUsername").textContent = user.username;

  document.getElementById("homeAvatar").textContent = user.initials;
  document.getElementById("profileAvatar").textContent = user.initials;
}

function updateUI() {

  document.getElementById("coinBalance").textContent = data.coins;
  document.getElementById("homeCoins").textContent = data.coins;
  document.getElementById("taskCoins").textContent = data.coins;
  document.getElementById("profileCoins").textContent = data.coins;

  const completed = data.completed.length;

  document.getElementById("completedCount").textContent = completed;
  document.getElementById("profileTasks").textContent = completed;

  document.getElementById("refCount").textContent = data.referrals;
  document.getElementById("referCount").textContent = data.referrals;
  document.getElementById("profileRefs").textContent = data.referrals;

  const premiumActive =
    data.premiumUntil > Date.now();

  const status =
    premiumActive ? "PREMIUM" : "FREE";

  document.getElementById("premiumStatus").textContent = status;
  document.getElementById("premiumText").textContent = status;

  renderTasks();
}

function renderTasks() {

  const list =
    document.getElementById("taskList");

  list.innerHTML = "";

  tasks.forEach(task => {

    const done =
      data.completed.includes(task.id);

    const div =
      document.createElement("div");

    div.className = "task";

    div.innerHTML = `
      <div class="taskTop">
        <div class="taskTitle">
          ${task.title}
        </div>

        <div class="reward">
          +${task.reward} 🪙
        </div>
      </div>

      <p>${task.description}</p>

      ${
        done
        ?
        `<button class="done" disabled>
          ✓ COMPLETED
        </button>`
        :
        `<button onclick="startTask(${task.id})">
          START TASK
        </button>`
      }
    `;

    list.appendChild(div);
  });
}

function startTask(id) {

  const task =
    tasks.find(x => x.id === id);

  if (!task) return;

  if (data.completed.includes(id)) {
    showToast("Task already completed");
    return;
  }

  window.open(
    task.url,
    "_blank"
  );

  setTimeout(() => {

    const confirmTask =
      confirm(
        "Did you complete this task?"
      );

    if (!confirmTask) {
      return;
    }

    completeTask(id);

  }, 1000);
}

function completeTask(id) {

  const task =
    tasks.find(x => x.id === id);

  if (!task) return;

  if (data.completed.includes(id)) {
    return;
  }

  data.completed.push(id);
  data.coins += task.reward;

  saveData();
  updateUI();

  showToast(
    `+${task.reward} coins added`
  );
}

function buyPremium(days, cost) {

  if (data.coins < cost) {

    showToast(
      `Need ${cost} coins`
    );

    return;
  }

  data.coins -= cost;

  const now = Date.now();

  const base =
    data.premiumUntil > now
      ? data.premiumUntil
      : now;

  data.premiumUntil =
    base + days * 24 * 60 * 60 * 1000;

  saveData();
  updateUI();

  showToast(
    `${days} day Premium activated`
  );
}

function makeReferralLink() {

  const user =
    tg?.initDataUnsafe?.user;

  const id =
    user?.id || "user";

  return `https://t.me/AG_EARN_HUB_BOT?start=ref_${id}`;
}

function copyReferral() {

  const link =
    makeReferralLink();

  navigator.clipboard
    .writeText(link)
    .then(() => {
      showToast("Referral link copied");
    })
    .catch(() => {
      showToast("Copy failed");
    });
}

function updateReferral() {

  document.getElementById(
    "refLink"
  ).textContent =
    makeReferralLink();
}

function openPage(pageId, button) {

  document
    .querySelectorAll(".page")
    .forEach(page => {
      page.classList.remove("active");
    });

  const page =
    document.getElementById(pageId);

  if (page) {
    page.classList.add("active");
  }

  document
    .querySelectorAll(".navItem")
    .forEach(item => {
      item.classList.remove("active");
    });

  if (button) {
    button.classList.add("active");
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function showToast(message) {

  const toast =
    document.getElementById("toast");

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(window.toastTimer);

  window.toastTimer =
    setTimeout(() => {
      toast.classList.remove("show");
    }, 2200);
}

function openSupport() {

  window.open(
    "https://t.me/ag_support_bd",
    "_blank"
  );
}

updateUser();
updateReferral();
updateUI();
