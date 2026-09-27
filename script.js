// ==================== CONFIG ====================
const API_BASE = "https://ag-earn-hub-1.onrender.com";

// ==================== STATE ====================
let userData = {
  id: null,
  balance: 0,
  totalEarned: 0,
  referrals: 0,
  referralEarnings: 0,
  name: 'User Name',
  username: '@user',
  referral_code: '',
  premium: false
};

let selectedPayment = 'bkash';

// ==================== API CALL ====================
async function apiCall(endpoint, method = "GET", body = null) {
  const headers = {
    "Content-Type": "application/json",
  };

  if (window.Telegram?.WebApp?.initData) {
    headers["X-Telegram-Init-Data"] = window.Telegram.WebApp.initData;
  }

  const options = { method, headers };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(`\( {API_BASE} \){endpoint}`, options);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("API Error:", err);
    showToast("নেটওয়ার্ক এরর। আবার চেষ্টা করুন।");
    return { ok: false };
  }
}

// ==================== LOAD USER ====================
async function loadUser() {
  const data = await apiCall("/api/auth", "POST");

  if (data.ok && data.user) {
    const u = data.user;
    userData.id = u.id;
    userData.balance = u.coins || 0;
    userData.name = (u.first_name || "") + (u.last_name ? " " + u.last_name : "");
    userData.username = u.username ? "@" + u.username : "@user" + u.id;
    userData.referral_code = u.referral_code || "";
    userData.premium = u.premium || false;

    updateUI();
    updateProfile();
  } else {
    showToast("লগইন ব্যর্থ। Telegram থেকে আবার খুলুন।");
  }
}

// ==================== UI UPDATE ====================
function updateUI() {
  const bal = `৳ ${Number(userData.balance).toFixed(2)}`;

  const els = {
    'home-balance': bal,
    'home-earned': bal,
    'home-refs': userData.referrals,
    'withdraw-balance': bal,
    'ref-count': userData.referrals,
    'ref-earn': `৳ ${Number(userData.referralEarnings).toFixed(2)}`,
    'profile-balance': bal,
    'profile-earned': bal,
    'profile-refs': userData.referrals
  };

  for (const [id, value] of Object.entries(els)) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }
}

function updateProfile() {
  const nameEl = document.getElementById('profile-name');
  const handleEl = document.querySelector('.user-handle');
  
  if (nameEl) nameEl.textContent = userData.name || "User";
  if (handleEl) handleEl.textContent = userData.username;

  const refLink = document.getElementById('ref-link');
  if (refLink && userData.referral_code) {
    refLink.textContent = `https://t.me/agearnhub_bot?start=${userData.referral_code}`;
  }
}

// ==================== NAVIGATION ====================
function switchScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const screen = document.getElementById(screenId);
  if (screen) screen.classList.add('active');

  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const navBtn = document.querySelector(`.nav-item[data-screen="${screenId}"]`);
  if (navBtn) navBtn.classList.add('active');

  if (window.Telegram?.WebApp?.HapticFeedback) {
    Telegram.WebApp.HapticFeedback.impactOccurred('light');
  }
}

// ==================== TASKS ====================
async function loadTasks() {
  const data = await apiCall("/api/tasks");
  if (!data.ok) return;

  const taskList = document.getElementById('task-list');
  if (!taskList) return;

  taskList.innerHTML = "";

  data.tasks.forEach(task => {
    const isCompleted = task.completed;

    const card = document.createElement('div');
    card.className = 'task-card';
    card.dataset.status = isCompleted ? 'completed' : 'available';

    card.innerHTML = `
      <div class="task-badge">${isCompleted ? 'Completed' : 'Available'}</div>
      <div class="task-header">
        <div class="task-icon yt"><i class="fas fa-ad"></i></div>
        <div class="task-info">
          <h4>${task.title}</h4>
          <div class="task-meta">${task.network} • ৳ ${task.reward}</div>
        </div>
      </div>
      <div class="task-reward">
        <div class="reward-text">Reward: ৳ ${task.reward}</div>
        <button class="start-btn" ${isCompleted ? 'disabled' : ''} 
                onclick="startTask('${task.id}', ${task.reward})">
          ${isCompleted ? 'Completed' : 'Start Task'}
        </button>
      </div>
    `;
    taskList.appendChild(card);
  });
}

async function startTask(taskId, reward) {
  const startRes = await apiCall("/api/tasks/start", "POST", { task_id: taskId });

  if (!startRes.ok) {
    showToast(startRes.message || "টাস্ক স্টার্ট করা যায়নি");
    return;
  }

  showToast("টাস্ক শুরু হয়েছে... ১০ সেকেন্ড অপেক্ষা করুন");

  setTimeout(async () => {
    const completeRes = await apiCall("/api/tasks/complete", "POST", { task_id: taskId });

    if (completeRes.ok) {
      showToast(`🎉 টাস্ক সম্পন্ন! +৳ ${reward}`);
      await loadUser();
      await loadTasks();
    } else {
      showToast(completeRes.message || "টাস্ক কমপ্লিট হয়নি");
    }
  }, 11000);
}

// ==================== WITHDRAW ====================
function selectPayment(el, method) {
  document.querySelectorAll('.pay-method').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  selectedPayment = method;
}

function requestWithdraw() {
  const amount = parseFloat(document.getElementById('withdraw-amount').value);
  const mobile = document.getElementById('withdraw-mobile').value;

  if (!amount || amount < 50) {
    showToast('⚠️ Minimum withdrawal ৳ 50');
    return;
  }
  if (amount > userData.balance) {
    showToast('⚠️ Insufficient balance');
    return;
  }
  if (!mobile || mobile.length < 11) {
    showToast('⚠️ Enter valid mobile number');
    return;
  }

  showToast(`✅ Withdraw request submitted (Backend API শীঘ্রই আসছে)`);
  document.getElementById('withdraw-amount').value = '';
  document.getElementById('withdraw-mobile').value = '';
}

// ==================== REFER ====================
function copyReferral() {
  const link = document.getElementById('ref-link')?.textContent || '';
  navigator.clipboard.writeText(link).then(() => {
    showToast('📋 Referral link copied!');
  }).catch(() => showToast(link));
}

function shareReferral() {
  const link = document.getElementById('ref-link')?.textContent || '';
  const text = `🚀 Join AG EARN HUB & earn money!\n\n${link}`;

  if (window.Telegram?.WebApp) {
    Telegram.WebApp.openTelegramLink(
      `https://t.me/share/url?url=\( {encodeURIComponent(link)}&text= \){encodeURIComponent(text)}`
    );
  } else {
    copyReferral();
  }
}

// ==================== TOAST ====================
function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', async () => {
  if (window.Telegram?.WebApp) {
    const tg = Telegram.WebApp;
    tg.ready();
    tg.expand();
    tg.setHeaderColor('#0a0e1a');
    tg.setBackgroundColor('#060b1a');
  }

  await loadUser();
  await loadTasks();
});
