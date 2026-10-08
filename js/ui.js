class UIController {
  constructor(simulation) {
    this.simulation = simulation;
    this.panel = document.getElementById('control-panel');
    this.menuToggle = document.getElementById('menu-toggle');
    this.resetBtn = document.getElementById('reset-btn');
    this.pauseBtn = document.getElementById('pause-btn');
    this.presetButtons = [...document.querySelectorAll('.preset-btn')];
    this.modeButtons = [...document.querySelectorAll('.mode-btn')];

    this.bindEvents();
  }

  bindEvents() {
    this.menuToggle.addEventListener('click', () => {
      this.panel.classList.toggle('collapsed');
    });

    this.resetBtn.addEventListener('click', () => {
      this.simulation.initialize();
    });

    this.pauseBtn.addEventListener('click', () => {
      this.simulation.paused = !this.simulation.paused;
      this.pauseBtn.textContent = this.simulation.paused ? 'Resume' : 'Pause';
    });

    this.presetButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        this.presetButtons.forEach((button) => button.classList.toggle('active', button === btn));
        this.applyPreset(btn.dataset.preset);
      });
    });

    this.modeButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        this.modeButtons.forEach((button) => button.classList.toggle('active', button === btn));
        this.simulation.setInteractionMode(btn.dataset.mode);
      });
    });

    const sliderMap = {
      stiffness: ['stiffness', 'stiffness-value'],
      damping: ['damping', 'damping-value'],
      gravity: ['gravity', 'gravity-value'],
      'tear-threshold': ['tear-threshold', 'tear-threshold-value'],
      'wind-strength': ['wind-strength', 'wind-strength-value'],
      bounce: ['bounce', 'bounce-value'],
      width: ['width', 'width-value'],
      height: ['height', 'height-value'],
      spacing: ['spacing', 'spacing-value'],
      iterations: ['iterations', 'iterations-value'],
    };

    Object.entries(sliderMap).forEach(([key, [inputId, valueId]]) => {
      const input = document.getElementById(inputId);
      const display = document.getElementById(valueId);

      input.addEventListener('input', (event) => {
        const value = Number(event.target.value);
        display.textContent = this.formatValue(key, value);

        if (key === 'stiffness') this.simulation.stiffness = value;
        if (key === 'damping') this.simulation.damping = value;
        if (key === 'gravity') this.simulation.gravity = value;
        if (key === 'tear-threshold') this.simulation.tearThreshold = value;
        if (key === 'wind-strength') this.simulation.windStrength = value;
        if (key === 'bounce') this.simulation.bounce = value;
        if (key === 'iterations') this.simulation.iterations = value;

        if (key === 'width' || key === 'height' || key === 'spacing') {
          this.simulation.setDimensions(
            Number(document.getElementById('width').value),
            Number(document.getElementById('height').value),
            Number(document.getElementById('spacing').value)
          );
        }
      });
    });
  }

  formatValue(key, value) {
    if (key === 'damping') return Number(value).toFixed(4);
    if (key === 'gravity') return Number(value).toFixed(2);
    if (key === 'wind-strength') return Number(value).toFixed(1);
    if (key === 'bounce') return Number(value).toFixed(2);
    return String(value);
  }

  applyPreset(name) {
    const preset = window.PRESET_CONFIG[name];
    if (!preset) return;

    this.simulation.applyPreset(name);

    const map = {
      stiffness: 'stiffness',
      damping: 'damping',
      gravity: 'gravity',
      tearThreshold: 'tear-threshold',
      windStrength: 'wind-strength',
      bounce: 'bounce',
      iterations: 'iterations',
    };

    Object.entries(map).forEach(([sourceKey, inputId]) => {
      const slider = document.getElementById(inputId);
      const output = document.getElementById(`${inputId}-value`);
      const value = preset[sourceKey];

      if (!slider || !output || value === undefined) return;

      slider.value = value;
      output.textContent = this.formatValue(inputId, value);
    });
  }
}

if (typeof window !== 'undefined') {
  window.UIController = UIController;
}