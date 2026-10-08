const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const cloth = new Cloth();

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  cloth.ground = window.innerHeight - 50;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// panel controls
const toggle = document.getElementById('toggle-btn');
const panel = document.getElementById('panel');
const panelBody = document.getElementById('panel-body');

toggle.addEventListener('click', () => {
  panel.classList.toggle('collapsed');
  toggle.textContent = panel.classList.contains('collapsed') ? '+' : '−';
});

// preset buttons
document.querySelectorAll('[data-preset]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('[data-preset]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    cloth.setPreset(btn.dataset.preset);
    updateSliders();
  });
});

// mode buttons
document.querySelectorAll('[data-mode]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('[data-mode]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    cloth.mode = btn.dataset.mode;
  });
});

// sliders
const sliderMap = {
  stiffness: 'stiffness',
  damping: 'damping',
  gravity: 'gravity',
  tear: 'tearThreshold',
  wind: 'windStrength',
  iterations: 'iterations'
};

Object.entries(sliderMap).forEach(([id, prop]) => {
  const input = document.getElementById(id);
  const value = document.getElementById(`val-${id}`);
  input.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    cloth[prop] = val;
    value.textContent = val.toFixed(prop === 'iterations' ? 0 : 2);
  });
});

function updateSliders() {
  Object.entries(sliderMap).forEach(([id, prop]) => {
    const input = document.getElementById(id);
    const value = document.getElementById(`val-${id}`);
    const val = cloth[prop];
    input.value = val;
    value.textContent = val.toFixed(prop === 'iterations' ? 0 : prop === 'tearThreshold' ? 0 : 2);
  });
}

// reset
document.getElementById('reset').addEventListener('click', () => {
  cloth.init();
});

// pause
let isPaused = false;
document.getElementById('pause').addEventListener('click', (e) => {
  isPaused = !isPaused;
  cloth.paused = isPaused;
  e.target.textContent = isPaused ? 'Resume' : 'Pause';
});

// mouse events
canvas.addEventListener('contextmenu', e => e.preventDefault());

canvas.addEventListener('mousedown', (e) => {
  cloth.mouseDown = true;
  cloth.mouseButton = e.button;
  cloth.pmouseX = cloth.mouseX = e.clientX;
  cloth.pmouseY = cloth.mouseY = e.clientY;
});

canvas.addEventListener('mousemove', (e) => {
  cloth.pmouseX = cloth.mouseX;
  cloth.pmouseY = cloth.mouseY;
  cloth.mouseX = e.clientX;
  cloth.mouseY = e.clientY;
});

window.addEventListener('mouseup', () => {
  cloth.mouseDown = false;
});

// touch events
canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  const touch = e.touches[0];
  cloth.mouseDown = true;
  cloth.pmouseX = cloth.mouseX = touch.clientX;
  cloth.pmouseY = cloth.mouseY = touch.clientY;
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  const touch = e.touches[0];
  cloth.pmouseX = cloth.mouseX;
  cloth.pmouseY = cloth.mouseY;
  cloth.mouseX = touch.clientX;
  cloth.mouseY = touch.clientY;
}, { passive: false });

canvas.addEventListener('touchend', () => {
  cloth.mouseDown = false;
});

// keyboard
window.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 'r') {
    cloth.init();
  }
});

// animation loop
let frameCount = 0;
let lastTime = performance.now();

function animate(now) {
  cloth.update();
  cloth.draw(ctx, canvas.width, canvas.height);

  frameCount++;
  if (now - lastTime >= 1000) {
    document.getElementById('fps').textContent = `FPS: ${frameCount}`;
    frameCount = 0;
    lastTime = now;
  }

  requestAnimationFrame(animate);
}

animate(lastTime);