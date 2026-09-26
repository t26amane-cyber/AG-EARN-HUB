// =========================================================
// AG EARN HUB — COMPLETE JAVASCRIPT
// =========================================================


// =========================================================
// TELEGRAM MINI APP
// =========================================================

const tg = window.Telegram?.WebApp || null;

if (tg) {
    tg.ready();
    tg.expand();

    try {
        tg.setHeaderColor("#070b14");
        tg.setBackgroundColor("#070b14");
    } catch (error) {
        console.log("Telegram theme setup:", error);
    }
}


// =========================================================
// USER DATA
// =========================================================

const userData = {

    name: "User",

    username: "@username",

    userId: null,

    accountStatus: "Active",

    verified: true,

    level: 2,

    levelProgress: 65,

    userType: "VIP",

    normalTaskLimit: 22,

    vipTaskLimit: 50,

    completedTasks: 7,

    availableTasks: 20,

    balance: 1250,

    pendingBalance: 150,

    totalEarned: 3500,

    taskEarnings: 2100,

    referralEarnings: 400,

    totalReferrals: 12,

    activeReferrals: 8,

    inactiveReferrals: 4,

    vipRemainingDays: 12,

    todayWorkSeconds: 2 * 60 * 60 + 35 * 60,

    currentSessionSeconds: 0,

    todaySessions: 4

};


// =========================================================
// TASK DATA
// =========================================================

const tasks = {

    game: [
        {
            id: "game1",
            title: "Game Task 01",
            description: "Complete the sponsored game task.",
            reward: 20
        },
        {
            id: "game2",
            title: "Game Task 02",
            description: "Complete the required game activity.",
            reward: 25
        }
    ],

    watch: [
        {
            id: "watch1",
            title: "Watch Task 01",
            description: "Watch the available sponsored content.",
            reward: 8
        },
        {
            id: "watch2",
            title: "Watch Task 02",
            description: "Complete the available video task.",
            reward: 10
        }
    ],

    typing: [
        {
            id: "typing1",
            title: "Typing Task 01",
            description: "Complete the assigned typing task.",
            reward: 15
        }
    ],

    micro: [
        {
            id: "micro1",
            title: "Micro Task 01",
            description: "Complete the small online task.",
            reward: 12
        }
    ],

    affiliate: [
        {
            id: "affiliate1",
            title: "Affiliate Task 01",
            description: "Complete the legitimate affiliate task.",
            reward: 20
        }
    ],

    app: [
        {
            id: "app1",
            title: "App / Website Task 01",
            description: "Complete the required app or website activity.",
            reward: 18
        }
    ],

    survey: [
        {
            id: "survey1",
            title: "Survey Task 01",
            description: "Complete the available survey.",
            reward: 15
        }
    ],

    bonus: [
        {
            id: "bonus1",
            title: "Bonus Task 01",
            description: "Complete this special bonus task.",
            reward: 30
        }
    ]

};


// =========================================================
// ONE-TIME TASKS
// =========================================================

const oneTimeTasks = {

    yt1: false,

    yt2: false,

    telegram: false

};


// =========================================================
// CURRENT TASK
// =========================================================

let selectedTask = null;


// =========================================================
// WORK TIMER
// =========================================================

let workTimerRunning = false;

let workTimerInterval = null;

let sessionSeconds = 0;


// =========================================================
// INITIALIZATION
// =========================================================

document.addEventListener("DOMContentLoaded", () => {

    loadSavedData();

    setupTelegramUser();

    updateUserInterface();

    renderAllTasks();

    updateLiveTime();

    setInterval(updateLiveTime, 1000);

    updateWorkTimerDisplay();

    hideLoadingScreen();

    setupRippleEffect();

});


// =========================================================
// TELEGRAM USER
// =========================================================

function setupTelegramUser() {

    if (!tg || !tg.initDataUnsafe) {
        return;
    }

    const telegramUser = tg.initDataUnsafe.user;

    if (!telegramUser) {
        return;
    }

    userData.userId = telegramUser.id;

    if (telegramUser.first_name) {

        userData.name =
            telegramUser.first_name +
            (telegramUser.last_name
                ? " " + telegramUser.last_name
                : "");

    }

    if (telegramUser.username) {

        userData.username =
            "@" + telegramUser.username;

    }

    updateUserInterface();

}


// =========================================================
// UPDATE USER INTERFACE
// =========================================================

function updateUserInterface() {

    setText("userName", userData.name + "!");

    setText("profileName", userData.name);

    setText("profileUsername", userData.username);

    setText("userLevel", userData.level);

    setText("profileLevel", userData.level);

    setText("levelPercent", userData.levelProgress + "%");

    const levelProgress =
        document.getElementById("levelProgress");

    if (levelProgress) {
        levelProgress.style.width =
            userData.levelProgress + "%";
    }


    setText(
        "balance",
        userData.balance.toFixed(2)
    );

    setText(
        "pendingBalance",
        userData.pendingBalance.toFixed(2)
    );

    setText(
        "totalEarned",
        userData.totalEarned.toFixed(2)
    );


    setText(
        "availableTasks",
        userData.availableTasks
    );

    setText(
        "completedTasks",
        userData.completedTasks
    );


    setText(
        "totalReferrals",
        userData.totalReferrals
    );

    setText(
        "activeReferrals",
        userData.activeReferrals
    );

    setText(
        "inactiveReferrals",
        userData.inactiveReferrals
    );


    setText(
        "vipRemaining",
        userData.vipRemainingDays + " Days"
    );


    setText(
        "taskEarnings",
        userData.taskEarnings
    );

    setText(
        "referralEarnings",
        userData.referralEarnings
    );

    setText(
        "overviewAvailable",
        userData.balance
    );

    setText(
        "overviewPending",
        userData.pendingBalance
    );

    setText(
        "overviewTotal",
        userData.totalEarned
    );


    setText(
        "withdrawBalance",
        userData.balance.toFixed(2)
    );


    setText(
        "profileTodayWork",
        formatWorkTime(userData.todayWorkSeconds)
    );


    setText(
        "todayActivity",
        userData.todaySessions + " Sessions"
    );


    const taskLimit =
        userData.userType === "VIP"
            ? userData.vipTaskLimit
            : userData.normalTaskLimit;


    setText(
        "taskUserType",
        userData.userType === "VIP"
            ? "💎 VIP USER"
            : "👤 NORMAL USER"
    );


    setText(
        "taskCompletedCount",
        userData.completedTasks
    );

    setText(
        "taskLimit",
        taskLimit
    );


    const taskProgress =
        document.getElementById("taskLimitProgress");

    if (taskProgress) {

        const percentage =
            Math.min(
                (userData.completedTasks / taskLimit) * 100,
                100
            );

        taskProgress.style.width =
            percentage + "%";
    }

}


// =========================================================
// HELPER — SET TEXT
// =========================================================

function setText(id, value) {

    const element =
        document.getElementById(id);

    if (element) {
        element.textContent = value;
    }

}


// =========================================================
// LIVE TIME
// =========================================================

function updateLiveTime() {

    const now = new Date();

    let time =
        now.toLocaleTimeString(
            "en-US",
            {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true
            }
        );


    let date =
        now.toLocaleDateString(
            "en-US",
            {
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );


    setText("liveTime", time);

    setText("liveDate", date);

}


// =========================================================
// PAGE NAVIGATION
// =========================================================

function openPage(pageId) {

    const pages =
        document.querySelectorAll(".page");

    pages.forEach(page => {

        page.classList.remove("active");

    });


    const target =
        document.getElementById(pageId);

    if (!target) {
        return;
    }


    target.classList.add("active");


    updateBottomNavigation(pageId);


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });


    if (pageId === "tasksPage") {
        renderAllTasks();
    }

}


function goHome() {

    openPage("homePage");

}


// =========================================================
// BOTTOM NAVIGATION
// =========================================================

function updateBottomNavigation(pageId) {

    const navItems =
        document.querySelectorAll(".nav-item");

    navItems.forEach(item => {

        item.classList.remove("active");

    });


    const mapping = {

        homePage: "navHome",

        tasksPage: "navTasks",

        withdrawPage: "navWithdraw",

        referPage: "navRefer",

        profilePage: "navProfile"

    };


    const navId =
        mapping[pageId];

    if (navId) {

        const nav =
            document.getElementById(navId);

        if (nav) {
            nav.classList.add("active");
        }

    }

}


// =========================================================
// WORK TIMER — START
// =========================================================

function startTaskTimer() {

    if (workTimerRunning) {

        showToast(
            "⏱️",
            "Work timer is already running."
        );

        return;

    }


    workTimerRunning = true;

    sessionSeconds = 0;


    setText(
        "workStatus",
        "Working"
    );


    showToast(
        "▶️",
        "Work session started."
    );


    workTimerInterval =
        setInterval(() => {

            sessionSeconds++;

            userData.todayWorkSeconds++;

            updateWorkTimerDisplay();

            setText(
                "todayWorkTime",
                formatWorkTime(
                    userData.todayWorkSeconds
                )
            );

            setText(
                "profileTodayWork",
                formatWorkTime(
                    userData.todayWorkSeconds
                )
            );

        }, 1000);

}


// =========================================================
// WORK TIMER — STOP
// =========================================================

function stopTaskTimer() {

    if (!workTimerRunning) {
        return;
    }


    clearInterval(
        workTimerInterval
    );


    workTimerRunning = false;


    userData.todaySessions++;


    saveData();


    setText(
        "workStatus",
        "Active"
    );


    showToast(
        "✅",
        "Work session saved."
    );

}


// =========================================================
// WORK TIMER DISPLAY
// =========================================================

function updateWorkTimerDisplay() {

    setText(
        "currentSession",
        formatSessionTime(
            sessionSeconds
        )
    );


    setText(
        "todayWorkTime",
        formatWorkTime(
            userData.todayWorkSeconds
        )
    );

}


// =========================================================
// FORMAT WORK TIME
// =========================================================

function formatWorkTime(seconds) {

    const hours =
        Math.floor(seconds / 3600);

    const minutes =
        Math.floor(
            (seconds % 3600) / 60
        );


    return (
        String(hours).padStart(2, "0") +
        "h " +
        String(minutes).padStart(2, "0") +
        "m"
    );

}


// =========================================================
// FORMAT SESSION TIME
// =========================================================

function formatSessionTime(seconds) {

    const minutes =
        Math.floor(seconds / 60);

    const secs =
        seconds % 60;


    return (
        String(minutes).padStart(2, "0") +
        "m " +
        String(secs).padStart(2, "0") +
        "s"
    );

}


// =========================================================
// RENDER ALL TASKS
// =========================================================

function renderAllTasks() {

    renderTaskCategory(
        "game",
        "gameTasks"
    );

    renderTaskCategory(
        "watch",
        "watchTasks"
    );

    renderTaskCategory(
        "typing",
        "typingTasks"
    );

    renderTaskCategory(
        "micro",
        "microTasks"
    );

    renderTaskCategory(
        "affiliate",
        "affiliateTasks"
    );

    renderTaskCategory(
        "app",
        "appTasks"
    );

    renderTaskCategory(
        "survey",
        "surveyTasks"
    );

    renderTaskCategory(
        "bonus",
        "bonusTasks"
    );


    updateOneTimeTasks();

}


// =========================================================
// RENDER TASK CATEGORY
// =========================================================

function renderTaskCategory(
    category,
    containerId
) {

    const container =
        document.getElementById(
            containerId
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    const categoryTasks =
        tasks[category] || [];


    if (categoryTasks.length === 0) {

        container.innerHTML = `
            <div class="task-item">
                <div class="task-icon">📭</div>
                <div class="task-info">
                    <h4>No Tasks Available</h4>
                    <p>New tasks will appear here.</p>
                </div>
            </div>
        `;

        return;

    }


    categoryTasks.forEach(task => {

        const completed =
            localStorage.getItem(
                "task_" + task.id
            ) === "completed";


        const item =
            document.createElement("div");

        item.className =
            "task-item" +
            (completed ? " completed" : "");


        item.innerHTML = `

            <div class="task-icon">
                ${getCategoryIcon(category)}
            </div>

            <div class="task-info">

                <h4>${escapeHTML(task.title)}</h4>

                <p>
                    ${escapeHTML(task.description)}
                </p>

                <span class="reward">
                    💰 ৳${task.reward}
                </span>

            </div>

            <button
                onclick="openTask('${task.id}', '${category}')"
                ${completed ? "disabled" : ""}
            >
                ${completed ? "DONE" : "START"}
            </button>

        `;


        container.appendChild(item);

    });

}


// =========================================================
// CATEGORY ICON
// =========================================================

function getCategoryIcon(category) {

    const icons = {

        game: "🎮",

        watch: "📺",

        typing: "⌨️",

        micro: "📝",

        affiliate: "🔗",

        app: "📱",

        survey: "📊",

        bonus: "🎁"

    };


    return icons[category] || "💻";

}


// =========================================================
// OPEN TASK
// =========================================================

function openTask(
    taskId,
    category
) {

    const categoryTasks =
        tasks[category] || [];


    const task =
        categoryTasks.find(
            item => item.id === taskId
        );


    if (!task) {
        return;
    }


    selectedTask = {
        ...task,
        category
    };


    setText(
        "modalTaskIcon",
        getCategoryIcon(category)
    );

    setText(
        "modalTaskTitle",
        task.title
    );

    setText(
        "modalTaskDescription",
        task.description
    );

    setText(
        "modalTaskReward",
        "৳" + task.reward
    );


    const modal =
        document.getElementById(
            "taskModal"
        );


    if (modal) {
        modal.classList.add("show");
    }

}


// =========================================================
// CLOSE TASK MODAL
// =========================================================

function closeTaskModal() {

    const modal =
        document.getElementById(
            "taskModal"
        );


    if (modal) {
        modal.classList.remove("show");
    }


    selectedTask = null;

}


// =========================================================
// START SELECTED TASK
// =========================================================

function startSelectedTask() {

    if (!selectedTask) {
        return;
    }


    const task =
        selectedTask;


    closeTaskModal();


    startTaskTimer();


    setTimeout(() => {

        completeTask(
            task.id,
            task.reward
        );

    }, 2500);


    showToast(
        "🚀",
        "Task started."
    );

}


// =========================================================
// COMPLETE TASK
// =========================================================

function completeTask(
    taskId,
    reward
) {

    const storageKey =
        "task_" + taskId;


    if (
        localStorage.getItem(storageKey)
        === "completed"
    ) {

        showToast(
            "✅",
            "Task already completed."
        );

        return;

    }


    const limit =
        userData.userType === "VIP"
            ? userData.vipTaskLimit
            : userData.normalTaskLimit;


    if (
        userData.completedTasks >= limit
    ) {

        showToast(
            "⚠️",
            "Your task limit has been reached."
        );

        return;

    }


    localStorage.setItem(
        storageKey,
        "completed"
    );


    userData.completedTasks++;

    userData.availableTasks =
        Math.max(
            0,
            userData.availableTasks - 1
        );


    userData.balance += reward;

    userData.taskEarnings += reward;

    userData.totalEarned += reward;


    saveData();

    updateUserInterface();

    renderAllTasks();


    showToast(
        "💰",
        "Task completed! ৳" +
        reward +
        " added."
    );


    notifyNewTaskCompletion();

}


// =========================================================
// ONE-TIME TASK
// =========================================================

function completeOneTimeTask(
    taskName
) {

    if (
        oneTimeTasks[taskName]
        === true
    ) {

        showToast(
            "✅",
            "This one-time task is already completed."
        );

        return;

    }


    const storageKey =
        "oneTime_" + taskName;


    if (
        localStorage.getItem(storageKey)
        === "completed"
    ) {

        oneTimeTasks[taskName] = true;

        updateOneTimeTasks();

        showToast(
            "✅",
            "This task is already completed."
        );

        return;

    }


    const limit =
        userData.userType === "VIP"
            ? userData.vipTaskLimit
            : userData.normalTaskLimit;


    if (
        userData.completedTasks >= limit
    ) {

        showToast(
            "⚠️",
            "Your task limit has been reached."
        );

        return;

    }


    oneTimeTasks[taskName] = true;


    localStorage.setItem(
        storageKey,
        "completed"
    );


    const reward = 10;


    userData.completedTasks++;

    userData.balance += reward;

    userData.taskEarnings += reward;

    userData.totalEarned += reward;


    saveData();

    updateUserInterface();

    updateOneTimeTasks();


    showToast(
        "🎯",
        "One-time task completed! ৳10 added."
    );

}


// =========================================================
// UPDATE ONE-TIME TASKS
// =========================================================

function updateOneTimeTasks() {

    updateOneTimeTaskButton(
        "oneTimeYT1",
        oneTimeTasks.yt1
    );

    updateOneTimeTaskButton(
        "oneTimeYT2",
        oneTimeTasks.yt2
    );

    updateOneTimeTaskButton(
        "oneTimeTelegram",
        oneTimeTasks.telegram
    );

}


// =========================================================
// UPDATE ONE-TIME BUTTON
// =========================================================

function updateOneTimeTaskButton(
    elementId,
    completed
) {

    const item =
        document.getElementById(
            elementId
        );


    if (!item) {
        return;
    }


    const button =
        item.querySelector("button");


    if (!button) {
        return;
    }


    if (completed) {

        item.classList.add("completed");

        button.disabled = true;

        button.textContent = "✓ DONE";

    } else {

        item.classList.remove("completed");

        button.disabled = false;

        button.textContent = "START";

    }

}


// =========================================================
// WITHDRAW
// =========================================================

function submitWithdraw() {

    const method =
        document.getElementById(
            "withdrawMethod"
        )?.value;


    const number =
        document.getElementById(
            "withdrawNumber"
        )?.value.trim();


    const amount =
        Number(
            document.getElementById(
                "withdrawAmount"
            )?.value
        );


    if (!number) {

        showToast(
            "⚠️",
            "Enter your payment account number."
        );

        return;

    }


    if (!/^01[0-9]{9}$/.test(number)) {

        showToast(
            "⚠️",
            "Enter a valid Bangladesh mobile number."
        );

        return;

    }


    if (!amount || amount <= 0) {

        showToast(
            "⚠️",
            "Enter a valid withdrawal amount."
        );

        return;

    }


    if (amount > userData.balance) {

        showToast(
            "❌",
            "Insufficient balance."
        );

        return;

    }


    userData.balance -= amount;

    userData.pendingBalance += amount;


    saveData();

    updateUserInterface();


    const history =
        document.getElementById(
            "withdrawHistory"
        );


    if (history) {

        history.innerHTML = `

            <div class="notification-item">

                <span>🕐</span>

                <div>

                    <strong>
                        Withdrawal Pending
                    </strong>

                    <small>
                        ${method.toUpperCase()}
                        • ${number}
                        • ৳${amount.toFixed(2)}
                    </small>

                </div>

            </div>

        `;

    }


    showToast(
        "💵",
        "Withdrawal request submitted."
    );

}


// =========================================================
// COPY REFERRAL
// =========================================================

async function copyReferral() {

    const input =
        document.getElementById(
            "referralLink"
        );


    if (!input) {
        return;
    }


    try {

        await navigator.clipboard.writeText(
            input.value
        );

        showToast(
            "📋",
            "Referral link copied."
        );

    } catch (error) {

        input.select();

        document.execCommand(
            "copy"
        );

        showToast(
            "📋",
            "Referral link copied."
        );

    }

}


// =========================================================
// SHARE REFERRAL
// =========================================================

function shareReferral() {

    const link =
        document.getElementById(
            "referralLink"
        )?.value;


    const text =
        "Join AG EARN HUB and complete earning tasks!";


    if (
        tg &&
        tg.openTelegramLink
    ) {

        const url =
            "https://t.me/share/url?url=" +
            encodeURIComponent(link) +
            "&text=" +
            encodeURIComponent(text);


        tg.openTelegramLink(url);

        return;

    }


    if (
        navigator.share
    ) {

        navigator.share({

            title: "AG EARN HUB",

            text: text,

            url: link

        }).catch(() => {});

        return;

    }


    copyReferral();

}


// =========================================================
// NOTIFICATIONS
// =========================================================

function notifyNewTaskCompletion() {

    const badge =
        document.getElementById(
            "notificationBadge"
        );


    if (badge) {

        badge.textContent = "1";

        badge.style.display = "flex";

    }

}


// =========================================================
// CLEAR NOTIFICATIONS
// =========================================================

function clearNotifications() {

    const badge =
        document.getElementById(
            "notificationBadge"
        );


    if (badge) {

        badge.textContent = "0";

        badge.style.display = "none";

    }


    showToast(
        "✓",
        "Notifications cleared."
    );

}


// =========================================================
// TOAST
// =========================================================

let toastTimer = null;


function showToast(
    icon,
    message
) {

    const toast =
        document.getElementById(
            "toast"
        );


    const toastIcon =
        document.getElementById(
            "toastIcon"
        );


    const toastMessage =
        document.getElementById(
            "toastMessage"
        );


    if (
        !toast ||
        !toastIcon ||
        !toastMessage
    ) {
        return;
    }


    toastIcon.textContent =
        icon;


    toastMessage.textContent =
        message;


    toast.classList.add("show");


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(() => {

            toast.classList.remove(
                "show"
            );

        }, 2800);

}


// =========================================================
// LOADING SCREEN
// =========================================================

function hideLoadingScreen() {

    const loading =
        document.getElementById(
            "loadingScreen"
        );


    if (!loading) {
        return;
    }


    setTimeout(() => {

        loading.classList.add(
            "hidden"
        );

    }, 700);

}


// =========================================================
// RIPPLE EFFECT
// =========================================================

function setupRippleEffect() {

    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "button"
                );


            if (!button) {
                return;
            }


            const ripple =
                document.createElement(
                    "span"
                );


            ripple.className =
                "ripple";


            const rect =
                button.getBoundingClientRect();


            const size =
                Math.max(
                    rect.width,
                    rect.height
                );


            ripple.style.width =
                size + "px";


            ripple.style.height =
                size + "px";


            ripple.style.left =
                (
                    event.clientX -
                    rect.left -
                    size / 2
                ) + "px";


            ripple.style.top =
                (
                    event.clientY -
                    rect.top -
                    size / 2
                ) + "px";


            button.style.position =
                "relative";


            button.style.overflow =
                "hidden";


            button.appendChild(
                ripple
            );


            setTimeout(() => {

                ripple.remove();

            }, 600);

        }
    );

}


// =========================================================
// SAVE DATA
// =========================================================

function saveData() {

    try {

        localStorage.setItem(
            "agEarnHubData",
            JSON.stringify(userData)
        );

        localStorage.setItem(
            "agEarnHubOneTimeTasks",
            JSON.stringify(oneTimeTasks)
        );

    } catch (error) {

        console.log(
            "Could not save data:",
            error
        );

    }

}


// =========================================================
// LOAD DATA
// =========================================================

function loadSavedData() {

    try {

        const savedData =
            localStorage.getItem(
                "agEarnHubData"
            );


        if (savedData) {

            const parsed =
                JSON.parse(
                    savedData
                );


            Object.assign(
                userData,
                parsed
            );

        }


        const savedOneTimeTasks =
            localStorage.getItem(
                "agEarnHubOneTimeTasks"
            );


        if (savedOneTimeTasks) {

            const parsedOneTime =
                JSON.parse(
                    savedOneTimeTasks
                );


            Object.assign(
                oneTimeTasks,
                parsedOneTime
            );

        }

    } catch (error) {

        console.log(
            "Could not load saved data:",
            error
        );

    }

}


// =========================================================
// ESCAPE HTML
// =========================================================

function escapeHTML(value) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        String(value);


    return div.innerHTML;

}


// =========================================================
// PREVENT DOUBLE TAP ZOOM
// =========================================================

let lastTouchEnd = 0;

document.addEventListener(
    "touchend",
    event => {

        const now =
            Date.now();


        if (
            now - lastTouchEnd <= 300
        ) {

            event.preventDefault();

        }


        lastTouchEnd =
            now;

    },
    {
        passive: false
    }
);


// =========================================================
// VISIBILITY CHANGE
// =========================================================

document.addEventListener(
    "visibilitychange",
    () => {

        if (
            document.visibilityState === "hidden"
        ) {

            saveData();

        }

    }
);


// =========================================================
// BEFORE UNLOAD
// =========================================================

window.addEventListener(
    "beforeunload",
    () => {

        saveData();

    }
);


// =========================================================
// MIDNIGHT / NEW DAY CHECK
// =========================================================

let currentDay =
    new Date().toDateString();


setInterval(() => {

    const newDay =
        new Date().toDateString();


    if (
        newDay !== currentDay
    ) {

        currentDay =
            newDay;


        userData.todayWorkSeconds = 0;

        userData.todaySessions = 0;

        sessionSeconds = 0;


        saveData();

        updateUserInterface();

        updateWorkTimerDisplay();


        showToast(
            "📅",
            "New day started. Work time reset."
        );

    }

}, 60000);


// =========================================================
// TASK PAGE AUTO REFRESH
// =========================================================

setInterval(() => {

    const tasksPage =
        document.getElementById(
            "tasksPage"
        );


    if (
        tasksPage &&
        tasksPage.classList.contains("active")
    ) {

        updateUserInterface();

    }

}, 5000);


// =========================================================
// TELEGRAM BACK BUTTON
// =========================================================

if (tg) {

    try {

        tg.BackButton.onClick(() => {

            const activePage =
                document.querySelector(
                    ".page.active"
                );


            if (
                activePage &&
                activePage.id !== "homePage"
            ) {

                goHome();

            } else {

                tg.close();

            }

        });


        tg.BackButton.show();

    } catch (error) {

        console.log(
            "Telegram BackButton:",
            error
        );

    }

}


// =========================================================
// INITIAL PAGE
// =========================================================

openPage("homePage");


// =========================================================
// END
// =========================================================
