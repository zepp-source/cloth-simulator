class ClothRenderer {
  constructor(canvas, simulation) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.simulation = simulation;
    this.lastFrame = 0;
    this.frameCount = 0;
    this.fps = 0;
  }

  resize() {
    const ratio = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.canvas.width = Math.round(width * ratio);
    this.canvas.height = Math.round(height * ratio);
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    this.simulation.groundY = height - 60;
  }

  render() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.ctx.clearRect(0, 0, width, height);

    const glow = this.ctx.createRadialGradient(
      width * 0.5,
      height * 0.2,
      40,
      width * 0.5,
      height * 0.8,
      height * 0.9
    );
    glow.addColorStop(0, 'rgba(80, 112, 255, 0.18)');
    glow.addColorStop(1, 'rgba(6, 12, 24, 0)');
    this.ctx.fillStyle = glow;
    this.ctx.fillRect(0, 0, width, height);

    this.ctx.lineWidth = 1.2;

    for (const link of this.simulation.links) {
      if (!link.active) continue;

      const { a, b } = link;
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      const stretch = (distance - this.simulation.spacing) / this.simulation.spacing;

      let r = 34;
      let g = 172;
      let b = 92;

      if (stretch > 0) {
        const t = clamp(stretch / 0.45, 0, 1);
        r = t < 0.5 ? 34 + Math.floor(t * 360) : 255;
        g = t < 0.5 ? 172 : Math.floor(172 - (t - 0.5) * 180);
        b = t < 0.5 ? 92 : Math.floor(92 - (t - 0.5) * 70);
      }

      this.ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;
      this.ctx.beginPath();
      this.ctx.moveTo(a.x, a.y);
      this.ctx.lineTo(b.x, b.y);
      this.ctx.stroke();
    }

    this.ctx.fillStyle = 'rgba(255,255,255,0.72)';
    for (const point of this.simulation.points) {
      if (point.pinned) {
        this.ctx.beginPath();
        this.ctx.arc(point.x, point.y, 2.4, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }
  }

  updateFPS(timestamp) {
    this.frameCount += 1;

    if (timestamp - this.lastFrame >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (timestamp - this.lastFrame));
      this.frameCount = 0;
      this.lastFrame = timestamp;

      const fpsCounter = document.getElementById('fps-counter');
      if (fpsCounter) {
        fpsCounter.textContent = `FPS: ${this.fps}`;
      }
    }
  }
}

if (typeof window !== 'undefined') {
  window.ClothRenderer = ClothRenderer;
}