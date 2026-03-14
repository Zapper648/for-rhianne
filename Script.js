// ═══════════════════════════
// ELEMENTS
// ═══════════════════════════
const giftWrap      = document.getElementById('gift-wrap');
const sceneClosed   = document.getElementById('scene-closed');
const sceneOpen     = document.getElementById('scene-open');
const flash         = document.getElementById('flash');
const envelope      = document.getElementById('envelope');
const letterOverlay = document.getElementById('letter-overlay');
const letterClose   = document.getElementById('letter-close');
const starsLayer    = document.getElementById('stars-layer');
const polaroidLayer = document.getElementById('polaroid-layer');

let letterReady = false;   // blocked until cooldown ends after opening


// ═══════════════════════════
// SOUNDS
// ═══════════════════════════
const sfxShake      = new Audio('sfx/shake.mp3');
const sfxConfetti   = new Audio('sfx/confetti.mp3');
const sfxMusic      = new Audio('sfx/music.mp3');
const sfxOpenLetter = new Audio('sfx/open-letter.mp3');

sfxMusic.volume = 0.5;   // ✏️ background music at 50% — change if needed


// ═══════════════════════════
// SHAKE — works on any .card element
// ═══════════════════════════
const cards = document.querySelectorAll('.card');

cards.forEach(card => {
  card.addEventListener('click', () => {
    card.classList.remove('shaking');
    void card.offsetWidth;       // force browser to reset animation
    card.classList.add('shaking');

    // Play shake sound on every click
    sfxShake.currentTime = 0;   // rewind so it replays even if already playing
    sfxShake.play();

    card.addEventListener('animationend', () => {
      card.classList.remove('shaking');
    }, { once: true });
  });
});


// ═══════════════════════════
// PINK PARTICLE DOTS — closed scene
// ═══════════════════════════
for (let i = 0; i < 55; i++) {
  const star = document.createElement('div');
  star.className = 'star';

  const size = 2 + Math.random() * 5;

  star.style.cssText = `
    width:  ${size}px;
    height: ${size}px;
    top:    ${Math.random() * 100}%;
    left:   ${Math.random() * 100}%;
    --dur:   ${2 + Math.random() * 4}s;
    --delay: ${Math.random() * 5}s;
  `;

  starsLayer.appendChild(star);
}


// ═══════════════════════════
// FAST CLICK TO OPEN GIFT
// ═══════════════════════════
const CLICKS_REQUIRED = 5;
const TIME_WINDOW     = 1800;   // ms — how fast they need to click

let clickCount     = 0;
let firstClickTime = null;

giftWrap.addEventListener('click', () => {

  const now = Date.now();

  // Reset counter if first click or clicked too slowly
  if (!firstClickTime || now - firstClickTime > TIME_WINDOW) {
    firstClickTime = now;
    clickCount     = 1;
  } else {
    clickCount++;
  }

  // Enough fast clicks — trigger open sequence
  if (clickCount >= CLICKS_REQUIRED) {

    letterReady = false;   // lock envelope during flash/reveal

    // Flash screen white
    flash.style.transition = 'opacity 0.15s ease';
    flash.style.opacity    = '1';

    setTimeout(() => {

      // Switch scenes
      sceneClosed.style.display = 'none';
      sceneOpen.style.display   = 'flex';

      // Fade flash out slowly
      flash.style.transition = 'opacity 2s ease';
      flash.style.opacity    = '0';

      // Play confetti SFX + background music at the same time
      sfxConfetti.play();
      sfxMusic.play();

      // Spawn polaroids + confetti
      spawnPolaroids();
      startConfetti();

      // Unlock envelope after cooldown
      // ✏️ Change 600 to however many ms you want the cooldown to last
      setTimeout(() => {
        letterReady = true;
      }, 600);

    }, 220);

    // Reset
    clickCount     = 0;
    firstClickTime = null;
  }

});


// ═══════════════════════════
// ENVELOPE — opens letter on click
// drift animation runs in CSS
// shake runs from the .card listener above
// ═══════════════════════════
envelope.addEventListener('click', () => {
  if (!letterReady) return;   // blocked during cooldown

  // Play letter open sound
  sfxOpenLetter.currentTime = 0;
  sfxOpenLetter.play();

  letterOverlay.classList.add('open');
});

letterClose.addEventListener('click', () => {
  letterOverlay.classList.remove('open');
});

// Click outside letter paper closes it
letterOverlay.addEventListener('click', (e) => {
  if (e.target === letterOverlay) {
    letterOverlay.classList.remove('open');
  }
});


// ═══════════════════════════
// POLAROID IMAGES
//
// ✏️ CUSTOMIZE HERE:
//   src  → filename of your photo (put it in the same folder as index.html)
//   cap  → caption shown below the photo
//
// If a photo file is missing it shows a purple placeholder automatically
// ═══════════════════════════
const polaroidData = [
  { src: 'images/photo1.jfif', cap: 'my pretty girl <3' },
  { src: 'images/photo2.jfif', cap: 'my smart girl <3' },
  { src: 'images/photo3.jfif', cap: 'your favorite <3' },
  { src: 'images/photo4.jfif', cap: 'my cute girl <3' },
  { src: 'images/photo5.jfif', cap: 'my funny girl <3' },
  { src: 'images/photo6.jfif', cap: 'my favorite girl <3' },
];

// Positions — 3 on the left, 3 on the right, close to the center gift
// Tweak left/right % values to move them closer or further from center
const polaroidPositions = [
  { top: '5%',  left: '4%',  rot: -13 },
  { top: '35%', left: '2%',  rot: -5  },
  { top: '63%', left: '4%',  rot: -10 },
  { top: '4%',  right: '4%', rot:  12 },
  { top: '34%', right: '2%', rot:  7  },
  { top: '62%', right: '4%', rot:  9  },
];

function spawnPolaroids() {
  // Responsive photo size — smaller on mobile, bigger on desktop
  const photoSize = Math.round(Math.min(140, Math.max(85, window.innerWidth * 0.10)));

  polaroidData.forEach((data, i) => {
    const pos = polaroidPositions[i];
    const el  = document.createElement('div');
    el.className = 'polaroid';

    // Position
    el.style.top   = pos.top;
    el.style.left  = pos.left  || 'auto';
    el.style.right = pos.right || 'auto';
    el.style.transform = `rotate(${pos.rot}deg)`;

    // Fade in staggered
    el.style.opacity    = '0';
    el.style.transition = `opacity 0.5s ease ${0.2 + i * 0.12}s`;

    el.innerHTML = `
      <img
        src="${data.src}"
        alt="${data.cap}"
        width="${photoSize}"
        height="${photoSize}"
        onerror="this.style.cssText='width:${photoSize}px;height:${photoSize}px;display:block;background:linear-gradient(135deg,#edd0ef,#d8b0e2);'; this.removeAttribute('src');"
      />
      <div class="pol-cap">${data.cap}</div>
    `;

    // Hover: scale up while keeping rotation
    const rot = pos.rot;
    el.addEventListener('mouseenter', () => {
      el.style.transform  = `rotate(${rot}deg) scale(1.13)`;
      el.style.zIndex     = '50';
      el.style.boxShadow  = '0 14px 36px rgba(0,0,0,0.2)';
      el.style.transition = 'transform 0.25s ease, box-shadow 0.25s ease';
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform  = `rotate(${rot}deg)`;
      el.style.zIndex     = '15';
      el.style.boxShadow  = '';
      el.style.transition = 'transform 0.25s ease, box-shadow 0.25s ease';
    });

    polaroidLayer.appendChild(el);

    // Double rAF so the opacity transition actually fires
    requestAnimationFrame(() => {
      requestAnimationFrame(() => { el.style.opacity = '1'; });
    });
  });
}


// ═══════════════════════════
// CONFETTI
// ═══════════════════════════
const canvas = document.getElementById('confetti-canvas');
const ctx    = canvas.getContext('2d');
let pieces   = [];
let stopSpawn = false;

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const COLORS = [
  '#ff4da6', '#ff80c4', '#ffb3d9',
  '#c44dff', '#ffd700', '#4dc3ff',
  '#ff6b6b', '#ffffff', '#ffb347',
];

function spawnPieces(n) {
  for (let i = 0; i < n; i++) {
    const isStrip = Math.random() > 0.5;
    pieces.push({
      x:     Math.random() * canvas.width,
      y:     -20 - Math.random() * 120,
      w:     isStrip ? 4 : 9 + Math.random() * 6,
      h:     isStrip ? 14 + Math.random() * 8 : 6,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      angle: Math.random() * Math.PI * 2,
      spin:  (Math.random() - 0.5) * 0.2,
      vx:    (Math.random() - 0.5) * 3,
      vy:    2 + Math.random() * 2,
      alpha: 1,
    });
  }
}

function tickConfetti() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  pieces.forEach(p => {
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
    ctx.rotate(p.angle);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    ctx.restore();

    p.x     += p.vx;
    p.y     += p.vy;
    p.vy    += 0.05;     // gravity
    p.angle += p.spin;

    if (p.y > canvas.height) p.alpha -= 0.05;
  });

  pieces = pieces.filter(p => p.alpha > 0);

  if (!stopSpawn || pieces.length > 0) {
    requestAnimationFrame(tickConfetti);
  }
}

function startConfetti() {
  stopSpawn = false;
  spawnPieces(200);
  tickConfetti();

  // Keep trickling for ~3.5 seconds then stop
  let t = 0;
  const interval = setInterval(() => {
    spawnPieces(25);
    t++;
    if (t >= 12) {
      clearInterval(interval);
      stopSpawn = true;
    }
  }, 300);
}