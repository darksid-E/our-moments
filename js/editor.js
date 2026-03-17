/* ═══════════════════════════════════════════════════════════════
   editor.js — Album creation & editing logic
═══════════════════════════════════════════════════════════════ */

let _editorAlbum = null;      // Working copy of the album
let _editingPhotoIdx = null;  // Photo being edited in photo-editor modal
let _photoEditorState = {};   // State of current photo edit
let _isMirrored = false;
let _selectedFilter = 'none';
let _selectedPalette = PALETTES[0].id;
let _coverIdx = 0;

// ══════════════════════════════════════════════════════
// Open editor (null = new, id = existing)
// ══════════════════════════════════════════════════════
function openEditor(albumId) {
  if (albumId) {
    _editorAlbum = JSON.parse(JSON.stringify(getAlbum(albumId)));
  } else {
    _editorAlbum = {
      id: generateId(),
      name: '',
      desc: '',
      paletteId: PALETTES[0].id,
      coverIdx: 0,
      photos: [],
      createdAt: Date.now(),
    };
  }

  _selectedPalette = _editorAlbum.paletteId || PALETTES[0].id;
  _coverIdx = _editorAlbum.coverIdx || 0;

  document.getElementById('editor-title').textContent = albumId ? 'Editar Álbum' : 'Novo Álbum';
  document.getElementById('input-album-name').value = _editorAlbum.name || '';
  document.getElementById('input-album-desc').value = _editorAlbum.desc || '';

  renderPaletteGrid();
  renderPhotoList();
  updateCoverPreview();

  showPage('editor');
}

function cancelEditor() {
  _editorAlbum = null;
  goHome();
}

// ══════════════════════════════════════════════════════
// Save album
// ══════════════════════════════════════════════════════
function saveAlbum() {
  const name = document.getElementById('input-album-name').value.trim();
  if (!name) { showToast('Adicione um nome ao álbum.'); return; }

  _editorAlbum.name = name;
  _editorAlbum.desc = document.getElementById('input-album-desc').value.trim();
  _editorAlbum.paletteId = _selectedPalette;
  _editorAlbum.coverIdx = _coverIdx;
  _editorAlbum.updatedAt = Date.now();

  saveAlbumData(_editorAlbum);
  showToast('Álbum salvo!', 'success');
  setTimeout(() => {
    renderHomeAlbums();
    goHome();
  }, 600);
}

// ══════════════════════════════════════════════════════
// Palette
// ══════════════════════════════════════════════════════
function renderPaletteGrid() {
  const grid = document.getElementById('palette-grid');
  grid.innerHTML = '';
  PALETTES.forEach(p => {
    const div = document.createElement('div');
    div.className = 'palette-option' + (p.id === _selectedPalette ? ' selected' : '');
    div.style.background = p.gradient;
    div.title = p.name;
    div.onclick = () => selectPalette(p.id);
    const label = document.createElement('span');
    label.className = 'palette-label';
    label.textContent = p.name;
    div.appendChild(label);
    grid.appendChild(div);
  });
}

function selectPalette(id) {
  _selectedPalette = id;
  document.querySelectorAll('.palette-option').forEach((el, i) => {
    el.classList.toggle('selected', PALETTES[i].id === id);
  });
}

// ══════════════════════════════════════════════════════
// Photo list (in editor)
// ══════════════════════════════════════════════════════
function renderPhotoList() {
  const list = document.getElementById('photo-list');
  const count = document.getElementById('photo-count');
  const photos = _editorAlbum.photos;
  count.textContent = `(${photos.length})`;

  list.innerHTML = '';
  photos.forEach((photo, i) => {
    const item = document.createElement('div');
    item.className = 'photo-item';
    item.draggable = true;
    item.dataset.idx = i;

    item.innerHTML = `
      <div class="photo-order-badge">#${i + 1}</div>
      <span class="photo-cover-star ${i === _coverIdx ? 'active' : ''}" title="Definir como capa" onclick="setCover(${i})">★</span>
      <div class="photo-item-thumb">
        <img src="${photo.dataUrl}" alt="foto ${i + 1}" />
      </div>
      <div class="photo-item-info">
        <span class="photo-item-caption">${photo.caption || 'Sem legenda'}</span>
        <div class="photo-item-actions">
          <button class="photo-item-btn" title="Mover para cima" onclick="movePhoto(${i}, -1)">↑</button>
          <button class="photo-item-btn" title="Mover para baixo" onclick="movePhoto(${i}, 1)">↓</button>
          <button class="photo-item-btn" title="Editar foto" onclick="openPhotoEditor(${i})">✎</button>
          <button class="photo-item-btn danger" title="Remover foto" onclick="removePhoto(${i})">✕</button>
        </div>
      </div>
    `;
    list.appendChild(item);
  });
}

function handlePhotoAdd(event) {
  const files = Array.from(event.target.files);
  if (!files.length) return;

  let loaded = 0;
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      _editorAlbum.photos.push({
        id: generateId(),
        dataUrl: e.target.result,
        caption: '',
        frameColor: '#ffffff',
        filter: 'none',
        zoom: 100,
        x: 0,
        y: 0,
        rotation: 0,
        brightness: 100,
        contrast: 100,
        saturation: 100,
        mirrored: false,
      });
      loaded++;
      if (loaded === files.length) {
        renderPhotoList();
        updateCoverPreview();
      }
    };
    reader.readAsDataURL(file);
  });
  // Reset input so same file can be re-added
  event.target.value = '';
}

function removePhoto(idx) {
  _editorAlbum.photos.splice(idx, 1);
  if (_coverIdx >= _editorAlbum.photos.length) _coverIdx = Math.max(0, _editorAlbum.photos.length - 1);
  renderPhotoList();
  updateCoverPreview();
}

function movePhoto(idx, dir) {
  const photos = _editorAlbum.photos;
  const newIdx = idx + dir;
  if (newIdx < 0 || newIdx >= photos.length) return;
  [photos[idx], photos[newIdx]] = [photos[newIdx], photos[idx]];
  if (_coverIdx === idx) _coverIdx = newIdx;
  else if (_coverIdx === newIdx) _coverIdx = idx;
  renderPhotoList();
}

function setCover(idx) {
  _coverIdx = idx;
  _editorAlbum.customCoverUrl = null; // clear custom cover when picking from photos
  updateCoverPreview();
  renderPhotoList();
}

function updateCoverPreview() {
  const preview = document.getElementById('cover-preview');
  if (_editorAlbum.customCoverUrl) {
    preview.innerHTML = '<img src="' + _editorAlbum.customCoverUrl + '" alt="capa" />';
    return;
  }
  const photos = _editorAlbum.photos;
  if (!photos.length) {
    preview.innerHTML = '<span>Selecione uma foto como capa</span>';
    return;
  }
  const photo = photos[_coverIdx] || photos[0];
  preview.innerHTML = '<img src="' + photo.dataUrl + '" alt="capa" />';
}

// ══════════════════════════════════════════════════════
// Photo editor modal
// ══════════════════════════════════════════════════════
function openPhotoEditor(idx) {
  _editingPhotoIdx = idx;
  const photo = _editorAlbum.photos[idx];
  _photoEditorState = { ...photo };
  _isMirrored = photo.mirrored || false;
  _selectedFilter = photo.filter || 'none';

  // Load image
  document.getElementById('edit-photo-img').src = photo.dataUrl;
  document.getElementById('input-photo-caption').value = photo.caption || '';
  document.getElementById('polaroid-caption-preview').textContent = photo.caption || 'Legenda aqui';

  // Sliders
  document.getElementById('zoom-slider').value = photo.zoom || 100;
  document.getElementById('x-slider').value = photo.x || 0;
  document.getElementById('y-slider').value = photo.y || 0;
  document.getElementById('rot-slider').value = photo.rotation || 0;
  document.getElementById('bright-slider').value = photo.brightness || 100;
  document.getElementById('contrast-slider').value = photo.contrast || 100;
  document.getElementById('sat-slider').value = photo.saturation || 100;

  // Labels
  updateSliderLabels();

  // Frame color
  renderFrameColors(photo.frameColor || '#ffffff');

  // Filter buttons
  renderFilterBtns(_selectedFilter);

  // Apply current state to preview
  applyTransform();
  applyFilters();
  applyFrameColor(photo.frameColor || '#ffffff');

  document.getElementById('photo-editor-modal').classList.remove('hidden');
}

function closePhotoEditor() {
  document.getElementById('photo-editor-modal').classList.add('hidden');
  _editingPhotoIdx = null;
}

function savePhotoEdit() {
  if (_editingPhotoIdx === null) return;
  const photo = _editorAlbum.photos[_editingPhotoIdx];
  const z = parseInt(document.getElementById('zoom-slider').value);
  const x = parseInt(document.getElementById('x-slider').value);
  const y = parseInt(document.getElementById('y-slider').value);
  const r = parseInt(document.getElementById('rot-slider').value);

  photo.caption = document.getElementById('input-photo-caption').value.trim();
  photo.frameColor = _photoEditorState.frameColor || '#ffffff';
  photo.zoom = z;
  photo.x = x;
  photo.y = y;
  photo.rotation = r;
  photo.brightness = parseInt(document.getElementById('bright-slider').value);
  photo.contrast = parseInt(document.getElementById('contrast-slider').value);
  photo.saturation = parseInt(document.getElementById('sat-slider').value);
  photo.filter = _selectedFilter;
  photo.mirrored = _isMirrored;

  closePhotoEditor();
  renderPhotoList();
  showToast('Foto salva!', 'success');
}

// Transform
function applyTransform() {
  const img = document.getElementById('edit-photo-img');
  const z = document.getElementById('zoom-slider').value;
  const x = document.getElementById('x-slider').value;
  const y = document.getElementById('y-slider').value;
  const r = document.getElementById('rot-slider').value;
  const mirror = _isMirrored ? -1 : 1;

  img.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${mirror * z / 100}) rotate(${r}deg)`;
  updateSliderLabels();
}

function applyFilters() {
  const img = document.getElementById('edit-photo-img');
  const b = document.getElementById('bright-slider').value;
  const c = document.getElementById('contrast-slider').value;
  const s = document.getElementById('sat-slider').value;

  const filterDef = FILTERS.find(f => f.id === _selectedFilter);
  const baseFilter = filterDef ? filterDef.css : 'none';

  img.style.filter = `brightness(${b}%) contrast(${c}%) saturate(${s}%) ${baseFilter !== 'none' ? baseFilter : ''}`;
  updateSliderLabels();
}

function updateSliderLabels() {
  document.getElementById('zoom-val').textContent = document.getElementById('zoom-slider').value + '%';
  document.getElementById('x-val').textContent = document.getElementById('x-slider').value;
  document.getElementById('y-val').textContent = document.getElementById('y-slider').value;
  document.getElementById('rot-val').textContent = document.getElementById('rot-slider').value + '°';
  document.getElementById('bright-val').textContent = document.getElementById('bright-slider').value + '%';
  document.getElementById('contrast-val').textContent = document.getElementById('contrast-slider').value + '%';
  document.getElementById('sat-val').textContent = document.getElementById('sat-slider').value + '%';
}

function updateCaption() {
  const val = document.getElementById('input-photo-caption').value;
  document.getElementById('polaroid-caption-preview').textContent = val || 'Legenda aqui';
}

function mirrorPhoto() {
  _isMirrored = !_isMirrored;
  applyTransform();
}

function resetPhotoEdits() {
  document.getElementById('zoom-slider').value = 100;
  document.getElementById('x-slider').value = 0;
  document.getElementById('y-slider').value = 0;
  document.getElementById('rot-slider').value = 0;
  document.getElementById('bright-slider').value = 100;
  document.getElementById('contrast-slider').value = 100;
  document.getElementById('sat-slider').value = 100;
  _isMirrored = false;
  _selectedFilter = 'none';
  renderFilterBtns('none');
  applyTransform();
  applyFilters();
}

// Frame colors
function renderFrameColors(selected) {
  const container = document.getElementById('frame-colors');
  container.innerHTML = '';
  FRAME_COLORS.forEach(color => {
    const btn = document.createElement('button');
    btn.className = 'frame-color-btn' + (color === selected ? ' selected' : '');
    btn.style.background = color;
    btn.style.border = color === '#ffffff' || color === '#e8e8e8' ? '2px solid rgba(255,255,255,0.2)' : '2px solid transparent';
    btn.onclick = () => {
      _photoEditorState.frameColor = color;
      applyFrameColor(color);
      container.querySelectorAll('.frame-color-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    };
    container.appendChild(btn);
  });
}

function applyFrameColor(color) {
  const inner = document.querySelector('#polaroid-preview .polaroid-inner');
  if (inner) inner.style.background = color;
  // Adjust caption color based on frame brightness
  const caption = document.getElementById('polaroid-caption-preview');
  if (caption) {
    const isDark = isDarkColor(color);
    caption.style.color = isDark ? '#cccccc' : '#333333';
  }
}

function isDarkColor(hex) {
  const c = hex.replace('#', '');
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) < 128;
}

// Filters
function renderFilterBtns(selectedId) {
  _selectedFilter = selectedId;
  const row = document.getElementById('filter-row');
  row.innerHTML = '';
  FILTERS.forEach(f => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn' + (f.id === selectedId ? ' selected' : '');
    btn.textContent = f.label;
    btn.onclick = () => {
      _selectedFilter = f.id;
      row.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      applyFilters();
    };
    row.appendChild(btn);
  });
}

// ══════════════════════════════════════════════════════
// Custom cover photo (upload externo)
// ══════════════════════════════════════════════════════
function handleCustomCover(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    _editorAlbum.customCoverUrl = e.target.result;
    const preview = document.getElementById('cover-preview');
    preview.innerHTML = '<img src="' + e.target.result + '" alt="capa personalizada" />';
    showToast('Capa personalizada definida!', 'success');
  };
  reader.readAsDataURL(file);
  event.target.value = '';
}
