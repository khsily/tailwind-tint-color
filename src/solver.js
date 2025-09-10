// Minimal Color utilities based on Barrett Sonntag's approach
// https://gist.github.com/barretts/e90d7e5251f36b183c67e02ba54c9ae1

'use strict';

const Color = require('./color');

class Solver {
  constructor(targetColor) {
    this.target = targetColor;
    this.targetHSL = targetColor.hsl();
    this.reusedColor = new Color(0, 0, 0);
  }

  solve() {
    const wide = this.solveWide();
    const narrow = this.solveNarrow(wide);
    return { values: narrow.values, loss: narrow.loss, filter: this.css(narrow.values) };
  }

  solveWide() {
    const A = 5;
    const c = 15;
    const a = [60, 180, 18000, 600, 1.2, 1.2];

    let best = { loss: Infinity };
    for (let i = 0; best.loss > 25 && i < 3; i++) {
      const initial = [50, 20, 3750, 50, 100, 100];
      const result = this.spsa(A, a, c, initial, 1000);
      if (result.loss < best.loss) best = result;
    }
    return best;
  }

  solveNarrow(wide) {
    const A = wide.loss;
    const c = 2;
    const A1 = A + 1;
    const a = [0.25 * A1, 0.25 * A1, A1, 0.25 * A1, 0.2 * A1, 0.2 * A1];
    return this.spsa(A, a, c, wide.values, 500);
  }

  spsa(A, a, c, values, iters) {
    const alpha = 1;
    const gamma = 1 / 6;

    let best = null;
    let bestLoss = Infinity;
    const deltas = new Array(6);
    const highArgs = new Array(6);
    const lowArgs = new Array(6);

    for (let k = 0; k < iters; k++) {
      const ck = c / Math.pow(k + 1, gamma);
      for (let i = 0; i < 6; i++) {
        deltas[i] = Math.random() > 0.5 ? 1 : -1;
        highArgs[i] = values[i] + ck * deltas[i];
        lowArgs[i] = values[i] - ck * deltas[i];
      }

      const lossDiff = this.loss(highArgs) - this.loss(lowArgs);
      for (let i = 0; i < 6; i++) {
        const g = (lossDiff / (2 * ck)) * deltas[i];
        const ak = a[i] / Math.pow(A + k + 1, alpha);
        values[i] = fix(values[i] - ak * g, i);
      }

      const loss = this.loss(values);
      if (loss < bestLoss) {
        best = values.slice(0);
        bestLoss = loss;
      }
    }
    return { values: best, loss: bestLoss };

    function fix(value, idx) {
      let max = 100;
      if (idx === 2 /* saturate */) max = 7500;
      else if (idx === 4 /* brightness */ || idx === 5 /* contrast */) max = 200;
      if (idx === 3 /* hue */) {
        if (value > max) value %= max;
        else if (value < 0) value = max + (value % max);
      } else if (value < 0) value = 0;
      else if (value > max) value = max;
      return value;
    }
  }

  loss(filters) {
    const color = this.reusedColor;
    color.set(0, 0, 0);
    color.invert(filters[0] / 100);
    color.sepia(filters[1] / 100);
    color.saturate(filters[2] / 100);
    color.hueRotate(filters[3] * 3.6);
    color.brightness(filters[4] / 100);
    color.contrast(filters[5] / 100);

    const colorHSL = color.hsl();
    return (
      Math.abs(color.r - this.target.r) +
      Math.abs(color.g - this.target.g) +
      Math.abs(color.b - this.target.b) +
      Math.abs(colorHSL.h - this.targetHSL.h) +
      Math.abs(colorHSL.s - this.targetHSL.s) +
      Math.abs(colorHSL.l - this.targetHSL.l)
    );
  }

  css(filters) {
    const fmt = (idx, mul = 1) => Math.round(filters[idx] * mul);
    return `brightness(0) saturate(100%) invert(${fmt(0)}%) sepia(${fmt(1)}%) saturate(${fmt(2)}%) hue-rotate(${fmt(3, 3.6)}deg) brightness(${fmt(4)}%) contrast(${fmt(5)}%)`;
  }
}

module.exports = Solver;
