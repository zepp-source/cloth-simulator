const PRESET_CONFIG = {
  silk: {
    stiffness: 0.88,
    damping: 0.998,
    gravity: 0.28,
    tearThreshold: 42,
    windStrength: 0.45,
    bounce: 0.08,
    iterations: 7,
  },
  linen: {
    stiffness: 0.72,
    damping: 0.995,
    gravity: 0.38,
    tearThreshold: 32,
    windStrength: 0.25,
    bounce: 0.12,
    iterations: 6,
  },
  denim: {
    stiffness: 0.9,
    damping: 0.992,
    gravity: 0.42,
    tearThreshold: 60,
    windStrength: 0.6,
    bounce: 0.15,
    iterations: 8,
  },
  wool: {
    stiffness: 0.68,
    damping: 0.989,
    gravity: 0.46,
    tearThreshold: 55,
    windStrength: 0.7,
    bounce: 0.19,
    iterations: 9,
  },
  rubber: {
    stiffness: 1.0,
    damping: 0.994,
    gravity: 0.32,
    tearThreshold: 75,
    windStrength: 0.2,
    bounce: 0.35,
    iterations: 10,
  },
};

if (typeof window !== 'undefined') {
  window.PRESET_CONFIG = PRESET_CONFIG;
}