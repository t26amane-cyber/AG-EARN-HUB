// ================================
// AG EARN HUB - script.js
// ================================

// Page Switch
function showPage(pageId, button) {
    // সব page hide
    const pages = document.querySelectorAll(".page");

    pages.forEach(page => {
        page.classList.remove("active");
    });

    // নির্বাচিত page show
    const selectedPage = document.getElementById(pageId);

    if (selectedPage) {
        selectedPage.classList.add("active");
    }

    // Bottom navigation active state
    const navButtons = document.querySelectorAll(".bottom-nav button");

    navButtons.forEach(btn => {
        btn.classList.remove("active");
    });

    if (button) {
        button.classList.add("active");
    }

    // Page change হলে উপরে নিয়ে যাবে
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ================================
// Referral Link Copy
// ================================

function copyRef() {

    const referralLink =
        "https://t.me/agearnhub_bot?start=AG123456";

    navigator.clipboard.writeText(referralLink)
        .then(() => {

            alert("Referral link copied!");

        })
        .catch(() => {

            // Clipboard কাজ না করলে fallback
            const tempInput = document.createElement("input");

            tempInput.value = referralLink;
            document.body.appendChild(tempInput);

            tempInput.select();
            document.execCommand("copy");

            document.body.removeChild(tempInput);

            alert("Referral link copied!");

        });
}


// ================================
// Quick Menu Buttons
// ================================

function openTasks() {
    showPage("tasks");
}

function openBonus() {
    showPage("bonus");
}

function openBalance() {
    showPage("balance");
}

function openReferral() {
    showPage("referral");
}

function openProfile() {
    showPage("profile");
}


// ================================
// Daily Bonus
// ================================

let bonusClaimed = false;

function claimBonus() {

    if (bonusClaimed) {
        alert("Today's bonus already claimed!");
        return;
    }

    bonusClaimed = true;

    alert("🎁 Bonus claimed successfully!");

    const bonusButton = document.querySelector(".bonus-btn");

    if (bonusButton) {
        bonusButton.innerText = "Claimed ✓";
        bonusButton.disabled = true;
    }
}


// ================================
// Task Claim
// ================================

function claimTask(button, reward = 50) {

    if (!button) return;

    button.disabled = true;
    button.innerText = "Completed ✓";

    alert("🎉 Task completed! +" + reward + " coins");
}


// ================================
// DOM Ready
// ================================

document.addEventListener("DOMContentLoaded", function () {

    // প্রথমে Home page দেখাবে
    const homePage = document.getElementById("home");

    if (homePage) {
        homePage.classList.add("active");
    }

    // প্রথম navigation button active
    const firstNavButton =
        document.querySelector(".bottom-nav button");

    if (firstNavButton) {
        firstNavButton.classList.add("active");
    }

    console.log("AG EARN HUB loaded successfully 🚀");

});
