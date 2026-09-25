/* =================================
   AG EARN HUB — SCRIPT.JS
   ================================= */


/* ===== TELEGRAM WEB APP ===== */

const tg = window.Telegram?.WebApp;

if (tg) {
  tg.ready();
  tg.expand();

  tg.setHeaderColor?.("#050814");
  tg.setBackgroundColor?.("#050814");
}


/* ===== BACKEND API ===== */

const API_URL = "https://ag-earn-hub.onrender.com";


/* ===== APP DATA ===== */

let day = 1;


/* ===== USER TYPE ===== */
/*
   এখন default = Normal User
   পরে backend থেকে VIP/Normal সেট করা যাবে.
*/

let userType = "normal";

const NORMAL_TASK_LIMIT = 10;
const VIP_TASK_LIMIT = 20;


/* ===== TASK DATA ===== */

const TASKS = [
  {
    id: "youtube1",
    name: "YOUTUBE 1",
    icon: "▶️",
    url: "https://www.youtube.com/@AG_AMANE"
  },

  {
    id: "youtube2",
    name: "YOUTUBE 2",
    icon: "▶️",
    url: "https://www.youtube.com/@amanegaming1k"
  },

  {
    id: "telegram",
    name: "TELEGRAM",
    icon: "✈️",
    url: "https://t.me/agxamanr"
  }
];


/* ===== TASK STATUS ===== */

let completedVideoTasks = 0;

const completedTasks = new Set();


/* ===== TOAST ===== */

function toast(message) {

  const box =
    document.getElementById("toastBox");

  if (!box) return;

  box.textContent = message;

  box.classList.add("show");

  clearTimeout(window.toastTimer);

  window.toastTimer = setTimeout(() => {

    box.classList.remove("show");

  }, 1800);

}


/* ===== PAGE SYSTEM ===== */

function showPage(pageId) {

  const pages = [
    "homePage",
    "tasksPage",
    "withdrawPage",
    "referPage",
    "profilePage"
  ];


  pages.forEach(id => {

    const page =
      document.getElementById(id);

    if (page) {
      page.classList.add("hidden");
    }

  });


  const selectedPage =
    document.getElementById(pageId);


  if (selectedPage) {
    selectedPage.classList.remove("hidden");
  }


  /* Update navigation */

  const navButtons =
    document.querySelectorAll(".nav button");


  navButtons.forEach(button => {
    button.classList.remove("active");
  });


  const pageToNav = {

    homePage: 0,
    tasksPage: 1,
    withdrawPage: 2,
    referPage: 3,
    profilePage: 4

  };


  const index =
    pageToNav[pageId];


  if (
    index !== undefined &&
    navButtons[index]
  ) {

    navButtons[index].classList.add("active");

  }


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


/* ===== BOTTOM NAV ===== */

function nav(button, name) {

  document
    .querySelectorAll(".nav button")
    .forEach(item => {

      item.classList.remove("active");

    });


  button.classList.add("active");

  toast(name + " opened");

}


/* =================================
   TASK SYSTEM
   ================================= */


/* ===== GET DAILY LIMIT ===== */

function getTaskLimit() {

  if (userType === "vip") {

    return VIP_TASK_LIMIT;

  }

  return NORMAL_TASK_LIMIT;

}


/* ===== START TASK ===== */

function startTask(taskId) {

  const task =
    TASKS.find(item => item.id === taskId);


  if (!task) {

    toast("❌ Task not found");

    return;

  }


  /* Check already completed */

  if (completedTasks.has(taskId)) {

    toast("✅ Task already completed");

    return;

  }


  /* Check daily limit */

  if (
    completedVideoTasks >=
    getTaskLimit()
  ) {

    toast("⚠️ Daily task limit reached");

    return;

  }


  /* Save current task */

  window.currentTask = taskId;


  /* Open link */

  window.open(
    task.url,
    "_blank"
  );


  toast(
    "▶️ Task opened"
  );

}


/* ===== COMPLETE TASK ===== */

function completeTask(taskId) {

  const task =
    TASKS.find(item => item.id === taskId);


  if (!task) {

    toast("❌ Task not found");

    return;

  }


  /* Already completed */

  if (completedTasks.has(taskId)) {

    toast("✅ Task already completed");

    return;

  }


  /* Daily limit */

  if (
    completedVideoTasks >=
    getTaskLimit()
  ) {

    toast(
      "⚠️ Daily task limit reached"
    );

    return;

  }


  /* Mark complete */

  completedTasks.add(taskId);

  completedVideoTasks++;


  updateTaskCounter();


  toast(
    "🎉 " +
    task.name +
    " completed!"
  );

}


/* ===== TASK COUNTER ===== */

function updateTaskCounter() {

  const counter =
    document.getElementById(
      "taskCounter"
    );


  if (!counter) return;


  counter.textContent =
    completedVideoTasks +
    " / " +
    getTaskLimit() +
    " completed";

}


/* ===== SET VIP ===== */

function setUserVIP() {

  userType = "vip";

  updateTaskCounter();

  toast("⭐ VIP User");

}


/* ===== SET NORMAL ===== */

function setUserNormal() {

  userType = "normal";

  updateTaskCounter();

}


/* =================================
   7-DAY BONUS
   ================================= */

function claimBonus() {

  if (day >= 7) {

    toast(
      "🎉 7-Day Bonus Completed"
    );

    return;

  }


  day++;

  renderDays();


  toast(
    "🎁 Daily bonus claimed"
  );

}


/* ===== RENDER BONUS DAYS ===== */

function renderDays() {

  const container =
    document.getElementById("days");


  if (!container) return;


  container.innerHTML = "";


  for (
    let i = 1;
    i <= 7;
    i++
  ) {

    const item =
      document.createElement("div");


    item.className =
      "day" +
      (
        i <= day
          ? " active"
          : ""
      );


    item.textContent =
      i < day
        ? "✓ Day " + i
        : "Day " + i;


    container.appendChild(item);

  }


  const streakText =
    document.getElementById(
      "streakText"
    );


  if (streakText) {

    streakText.textContent =
      "Day " +
      day +
      " / 7";

  }

}


/* =================================
   SUPPORT POPUP
   ================================= */

function openSupport() {

  const popup =
    document.getElementById(
      "supportPopup"
    );


  if (!popup) return;


  popup.classList.remove(
    "hidden"
  );


  document.body.style.overflow =
    "hidden";

}


/* ===== CLOSE SUPPORT ===== */

function closeSupport() {

  const popup =
    document.getElementById(
      "supportPopup"
    );


  if (!popup) return;


  popup.classList.add(
    "hidden"
  );


  document.body.style.overflow =
    "";

}


/* ===== CLOSE BY BACKGROUND ===== */

document.addEventListener(
  "click",
  function(event) {

    const popup =
      document.getElementById(
        "supportPopup"
      );


    if (!popup) return;


    if (
      event.target === popup
    ) {

      closeSupport();

    }

  }
);


/* ===== ESC CLOSE ===== */

document.addEventListener(
  "keydown",
  function(event) {

    if (
      event.key === "Escape"
    ) {

      closeSupport();

    }

  }
);


/* =================================
   CLOCK
   ================================= */

function updateClock() {

  const time =
    document.getElementById(
      "time"
    );


  if (!time) return;


  time.textContent =
    new Date().toLocaleTimeString(
      "en-GB",
      {
        hour12: false,
        timeZone: "Asia/Dhaka"
      }
    );

}


updateClock();


setInterval(
  updateClock,
  1000
);


/* =================================
   LOADING
   ================================= */

window.addEventListener(
  "load",
  () => {

    setTimeout(
      () => {

        const loading =
          document.getElementById(
            "loading"
          );


        const app =
          document.getElementById(
            "app"
          );


        if (loading) {

          loading.classList.add(
            "hidden"
          );

        }


        if (app) {

          app.classList.remove(
            "hidden"
          );

        }


        updateTaskCounter();


      },
      1200
    );

  }
);


/* =================================
   START
   ================================= */

renderDays();

updateTaskCounter();


/* =================================
   TELEGRAM BACK BUTTON
   ================================= */

if (tg) {

  tg.BackButton?.hide();

}


/* =================================
   CONSOLE
   ================================= */

console.log(
  "AG EARN HUB loaded successfully."
);

console.log(
  "User type:",
  userType
);

console.log(
  "Task limit:",
  getTaskLimit()
);
