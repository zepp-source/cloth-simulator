const canvas = document.getElementById('glCanvas');
const simulation = new window.ClothSimulation(75, 45, 14);
const renderer = new window.ClothRenderer(canvas, simulation);
const ui = new window.UIController(simulation);

renderer.resize();

window.addEventListener('resize', () => {
  renderer.resize();
});

canvas.addEventListener('contextmenu', (event) => {
  event.preventDefault();
});

canvas.addEventListener('pointerdown', (event) => {
  const rect = canvas.getBoundingClientRect();
  simulation.pointer.down = true;
  simulation.pointer.button = event.button;
  simulation.setPointerFromEvent(event, rect);
});

canvas.addEventListener('pointermove', (event) => {
  const rect = canvas.getBoundingClientRect();
  simulation.setPointerFromEvent(event, rect);
});

window.addEventListener('pointerup', () => {
  simulation.pointer.down = false;
});

canvas.addEventListener('touchstart', (event) => {
  const rect = canvas.getBoundingClientRect();
  simulation.setTouchesFromEvent(event, rect);
  event.preventDefault();
}, { passive: false });

canvas.addEventListener('touchmove', (event) => {
  const rect = canvas.getBoundingClientRect();
  simulation.setTouchesFromEvent(event, rect);
  event.preventDefault();
}, { passive: false });

canvas.addEventListener('touchend', () => {
  simulation.touchPoints.clear();
});

window.addEventListener('keydown', (event) => {
  if (event.key.toLowerCase() === 'r') {
    simulation.initialize();
  }
});

let lastTimestamp = 0;

function animate(timestamp) {
  const delta = Math.min(32, timestamp - lastTimestamp || 16.7);
  lastTimestamp = timestamp;

  simulation.update(delta);
  renderer.render();
  renderer.updateFPS(timestamp);

  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
