const tg = window.Telegram?.WebApp;

if (tg) {
    tg.ready();
    tg.expand();
}

const pages = document.querySelectorAll(".page");
const navButtons = document.querySelectorAll(".bottom-nav button");

function go(page) {

    pages.forEach(function(item) {
        item.classList.remove("active");
    });

    const target = document.getElementById(page + "Page");

    if (target) {
        target.classList.add("active");
    }

    navButtons.forEach(function(button) {

        button.classList.toggle(
            "active",
            button.dataset.page === page
        );

    });

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


function showToast(message) {

    const toast = document.getElementById("toast");

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(window.toastTimer);

    window.toastTimer = setTimeout(function() {
        toast.classList.remove("show");
    }, 1800);
}


/* =========================
   TASK SYSTEM
========================= */

const tasks = [
    "Task 1",
    "Task 2",
    "Task 3",
    "Task 4",
    "Task 5",
    "Task 6",
    "Task 7",
    "Task 8",
    "Task 9",
    "Task 10"
];

let taskState = [];

try {

    taskState =
        JSON.parse(
            localStorage.getItem("ag_tasks")
        ) || [];

} catch (e) {

    taskState = [];
}

while (taskState.length < 10) {
    taskState.push(false);
}


function renderTasks() {

    const container =
        document.getElementById("tasksContainer");

    if (!container) return;

    container.innerHTML = "";

    let completed = 0;

    tasks.forEach(function(task, index) {

        if (taskState[index]) {
            completed++;
        }

        const card =
            document.createElement("div");

        card.className = "task-card";

        const number =
            document.createElement("div");

        number.className = "task-number";
        number.textContent = index + 1;

        const info =
            document.createElement("div");

        info.className = "task-info";

        info.innerHTML = `
            <b>${task}</b>
            <small>Complete task • +5 coins</small>
        `;

        const button =
            document.createElement("button");

        button.className = "task-button";

        if (taskState[index]) {

            button.textContent = "✓ DONE";
            button.classList.add("done");

        } else {

            button.textContent = "START";

            button.onclick = function() {

                taskState[index] = true;

                localStorage.setItem(
                    "ag_tasks",
                    JSON.stringify(taskState)
                );

                updateCoins(5);

                renderTasks();

                showToast(
                    "+5 coins • Task completed"
                );
            };
        }

        card.appendChild(number);
        card.appendChild(info);
        card.appendChild(button);

        container.appendChild(card);

    });

    const percent =
        Math.round((completed / 10) * 100);

    document.getElementById(
        "taskDone"
    ).textContent = completed;

    document.getElementById(
        "taskPercent"
    ).textContent = percent + "%";

    document.getElementById(
        "progressBar"
    ).style.width = percent + "%";
}


/* =========================
   COINS
========================= */

let coins =
    Number(
        localStorage.getItem("ag_coins") || 0
    );


function updateCoins(amount) {

    coins += Number(amount);

    localStorage.setItem(
        "ag_coins",
        coins
    );

    updateCoinUI();
}


function updateCoinUI() {

    document.getElementById(
        "coinBalance"
    ).textContent = coins;

    document.getElementById(
        "profileCoins"
    ).textContent = coins;
}


/* =========================
   TELEGRAM USER
========================= */

function loadTelegramUser() {

    if (
        tg &&
        tg.initDataUnsafe &&
        tg.initDataUnsafe.user
    ) {

        const user =
            tg.initDataUnsafe.user;

        const name =
            [
                user.first_name,
                user.last_name
            ]
            .filter(Boolean)
            .join(" ");

        document.getElementById(
            "profileName"
        ).textContent =
            name || "Telegram User";

        document.getElementById(
            "profileId"
        ).textContent =
            user.id;
    }
}


/* =========================
   REFERRAL
========================= */

function copyReferral() {

    const link =
        "https://t.me/AG_EARN_HUB_BOT?start=ref";

    if (
        navigator.clipboard
    ) {

        navigator.clipboard.writeText(link);

        showToast(
            "Referral link copied"
        );

    } else {

        showToast(
            "Referral link ready"
        );
    }
}


/* =========================
   PREMIUM
========================= */

function selectPremium(plan) {

    showToast(
        plan + " selected"
    );
}


/* =========================
   LOADING
========================= */

setTimeout(function() {

    const loading =
        document.getElementById("loading");

    if (loading) {
        loading.classList.add("hide");
    }

}, 1800);


/* =========================
   START
========================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        updateCoinUI();
        loadTelegramUser();
        renderTasks();

    }
);
