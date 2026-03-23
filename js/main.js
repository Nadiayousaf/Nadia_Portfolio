/* ========================================
   main.js — Theme Toggle, Scroll Reveal & Modal
   ======================================== */

/* ── THEME TOGGLE ── */
function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';
  html.setAttribute('data-theme', isDark ? 'light' : 'dark');
  document.querySelector('.theme-btn').textContent = isDark ? '🌙 Dark' : '☀ Light';
}

/* ── SCROLL REVEAL ── */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');

      // Animate progress bars inside revealed elements
      entry.target.querySelectorAll('.prog-fill').forEach(bar => {
        bar.style.width = bar.dataset.pct + '%';
      });
    }
  });
}, { threshold: 0.12 });

// Observe all elements with class .reveal
// Use MutationObserver to catch dynamically added elements too
function observeRevealElements() {
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
}

// Initial observe + re-observe after DOM settles
observeRevealElements();
setTimeout(observeRevealElements, 300);

/* ── MODAL ── */
function openModal(proj) {
  document.getElementById('modalContent').innerHTML = `
    <div style="font-size: 2.5rem; margin-bottom: 12px">${proj.icon}</div>
    <h3>${proj.title}</h3>
    <div class="modal-stack">
      ${proj.stack.map(t => `<span class="stack-tag">${t}</span>`).join('')}
    </div>
    <p class="modal-desc">${proj.desc}</p>
    <ul class="modal-features">
      ${proj.features.map(f => `<li>${f}</li>`).join('')}
    </ul>
  `;
  document.getElementById('modal').classList.add('open');
}

function closeModal(e) {
  const modal = document.getElementById('modal');
  if (!e || e.target === modal || e.currentTarget.classList.contains('modal-close')) {
    modal.classList.remove('open');
  }
}

// Close modal on Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

/* ── CONTACT FORM ── */
async function submitContactForm() {
  const name    = document.getElementById('cf-name').value.trim();
  const email   = document.getElementById('cf-email').value.trim();
  const phone   = document.getElementById('cf-phone').value.trim();
  const message = document.getElementById('cf-message').value.trim();

  const feedback = document.getElementById('cf-feedback');
  const btnText  = document.getElementById('cf-btn-text');
  const btnLoader= document.getElementById('cf-btn-loader');
  const btn      = document.getElementById('cf-submit');

  // Simple validation
  if (!name || !email || !message) {
    showFormFeedback('⚠ Please fill in your name, email, and message.', 'error');
    return;
  }
  const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRx.test(email)) {
    showFormFeedback('⚠ Please enter a valid email address.', 'error');
    return;
  }

  // Show loading state
  btnText.style.display  = 'none';
  btnLoader.style.display= 'inline';
  btn.disabled = true;
  feedback.style.display = 'none';

  // Build form body  
  // NEW:
  const body = { name, email, phone, message };
  try{
  const res = await fetch('http://localhost:8080/contacts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body)
  });

  if (res.ok) {
      showFormFeedback('✅ Message sent! I\'ll get back to you soon.', 'success');
      // Clear fields
      ['cf-name','cf-email','cf-phone','cf-message'].forEach(id => {
        document.getElementById(id).value = '';
      });
  } else {
      const err = await res.json().catch(() => ({}));
      showFormFeedback('⚠ ' + (err.error || 'Something went wrong. Please try again.'), 'error');
  }
  } catch (e) {
    // Fallback: open mail client if backend is unavailable
    const subject = encodeURIComponent('Portfolio Contact: ' + name);
    const mailBody = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nPhone: ${phone || 'N/A'}\n\nMessage:\n${message}`);
    window.location.href = `mailto:nadiayousaf031@gmail.com?subject=${subject}&body=${mailBody}`;
    showFormFeedback('📧 Opening your mail client as backup…', 'info');
  } finally {
    btnText.style.display  = 'inline';
    btnLoader.style.display= 'none';
    btn.disabled = false;
  }
}

function showFormFeedback(msg, type) {
  const el = document.getElementById('cf-feedback');
  el.textContent = msg;
  el.className = 'cf-feedback cf-' + type;
  el.style.display = 'block';
}