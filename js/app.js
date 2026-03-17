/* ═══════════════════════════════════════════════════════════════
   app.js — Routing, navigation, toast, init
═══════════════════════════════════════════════════════════════ */

// ── Page navigation ──
function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById('page-' + name);
  if (page) page.classList.add('active');
  window.scrollTo(0, 0);
}

function goHome() {
  renderHomeAlbums();
  showPage('home');
}

// ── Toast ──
let _toastTimeout;
function showToast(msg, type = '') {
  let toast = document.getElementById('app-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.className = 'toast' + (type ? ' ' + type : '');
  clearTimeout(_toastTimeout);
  setTimeout(() => toast.classList.add('show'), 10);
  _toastTimeout = setTimeout(() => toast.classList.remove('show'), 2800);
}

// ── Smooth ambient background particles ──
function initParticles() {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:0;opacity:0.35;';
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');

  const particles = Array.from({ length: 30 }, () => ({
    x: Math.random(),
    y: Math.random(),
    size: Math.random() * 1.5 + 0.5,
    vx: (Math.random() - 0.5) * 0.0002,
    vy: (Math.random() - 0.5) * 0.0002,
    opacity: Math.random() * 0.4 + 0.1,
  }));

  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x = (p.x + p.vx + 1) % 1;
      p.y = (p.y + p.vy + 1) % 1;
      ctx.beginPath();
      ctx.arc(p.x * canvas.width, p.y * canvas.height, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(201,169,110,${p.opacity})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
}

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  renderHomeAlbums();
  showPage('home');
});
