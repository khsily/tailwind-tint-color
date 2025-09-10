// Minimal Color utilities based on Barrett Sonntag's approach
// https://gist.github.com/barretts/e90d7e5251f36b183c67e02ba54c9ae1

'use strict';

class Color {
  constructor(r, g, b) {
    this.reused = [0, 0, 0];
    this.set(r, g, b);
  }

  clamp(v) {
    return Math.max(0, Math.min(255, v));
  }

  set(r, g, b) {
    this.r = this.clamp(r);
    this.g = this.clamp(g);
    this.b = this.clamp(b);
  }

  multiply(m) {
    const r = this.r,
      g = this.g,
      b = this.b;
    this.r = this.clamp(r * m[0] + g * m[1] + b * m[2]);
    this.g = this.clamp(r * m[3] + g * m[4] + b * m[5]);
    this.b = this.clamp(r * m[6] + g * m[7] + b * m[8]);
  }

  invert(value = 1) {
    this.r = this.clamp((value + (this.r / 255) * (1 - 2 * value)) * 255);
    this.g = this.clamp((value + (this.g / 255) * (1 - 2 * value)) * 255);
    this.b = this.clamp((value + (this.b / 255) * (1 - 2 * value)) * 255);
  }

  sepia(value = 1) {
    this.multiply([
      0.393 + 0.607 * (1 - value),
      0.769 - 0.769 * (1 - value),
      0.189 - 0.189 * (1 - value),
      0.349 - 0.349 * (1 - value),
      0.686 + 0.314 * (1 - value),
      0.168 - 0.168 * (1 - value),
      0.272 - 0.272 * (1 - value),
      0.534 - 0.534 * (1 - value),
      0.131 + 0.869 * (1 - value),
    ]);
  }

  saturate(value = 1) {
    this.multiply([
      0.213 + 0.787 * value,
      0.715 - 0.715 * value,
      0.072 - 0.072 * value,
      0.213 - 0.213 * value,
      0.715 + 0.285 * value,
      0.072 - 0.072 * value,
      0.213 - 0.213 * value,
      0.715 - 0.715 * value,
      0.072 + 0.928 * value,
    ]);
  }

  hueRotate(angle = 0) {
    angle = (angle / 180) * Math.PI;
    const sin = Math.sin(angle);
    const cos = Math.cos(angle);
    this.multiply([
      0.213 + cos * 0.787 - sin * 0.213,
      0.715 - cos * 0.715 - sin * 0.715,
      0.072 - cos * 0.072 + sin * 0.928,
      0.213 - cos * 0.213 + sin * 0.143,
      0.715 + cos * 0.285 + sin * 0.14,
      0.072 - cos * 0.072 - sin * 0.283,
      0.213 - cos * 0.213 - sin * 0.787,
      0.715 - cos * 0.715 + sin * 0.715,
      0.072 + cos * 0.928 + sin * 0.072,
    ]);
  }

  brightness(value = 1) {
    this.r = this.clamp(this.r * value);
    this.g = this.clamp(this.g * value);
    this.b = this.clamp(this.b * value);
  }

  contrast(value = 1) {
    this.r = this.clamp((this.r - 128) * value + 128);
    this.g = this.clamp((this.g - 128) * value + 128);
    this.b = this.clamp((this.b - 128) * value + 128);
  }

  hsl() {
    const r = this.r / 255,
      g = this.g / 255,
      b = this.b / 255;
    const max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    let h, s;
    const l = (max + min) / 2;
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        default:
          h = (r - g) / d + 4;
      }
      h /= 6;
    }
    // match sample.js scaling: h in 0..100, s/l in 0..100 (no rounding)
    return { h: h * 100, s: s * 100, l: l * 100 };
  }
}

module.exports = Color;
