// ==================== STATE ====================
let userData = {
  balance: 0,
  totalEarned: 0,
  referrals: 0,
  referralEarnings: 0,
  name: 'User Name',
  username: '@user123456'
};

let selectedPayment = 'bkash';

// ==================== AD NETWORK INTEGRATION POINTS ====================
/*
 * ============================================
 *  AD NETWORK INTEGRATION GUIDE
 * ============================================
 * 
 * 1. Banner Ads:
 *    - Home:    #ad-home-banner
 *    - Withdraw:#ad-withdraw-banner
 *    - Refer:   #ad-refer-banner
 * 
 * 2. Rewarded Video (Tasks):
 *    - Call showRewardedAd(callback) when user starts a video task
 * 
 * 3. Recommended Networks for Telegram Mini Apps / Web:
 *    - Google AdMob (Web)
 *    - Unity Ads
 *    - AppLovin MAX
 *    - ironSource
 *    - Monetag / PropellerAds (for web)
 * 
 * 4. Example Integration (AdMob Rewarded):
 * 
 *    function showRewardedAd(onSuccess) {
 *      // Load & show rewarded ad
 *      // On complete: onSuccess();
 *    }
 * 
 * 5. For Telegram Mini App:
 *    - Use Telegram.WebApp for haptic & theme
 *    - Ads work best with external browser or WebView support
 */

// Dummy Rewarded Ad function (replace with real ad network)
function showRewardedAd(onReward) {
  showToast('🎬 Loading Rewarded Ad...');
  
  // Simulate ad loading & watching (2 seconds)
  setTimeout(() => {
    showToast('✅ Ad completed! Reward granted');
    if (typeof onReward === 'function') onReward();
  }, 2000);
  
  // REAL INTEGRATION EXAMPLE:
  // if (window.adNetwork) {
  //   window.adNetwork.showRewarded({
  //     onComplete: onReward,
  //     onError: () => showToast('Ad failed to load')
  //   });
  // }
}

// Load Banner Ads (call this after ad network SDK loads)
function loadBannerAds() {
  // Example:
  // document.getElementById('ad-home-banner').innerHTML = realAdHtml;
  console.log('Ad Network: Banner slots ready for integration');
}

// ==================== NAVIGATION ====================
function switchScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');

  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelector(`.nav-item[data-screen="${screenId}"]`).classList.add('active');

  // Optional: Telegram haptic
  if (window.Telegram?.WebApp?.HapticFeedback) {
    Telegram.WebApp.HapticFeedback.impactOccurred('light');
  }
}

// ==================== TASKS ====================
function filterTasks(status, btn) {
  document.querySelectorAll('.task-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');

  document.querySelectorAll('.task-card').forEach(card => {
    if (status === 'available' || card.dataset.status === status) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

function startTask(taskId, reward) {
  // For video tasks → show rewarded ad first
  if (taskId === 1) {
    showRewardedAd(() => {
      completeTask(taskId, reward);
    });
  } else {
    completeTask(taskId, reward);
  }
}

function completeTask(taskId, reward) {
  userData.balance += reward;
  userData.totalEarned += reward;
  updateUI();
  showToast(`🎉 Task completed! +৳ ${reward}`);
  
  // Mark task as completed visually (demo)
  const cards = document.querySelectorAll('.task-card');
  if (cards[taskId - 1]) {
    cards[taskId - 1].dataset.status = 'completed';
    cards[taskId - 1].querySelector('.task-badge').textContent = 'Completed';
    cards[taskId - 1].querySelector('.task-badge').style.background = 'rgba(0,230,118,0.15)';
    cards[taskId - 1].querySelector('.start-btn').disabled = true;
    cards[taskId - 1].querySelector('.start-btn').textContent = 'Completed';
  }
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
    showToast('⚠️ Minimum withdrawal is ৳ 50');
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

  userData.balance -= amount;
  updateUI();
  showToast(`✅ Withdrawal request of ৳ ${amount} submitted via ${selectedPayment.toUpperCase()}`);
  
  // Clear inputs
  document.getElementById('withdraw-amount').value = '';
  document.getElementById('withdraw-mobile').value = '';
}

// ==================== REFER ====================
function copyReferral() {
  const link = document.getElementById('ref-link').textContent;
  navigator.clipboard.writeText(link).then(() => {
    showToast('📋 Referral link copied!');
  }).catch(() => {
    showToast('📋 Link: ' + link);
  });
}

function shareReferral() {
  const link = document.getElementById('ref-link').textContent;
  const text = `🚀 Join AG EARN HUB & earn money by completing simple tasks!\n\n${link}`;
  
  if (navigator.share) {
    navigator.share({ title: 'AG EARN HUB', text, url: link });
  } else if (window.Telegram?.WebApp) {
    // Telegram share
    Telegram.WebApp.openTelegramLink(`https://t.me/share/url?url=\( {encodeURIComponent(link)}&text= \){encodeURIComponent(text)}`);
  } else {
    copyReferral();
  }
}

// ==================== UI UPDATE ====================
function updateUI() {
  const bal = `৳ ${userData.balance.toFixed(2)}`;
  const earned = `৳ ${userData.totalEarned.toFixed(2)}`;
  
  document.getElementById('home-balance').textContent = bal;
  document.getElementById('home-earned').textContent = earned;
  document.getElementById('home-refs').textContent = userData.referrals;
  
  document.getElementById('withdraw-balance').textContent = bal;
  
  document.getElementById('ref-count').textContent = userData.referrals;
  document.getElementById('ref-earn').textContent = `৳ ${userData.referralEarnings.toFixed(2)}`;
  
  document.getElementById('profile-balance').textContent = bal;
  document.getElementById('profile-earned').textContent = earned;
  document.getElementById('profile-refs').textContent = userData.referrals;
}

// ==================== TOAST ====================
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

// ==================== TELEGRAM WEBAPP INIT ====================
function initTelegram() {
  if (window.Telegram?.WebApp) {
    const tg = Telegram.WebApp;
    tg.ready();
    tg.expand();
    tg.setHeaderColor('#0a0e1a');
    tg.setBackgroundColor('#060b1a');
    
    // Get user data from Telegram
    if (tg.initDataUnsafe?.user) {
      const user = tg.initDataUnsafe.user;
      userData.name = user.first_name + (user.last_name ? ' ' + user.last_name : '');
      userData.username = user.username ? '@' + user.username : '@user' + user.id;
      document.getElementById('profile-name').textContent = userData.name;
      document.querySelector('.user-handle').textContent = userData.username;
    }
  }
}

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', () => {
  initTelegram();
  updateUI();
  loadBannerAds(); // Ad Network ready
});
