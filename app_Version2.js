// Realtime Cloud — interactivity: nav, tabs, FAQ, dynamic background, soft ribbons, demo auth

// Mobile nav toggle (accessible)
const nav = document.querySelector('.nav');
const navToggle = document.querySelector('.nav-toggle');
if (nav && navToggle) {
  navToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Close menu when clicking a link (mobile)
  document.querySelectorAll('.nav-list a').forEach(a => {
    a.addEventListener('click', () => {
      nav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// Tabs: Web / iOS / Android
const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.code-panel');
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.tab;
    tabs.forEach(t => {
      t.classList.toggle('active', t === tab);
      t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
    });
    panels.forEach(panel => {
      const shouldShow = panel.id === `panel-${target}`;
      panel.classList.toggle('show', shouldShow);
      panel.hidden = !shouldShow;
    });
  });
});

// FAQ accordion (accessible)
const faqButtons = document.querySelectorAll('.faq-q');
faqButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    const id = btn.getAttribute('aria-controls');
    const panel = document.getElementById(id);
    btn.setAttribute('aria-expanded', String(!expanded));
    if (panel) panel.hidden = expanded;
  });
});

// Footer year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const href = anchor.getAttribute('href') || '';
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// --- Dynamic background hues + parallax on scroll (mobile optimized) ---
function initDynamicBackground(){
  const root = document.documentElement;
  let ticking = false;
  const mMobile = window.matchMedia('(pointer: coarse), (max-width: 768px)');
  const mReduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

  function update(){
    const h = document.documentElement;
    const b = document.body;
    const scrollMax = (h.scrollHeight || b.scrollHeight) - h.clientHeight;
    const y = window.scrollY || window.pageYOffset || 0;
    const p = scrollMax > 0 ? clamp(y / scrollMax, 0, 1) : 0;
    const dir = (window._rc_lastY || 0) <= y ? 1 : -1; // 1 down, -1 up
    window._rc_lastY = y;

    const mobileFactor = mMobile.matches ? 0.6 : 1.0;
    const reduceFactor = mReduce.matches ? 0.25 : 1.0;
    const amp = mobileFactor * reduceFactor;

    // Hue animation
    const hA = 210 + Math.sin(p * Math.PI * 2) * (40 * amp);
    const hB = 260 + Math.cos(p * Math.PI * 2) * (35 * amp);
    const hC = 190 + Math.sin(p * Math.PI) * (30 * amp);

    // Parallax offsets
    const off1 = (p * 140 * amp) * dir;
    const off2 = (-p * 120 * amp) * dir;
    const off3 = (p * 160 * amp) * -dir;

    root.style.setProperty('--hA', hA.toFixed(0));
    root.style.setProperty('--hB', hB.toFixed(0));
    root.style.setProperty('--hC', hC.toFixed(0));
    root.style.setProperty('--bg1-off', off1.toFixed(1) + 'px');
    root.style.setProperty('--bg2-off', off2.toFixed(1) + 'px');
    root.style.setProperty('--bg3-off', off3.toFixed(1) + 'px');

    ticking = false;
  }

  function onScroll(){
    if (!ticking){
      requestAnimationFrame(update);
      ticking = true;
    }
  }

  if (!mReduce.matches){
    window.addEventListener('scroll', onScroll, { passive: true });
  }
  window.addEventListener('resize', () => { if (!ticking){ requestAnimationFrame(update); ticking = true; } }, { passive: true });
  window.addEventListener('orientationchange', () => { if (!ticking){ requestAnimationFrame(update); ticking = true; } }, { passive: true });
  update();
}

// --- Simple client-side auth (demo only) ---
const AUTH_KEY = 'rc_auth_user';

function getUser(){
  try { return JSON.parse(localStorage.getItem(AUTH_KEY) || 'null'); } catch { return null; }
}
function setUser(user){ localStorage.setItem(AUTH_KEY, JSON.stringify(user)); }
function clearUser(){ localStorage.removeItem(AUTH_KEY); }

function updateHeaderState(){
  const user = getUser();
  const actions = document.querySelector('.actions');
  if (!actions) return;

  if (user){
    const initials = (user.fullName || user.email || 'U').split(' ').map(s=>s[0]).join('').slice(0,2).toUpperCase();
    const avatarImg = user.avatarDataUrl ? `<img src="${user.avatarDataUrl}" alt="avatar" style="width:28px;height:28px;border-radius:999px;border:1px solid var(--border);">` : `<div class="brand-mark" style="width:28px;height:28px;border-radius:999px;display:grid;place-items:center;font-size:12px;">${initials}</div>`;
    actions.innerHTML = `
      <a class="btn ghost" href="./profile.html" style="gap:8px; align-items:center;">${avatarImg}<span>${user.fullName ? user.fullName.split(' ')[0] : 'Profile'}</span></a>
      <button class="btn" id="logout-btn" type="button">Log out</button>
    `;
  } else {
    actions.innerHTML = `
      <a class="btn ghost" href="./login.html">Sign in</a>
      <a class="btn primary" href="./register.html">Start for free</a>
    `;
  }
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn){
    logoutBtn.addEventListener('click', () => { clearUser(); updateHeaderState(); window.location.href = './index.html'; });
  }
}

function handleAuthForms(){
  // Register form
  const regForm = document.getElementById('register-form');
  if (regForm){
    regForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const fullName = regForm.fullName.value.trim();
      const email = regForm.email.value.trim();
      const password = regForm.password.value; // demo only
      const company = regForm.company.value.trim();
      setUser({ fullName, email, company });
      window.location.href = './welcome.html';
    });
  }

  // Login form
  const loginForm = document.getElementById('login-form');
  if (loginForm){
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = loginForm.email.value.trim();
      const fullName = email.split('@')[0];
      setUser({ fullName, email });
      window.location.href = './profile.html';
    });
  }
}

function initProfile(){
  if (!document.getElementById('profile-form')) return;
  const user = getUser();
  if (!user){ window.location.href = './login.html'; return; }
  const form = document.getElementById('profile-form');
  form.fullName.value = user.fullName || '';
  form.email.value = user.email || '';
  form.company.value = user.company || '';

  // Avatar preview
  const avatarPreview = document.getElementById('avatar-preview');
  if (avatarPreview){
    if (user.avatarDataUrl) avatarPreview.src = user.avatarDataUrl;
    const avatarInput = document.getElementById('avatar');
    if (avatarInput){
      avatarInput.addEventListener('change', () => {
        const f = avatarInput.files && avatarInput.files[0];
        if (!f) return;
        const reader = new FileReader();
        reader.onload = () => {
          avatarPreview.src = reader.result;
          user.avatarDataUrl = reader.result;
          setUser(user);
          updateHeaderState();
        };
        reader.readAsDataURL(f);
      });
    }
  }

  // Save profile
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    user.fullName = form.fullName.value.trim();
    user.email = form.email.value.trim();
    user.company = form.company.value.trim();
    setUser(user);
    updateHeaderState();
    const saved = document.createElement('div');
    saved.textContent = 'Saved';
    saved.style.position = 'fixed'; saved.style.bottom = '20px'; saved.style.right = '20px';
    saved.style.padding = '10px 14px'; saved.style.borderRadius = '10px';
    saved.style.background = 'rgba(20,160,120,0.35)'; saved.style.border = '1px solid rgba(200,255,220,0.35)'; saved.style.color = '#eafff4';
    document.body.appendChild(saved); setTimeout(()=>saved.remove(), 1400);
  });

  // API keys list
  user.keys = Array.isArray(user.keys) ? user.keys : [];
  const list = document.getElementById('keys-list');
  const renderKeys = () => {
    if (!list) return;
    list.innerHTML = '';
    if (user.keys.length === 0){
      const empty = document.createElement('div');
      empty.className = 'muted'; empty.textContent = 'No keys yet.';
      list.appendChild(empty);
      return;
    }
    user.keys.forEach((k, idx) => {
      const row = document.createElement('div');
      row.className = 'key-item';
      row.innerHTML = `<div class="key-text">${k}</div>`;
      const copy = document.createElement('button'); copy.className = 'key-btn'; copy.textContent = 'Copy';
      const revoke = document.createElement('button'); revoke.className = 'key-btn'; revoke.textContent = 'Revoke';
      copy.addEventListener('click', async ()=>{
        try{ await navigator.clipboard.writeText(k); copy.textContent = 'Copied'; setTimeout(()=>copy.textContent='Copy', 1000);}catch{}
      });
      revoke.addEventListener('click', ()=>{
        user.keys.splice(idx,1); setUser(user); renderKeys();
      });
      row.appendChild(copy); row.appendChild(revoke);
      list.appendChild(row);
    });
  };
  renderKeys();

  const genKeyBtn = document.getElementById('gen-key');
  if (genKeyBtn){
    genKeyBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const key = 'rc_' + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
      user.keys.push(key); setUser(user); renderKeys();
    });
  }

  // Delete account
  const delBtn = document.getElementById('delete-account');
  if (delBtn){
    delBtn.addEventListener('click', ()=>{
      if (confirm('Delete your account? This will remove local data.')){
        clearUser();
        window.location.href = './register.html';
      }
    });
  }
}

// --- Soft ribbon bursts beneath content ---
(function(){
  const layer = document.querySelector('.fx-layer');
  if (!layer) return;

  const sections = Array.from(document.querySelectorAll('.hero, .trusted, .section, .cta, .footer'));
  const rnd = (min, max) => Math.random() * (max - min) + min;
  const mMobile = window.matchMedia('(pointer: coarse), (max-width: 768px)');
  const mReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const spawnDup = () => !mMobile.matches && Math.random() > 0.5;

  function hues(){
    const cs = getComputedStyle(document.documentElement);
    const hA = parseFloat(cs.getPropertyValue('--hA')) || 240;
    const hB = parseFloat(cs.getPropertyValue('--hB')) || 220;
    const hC = parseFloat(cs.getPropertyValue('--hC')) || 200;
    return { hA, hB, hC };
  }

  function spawnBurst(x, y){
    if (mReduce.matches) return; // honor reduced motion
    const b = document.createElement('div');
    b.className = 'ink-burst';
    b.style.left = x + 'px';
    b.style.top = y + 'px';

    const { hA, hB, hC } = hues();
    const softness = mMobile.matches ? 0.85 : 1.0; // slightly softer on mobile
    const c1 = `hsla(${(hA + rnd(-10,10)).toFixed(0)}, 85%, 62%, ${0.28*softness})`;
    const c2 = `hsla(${(hB + rnd(-8,8)).toFixed(0)}, 80%, 62%, ${0.26*softness})`;
    const c3 = `hsla(${(hC + rnd(-8,8)).toFixed(0)}, 85%, 60%, ${0.22*softness})`;
    const c4 = `hsla(${(hA + 110 + rnd(-6,6)).toFixed(0)}, 80%, 62%, ${0.18*softness})`;
    const c5 = `hsla(${(hB - 140 + rnd(-6,6)).toFixed(0)}, 90%, 60%, ${0.16*softness})`;
    b.style.setProperty('--c1', c1);
    b.style.setProperty('--c2', c2);
    b.style.setProperty('--c3', c3);
    b.style.setProperty('--c4', c4);
    b.style.setProperty('--c5', c5);

    const w = mMobile.matches ? rnd(340, 520) : rnd(420, 640);
    const h = mMobile.matches ? rnd(100, 160) : rnd(120, 200);
    const blur = mMobile.matches ? rnd(12, 20) : rnd(16, 26);
    b.style.setProperty('--w', w + 'px');
    b.style.setProperty('--h', h + 'px');
    b.style.setProperty('--rot', rnd(-10, 14) + 'deg');
    b.style.setProperty('--blur', blur + 'px');

    layer.appendChild(b);
    setTimeout(()=> b.remove(), 1600);
  }

  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e => {
      if (e.isIntersecting){
        const rect = e.target.getBoundingClientRect();
        const cx = rect.left + rect.width * rnd(0.2, 0.8);
        const cy = rect.top + rect.height * rnd(0.2, 0.8);
        spawnBurst(cx, cy);
        if (spawnDup()) setTimeout(()=> spawnBurst(cx + rnd(-80,80), cy + rnd(-60,60)), 180);
      }
    });
  }, { threshold: mMobile.matches ? 0.5 : 0.35 });

  sections.forEach(s => io.observe(s));
})();

// Init on DOM ready
window.addEventListener('DOMContentLoaded', () => {
  updateHeaderState();
  handleAuthForms();
  initProfile();
  initDynamicBackground();
  // Welcome page personalization
  (function(){
    const nameEl = document.getElementById('welcome-name');
    if (!nameEl) return;
    const user = getUser();
    if (!user){ window.location.href = './register.html'; return; }
    nameEl.textContent = user.fullName || user.email || 'there';
  })();
});
