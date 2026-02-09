/**
 * 2048 Game - Co-Pilot Birthday Dashboard
 * Slide tiles, merge numbers, reach 2048!
 */

document.addEventListener('DOMContentLoaded', () => {
  const gridEl = document.getElementById('grid2048');
  const scoreEl = document.getElementById('score2048');
  const bestEl = document.getElementById('best2048');
  const startBtn = document.getElementById('game2048StartBtn');

  if (!gridEl || !startBtn) return;

  const tiles = [];
  let score = 0;
  let best = parseInt(localStorage.getItem('2048-best') || '0', 10);
  const size = 4;

  const tileColors = {
    2: { bg: '#3d5a80', color: '#e9ecef' },
    4: { bg: '#ee6c4d', color: '#fff' },
    8: { bg: '#f5c842', color: '#1a2d4a' },
    16: { bg: '#ea3546', color: '#fff' },
    32: { bg: '#ff6b6b', color: '#fff' },
    64: { bg: '#e63946', color: '#fff' },
    128: { bg: '#69db7c', color: '#1a2d4a' },
    256: { bg: '#38b000', color: '#fff' },
    512: { bg: '#74c0fc', color: '#1a2d4a' },
    1024: { bg: '#4895ef', color: '#fff' },
    2048: { bg: '#f5c842', color: '#1a2d4a' },
    4096: { bg: '#da77f2', color: '#fff' }
  };

  function getTileStyle(n) {
    return tileColors[n] || { bg: '#2d4a6f', color: '#e9ecef' };
  }

  function initGrid() {
    tiles.length = 0;
    for (let i = 0; i < size * size; i++) tiles.push(0);
  }

  function addRandom() {
    const empty = tiles.map((v, i) => v === 0 ? i : -1).filter(i => i >= 0);
    if (empty.length) {
      const idx = empty[Math.floor(Math.random() * empty.length)];
      tiles[idx] = Math.random() < 0.9 ? 2 : 4;
    }
  }

  function render() {
    gridEl.innerHTML = '';
    tiles.forEach((val, i) => {
      const cell = document.createElement('div');
      cell.className = 'tile-2048' + (val ? ' tile-' + val : '');
      const style = getTileStyle(val);
      cell.style.background = style.bg;
      cell.style.color = style.color;
      cell.textContent = val || '';
      gridEl.appendChild(cell);
    });
    if (scoreEl) scoreEl.textContent = score;
    if (bestEl) bestEl.textContent = best;
  }

  function move(dir) {
    let moved = false;
    const lines = [[0,1,2,3],[4,5,6,7],[8,9,10,11],[12,13,14,15]];
    const cols = [[0,4,8,12],[1,5,9,13],[2,6,10,14],[3,7,11,15]];

    const slide = (indices, reverse) => {
      let row = indices.map(i => tiles[i]);
      if (reverse) row = row.reverse();
      const nonZero = row.filter(v => v);
      const merged = [];
      for (let i = 0; i < nonZero.length; i++) {
        if (i < nonZero.length - 1 && nonZero[i] === nonZero[i + 1]) {
          merged.push(nonZero[i] * 2);
          score += nonZero[i] * 2;
          i++;
        } else merged.push(nonZero[i]);
      }
      while (merged.length < 4) merged.push(0);
      if (reverse) merged.reverse();
      indices.forEach((idx, i) => {
        if (tiles[idx] !== merged[i]) moved = true;
        tiles[idx] = merged[i];
      });
    };

    if (dir === 'left' || dir === 'right') {
      lines.forEach(line => slide(line, dir === 'right'));
    } else {
      cols.forEach(col => slide(col, dir === 'down'));
    }

    if (moved) {
      addRandom();
      if (score > best) { best = score; localStorage.setItem('2048-best', best); }
      render();
      checkGameOver();
    }
  }

  function checkGameOver() {
    for (let i = 0; i < size * size; i++) {
      if (tiles[i] === 0) return;
      const row = Math.floor(i / 4), col = i % 4;
      if (col < 3 && tiles[i] === tiles[i + 1]) return;
      if (row < 3 && tiles[i] === tiles[i + 4]) return;
    }
    setTimeout(() => alert('Game Over! Score: ' + score), 100);
  }

  function startGame() {
    initGrid();
    score = 0;
    addRandom();
    addRandom();
    render();
  }

  startBtn.addEventListener('click', startGame);

  const panel2048 = document.getElementById('game2048Panel');

  document.addEventListener('keydown', (e) => {
    if (!panel2048 || !panel2048.classList.contains('active')) return;
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) {
      e.preventDefault();
      move(e.code.replace('Arrow', '').toLowerCase());
    }
  });

  let touchStart = null;
  gridEl.addEventListener('touchstart', (e) => {
    touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, { passive: true });
  gridEl.addEventListener('touchend', (e) => {
    if (!touchStart || !e.changedTouches?.[0]) return;
    const dx = e.changedTouches[0].clientX - touchStart.x;
    const dy = e.changedTouches[0].clientY - touchStart.y;
    const thresh = 40;
    if (Math.abs(dx) > thresh || Math.abs(dy) > thresh) {
      if (Math.abs(dx) > Math.abs(dy)) {
        move(dx > 0 ? 'right' : 'left');
      } else {
        move(dy > 0 ? 'down' : 'up');
      }
    }
    touchStart = null;
  }, { passive: true });

  // Tab switching
  document.querySelectorAll('.game-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.game-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.game-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.game + 'Panel')?.classList.add('active');
    });
  });

  startGame();
});
