/* ═══════════════════════════════════════════════════════════════
   data.js — LocalStorage persistence layer
═══════════════════════════════════════════════════════════════ */

const DB_KEY = 'our_moments_v1';

const PALETTES = [
  { id: 'midnight',  name: 'Midnight',  bg: '#0d0d14', text: '#f0ede8', accent: '#c9a96e',  gradient: 'linear-gradient(135deg,#0d0d14 0%,#1a1a2e 100%)' },
  { id: 'forest',    name: 'Floresta',  bg: '#0f1e0f', text: '#d4e8c2', accent: '#6abf6a',  gradient: 'linear-gradient(135deg,#0f1e0f 0%,#1c3320 100%)' },
  { id: 'wine',      name: 'Vinho',     bg: '#1a0a12', text: '#f4d0dd', accent: '#d4527a',  gradient: 'linear-gradient(135deg,#1a0a12 0%,#2e0f20 100%)' },
  { id: 'ocean',     name: 'Oceano',    bg: '#050f1c', text: '#c8e4f8', accent: '#4ab3e8',  gradient: 'linear-gradient(135deg,#050f1c 0%,#0a2040 100%)' },
  { id: 'ember',     name: 'Brasa',     bg: '#1a0c00', text: '#fde8c8', accent: '#e87d2a',  gradient: 'linear-gradient(135deg,#1a0c00 0%,#2e1800 100%)' },
  { id: 'slate',     name: 'Ardósia',   bg: '#0f1418', text: '#e0e8f0', accent: '#7ab4d4',  gradient: 'linear-gradient(135deg,#0f1418 0%,#1c2830 100%)' },
  { id: 'plum',      name: 'Ameixa',    bg: '#120a1a', text: '#e8d4f8', accent: '#a06ae8',  gradient: 'linear-gradient(135deg,#120a1a 0%,#20103a 100%)' },
  { id: 'rose',      name: 'Rosa',      bg: '#1a0f0f', text: '#f8d4e0', accent: '#e87a9a',  gradient: 'linear-gradient(135deg,#1a0f0f 0%,#2e1820 100%)' },
  { id: 'ivory',     name: 'Marfim',    bg: '#1a1810', text: '#f8f0d8', accent: '#c8b86a',  gradient: 'linear-gradient(135deg,#1a1810 0%,#2a2818 100%)' },
  { id: 'graphite',  name: 'Grafite',   bg: '#111111', text: '#e8e8e8', accent: '#888888',  gradient: 'linear-gradient(135deg,#111111 0%,#1e1e1e 100%)' },
  { id: 'teal',      name: 'Esmeralda', bg: '#051814', text: '#c8f0e8', accent: '#3ab8a0',  gradient: 'linear-gradient(135deg,#051814 0%,#0a2a24 100%)' },
  { id: 'gold',      name: 'Ouro',      bg: '#140e00', text: '#f8e8a0', accent: '#d4a820',  gradient: 'linear-gradient(135deg,#140e00 0%,#281c00 100%)' },
];

const FRAME_COLORS = [
  '#ffffff', '#f5f0e8', '#e8d8c0', '#2c2c2c',
  '#1a1a1a', '#c8b4a0', '#a0b8c8', '#b0c8a0',
  '#c8a0b0', '#d4c080', '#a0c0d4', '#e8e8e8',
];

const FILTERS = [
  { id: 'none',      label: 'Normal',    css: 'none' },
  { id: 'bw',        label: 'P&B',       css: 'grayscale(100%)' },
  { id: 'sepia',     label: 'Sépia',     css: 'sepia(80%)' },
  { id: 'warm',      label: 'Quente',    css: 'sepia(40%) saturate(120%) hue-rotate(-10deg)' },
  { id: 'cool',      label: 'Frio',      css: 'saturate(80%) hue-rotate(20deg)' },
  { id: 'fade',      label: 'Desbotado', css: 'contrast(80%) brightness(110%) saturate(70%)' },
  { id: 'vivid',     label: 'Vívido',    css: 'saturate(180%) contrast(110%)' },
  { id: 'dramatic',  label: 'Dramático', css: 'contrast(140%) brightness(90%) saturate(80%)' },
];

// ── Storage helpers ──
function loadDB() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    return raw ? JSON.parse(raw) : { albums: [] };
  } catch { return { albums: [] }; }
}

function saveDB(db) {
  try { localStorage.setItem(DB_KEY, JSON.stringify(db)); } catch (e) { console.warn('Storage full', e); }
}

function getAlbums() { return loadDB().albums; }

function getAlbum(id) { return getAlbums().find(a => a.id === id); }

function saveAlbumData(album) {
  const db = loadDB();
  const idx = db.albums.findIndex(a => a.id === album.id);
  if (idx >= 0) db.albums[idx] = album;
  else db.albums.unshift(album);
  saveDB(db);
}

function deleteAlbum(id) {
  const db = loadDB();
  db.albums = db.albums.filter(a => a.id !== id);
  saveDB(db);
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
