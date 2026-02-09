/**
 * Breakout Game - Co-Pilot Birthday Dashboard
 * Enhanced with smooth physics, levels, particles, and feedback
 */

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('breakoutCanvas');
  const startBtn = document.getElementById('gameStartBtn');
  const scoreEl = document.getElementById('gameScore');
  const livesEl = document.getElementById('gameLives');
  const levelEl = document.getElementById('gameLevel');
  const messageEl = document.getElementById('gameMessage');

  if (!canvas || !startBtn) return;

  const ctx = canvas.getContext('2d');
  const brickColors = ['#ff6b6b', '#f5c842', '#69db7c', '#74c0fc', '#da77f2'];

  let gameRunning = false;
  let score = 0;
  let lives = 3;
  let level = 1;
  let ball = { x: 200, y: 450, dx: 0, dy: 0, r: 8, baseSpeed: 5 };
  let paddle = { x: 150, w: 80, h: 12, targetX: 150, speed: 0.25 };
  let bricks = [];
  let particles = [];
  let message = { text: '', alpha: 0, y: 0 };
  let animationId;
  let lastTime = 0;

  const brickRows = 5;
  const brickCols = 8;
  const brickW = 45;
  const brickH = 18;
  const brickGap = 4;

  function initBricks() {
    bricks = [];
    const rows = Math.min(brickRows + Math.floor(level / 2), 8);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < brickCols; c++) {
        bricks.push({
          x: c * (brickW + brickGap) + 25,
          y: r * (brickH + brickGap) + 25,
          w: brickW,
          h: brickH,
          color: brickColors[r % brickColors.length],
          visible: true
        });
      }
    }
  }

  function createParticles(x, y, color) {
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8 + Math.random();
      particles.push({
        x, y,
        vx: Math.cos(angle) * 4,
        vy: Math.sin(angle) * 4 - 2,
        life: 1,
        color,
        size: 4 + Math.random() * 4
      });
    }
  }

  function showMessage(text, duration = 1500) {
    message.text = text;
    message.alpha = 1;
    message.y = 0;
    if (messageEl) {
      messageEl.textContent = text;
      messageEl.classList.add('show');
      setTimeout(() => messageEl.classList.remove('show'), duration);
    }
  }

  function resetBall() {
    ball.x = 200;
    ball.y = 450;
    const speed = ball.baseSpeed + level * 0.5;
    ball.dx = speed * (Math.random() > 0.5 ? 1 : -1);
    ball.dy = -speed;
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Paddle with rounded look
    const py = canvas.height - 30;
    ctx.fillStyle = '#f5c842';
    ctx.shadowColor = 'rgba(245, 200, 66, 0.5)';
    ctx.shadowBlur = 8;
    ctx.fillRect(paddle.x, py, paddle.w, paddle.h);
    ctx.shadowBlur = 0;

    // Ball with glow
    ctx.shadowColor = 'rgba(255,255,255,0.8)';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.shadowBlur = 0;

    // Bricks with gradient
    bricks.forEach(b => {
      if (b.visible) {
        const g = ctx.createLinearGradient(b.x, b.y, b.x + b.w, b.y + b.h);
        g.addColorStop(0, b.color);
        g.addColorStop(1, adjustColor(b.color, -30));
        ctx.fillStyle = g;
        ctx.fillRect(b.x, b.y, b.w, b.h);
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 1;
        ctx.strokeRect(b.x, b.y, b.w, b.h);
      }
    });

    // Particles
    particles.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    });
  }

  function adjustColor(hex, amount) {
    const num = parseInt(hex.slice(1), 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
    return `rgb(${r},${g},${b})`;
  }

  function update(dt) {
    const delta = Math.min(dt / 16, 2);

    // Smooth paddle follow
    paddle.x += (paddle.targetX - paddle.x) * paddle.speed * delta;
    paddle.x = Math.max(0, Math.min(canvas.width - paddle.w, paddle.x));

    ball.x += ball.dx * delta;
    ball.y += ball.dy * delta;

    // Walls
    if (ball.x - ball.r < 0) { ball.x = ball.r; ball.dx = Math.abs(ball.dx); }
    if (ball.x + ball.r > canvas.width) { ball.x = canvas.width - ball.r; ball.dx = -Math.abs(ball.dx); }
    if (ball.y - ball.r < 0) { ball.y = ball.r; ball.dy = Math.abs(ball.dy); }

    // Paddle collision
    if (ball.dy > 0 && ball.y + ball.r > canvas.height - 30 &&
        ball.y - ball.r < canvas.height - 30 + paddle.h &&
        ball.x > paddle.x - ball.r && ball.x < paddle.x + paddle.w + ball.r) {
      ball.y = canvas.height - 30 - ball.r;
      ball.dy = -Math.abs(ball.dy);
      const hitPos = (ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
      ball.dx = hitPos * (ball.baseSpeed + level * 0.3);
    }

    // Lose life
    if (ball.y + ball.r > canvas.height) {
      lives--;
      if (livesEl) livesEl.textContent = lives;
      showMessage('Oops! 💔', 800);
      if (lives <= 0) {
        gameOver();
        return;
      }
      resetBall();
    }

    // Bricks
    let bricksHit = 0;
    let ballFlipped = false;
    bricks.forEach(b => {
      if (b.visible &&
          ball.x + ball.r > b.x && ball.x - ball.r < b.x + b.w &&
          ball.y + ball.r > b.y && ball.y - ball.r < b.y + b.h) {
        b.visible = false;
        createParticles(b.x + b.w / 2, b.y + b.h / 2, b.color);
        if (!ballFlipped) { ball.dy *= -1; ballFlipped = true; }
        bricksHit++;
        const points = 10 + (level - 1) * 2;
        score += points;
        if (scoreEl) scoreEl.textContent = score;
      }
    });

    // Combo message
    if (bricksHit > 1) {
      showMessage(`${bricksHit}x Combo! 🔥`, 600);
    }

    // Score milestones
    if (score > 0 && score % 100 === 0 && bricksHit > 0) {
      showMessage(`${score} points! 🎉`, 1200);
    }

    // Level complete
    if (bricks.every(b => !b.visible)) {
      score += 50 + level * 10;
      if (scoreEl) scoreEl.textContent = score;
      level++;
      if (levelEl) levelEl.textContent = level;
      showMessage(`Level ${level}! 🚀`, 1200);
      initBricks();
      resetBall();
      // Brief pause
      gameRunning = false;
      setTimeout(() => {
        gameRunning = true;
        gameLoop(performance.now());
      }, 800);
    }

    // Update particles
    particles = particles.filter(p => {
      p.x += p.vx * delta;
      p.y += p.vy * delta;
      p.life -= 0.04 * delta;
      return p.life > 0;
    });
  }

  function gameLoop(timestamp) {
    if (!gameRunning) return;
    const dt = timestamp - lastTime;
    lastTime = timestamp;
    update(dt);
    draw();
    animationId = requestAnimationFrame(gameLoop);
  }

  function gameOver() {
    gameRunning = false;
    cancelAnimationFrame(animationId);
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ff6b6b';
    ctx.font = 'bold 26px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 30);
    ctx.fillStyle = '#f5c842';
    ctx.font = '18px Outfit, sans-serif';
    ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2);
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '14px Outfit, sans-serif';
    ctx.fillText(`Level ${level}`, canvas.width / 2, canvas.height / 2 + 25);
    startBtn.style.display = 'block';
    startBtn.textContent = 'Play Again';
  }

  function startGame() {
    score = 0;
    lives = 3;
    level = 1;
    particles = [];
    lastTime = performance.now();
    if (scoreEl) scoreEl.textContent = score;
    if (livesEl) livesEl.textContent = lives;
    if (levelEl) levelEl.textContent = level;
    if (messageEl) messageEl.textContent = '';
    ball.baseSpeed = 5;
    initBricks();
    resetBall();
    showMessage('Go! 🎮', 600);
    gameRunning = true;
    startBtn.style.display = 'none';
    lastTime = performance.now();
    gameLoop(lastTime);
  }

  startBtn.addEventListener('click', startGame);

  // Paddle controls
  let mouseX = 200;
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
    paddle.targetX = mouseX - paddle.w / 2;
  });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    mouseX = (e.touches[0].clientX - rect.left) * (canvas.width / rect.width);
    paddle.targetX = mouseX - paddle.w / 2;
  }, { passive: false });

  // Initial draw
  initBricks();
  draw();
});
