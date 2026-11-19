/**
 * YUJAMRUTHA - Core Application Script
 * Handles Bilingual switching (EN/KN), navigation, toasts, inquiry modals, WhatsApp integration
 */

// Current selected language, defaulting to English or stored preference
let currentLang = localStorage.getItem('yujamrutha_lang') || 'en';

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initLanguage();
  initNavigation();
  initContactForm();
  initScrollEffects();
  initUrlParamsHandler();
});

/**
 * Initializes and applies the active language
 */
function initLanguage() {
  applyTranslations(currentLang);

  // Attach language toggle button listeners
  const langToggleBtns = document.querySelectorAll('.lang-toggle-btn');
  langToggleBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleLanguage();
    });
  });
}

/**
 * Switches between English ('en') and Kannada ('kn')
 */
function toggleLanguage() {
  currentLang = currentLang === 'en' ? 'kn' : 'en';
  localStorage.setItem('yujamrutha_lang', currentLang);
  applyTranslations(currentLang);
  
  const toastMsg = currentLang === 'kn' 
    ? 'ಭಾಷೆಯನ್ನು ಕನ್ನಡಕ್ಕೆ ಬದಲಾಯಿಸಲಾಗಿದೆ' 
    : 'Language changed to English';
  showToast(toastMsg);
}

/**
 * Updates all DOM elements with data-i18n attributes
 */
function applyTranslations(lang) {
  const dict = translations[lang];
  if (!dict) return;

  // Set html & body classes for font & direction
  document.documentElement.lang = lang;
  if (lang === 'kn') {
    document.body.classList.add('lang-kn');
  } else {
    document.body.classList.remove('lang-kn');
  }

  // Update elements with data-i18n
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = dict[key];
      } else {
        el.textContent = dict[key];
      }
    }
  });

  // Update elements with data-i18n-html (if needed for markup)
  const htmlElements = document.querySelectorAll('[data-i18n-html]');
  htmlElements.forEach(el => {
    const key = el.getAttribute('data-i18n-html');
    if (dict[key]) {
      el.innerHTML = dict[key];
    }
  });

  // Update Language toggle button label
  const toggleLabels = document.querySelectorAll('.lang-toggle-label');
  toggleLabels.forEach(label => {
    label.textContent = lang === 'en' ? 'ಕನ್ನಡ' : 'English';
  });

  // Re-render cart drawer if open or instantiated
  if (typeof updateCartUI === 'function') {
    updateCartUI();
  }
}

/**
 * Navigation & Mobile menu handling
 */
function initNavigation() {
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('open');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !hamburger.contains(e.target) && navMenu.classList.contains('open')) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('open');
      }
    });

    // Close menu when a link is clicked
    const navLinks = navMenu.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('open');
      });
    });
  }

  // Highlight active link according to current page pathname
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

/**
 * Header scroll shadow effect
 */
function initScrollEffects() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

/**
 * Toast Notification system
 */
function showToast(message, duration = 3200) {
  let toastContainer = document.querySelector('.toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D49B24" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
    <span>${message}</span>
  `;

  toastContainer.appendChild(toast);

  // Trigger animation
  setTimeout(() => toast.classList.add('show'), 20);

  // Remove toast after duration
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 350);
  }, duration);
}

/**
 * Contact & Inquiry form handler
 * Prepares direct WhatsApp message to Master Abhinandhan at 9880781965
 */
function initContactForm() {
  const form = document.getElementById('inquiryForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = form.querySelector('[name="name"]')?.value || 'Guest';
    const phone = form.querySelector('[name="phone"]')?.value || 'Not provided';
    const interest = form.querySelector('[name="interest"]')?.value || 'General Inquiry';
    const message = form.querySelector('[name="message"]')?.value || 'Hello, I want more information.';

    const isKn = currentLang === 'kn';
    const greeting = isKn ? 'ನಮಸ್ಕಾರ ಶ್ರೀ ಅಭಿನಂದನ್ ಅವರೇ,' : 'Namaste Master Abhinandhan,';
    const interestLabel = isKn ? 'ಆಸಕ್ತಿಯ ವಿಷಯ:' : 'Interest:';
    const nameLabel = isKn ? 'ಹೆಸರು:' : 'Name:';
    const phoneLabel = isKn ? 'ಮೊಬೈಲ್:' : 'Phone:';
    const messageLabel = isKn ? 'ಸಂದೇಶ:' : 'Message:';

    const waText = `${greeting}%0A%0A` +
      `*Yujamrutha Website Inquiry*%0A` +
      `--------------------------------%0A` +
      `*${nameLabel}* ${encodeURIComponent(name)}%0A` +
      `*${phoneLabel}* ${encodeURIComponent(phone)}%0A` +
      `*${interestLabel}* ${encodeURIComponent(interest)}%0A` +
      `*${messageLabel}* ${encodeURIComponent(message)}%0A%0A` +
      `(Sent from Yujamrutha Yoga & Honey Portal)`;

    const waUrl = `https://wa.me/919880781965?text=${waText}`;

    showToast(isKn ? 'ವಾಟ್ಸಾಪ್‌ಗೆ ಸಂಪರ್ಕಿಸಲಾಗುತ್ತಿದೆ...' : 'Connecting to WhatsApp...');
    window.open(waUrl, '_blank');
  });
}

/**
 * Quick Yoga Class Booking Trigger
 */
/**
 * Synchronize Phone Number to WhatsApp Number when checked
 */
function syncPhoneToWhatsApp(checkbox) {
  const form = checkbox ? checkbox.closest('form') : document.getElementById('yogaRegistrationForm');
  if (!form) return;
  const phoneInput = form.querySelector('[name="phone"]');
  const waInput = form.querySelector('[name="whatsapp"]');
  if (waInput && phoneInput && checkbox.checked) {
    waInput.value = phoneInput.value.trim();
  }
}

/**
 * Quick Yoga Class Booking Trigger
 */
function quickBookClass(batchName) {
  // If we are already on yoga-registration.html
  const regClass = document.getElementById('regClass');
  const regBox = document.getElementById('yogaRegBox');

  if (window.location.pathname.includes('yoga-registration.html') && regClass && regBox) {
    for (let i = 0; i < regClass.options.length; i++) {
      if (regClass.options[i].text.toLowerCase().includes(batchName.toLowerCase()) ||
          regClass.options[i].value.toLowerCase().includes(batchName.toLowerCase())) {
        regClass.selectedIndex = i;
        break;
      }
    }
    regBox.scrollIntoView({ behavior: 'smooth' });
    showToast(`Selected: ${batchName}. Please complete student registration below.`);
    return;
  }

  // If on another page, route directly to the dedicated Yoga Registration page with pre-selected batch
  window.location.href = `yoga-registration.html?batch=${encodeURIComponent(batchName)}`;
}

/**
 * Reads URL search parameters on page load (e.g. ?batch=...) to pre-select options
 */
function initUrlParamsHandler() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const batchParam = urlParams.get('batch');
    if (batchParam) {
      const regClass = document.getElementById('regClass') || document.getElementById('homeRegClass');
      const regBox = document.getElementById('yogaRegBox');
      if (regClass) {
        for (let i = 0; i < regClass.options.length; i++) {
          if (regClass.options[i].text.toLowerCase().includes(batchParam.toLowerCase()) ||
              regClass.options[i].value.toLowerCase().includes(batchParam.toLowerCase())) {
            regClass.selectedIndex = i;
            break;
          }
        }
      }
      if (regBox) {
        setTimeout(() => {
          regBox.scrollIntoView({ behavior: 'smooth' });
        }, 350);
      }
    }
  } catch (err) {
    console.warn('URL params parser error:', err);
  }
}

/**
 * Hub Tab Switcher: Yoga Registration vs Buy Honey
 */
function switchHubTab(tabName, scrollIntoView = false) {
  const yogaBtn = document.getElementById('tabBtnYoga');
  const honeyBtn = document.getElementById('tabBtnHoney');
  const yogaPane = document.getElementById('paneYoga');
  const honeyPane = document.getElementById('paneHoney');
  
  if (!yogaBtn && !honeyBtn) return;

  if (tabName === 'honey') {
    if (honeyBtn) {
      honeyBtn.classList.add('active');
      honeyBtn.setAttribute('aria-selected', 'true');
    }
    if (yogaBtn) {
      yogaBtn.classList.remove('active');
      yogaBtn.setAttribute('aria-selected', 'false');
    }
    if (honeyPane) honeyPane.classList.add('active');
    if (yogaPane) yogaPane.classList.remove('active');
    history.replaceState(null, null, '#honey');
  } else {
    // Default to yoga
    if (yogaBtn) {
      yogaBtn.classList.add('active');
      yogaBtn.setAttribute('aria-selected', 'true');
    }
    if (honeyBtn) {
      honeyBtn.classList.remove('active');
      honeyBtn.setAttribute('aria-selected', 'false');
    }
    if (yogaPane) yogaPane.classList.add('active');
    if (honeyPane) honeyPane.classList.remove('active');
    history.replaceState(null, null, '#yoga');
  }

  if (scrollIntoView) {
    const hub = document.getElementById('services-hub');
    if (hub) {
      hub.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

/**
 * Handles YUJAMRUTHA YOGA STUDENT REGISTRATION FORM Submission (11 Fields)
 */
function submitYogaReg(event) {
  event.preventDefault();
  const form = event.target;

  // 1. Student Name
  const studentName = (form.querySelector('[name="student_name"]')?.value || document.getElementById('regStudentName')?.value || document.getElementById('homeRegStudentName')?.value || '').trim();
  // 2. Parent's Name
  const parentName = (form.querySelector('[name="parent_name"]')?.value || document.getElementById('regParentName')?.value || document.getElementById('homeRegParentName')?.value || 'N/A').trim();
  // 3. Age
  const age = (form.querySelector('[name="age"]')?.value || document.getElementById('regAge')?.value || document.getElementById('homeRegAge')?.value || '').trim();
  // 4. Class / Batch
  const yogaClass = (form.querySelector('[name="yoga_class"]')?.value || document.getElementById('regClass')?.value || document.getElementById('homeRegClass')?.value || '').trim();
  // 5. Address
  const address = (form.querySelector('[name="address"]')?.value || document.getElementById('regAddress')?.value || document.getElementById('homeRegAddress')?.value || '').trim();
  // 6. Phone Number
  const phone = (form.querySelector('[name="phone"]')?.value || document.getElementById('regPhone')?.value || document.getElementById('homeRegPhone')?.value || '').trim();
  // 7. WhatsApp Number
  const whatsapp = (form.querySelector('[name="whatsapp"]')?.value || document.getElementById('regWhatsApp')?.value || document.getElementById('homeRegWhatsApp')?.value || phone).trim();
  // 8. Previous Yoga Experience
  const experience = (form.querySelector('[name="experience"]')?.value || document.getElementById('regExp')?.value || document.getElementById('homeRegExp')?.value || 'Beginner (No prior experience)');
  // 9. Main Goal
  const mainGoal = (form.querySelector('[name="goal"]')?.value || document.getElementById('regGoal')?.value || document.getElementById('homeRegGoal')?.value || 'General Fitness, Stamina & Flexibility');
  // 10. Injury / Health Issues
  const healthIssues = (form.querySelector('[name="health_issues"]')?.value || document.getElementById('regHealthIssues')?.value || document.getElementById('homeRegHealthIssues')?.value || 'None').trim() || 'None';
  // 11. Language
  const language = (form.querySelector('[name="language"]')?.value || document.getElementById('regLanguage')?.value || document.getElementById('homeRegLanguage')?.value || 'Kannada (ಕನ್ನಡ)');

  if (!studentName || !phone) {
    showToast('Please fill in Student Name and Phone Number');
    return;
  }

  const isKn = currentLang === 'kn';
  const greeting = isKn ? 'ನಮಸ್ಕಾರ ಗುರು ಅಭಿನಂದನ್ ಅವರೇ,' : 'Namaste Master Abhinandhan,';
  
  const waText = `${greeting}%0A%0A` +
    `🕉️ *YUJAMRUTHA YOGA*%0A` +
    `*STUDENT REGISTRATION FORM*%0A` +
    `--------------------------------%0A` +
    `1. *Student Name:* ${encodeURIComponent(studentName)}%0A` +
    `2. *Parent's Name:* ${encodeURIComponent(parentName)}%0A` +
    `3. *Age:* ${encodeURIComponent(age)}%0A` +
    `4. *Class / Batch:* ${encodeURIComponent(yogaClass)}%0A` +
    `5. *Address:* ${encodeURIComponent(address)}%0A` +
    `6. *Phone Number:* ${encodeURIComponent(phone)}%0A` +
    `7. *WhatsApp Number:* ${encodeURIComponent(whatsapp)}%0A` +
    `8. *Previous Yoga Experience:* ${encodeURIComponent(experience)}%0A` +
    `9. *Main Goal:* ${encodeURIComponent(mainGoal)}%0A` +
    `10. *Injury / Health Issues:* ${encodeURIComponent(healthIssues)}%0A` +
    `11. *Language:* ${encodeURIComponent(language)}%0A` +
    `--------------------------------%0A` +
    `Please confirm the student admission & batch timings.%0A` +
    `(Sent from Yujamrutha Yoga Registration Portal)`;

  const waUrl = `https://wa.me/919880781965?text=${waText}`;
  showToast(isKn ? 'ವಾಟ್ಸಾಪ್ ಮೂಲಕ ನೋಂದಣಿ ವಿವರ ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ...' : 'Opening WhatsApp with Master Abhinandhan...');
  
  // Open WhatsApp in new tab
  window.open(waUrl, '_blank');

  // Display on-screen confirmation receipt modal
  openRegReceiptModal({
    studentName,
    parentName,
    age,
    yogaClass,
    address,
    phone,
    whatsapp,
    experience,
    mainGoal,
    healthIssues,
    language
  });
}

function openRegReceiptModal(data) {
  let modal = document.getElementById('regReceiptModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'regReceiptModal';
    modal.className = 'reg-modal-backdrop';
    document.body.appendChild(modal);
  }

  const isKn = currentLang === 'kn';
  modal.innerHTML = `
    <div class="reg-modal-card">
      <button class="reg-modal-close" onclick="closeRegModal()" aria-label="Close">&times;</button>
      <div class="reg-modal-header">
        <span class="reg-modal-badge">${isKn ? 'ಯುಜಾಮೃತ ಯೋಗ' : 'YUJAMRUTHA YOGA'}</span>
        <h3 class="reg-modal-title">${isKn ? 'ವಿದ್ಯಾರ್ಥಿ ನೋಂದಣಿ ರಶೀದಿ' : 'Student Registration Acknowledgment'}</h3>
        <p class="reg-modal-sub">${isKn ? 'ಧನ್ಯವಾದಗಳು! ನೋಂದಣಿ ವಿವರಗಳನ್ನು ಗುರು ಅಭಿನಂದನ್ ಅವರಿಗೆ ಕಳುಹಿಸಲಾಗಿದೆ.' : 'Thank you! Your registration details have been submitted to Master Abhinandhan.'}</p>
      </div>

      <table class="reg-receipt-table">
        <tbody>
          <tr><td class="reg-receipt-label">1. Student Name:</td><td class="reg-receipt-val"><strong>${escapeHtml(data.studentName)}</strong></td></tr>
          <tr><td class="reg-receipt-label">2. Parent's Name:</td><td class="reg-receipt-val">${escapeHtml(data.parentName)}</td></tr>
          <tr><td class="reg-receipt-label">3. Age:</td><td class="reg-receipt-val">${escapeHtml(data.age)} Years</td></tr>
          <tr><td class="reg-receipt-label">4. Class / Batch:</td><td class="reg-receipt-val"><strong>${escapeHtml(data.yogaClass)}</strong></td></tr>
          <tr><td class="reg-receipt-label">5. Address:</td><td class="reg-receipt-val">${escapeHtml(data.address)}</td></tr>
          <tr><td class="reg-receipt-label">6. Phone Number:</td><td class="reg-receipt-val">${escapeHtml(data.phone)}</td></tr>
          <tr><td class="reg-receipt-label">7. WhatsApp Number:</td><td class="reg-receipt-val">${escapeHtml(data.whatsapp)}</td></tr>
          <tr><td class="reg-receipt-label">8. Previous Experience:</td><td class="reg-receipt-val">${escapeHtml(data.experience)}</td></tr>
          <tr><td class="reg-receipt-label">9. Main Goal:</td><td class="reg-receipt-val">${escapeHtml(data.mainGoal)}</td></tr>
          <tr><td class="reg-receipt-label">10. Injury / Health:</td><td class="reg-receipt-val">${escapeHtml(data.healthIssues)}</td></tr>
          <tr><td class="reg-receipt-label">11. Language:</td><td class="reg-receipt-val">${escapeHtml(data.language)}</td></tr>
        </tbody>
      </table>

      <div class="reg-modal-actions">
        <button class="btn btn-primary" onclick="window.print()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
          <span>${isKn ? 'ಪ್ರಿಂಟ್ / ಪಿಡಿಎಫ್ ಉಳಿಸಿ' : 'Print / Save Copy'}</span>
        </button>
        <button class="btn btn-secondary" onclick="closeRegModal()">${isKn ? 'ಮುಚ್ಚಿ' : 'Close'}</button>
      </div>
    </div>
  `;
  modal.classList.add('active');
}

function closeRegModal() {
  const modal = document.getElementById('regReceiptModal');
  if (modal) {
    modal.classList.remove('active');
  }
}

// Check URL hash on initial load
window.addEventListener('DOMContentLoaded', () => {
  const hash = window.location.hash.toLowerCase();
  if (hash === '#honey') {
    switchHubTab('honey', false);
  } else if (hash === '#yoga') {
    switchHubTab('yoga', false);
  }
});

// Listen to hash changes (e.g. back/forward button or anchor clicks)
window.addEventListener('hashchange', () => {
  const hash = window.location.hash.toLowerCase();
  if (hash === '#honey') {
    switchHubTab('honey', true);
  } else if (hash === '#yoga') {
    switchHubTab('yoga', true);
  }
});
