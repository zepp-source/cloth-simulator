class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.px = x;
    this.py = y;
    this.pinned = false;
  }

  update(damping, gravity, windStrength, windPhase) {
    if (this.pinned) return;

    const vx = (this.x - this.px) * damping;
    const vy = (this.y - this.py) * damping;

    this.px = this.x;
    this.py = this.y;
    this.x += vx;
    this.y += vy + gravity;

    if (windStrength > 0) {
      this.x += Math.sin(windPhase + this.y * 0.02) * windStrength;
    }
  }
}

class Link {
  constructor(p1, p2) {
    this.p1 = p1;
    this.p2 = p2;
    this.restLength = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    this.active = true;
  }

  solve(stiffness, tearThreshold) {
    if (!this.active) return;

    const dx = this.p2.x - this.p1.x;
    const dy = this.p2.y - this.p1.y;
    const distance = Math.hypot(dx, dy) || 0.0001;

    if (distance > tearThreshold) {
      this.active = false;
      return;
    }

    const diff = (this.restLength - distance) / distance;
    const offsetX = (dx * diff * 0.5 * stiffness);
    const offsetY = (dy * diff * 0.5 * stiffness);

    if (!this.p1.pinned) {
      this.p1.x += offsetX;
      this.p1.y += offsetY;
    }
    if (!this.p2.pinned) {
      this.p2.x -= offsetX;
      this.p2.y -= offsetY;
    }
  }
}

class Cloth {
  constructor() {
    this.points = [];
    this.links = [];
    this.stiffness = 0.75;
    this.damping = 0.9945;
    this.gravity = 0.35;
    this.tearThreshold = 35;
    this.windStrength = 0;
    this.windPhase = 0;
    this.iterations = 6;
    this.width = 75;
    this.height = 45;
    this.spacing = 14;
    this.paused = false;
    this.mode = 'grab';
    this.mouseX = 0;
    this.mouseY = 0;
    this.pmouseX = 0;
    this.pmouseY = 0;
    this.mouseDown = false;
    this.mouseButton = 0;
    this.radius = 50;
    this.ground = window.innerHeight - 50;
    this.init();
  }

  init() {
    this.points = [];
    this.links = [];

    const startX = (window.innerWidth - (this.width - 1) * this.spacing) / 2 + 100;
    const startY = 60;

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const p = new Point(startX + x * this.spacing, startY + y * this.spacing);
        if (y === 0) p.pinned = true;
        this.points.push(p);
      }
    }

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const i = y * this.width + x;
        if (x < this.width - 1) this.links.push(new Link(this.points[i], this.points[i + 1]));
        if (y < this.height - 1) this.links.push(new Link(this.points[i], this.points[i + this.width]));
      }
    }
  }

  update() {
    if (this.paused) return;

    this.windPhase += 0.01;

    // update points
    for (let p of this.points) {
      p.update(this.damping, this.gravity, this.windStrength, this.windPhase);

      if (p.y > this.ground) {
        p.y = this.ground;
        p.py = p.y + (p.y - p.py) * 0.05;
      }
    }

    // solve constraints
    for (let i = 0; i < this.iterations; i++) {
      for (let l of this.links) {
        l.solve(this.stiffness, this.tearThreshold);
      }
    }

    // mouse interactions
    if (this.mouseDown) {
      const dx = this.mouseX - this.pmouseX;
      const dy = this.mouseY - this.pmouseY;

      if (this.mode === 'grab') {
        for (let p of this.points) {
          const d = Math.hypot(p.x - this.mouseX, p.y - this.mouseY);
          if (d < this.radius) {
            p.x += dx * 0.8;
            p.y += dy * 0.8;
            p.px = p.x;
            p.py = p.y;
          }
        }
      } else if (this.mode === 'tear' && this.mouseButton === 2) {
        for (let l of this.links) {
          const mx = (l.p1.x + l.p2.x) * 0.5;
          const my = (l.p1.y + l.p2.y) * 0.5;
          const d = Math.hypot(mx - this.mouseX, my - this.mouseY);
          if (d < this.radius) {
            l.active = false;
          }
        }
      } else if (this.mode === 'pin') {
        for (let p of this.points) {
          const d = Math.hypot(p.x - this.mouseX, p.y - this.mouseY);
          if (d < this.radius) {
            p.pinned = true;
          }
        }
      }
    }
  }

  draw(ctx, w, h) {
    ctx.clearRect(0, 0, w, h);

    // draw links
    ctx.lineWidth = 1.5;
    for (let l of this.links) {
      if (!l.active) continue;

      const d = Math.hypot(l.p2.x - l.p1.x, l.p2.y - l.p1.y);
      const stretch = (d - this.spacing) / this.spacing;

      let r = 150, g = 150, b = 150;
      if (stretch > 0) {
        const t = Math.min(stretch, 1);
        r = Math.floor(150 + t * 105);
        g = Math.floor(150 - t * 80);
        b = Math.floor(150 - t * 150);
      }

      ctx.strokeStyle = `rgb(${r},${g},${b})`;
      ctx.beginPath();
      ctx.moveTo(l.p1.x, l.p1.y);
      ctx.lineTo(l.p2.x, l.p2.y);
      ctx.stroke();
    }

    // draw pinned points
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    for (let p of this.points) {
      if (p.pinned) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  setPreset(name) {
    const preset = PRESETS[name];
    if (!preset) return;
    Object.assign(this, preset);
  }
}