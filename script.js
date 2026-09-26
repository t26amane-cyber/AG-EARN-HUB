/* =========================================
   AG EARN HUB — SCRIPT.JS
   ========================================= */

const tg = window.Telegram?.WebApp || null;

const API_URL = "https://ag-earn-hub.onrender.com";

/* =========================================
   TELEGRAM MINI APP
   ========================================= */

if (tg) {
    tg.ready();
    tg.expand();

    tg.setHeaderColor?.("#050814");
    tg.setBackgroundColor?.("#050814");
}

/* =========================================
   APP STATE
   ========================================= */

let user = {
    id: "",
    name: "Telegram User",
    username: "",
    coins: 0,
    premium: false
};

let selectedPremiumPlan = null;
let selectedPaymentMethod = null;

let currentTasks = [];

const completedTasks = new Set();

/* =========================================
   DEFAULT TASKS
   =========================================
   এগুলো এখন task structure।
   আসল link/reward backend থেকে দিলে
   পরে backend data দিয়ে replace করা যাবে।
   ========================================= */

const DEFAULT_TASKS = [
    {
        id: "task_1",
        title: "AD NETWORK TASK 1",
        description: "Open the assigned task",
        icon: "📢",
        reward: 5,
        url: "#",
        status: "demo"
    },
    {
        id: "task_2",
        title: "AD NETWORK TASK 2",
        description: "Open the assigned task",
        icon: "🌐",
        reward: 5,
        url: "#",
        status: "demo"
    },
    {
        id: "task_3",
        title: "AD NETWORK TASK 3",
        description: "Open the assigned task",
        icon: "🚀",
        reward: 10,
        url: "#",
        status: "demo"
    },
    {
        id: "task_4",
        title: "AD NETWORK TASK 4",
        description: "Open the assigned task",
        icon: "🎯",
        reward: 10,
        url: "#",
        status: "demo"
    },
    {
        id: "task_5",
        title: "AD NETWORK TASK 5",
        description: "Open the assigned task",
        icon: "💎",
        reward: 10,
        url: "#",
        status: "demo"
    },
    {
        id: "task_6",
        title: "AD NETWORK TASK 6",
        description: "Open the assigned task",
        icon: "⭐",
        reward: 15,
        url: "#",
        status: "demo"
    },
    {
        id: "task_7",
        title: "AD NETWORK TASK 7",
        description: "Open the assigned task",
        icon: "🔥",
        reward: 15,
        url: "#",
        status: "demo"
    },
    {
        id: "task_8",
        title: "AD NETWORK TASK 8",
        description: "Open the assigned task",
        icon: "💰",
        reward: 20,
        url: "#",
        status: "demo"
    },
    {
        id: "task_9",
        title: "AD NETWORK TASK 9",
        description: "Open the assigned task",
        icon: "🏆",
        reward: 20,
        url: "#",
        status: "demo"
    },
    {
        id: "task_10",
        title: "AD NETWORK TASK 10",
        description: "Open the assigned task",
        icon: "👑",
        reward: 25,
        url: "#",
        status: "demo"
    }
];

/* =========================================
   TOAST
   ========================================= */

function toast(message) {

    const box = document.getElementById("toastBox");

    if (!box) return;

    box.textContent = message;
    box.classList.add("show");

    clearTimeout(window.toastTimer);

    window.toastTimer = setTimeout(() => {
        box.classList.remove("show");
    }, 2200);
}

/* =========================================
   API HELPER
   ========================================= */

async function apiRequest(path, options = {}) {

    try {

        const headers = {
            "Content-Type": "application/json",
            ...(options.headers || {})
        };

        const response = await fetch(
            API_URL + path,
            {
                ...options,
                headers
            }
        );

        const data = await response.json().catch(() => ({}));

        return {
            ok: response.ok,
            status: response.status,
            data
        };

    } catch (error) {

        console.log("API Error:", error);

        return {
            ok: false,
            status: 0,
            data: {}
        };
    }
}

/* =========================================
   TELEGRAM USER
   ========================================= */

function getTelegramUser() {

    if (!tg?.initDataUnsafe?.user) {
        return null;
    }

    return tg.initDataUnsafe.user;
}

/* =========================================
   USER INITIALIZATION
   ========================================= */

async function initializeUser() {

    const telegramUser = getTelegramUser();

    if (telegramUser) {

        user.id = String(telegramUser.id || "");
        user.name =
            telegramUser.first_name ||
            telegramUser.username ||
            "Telegram User";

        user.username =
            telegramUser.username
                ? "@" + telegramUser.username
                : "";

        updateProfile();
    }

    /*
      Backend endpoint না থাকলে UI চালু থাকবে।
      Backend-এ /api/user/init যোগ করলে এখানে
      real user data নেওয়া যাবে।
    */

    if (!tg?.initData) {
        console.log("Telegram initData unavailable.");
        return;
    }

    const result = await apiRequest(
        "/api/user/init",
        {
            method: "POST",
            body: JSON.stringify({
                initData: tg.initData
            })
        }
    );

    if (result.ok && result.data?.user) {

        user = {
            ...user,
            ...result.data.user
        };

        updateAllUI();
    }
}

/* =========================================
   PAGE NAVIGATION
   ========================================= */

function showPage(pageId) {

    const pages = [
        "homePage",
        "tasksPage",
        "premiumPage",
        "premiumTasksPage",
        "advancedPage",
        "shopPage",
        "withdrawPage",
        "referPage",
        "profilePage"
    ];

    pages.forEach(id => {

        const page = document.getElementById(id);

        if (page) {
            page.classList.add("hidden");
        }
    });

    const selected = document.getElementById(pageId);

    if (selected) {
        selected.classList.remove("hidden");
    }

    updateNav(pageId);

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

/* =========================================
   BOTTOM NAV
   ========================================= */

function updateNav(pageId) {

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

    const index = pageToNav[pageId];

    if (
        index !== undefined &&
        navButtons[index]
    ) {
        navButtons[index].classList.add("active");
    }
}

function nav(button, name) {

    document
        .querySelectorAll(".nav button")
        .forEach(item => {
            item.classList.remove("active");
        });

    button.classList.add("active");

    toast(name + " opened");
}

/* =========================================
   TASK RENDER
   ========================================= */

function renderTasks() {

    const container =
        document.getElementById("tasksContainer");

    if (!container) return;

    container.innerHTML = "";

    currentTasks.forEach((task, index) => {

        const completed =
            completedTasks.has(task.id);

        const card =
            document.createElement("div");

        card.className = "task-card";

        card.innerHTML = `
            <div class="task-head">

                <div class="task-icon">
                    ${escapeHTML(task.icon || "🎯")}
                </div>

                <div class="task-info">

                    <h3>
                        ${escapeHTML(task.title)}
                    </h3>

                    <p>
                        ${escapeHTML(
                            task.description ||
                            "Complete this task"
                        )}
                    </p>

                </div>

                <div class="task-reward">
                    +${Number(task.reward || 0)}
                </div>

            </div>

            <div class="task-buttons">

                <button
                    class="btn btn-primary"
                    onclick="startTask('${task.id}')"
                >
                    🔗 OPEN
                </button>

                <button
                    class="btn ${
                        completed
                            ? "btn-success"
                            : "btn-secondary"
                    }"
                    onclick="completeTask('${task.id}')"
                    ${completed ? "disabled" : ""}
                >
                    ${
                        completed
                            ? "✅ DONE"
                            : "✓ COMPLETE"
                    }
                </button>

            </div>
        `;

        container.appendChild(card);
    });

    updateTaskCounter();
}

/* =========================================
   TASK LIMIT
   ========================================= */

function getTaskLimit() {

    return user.premium
        ? 20
        : 10;
}

function updateTaskCounter() {

    const counter =
        document.getElementById("taskCounter");

    if (!counter) return;

    counter.textContent =
        completedTasks.size +
        " / " +
        getTaskLimit() +
        " completed";
}

/* =========================================
   START TASK
   ========================================= */

function startTask(taskId) {

    const task =
        currentTasks.find(
            item => item.id === taskId
        );

    if (!task) {
        toast("❌ Task not found");
        return;
    }

    if (completedTasks.has(taskId)) {
        toast("✅ Task already completed");
        return;
    }

    if (
        completedTasks.size >=
        getTaskLimit()
    ) {
        toast("⚠️ Daily task limit reached");
        return;
    }

    if (
        !task.url ||
        task.url === "#"
    ) {
        toast("⚠️ Task link not added yet");
        return;
    }

    window.currentTask = taskId;

    window.open(
        task.url,
        "_blank"
    );

    toast("🔗 Task opened");
}

/* =========================================
   COMPLETE TASK
   =========================================
   IMPORTANT:
   Frontend নিজে real reward দেয় না।
   Backend verification থাকলে সেখানে request যাবে।
   ========================================= */

async function completeTask(taskId) {

    const task =
        currentTasks.find(
            item => item.id === taskId
        );

    if (!task) {
        toast("❌ Task not found");
        return;
    }

    if (completedTasks.has(taskId)) {
        toast("✅ Already completed");
        return;
    }

    if (
        completedTasks.size >=
        getTaskLimit()
    ) {
        toast("⚠️ Daily task limit reached");
        return;
    }

    /*
      Demo/manual task হলে automatic coin award করা হবে না।
    */

    if (task.status === "demo") {

        toast(
            "ℹ️ This task needs verification"
        );

        return;
    }

    if (!tg?.initData) {

        toast(
            "⚠️ Telegram authentication required"
        );

        return;
    }

    const result = await apiRequest(
        "/api/tasks/complete",
        {
            method: "POST",
            body: JSON.stringify({
                initData: tg.initData,
                task_id: taskId
            })
        }
    );

    if (
        result.ok &&
        result.data?.ok
    ) {

        completedTasks.add(taskId);

        if (
            typeof result.data.coins === "number"
        ) {
            user.coins =
                result.data.coins;
        }

        updateAllUI();

        renderTasks();

        toast(
            "🎉 Task completed! +" +
            (task.reward || 0) +
            " coins"
        );

    } else {

        toast(
            result.data?.message ||
            "❌ Task verification failed"
        );
    }
}

/* =========================================
   PREMIUM
   ========================================= */

function selectPremiumPlan(plan) {

    selectedPremiumPlan = plan;

    const names = {
        "1_day": "1 Day Premium",
        "7_day": "7 Days Premium",
        "30_day": "30 Days Premium"
    };

    toast(
        "⭐ " +
        (names[plan] || "Premium plan") +
        " selected"
    );

    const paymentBox =
        document.querySelector(".payment-box");

    if (paymentBox) {
        paymentBox.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }
}

/* =========================================
   PAYMENT METHOD
   ========================================= */

function selectPaymentMethod(method) {

    selectedPaymentMethod = method;

    document
        .querySelectorAll(".payment-method")
        .forEach(item => {
            item.classList.remove("active");
        });

    const selected =
        document.querySelector(
            `[data-payment="${method}"]`
        );

    if (selected) {
        selected.classList.add("active");
    }

    const names = {
        bkash: "bKash",
        nagad: "Nagad",
        wallet: "AG Wallet"
    };

    toast(
        (names[method] || "Payment") +
        " selected"
    );
}

/* =========================================
   COPY PAYMENT NUMBER
   ========================================= */

async function copyPaymentNumber() {

    const element =
        document.getElementById(
            "paymentNumber"
        );

    if (!element) return;

    const text =
        element.textContent.trim();

    try {

        await navigator.clipboard.writeText(text);

        toast("📋 Copied");

    } catch {

        toast("⚠️ Copy failed");
    }
}

/* =========================================
   SUBMIT PAYMENT
   ========================================= */

async function submitPayment() {

    const transactionInput =
        document.getElementById(
            "transactionId"
        );

    const transactionId =
        transactionInput?.value.trim();

    if (!selectedPremiumPlan) {
        toast("⚠️ Select a premium plan");
        return;
    }

    if (!selectedPaymentMethod) {
        toast("⚠️ Select payment method");
        return;
    }

    if (!transactionId) {
        toast("⚠️ Enter Transaction ID");
        return;
    }

    /*
      Manual verification:
      Transaction ID backend-এ পাঠানো হবে।
      Admin verify না করা পর্যন্ত Premium active হবে না।
    */

    if (!tg?.initData) {

        toast(
            "⚠️ Open this inside Telegram"
        );

        return;
    }

    const result = await apiRequest(
        "/api/payment/submit",
        {
            method: "POST",
            body: JSON.stringify({
                initData: tg.initData,
                plan: selectedPremiumPlan,
                method: selectedPaymentMethod,
                transaction_id: transactionId
            })
        }
    );

    if (result.ok) {

        toast(
            "✅ Payment submitted for review"
        );

        transactionInput.value = "";

    } else {

        toast(
            result.data?.message ||
            "❌ Payment submission failed"
        );
    }
}

/* =========================================
   PREMIUM TASKS
   ========================================= */

function openPremiumTasks() {

    if (!user.premium) {

        showPage("premiumPage");

        toast(
            "🔒 Premium required"
        );

        return;
    }

    showPage("premiumTasksPage");

    renderPremiumTasks();
}

function renderPremiumTasks() {

    const container =
        document.getElementById(
            "premiumTasksContainer"
        );

    const lock =
        document.getElementById(
            "premiumTasksLock"
        );

    if (!container) return;

    if (!user.premium) {

        if (lock) {
            lock.classList.remove("hidden");
        }

        container.innerHTML = "";

        return;
    }

    if (lock) {
        lock.classList.add("hidden");
    }

    container.innerHTML = `
        <div class="task-card">

            <div class="task-head">

                <div class="task-icon">
                    👑
                </div>

                <div class="task-info">
                    <h3>PREMIUM TASKS</h3>
                    <p>
                        Premium task system
                    </p>
                </div>

                <div class="task-reward">
                    VIP
                </div>

            </div>

            <div class="info-box">
                Premium task verification
                will be connected to the
                backend/provider system.
            </div>

        </div>
    `;
}

/* =========================================
   WITHDRAW
   ========================================= */

function openWithdraw(method) {

    const names = {
        bkash: "bKash",
        nagad: "Nagad",
        wallet: "AG Wallet"
    };

    toast(
        (names[method] || "Withdraw") +
        " selected"
    );

    /*
      Real withdrawal should be handled
      by backend/admin verification.
    */
}

/* =========================================
   REFERRAL
   ========================================= */

async function copyReferralLink() {

    let userId =
        user.id || "USER";

    const botUsername =
        "ag_earn_hub_bot";

    const link =
        "https://t.me/" +
        botUsername +
        "?start=ref_" +
        encodeURIComponent(userId);

    try {

        await navigator.clipboard.writeText(link);

        toast("📋 Referral link copied");

    } catch {

        toast("⚠️ Copy failed");
    }
}

/* =========================================
   PROFILE
   ========================================= */

function updateProfile() {

    const name =
        document.getElementById(
            "profileName"
        );

    const username =
        document.getElementById(
            "profileUsername"
        );

    const id =
        document.getElementById(
            "profileUserId"
        );

    const coins =
        document.getElementById(
            "profileCoins"
        );

    if (name) {
        name.textContent =
            user.name || "Telegram User";
    }

    if (username) {
        username.textContent =
            user.username || "Telegram";
    }

    if (id) {
        id.textContent =
            user.id || "—";
    }

    if (coins) {
        coins.textContent =
            String(user.coins || 0);
    }
}

/* =========================================
   GLOBAL UI UPDATE
   ========================================= */

function updateAllUI() {

    updateProfile();

    updateBalance();

    updatePremiumStatus();

    updateTaskCounter();

    renderPremiumTasks();
}

/* =========================================
   BALANCE
   ========================================= */

function updateBalance() {

    const balance =
        document.getElementById(
            "balance"
        );

    if (balance) {
        balance.textContent =
            String(user.coins || 0);
    }
}

/* =========================================
   PREMIUM STATUS
   ========================================= */

function updatePremiumStatus() {

    const status =
        document.querySelector(
            ".premium-status"
        );

    if (!status) return;

    status.textContent =
        user.premium
            ? "⭐ PREMIUM ACTIVE"
            : "FREE USER";
}

/* =========================================
   DAILY 
