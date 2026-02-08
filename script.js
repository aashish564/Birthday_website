/**
 * CA Sahab – Co-Pilot Birthday Dashboard
 * Auto-confetti when message section is in view · Continuous falling confetti
 */

let confettiRunning = false;

document.addEventListener('DOMContentLoaded', () => {
  const messageSection = document.getElementById('birthdayMessage');
  const canvas = document.getElementById('confetti-canvas');

  if (!messageSection || !canvas) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !confettiRunning) {
          confettiRunning = true;
          startConfetti();
        }
      });
    },
    { threshold: 0.3 }
  );

  observer.observe(messageSection);

  window.addEventListener('resize', () => {
    if (canvas && confettiRunning) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  });
});

function startConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#f5c842', '#ff6b6b', '#69db7c', '#74c0fc', '#da77f2', '#ffd43b'];
  const confetti = [];
  const maxConfetti = 80;
  const spawnInterval = 80;
  let lastSpawn = 0;

  function createPiece() {
    return {
      x: Math.random() * canvas.width,
      y: -20,
      w: Math.random() * 8 + 4,
      h: Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: Math.random() * 2 + 2,
      angle: Math.random() * 360,
      rotation: (Math.random() - 0.5) * 8,
      opacity: Math.random() * 0.5 + 0.5,
    };
  }

  for (let i = 0; i < 40; i++) {
    confetti.push(createPiece());
  }

  function animate(timestamp) {

    if (!lastSpawn) lastSpawn = timestamp;
    const elapsed = timestamp - lastSpawn;

    if (elapsed > spawnInterval && confetti.length < maxConfetti) {
      confetti.push(createPiece());
      lastSpawn = timestamp;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = confetti.length - 1; i >= 0; i--) {
      const c = confetti[i];
      c.y += c.speed;
      c.x += Math.sin((c.angle * Math.PI) / 180) * 0.8;
      c.angle += c.rotation;

      if (c.y > canvas.height + 30) {
        confetti.splice(i, 1);
        confetti.push(createPiece());
      } else {
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate((c.angle * Math.PI) / 180);
        ctx.globalAlpha = c.opacity;
        ctx.fillStyle = c.color;
        ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
        ctx.restore();
      }
    }

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}
