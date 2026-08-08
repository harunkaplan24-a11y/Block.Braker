(() => {
  const STAR_COUNT = 30;
  const DURATION = 1100;

  function burstStars() {
    const layer = document.createElement('div');
    layer.style.cssText = 'position:fixed;inset:0;overflow:hidden;pointer-events:none;z-index:1900;';
    document.body.appendChild(layer);

    for (let i = 0; i < STAR_COUNT; i++) {
      const star = document.createElement('div');
      const x = 8 + Math.random() * 84;
      const size = 7 + Math.random() * 10;
      const delay = Math.random() * 180;
      const travel = 30 + Math.random() * 42;
      const drift = (Math.random() - 0.5) * 150;
      const rotate = (Math.random() - 0.5) * 1000;
      const colors = ['#facc15', '#fde68a', '#ffffff', '#38bdf8', '#f472b6'];

      star.textContent = '★';
      star.style.cssText = `position:absolute;left:${x}%;bottom:-30px;font-size:${size}px;color:${colors[i % colors.length]};text-shadow:0 0 8px currentColor;opacity:0;transform:translate(0,0) scale(.4) rotate(0deg);transition:transform ${DURATION}ms cubic-bezier(.16,1,.3,1),opacity 180ms ease-out;`;
      layer.appendChild(star);

      setTimeout(() => {
        star.style.opacity = '1';
        star.style.transform = `translate(${drift}px,-${travel}vh) scale(1) rotate(${rotate}deg)`;
      }, delay);

      setTimeout(() => {
        star.style.opacity = '0';
        star.style.transform += ' scale(.2)';
      }, 700 + delay);
    }

    setTimeout(() => layer.remove(), DURATION + 500);
  }

  function startCelebration() {
    burstStars();
    const orangutan = document.getElementById('orangutan-stage');
    if (orangutan) {
      orangutan.classList.remove('arms-celebrate');
      void orangutan.offsetWidth;
      orangutan.classList.add('arms-celebrate');
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    // Opening celebration.
    setTimeout(startCelebration, 250);

    // Level-up celebration: the existing overlay becomes populated when a level is reached.
    const overlay = document.getElementById('level-overlay');
    if (!overlay) return;

    let lastText = '';
    const observer = new MutationObserver(() => {
      const text = overlay.textContent.trim();
      const visible = getComputedStyle(overlay).display !== 'none' &&
                      getComputedStyle(overlay).visibility !== 'hidden' &&
                      getComputedStyle(overlay).opacity !== '0';
      if (text && text !== lastText && visible) {
        lastText = text;
        startCelebration();
      }
    });

    observer.observe(overlay, { childList: true, subtree: true, characterData: true, attributes: true });
  });
})();
