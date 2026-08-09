(() => {
  'use strict';

  const COST = 250;
  let selecting = false;
  let initialized = false;

  function holders() {
    try {
      if (Array.isArray(pieceHolders)) return pieceHolders;
    } catch (_) {}
    return Array.from(document.querySelectorAll('.piece-holder')).filter(h => !h.classList.contains('hold-box'));
  }

  function getRotateButton() {
    return document.getElementById('rotate-btn') ||
      Array.from(document.querySelectorAll('button')).find(b => /yön|döndür|rotate/i.test(b.textContent));
  }

  function renderPieces() {
    try { renderAllHolders(); return; } catch (_) {}
    holders().forEach((h, i) => {
      try {
        const p = currentPieces[i];
        if (typeof renderPieceHolder === 'function') renderPieceHolder(h, p);
      } catch (_) {}
    });
  }

  function updateSelectionVisuals() {
    holders().forEach((h, i) => {
      h.classList.toggle('rotate-selectable', selecting && !!getPiece(i));
      h.classList.toggle('rotate-choice', selecting && !!getPiece(i));
      let overlay = h.querySelector('.rotate-select-overlay');
      if (selecting && getPiece(i)) {
        if (!overlay) {
          overlay = document.createElement('span');
          overlay.className = 'rotate-select-overlay';
          overlay.textContent = '↻';
          h.appendChild(overlay);
        }
      } else if (overlay) overlay.remove();
    });
    const btn = getRotateButton();
    if (btn) {
      btn.textContent = selecting ? '↻ Şekil Seç' : `↻ Yön Değiştir (${COST} 🪙)`;
      btn.setAttribute('aria-pressed', String(selecting));
      btn.classList.toggle('rotate-active', selecting);
    }
  }

  function getPiece(index) {
    try { return currentPieces[index]; } catch (_) { return null; }
  }

  function setSelecting(value) {
    selecting = !!value;
    updateSelectionVisuals();
  }

  function choose(index) {
    const piece = getPiece(index);
    if (!selecting || !piece) return;

    let currentCoins;
    try { currentCoins = Number(coins) || 0; } catch (_) { currentCoins = 0; }
    if (currentCoins < COST) {
      setSelecting(false);
      return;
    }

    try { coins -= COST; } catch (_) { return; }

    try {
      piece.shape = rotateShape(piece.shape);
    } catch (_) {
      // Refund if the existing game rotation function is unavailable.
      try { coins += COST; } catch (_) {}
      setSelecting(false);
      return;
    }

    setSelecting(false);
    renderPieces();
    updateSelectionVisuals();
    try { updateCoinsDisplay(); } catch (_) {}
    try { saveGameState(); } catch (_) {}
  }

  function installButton() {
    let btn = document.getElementById('rotate-btn');
    if (!btn) {
      const action = document.querySelector('.action-buttons') || document.querySelector('.bottom-panel');
      if (!action) return null;
      btn = document.createElement('button');
      btn.id = 'rotate-btn';
      btn.className = 'reroll-btn';
      btn.type = 'button';
      btn.textContent = `↻ Yön Değiştir (${COST} 🪙)`;
      action.appendChild(btn);
    }
    btn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      let currentCoins = 0;
      try { currentCoins = Number(coins) || 0; } catch (_) {}
      if (!selecting && currentCoins < COST) return;
      setSelecting(!selecting);
    }, true);
    return btn;
  }

  function installHolderHandlers() {
    holders().forEach((h, i) => {
      if (h.dataset.rotateSelectionBound === '1') return;
      h.dataset.rotateSelectionBound = '1';
      h.addEventListener('pointerdown', e => {
        if (!selecting) return;
        if (!getPiece(i)) return;
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        choose(i);
      }, true);
      h.addEventListener('click', e => {
        if (!selecting) return;
        if (!getPiece(i)) return;
        e.preventDefault();
        e.stopPropagation();
        choose(i);
      }, true);
    });
  }

  function init() {
    if (initialized) return;
    initialized = true;
    const style = document.createElement('style');
    style.textContent = `
      .piece-holder.rotate-selectable,.piece-holder.rotate-choice{cursor:pointer!important;outline:2px solid #38bdf8;outline-offset:2px;box-shadow:0 0 0 3px rgba(56,189,248,.18);animation:rotateChoicePulse 1s ease-in-out infinite}
      .rotate-select-overlay{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;border-radius:10px;background:rgba(15,23,42,.55);color:#fff;font-size:32px;font-weight:900;text-shadow:0 2px 8px rgba(0,0,0,.9);pointer-events:none;z-index:20}
      .rotate-active{background:#059669!important;transform:scale(1.02)}
      @keyframes rotateChoicePulse{0%,100%{box-shadow:0 0 0 3px rgba(56,189,248,.15)}50%{box-shadow:0 0 0 6px rgba(56,189,248,.3)}}`;
    document.head.appendChild(style);
    installButton();
    installHolderHandlers();
    updateSelectionVisuals();
    setInterval(() => { installHolderHandlers(); if (!selecting) updateSelectionVisuals(); }, 500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else setTimeout(init, 0);
})();
