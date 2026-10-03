// =====================================
// AG EARN HUB - SCRIPT
// =====================================

function showPage(pageId, button) {

    const pages = document.querySelectorAll(".page");

    pages.forEach(function(page) {
        page.classList.remove("active");
    });


    const selectedPage = document.getElementById(pageId);

    if (selectedPage) {
        selectedPage.classList.add("active");
    }


    const navButtons = document.querySelectorAll(".nav button");

    navButtons.forEach(function(btn) {
        btn.classList.remove("active");
    });


    if (button) {
        button.classList.add("active");
    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// =====================================
// QUICK MENU
// =====================================

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


// =====================================
// REFERRAL COPY
// =====================================

function copyRef() {

    const referralLink =
        "https://t.me/agearnhub_bot?start=AG123456";


    if (navigator.clipboard) {

        navigator.clipboard.writeText(referralLink)
            .then(function() {
                alert("Referral link copied!");
            })
            .catch(function() {
                alert(referralLink);
            });

    } else {

        alert(referralLink);

    }
}


// =====================================
// DAILY BONUS
// =====================================

let bonusClaimed = false;


function claimBonus() {

    if (bonusClaimed) {

        alert("Today's bonus has already been claimed.");

        return;
    }


    bonusClaimed = true;


    const button = document.querySelector(".bonus-btn");


    if (button) {

        button.innerText = "Claimed ✓";

        button.disabled = true;

    }


    alert("🎉 Bonus claimed successfully!");
}


// =====================================
// TASK CLAIM
// =====================================

function claimTask(button, reward) {

    if (!button) {
        return;
    }


    button.disabled = true;

    button.innerText = "Completed ✓";


    alert(
        "🎉 Task completed! +" +
        reward +
        " coins"
    );
}


// =====================================
// STARTUP
// =====================================

document.addEventListener("DOMContentLoaded", function() {

    const home = document.getElementById("home");


    if (home) {
        home.classList.add("active");
    }


    console.log("AG EARN HUB loaded successfully 🚀");

});
