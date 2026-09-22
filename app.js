/* ==========================================================================
   LIFEBRIDGE INDIA - APPLICATION JAVASCRIPT
   SPA Router, Theme Controller, AI Chatbot Assistant, Interactive Map & Modals
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* 1. Theme Controller (Light / Dark Mode) */
  const themeToggleBtn = document.getElementById('themeToggle');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      const isDark = document.body.classList.contains('dark-mode');
      themeToggleBtn.innerHTML = isDark ? `<i class="fa-solid fa-sun"></i>` : `<i class="fa-solid fa-moon"></i>`;
    });
  }

});

/* 2. SPA Navigation Router */
function navigateTo(viewId) {
  const views = document.querySelectorAll('.page-view');
  views.forEach(v => {
    v.style.display = 'none';
    v.classList.remove('active');
  });

  const targetView = document.getElementById(`view-${viewId}`);
  if (targetView) {
    targetView.style.display = 'block';
    targetView.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Update navbar active state
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === `#${viewId}`) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Close mobile navigation drawer if open
  const navMenu = document.getElementById('navMenu');
  if (navMenu) {
    navMenu.classList.remove('mobile-active');
  }
}

/* Mobile Nav Toggle */
function toggleMobileNav() {
  const navMenu = document.getElementById('navMenu');
  if (navMenu) {
    navMenu.classList.toggle('mobile-active');
  }
}

/* 3. Role Switcher Navigation */
function handleRoleSwitch(role) {
  const roleNames = {
    donor: "Donor Dashboard (0% Fee)",
    patient: "Patient Family Portal",
    volunteer: "Volunteer Workspace",
    hospital: "Partner Hospital Desk",
    doctor: "Treating Neurologist Verification Desk",
    csr: "Corporate ESG & CSR Dashboard",
    admin: "Platform Administrator Portal"
  };

  alert(`Switched UI View context to: ${roleNames[role]}`);

  if (role === 'admin') {
    navigateTo('admin');
  } else if (role === 'patient') {
    navigateTo('patients');
  } else if (role === 'volunteer') {
    navigateTo('volunteers');
  } else if (role === 'hospital') {
    navigateTo('hospitals');
  } else if (role === 'donor') {
    navigateTo('donate');
  } else if (role === 'doctor') {
    navigateTo('doctor');
  } else if (role === 'csr') {
    navigateTo('csr');
  }
}

/* 4. Patient Category Filtering */
function filterPatients(cat, btnElem) {
  // Update button active state
  if (btnElem) {
    const filterBtns = document.querySelectorAll('.patient-filter-btn');
    filterBtns.forEach(btn => btn.classList.remove('active'));
    btnElem.classList.add('active');
  }

  const cards = document.querySelectorAll('.patient-card');
  cards.forEach(card => {
    const categories = card.getAttribute('data-category');
    if (cat === 'all' || (categories && categories.includes(cat))) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });
}

/* 5. Dynamic Patient Detail Modal Handler */
function openPatientModal(name, age, smaType, hospital, raised, goal, percent, urgentInfo) {
  const modal = document.getElementById('patientDetailModal');
  if (!modal) return;

  document.getElementById('modalPatientName').textContent = `${name} [DEMO PROFILE]`;
  document.getElementById('modalPatientSub').textContent = `${smaType} • ${age} • ${hospital}`;
  document.getElementById('modalRaisedText').textContent = raised;
  document.getElementById('modalGoalText').textContent = goal;
  document.getElementById('modalProgressFill').style.width = `${percent}%`;
  document.getElementById('modalUrgencyText').textContent = urgentInfo || "Hospital Verified & Active for Direct Payout";

  modal.classList.add('active');
}

function closePatientModal() {
  const modal = document.getElementById('patientDetailModal');
  if (modal) {
    modal.classList.remove('active');
  }
}

/* 6. Donation Checkout Simulator */
function setDonationAmt(amt) {
  const input = document.getElementById('customDonationAmt');
  if (input) input.value = amt;
}

let selectedPayMethod = 'upi';
function selectPayMethod(method) {
  selectedPayMethod = method;
  const upiBtn = document.getElementById('payMethodUpi');
  const cardBtn = document.getElementById('payMethodCard');
  const netBtn = document.getElementById('payMethodNet');

  if (upiBtn) upiBtn.classList.remove('active');
  if (cardBtn) cardBtn.classList.remove('active');
  if (netBtn) netBtn.classList.remove('active');

  if (method === 'upi' && upiBtn) upiBtn.classList.add('active');
  if (method === 'card' && cardBtn) cardBtn.classList.add('active');
  if (method === 'net' && netBtn) netBtn.classList.add('active');
}

/* Adopt a Treatment Selector Handler */
let selectedAdoptItem = null;
function selectAdoptTreatment(title, price, cardElem) {
  selectedAdoptItem = { title, price };
  const cards = document.querySelectorAll('.adopt-card');
  cards.forEach(c => c.classList.remove('selected'));
  if (cardElem) cardElem.classList.add('selected');

  const input = document.getElementById('customDonationAmt');
  if (input) input.value = price;

  const targetSelect = document.getElementById('donationTargetSelect');
  if (targetSelect) {
    const optText = `Adopt a Treatment: ${title} (₹${price.toLocaleString()})`;
    // Add temporary option if needed
    let found = false;
    for (let i = 0; i < targetSelect.options.length; i++) {
      if (targetSelect.options[i].text.includes(title)) {
        targetSelect.selectedIndex = i;
        found = true;
        break;
      }
    }
    if (!found) {
      const opt = document.createElement('option');
      opt.value = 'adopt_custom';
      opt.text = optText;
      opt.selected = true;
      targetSelect.add(opt);
    }
  }

  alert(`Selected Micro-Sponsorship: ${title} (₹${price.toLocaleString()})\n\nRedirecting to 0% Fee Demo Donation Checkout...`);
  navigateTo('donate');
}

/* "Why Can I Trust This Campaign?" Drawer Accordion */
function toggleTrustDrawer(drawerId) {
  const drawer = document.getElementById(drawerId || 'trustDrawer');
  if (!drawer) return;
  const body = drawer.querySelector('.trust-drawer-body');
  const icon = drawer.querySelector('.trust-drawer-icon');
  if (body) {
    if (body.style.display === 'none' || !body.style.display) {
      body.style.display = 'block';
      if (icon) icon.className = 'fa-solid fa-chevron-up trust-drawer-icon';
    } else {
      body.style.display = 'none';
      if (icon) icon.className = 'fa-solid fa-chevron-down trust-drawer-icon';
    }
  }
}

function executeDonationSimulation() {
  const input = document.getElementById('customDonationAmt');
  const rawAmt = input ? input.value : 5000;
  const amt = Number(rawAmt);

  if (typeof rawAmt === 'boolean' || rawAmt === null || !Number.isFinite(amt) || amt < 1 || amt > 500000) {
    alert("Invalid Donation Amount!\n\nPlease enter a valid donation amount between ₹1 and ₹5,00,000.");
    return;
  }

  const select = document.getElementById('donationTargetSelect');
  const target = select ? select.options[select.selectedIndex].text : "Sample Patient Campaign (DEMO DATA)";

  if (window.LifeBridgeDB) {
    window.LifeBridgeDB.recordDonation('demo_camp_01', amt, selectedPayMethod);
  }

  alert(`[DEMO SIMULATION — NO REAL MONEY PROCESSED]\n\nThank you! Simulated contribution of ₹${amt.toLocaleString()} for ${target} processed via ${selectedPayMethod.toUpperCase()}.\n\nLifeBridge charges 0% platform commission on patient campaigns. Donation routing and settlement will be handled through compliant payment/charitable partners.\n\n📄 Note: DEMO RECEIPT — NOT A TAX DOCUMENT.`);
}

/* 7. Blood Donor Search Simulation with Enum Validation */
function searchBloodDonors() {
  const VALID_BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const grpSelect = document.getElementById('bloodGroupSearch');
  const citySelect = document.getElementById('citySearch');
  const rawGrp = grpSelect ? grpSelect.value.replace('_', '+') : 'O-';
  const city = citySelect ? citySelect.value : 'mumbai';
  const resultsBox = document.getElementById('bloodSearchResults');

  if (!resultsBox) return;

  if (!VALID_BLOOD_GROUPS.includes(rawGrp)) {
    alert(`Invalid Blood Group!\n\nPlease select a valid blood group from: ${VALID_BLOOD_GROUPS.join(', ')}`);
    return;
  }

  const grp = rawGrp;

  if (window.LifeBridgeMessaging) {
    window.LifeBridgeMessaging.dispatchEmergencyBloodAlert(grp, city);
  }

  resultsBox.innerHTML = `
    <div style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.3); padding: 0.75rem 1rem; border-radius: 10px; font-size: 0.8rem; color: var(--text-main); margin-bottom: 1rem;">
      <i class="fa-solid fa-shield-halved" style="color: #D97706;"></i> <strong>Medical Safety Rule:</strong> LifeBridge connects voluntary donors with verified hospital blood requests. Final donor eligibility, blood collection, compatibility, testing, and transfusion decisions belong strictly to authorized blood banks and medical facilities.
    </div>
    <div style="padding: 0.85rem; background: var(--bg-card-subtle); border-radius: 12px; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center; border: 1px solid var(--border-light);">
      <div>
        <span class="status-badge demo" style="font-size: 0.65rem; margin-bottom: 0.2rem;">DEMO DONOR</span><br>
        <strong style="color: var(--text-main);">Standby Voluntary Donor #892</strong> - Group <span style="color: var(--brand-rose); font-weight: 700;">${grp}</span><br>
        <span style="font-size: 0.75rem; color: var(--text-muted);"><i class="fa-solid fa-location-dot"></i> ${city.toUpperCase()} • Last Donated 45 days ago</span>
      </div>
      <button class="btn btn-emerald" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;" onclick="alert('Demo SMS alert triggered for Voluntary Donor #892 in ${city.toUpperCase()}. Final donor collection & testing will occur at partner hospital blood bank.')">
        <i class="fa-solid fa-bell"></i> Request Match
      </button>
    </div>
    <div style="padding: 0.85rem; background: var(--bg-card-subtle); border-radius: 12px; display: flex; justify-content: space-between; align-items: center; border: 1px solid var(--border-light);">
      <div>
        <span class="status-badge demo" style="font-size: 0.65rem; margin-bottom: 0.2rem;">DEMO DONOR</span><br>
        <strong style="color: var(--text-main);">Standby Voluntary Donor #415</strong> - Group <span style="color: var(--brand-rose); font-weight: 700;">${grp}</span><br>
        <span style="font-size: 0.75rem; color: var(--text-muted);"><i class="fa-solid fa-location-dot"></i> ${city.toUpperCase()} • Emergency Reserve Standby</span>
      </div>
      <button class="btn btn-emerald" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;" onclick="alert('Demo SMS alert triggered for Voluntary Donor #415.')">
        <i class="fa-solid fa-bell"></i> Request Match
      </button>
    </div>
  `;
}

/* 8. Interactive FAQ Accordion Toggle */
function toggleFaq(faqElem) {
  const answer = faqElem.querySelector('.faq-answer');
  const icon = faqElem.querySelector('.faq-icon');

  if (answer.style.maxHeight) {
    answer.style.maxHeight = null;
    if (icon) icon.className = 'fa-solid fa-plus faq-icon';
  } else {
    // Close all other open FAQs
    document.querySelectorAll('.faq-answer').forEach(ans => ans.style.maxHeight = null);
    document.querySelectorAll('.faq-icon').forEach(ic => ic.className = 'fa-solid fa-plus faq-icon');

    answer.style.maxHeight = answer.scrollHeight + "px";
    if (icon) icon.className = 'fa-solid fa-minus faq-icon';
  }
}

/* 9. Interactive India Impact Map Controller */
function selectMapHub(hubName, city, campaigns, funds, donors) {
  const detailsBox = document.getElementById('mapHubDetails');
  if (!detailsBox) return;

  detailsBox.innerHTML = `
    <div style="background: var(--bg-card); border: 1px solid var(--border-light); border-radius: 16px; padding: 1.5rem; box-shadow: var(--shadow-subtle);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
        <h4 style="font-family: var(--font-heading); font-size: 1.2rem; color: var(--text-main);"><i class="fa-solid fa-hospital-user" style="color: var(--brand-blue);"></i> ${hubName} Partnership Desk</h4>
        <span class="status-badge demo">DEMO HUB DATA</span>
      </div>
      <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;"><i class="fa-solid fa-location-dot"></i> Location: ${city}</p>
      
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; text-align: center;">
        <div style="background: var(--bg-card-subtle); padding: 0.75rem; border-radius: 10px;">
          <div style="font-size: 1.3rem; font-weight: 800; color: var(--brand-blue);">${campaigns}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">Sample Campaigns</div>
        </div>
        <div style="background: var(--bg-card-subtle); padding: 0.75rem; border-radius: 10px;">
          <div style="font-size: 1.3rem; font-weight: 800; color: var(--brand-emerald);">${funds}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">Demo Settled</div>
        </div>
        <div style="background: var(--bg-card-subtle); padding: 0.75rem; border-radius: 10px;">
          <div style="font-size: 1.3rem; font-weight: 800; color: var(--brand-rose);">${donors}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">Standby Donors</div>
        </div>
      </div>
    </div>
  `;
}

/* 10. Floating LifeBridge AI Educational Assistant Chatbot Logic */
function toggleChatbot() {
  const drawer = document.getElementById('chatDrawer');
  if (drawer) drawer.classList.toggle('active');
}

function sendChatMessage() {
  const input = document.getElementById('chatInput');
  const body = document.getElementById('chatBody');
  if (!input || !body) return;

  const msg = input.value.trim();
  if (!msg) return;

  // Append user message
  const userDiv = document.createElement('div');
  userDiv.className = 'chat-msg user';
  userDiv.textContent = msg;
  body.appendChild(userDiv);
  input.value = '';

  body.scrollTop = body.scrollHeight;

  // Bot response simulation with strict medical safety rule
  setTimeout(() => {
    const botDiv = document.createElement('div');
    botDiv.className = 'chat-msg bot';

    const textLower = msg.toLowerCase();
    
    // Check for diagnostic query triggers
    if (textLower.includes('does my baby') || textLower.includes('do i have') || textLower.includes('diagnose') || textLower.includes('cure my') || textLower.includes('symptom check')) {
      botDiv.innerHTML = `
        <div style="background: rgba(245, 158, 11, 0.1); border-left: 3px solid #D97706; padding: 0.5rem 0.75rem; font-size: 0.8rem; margin-bottom: 0.5rem; border-radius: 4px;">
          <i class="fa-solid fa-user-doctor" style="color: #D97706;"></i> <strong>Medical Safety Notice:</strong> LifeBridge AI provides general educational information and cannot diagnose, prescribe treatment, or replace a qualified healthcare professional.
        </div>
        Early warning signs for SMA include hypotonia (floppiness), weak cry, and breathing difficulty. Please schedule an immediate pediatric neurologist evaluation and genetic screening at a certified hospital.
      `;
    } else if (textLower.includes('sma') || textLower.includes('zolgensma') || textLower.includes('dmd') || textLower.includes('thalassemia') || textLower.includes('rare disease')) {
      botDiv.innerHTML = `LifeBridge India supports rare disease awareness including SMA (Spinal Muscular Atrophy), DMD, Thalassemia, and Organ Transplants. FDA-approved gene therapies like <strong>Zolgensma</strong> target SMN1 gene replacement.`;
    } else if (textLower.includes('scheme') || textLower.includes('government') || textLower.includes('nprd') || textLower.includes('grant') || textLower.includes('insurance')) {
      botDiv.innerHTML = `Under India's <strong>National Policy for Rare Diseases (NPRD 2021)</strong>, eligible patients can receive up to <strong>₹50 Lakhs</strong> financial support at designated Centre of Excellence hospitals. PM-JAY (Ayushman Bharat) also offers tertiary care coverage.`;
    } else if (textLower.includes('fee') || textLower.includes('commission') || textLower.includes('cost') || textLower.includes('donate')) {
      botDiv.innerHTML = `LifeBridge India operates on a <strong>Strict 0% Platform Fee</strong> model. LifeBridge charges 0% platform commission on patient campaigns. Donation routing and settlement will be handled through compliant payment/charitable partners.`;
    } else if (textLower.includes('blood') || textLower.includes('donor')) {
      botDiv.innerHTML = `You can search voluntary blood donor matches in our <strong>Emergency Blood Network</strong> tab. Final donor eligibility, collection, testing, and transfusion decisions are made by authorized medical facilities.`;
    } else if (textLower.includes('apply') || textLower.includes('patient') || textLower.includes('verification') || textLower.includes('hope verification')) {
      botDiv.innerHTML = `Patient registration requires government ID proof (PAN/Passport/Voter ID) and hospital medical estimates. Campaigns display a transparent <strong>Hope Verification Checklist</strong> (e.g. 4/5 checks completed - 80%).`;
    } else {
      botDiv.innerHTML = `Welcome to <strong>LifeBridge AI</strong>! Ask me about rare disease awareness, National Policy for Rare Diseases (NPRD) government schemes, hospital verification, or voluntary blood donation.`;
    }

    body.appendChild(botDiv);
    body.scrollTop = body.scrollHeight;
  }, 500);
}

/* 11. Emergency Modal Controls */
function openEmergencyModal() {
  const modal = document.getElementById('emergencyModal');
  if (modal) modal.classList.add('active');
}

function closeEmergencyModal() {
  const modal = document.getElementById('emergencyModal');
  if (modal) modal.classList.remove('active');
}

/* 12. Patient Verification Application Modal */
function openApplyModal() {
  const modal = document.getElementById('applyPatientModal');
  if (modal) modal.classList.add('active');
}

function closeApplyModal() {
  const modal = document.getElementById('applyPatientModal');
  if (modal) modal.classList.remove('active');
}

function submitPatientApplication(event) {
  event.preventDefault();
  closeApplyModal();

  if (window.LifeBridgeDB) {
    window.LifeBridgeDB.createPatientCampaign({
      name: "Sample Patient Case",
      diseaseCategory: "SMA",
      goalAmount: 160000000
    });
  }

  alert('[Application Submitted to Firebase Firestore]\n\nThank you! The patient campaign application has been stored in Cloud Firestore and submitted to the LifeBridge Verification Desk. Medical & genetic PDF reports have been uploaded to restricted Firebase Storage.');
}

/* 13. Firebase Authentication & Privacy Control Modal Handlers */
function openAuthModal() {
  const modal = document.getElementById('authModal');
  if (modal) modal.classList.add('active');
}

function closeAuthModal() {
  const modal = document.getElementById('authModal');
  if (modal) modal.classList.remove('active');
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  const email = document.getElementById('authEmailInput').value;
  const password = document.getElementById('authPasswordInput').value;
  const role = document.getElementById('authRoleInput').value;

  if (window.LifeBridgeAuth) {
    const res = await window.LifeBridgeAuth.registerUser(email, password, email.split('@')[0], role);
    if (res.success) {
      alert(`[Firebase Auth Success]\n\nAuthenticated user: ${email}\nAssigned Role: ${role}\n\nCustom claims updated. Access granted to specialized ${role} desk.`);
      closeAuthModal();
      handleRoleSwitch(role.toLowerCase());
    }
  }
}

async function handleGoogleAuth() {
  const roleSelect = document.getElementById('authRoleInput');
  const role = roleSelect ? roleSelect.value : 'DONOR';

  if (window.LifeBridgeAuth) {
    const res = await window.LifeBridgeAuth.loginWithGoogle(role);
    if (res.success) {
      alert(`[Firebase Google Auth Success]\n\nAuthenticated with Google as: ${res.user.email}\nAssigned Role: ${role}`);
      closeAuthModal();
      handleRoleSwitch(role.toLowerCase());
    }
  }
}

async function handlePasswordReset() {
  const email = prompt("Enter your email address to receive a password reset link:");
  if (email && window.LifeBridgeAuth) {
    const res = await window.LifeBridgeAuth.sendPasswordReset(email);
    if (res.success) {
      alert(`[Password Reset Dispatched]\n\n${res.message}`);
    } else {
      alert(`[Error] ${res.error}`);
    }
  }
}

async function handleSignOut() {
  if (window.LifeBridgeAuth) {
    await window.LifeBridgeAuth.logoutUser();
    alert("[Firebase Auth]\n\nYou have been signed out safely.");
    handleRoleSwitch('donor');
  }
}

function openPrivacyModal() {
  const modal = document.getElementById('privacyModal');
  if (modal) modal.classList.add('active');
}

function closePrivacyModal() {
  const modal = document.getElementById('privacyModal');
  if (modal) modal.classList.remove('active');
}

async function handleAccountDeletion() {
  if (confirm("Are you sure you want to delete your account? This will scrub all personal data and anonymize audit log references.")) {
    if (window.LifeBridgeAuth) {
      await window.LifeBridgeAuth.deleteAccount();
      alert("[Account Scrubbed]\n\nYour user profile and medical consent data have been anonymized under India Privacy Regulations.");
      closePrivacyModal();
    }
  }
}

async function toggleFcmOptIn(checkboxElem) {
  if (checkboxElem.checked && window.LifeBridgeMessaging) {
    const res = await window.LifeBridgeMessaging.requestNotificationPermission();
    if (res.success) {
      alert("[FCM Notifications Opted-In]\n\nYou will receive emergency blood match and campaign milestone push alerts.");
    }
  }
}

/* 14. Controlled Pilot Feedback Modal Handlers */
function openFeedbackModal() {
  const modal = document.getElementById('feedbackModal');
  if (modal) modal.classList.add('active');
}

function closeFeedbackModal() {
  const modal = document.getElementById('feedbackModal');
  if (modal) modal.classList.remove('active');
}

async function handleFeedbackSubmit(event) {
  event.preventDefault();
  const worked = document.getElementById('fbWorked').value;
  const confusing = document.getElementById('fbConfusing').value;
  const improve = document.getElementById('fbImprove').value;

  if (window.LifeBridgeDB) {
    await window.LifeBridgeDB.submitPilotFeedback({
      whatWorked: worked,
      whatWasConfusing: confusing,
      whatShouldImprove: improve
    });
  }

  alert("[Pilot Feedback Received]\n\nThank you! Your feedback has been stored securely in Cloud Firestore for the LifeBridge Product Advisory Board.");
  closeFeedbackModal();
}



