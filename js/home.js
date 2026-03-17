/* ═══════════════════════════════════════════════════════════════
   home.js — Home page: album grid rendering
═══════════════════════════════════════════════════════════════ */

function renderHomeAlbums() {
  const albums = getAlbums();
  const grid = document.getElementById('albums-grid');
  const empty = document.getElementById('albums-empty');

  grid.innerHTML = '';

  if (!albums.length) {
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  albums.forEach(album => {
    const palette = PALETTES.find(p => p.id === album.paletteId) || PALETTES[0];
    const customCover = album.customCoverUrl;
    const coverPhoto = album.photos[album.coverIdx] || album.photos[0];
    const coverSrc = customCover || (coverPhoto && coverPhoto.dataUrl);
    const photoCount = album.photos.length;

    const card = document.createElement('div');
    card.className = 'album-card';

    // Palette dots preview
    const paletteDots = PALETTES.slice(0, 3).map(p =>
      `<span class="palette-dot" style="background:${palette.accent}"></span>`
    ).join('');

    card.innerHTML = `
      <div class="album-card-thumb">
        ${coverSrc
          ? `<img class="album-card-img" src="${coverSrc}" alt="${album.name}" />`
          : `<span class="album-card-no-img">◈</span>`
        }
      </div>
      <div class="album-card-info">
        <h3>${album.name}</h3>
        ${album.desc ? `<p>${album.desc}</p>` : ''}
        <div class="album-card-meta">
          <span class="album-card-count">${photoCount} foto${photoCount !== 1 ? 's' : ''}</span>
          <div class="album-card-palette">
            <span class="palette-dot" style="background:${palette.bg};border-color:rgba(255,255,255,0.3)"></span>
            <span class="palette-dot" style="background:${palette.accent}"></span>
            <span class="palette-dot" style="background:${palette.text}"></span>
          </div>
        </div>
      </div>
    `;

    card.onclick = () => openAlbum(album.id);
    grid.appendChild(card);
  });
}
