/* ═══════════════════════════════════════════════════════════════
   album.js — Album view & polaroid carousel
═══════════════════════════════════════════════════════════════ */

let _carouselIdx = 0;
let _carouselPhotos = [];

function openAlbum(albumId) {
  window._currentAlbumId = albumId;
  const album = getAlbum(albumId);
  if (!album) return;

  applyAlbumTheme(album);

  document.getElementById('album-name-display').textContent = album.name;
  document.getElementById('album-desc-display').textContent = album.desc || '';

  _carouselPhotos = album.photos || [];
  _carouselIdx = 0;
  buildCarousel();

  showPage('album');
}

function applyAlbumTheme(album) {
  const palette = PALETTES.find(p => p.id === album.paletteId) || PALETTES[0];
  const bg = document.getElementById('album-bg');
  bg.style.background = palette.gradient;

  const nameEl = document.getElementById('album-name-display');
  const descEl = document.getElementById('album-desc-display');
  if (nameEl) nameEl.style.color = palette.text;
  if (descEl) descEl.style.color = palette.accent;
}

// ══════════════════════════════════════════════════════
// Carousel
// ══════════════════════════════════════════════════════
function buildCarousel() {
  const container = document.getElementById('polaroid-carousel');
  container.innerHTML = '';

  if (!_carouselPhotos.length) {
    container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:rgba(255,255,255,0.3);font-size:14px;">Nenhuma foto neste álbum</div>';
    updateCarouselCounter();
    return;
  }

  _carouselPhotos.forEach((photo, i) => {
    const el = document.createElement('div');
    el.className = 'carousel-polaroid';
    el.dataset.idx = i;

    const frameColor    = photo.frameColor || '#ffffff';
    const captionColor  = isDarkColor(frameColor) ? '#cccccc' : '#444444';

    // Build image CSS filter
    const b = photo.brightness || 100;
    const c = photo.contrast   || 100;
    const s = photo.saturation || 100;
    const filterDef  = FILTERS.find(f => f.id === (photo.filter || 'none'));
    const filterBase = (filterDef && filterDef.id !== 'none') ? filterDef.css : '';
    const imgFilter  = 'brightness(' + b + '%) contrast(' + c + '%) saturate(' + s + '%)' + (filterBase ? ' ' + filterBase : '');

    // Build image CSS transform — starts at centre of .polaroid-photo, then applies user edits
    const zoom   = (photo.zoom || 100) / 100;
    const ox     = photo.x        || 0;
    const oy     = photo.y        || 0;
    const rot    = photo.rotation || 0;
    const mirror = photo.mirrored ? -1 : 1;
    const imgTransform = 'translate(-50%, -50%) translate(' + ox + 'px, ' + oy + 'px) scale(' + (mirror * zoom) + ') rotate(' + rot + 'deg)';

    el.innerHTML =
      '<div class="polaroid-inner" style="background:' + frameColor + ';">' +
        '<div class="polaroid-photo">' +
          '<img src="' + photo.dataUrl + '" alt="" style="transform:' + imgTransform + ';filter:' + imgFilter + ';" />' +
        '</div>' +
        '<div class="polaroid-label" style="color:' + captionColor + ';">' + (photo.caption || '') + '</div>' +
      '</div>';

    container.appendChild(el);
  });

  positionCarousel();
  updateCarouselCounter();
}

function positionCarousel() {
  const items = document.querySelectorAll('.carousel-polaroid');
  const total = items.length;
  if (!total) return;

  items.forEach((el, i) => {
    const offset   = i - _carouselIdx;
    const absOffset = Math.abs(offset);

    if (absOffset > 2) {
      el.style.opacity       = '0';
      el.style.pointerEvents = 'none';
      el.style.transform     = 'translateX(' + (offset * 300) + 'px) scale(0.7) translateZ(-200px)';
      el.style.zIndex        = '0';
      return;
    }

    const tx      = offset * 88;
    const tz      = -absOffset * 60;
    const ry      = offset * -12;
    const scale   = offset === 0 ? 1 : 0.88 - absOffset * 0.06;
    const opacity = offset === 0 ? 1 : 0.55 - absOffset * 0.15;

    el.style.transform     = 'translateX(' + tx + 'px) translateZ(' + tz + 'px) rotateY(' + ry + 'deg) scale(' + scale + ')';
    el.style.opacity       = opacity;
    el.style.zIndex        = 10 - absOffset;
    el.style.pointerEvents = offset === 0 ? 'auto' : 'none';
  });
}

function rotateCarousel(dir) {
  const total = _carouselPhotos.length;
  if (!total) return;
  _carouselIdx = (_carouselIdx + dir + total) % total;
  positionCarousel();
  updateCarouselCounter();
}

function updateCarouselCounter() {
  const el    = document.getElementById('carousel-counter');
  const total = _carouselPhotos.length;
  el.textContent = total ? (_carouselIdx + 1) + ' / ' + total : '0 / 0';
}

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  const albumPage = document.getElementById('page-album');
  if (!albumPage.classList.contains('active')) return;
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') rotateCarousel(1);
  if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   rotateCarousel(-1);
});

// Touch swipe
let _touchStartX = 0;
document.addEventListener('touchstart', (e) => { _touchStartX = e.touches[0].clientX; }, { passive: true });
document.addEventListener('touchend',   (e) => {
  const albumPage = document.getElementById('page-album');
  if (!albumPage.classList.contains('active')) return;
  const dx = _touchStartX - e.changedTouches[0].clientX;
  if (Math.abs(dx) > 40) rotateCarousel(dx > 0 ? 1 : -1);
}, { passive: true });
