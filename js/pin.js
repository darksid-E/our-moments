/* ═══════════════════════════════════════════════════════════════
   pin.js — PIN authentication
═══════════════════════════════════════════════════════════════ */

const PIN_CORRECT = '1909';
let _pinBuffer = '';
let _pinCallback = null;

function requestPin(action) {
  _pinBuffer = '';
  _pinCallback = action;
  updatePinDots();
  document.getElementById('pin-error').classList.add('hidden');
  document.getElementById('pin-modal').classList.remove('hidden');
}

function closePin() {
  _pinBuffer = '';
  _pinCallback = null;
  document.getElementById('pin-modal').classList.add('hidden');
}

function pinPress(digit) {
  if (_pinBuffer.length >= 4) return;
  _pinBuffer += digit;
  updatePinDots();
  if (_pinBuffer.length === 4) setTimeout(pinSubmit, 120);
}

function pinClear() {
  _pinBuffer = _pinBuffer.slice(0, -1);
  updatePinDots();
}

function pinSubmit() {
  if (_pinBuffer.length < 4) return;
  if (_pinBuffer === PIN_CORRECT) {
    document.getElementById('pin-modal').classList.add('hidden');
    const action = _pinCallback;
    _pinBuffer = '';
    _pinCallback = null;
    handlePinSuccess(action);
  } else {
    // Shake dots red
    const dots = document.querySelectorAll('.dot');
    dots.forEach(d => { d.classList.remove('filled'); d.classList.add('error'); });
    document.getElementById('pin-error').classList.remove('hidden');
    setTimeout(() => {
      dots.forEach(d => d.classList.remove('error'));
      _pinBuffer = '';
      updatePinDots();
    }, 700);
  }
}

function updatePinDots() {
  for (let i = 1; i <= 4; i++) {
    const dot = document.getElementById('d' + i);
    dot.classList.toggle('filled', i <= _pinBuffer.length);
    dot.classList.remove('error');
  }
}

function handlePinSuccess(action) {
  if (action === 'create-album') {
    openEditor(null);
  } else if (action === 'edit-album') {
    openEditor(window._currentAlbumId);
  }
}

// Keyboard support for PIN
document.addEventListener('keydown', (e) => {
  const modal = document.getElementById('pin-modal');
  if (modal.classList.contains('hidden')) return;
  if (e.key >= '0' && e.key <= '9') pinPress(e.key);
  else if (e.key === 'Backspace') pinClear();
  else if (e.key === 'Enter') pinSubmit();
  else if (e.key === 'Escape') closePin();
});
