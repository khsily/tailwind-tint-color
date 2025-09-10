'use strict';

const plugin = require('tailwindcss/plugin');
const flattenColorPalette = require('tailwindcss/lib/util/flattenColorPalette');
const Color = require('./color');
const Solver = require('./solver');
const { parseColor } = require('./parser');

function getFilterForColor(colorValue) {
  try {
    const color = String(colorValue).trim();
    if (color === 'transparent') return 'opacity(0)';
    if (color === 'currentColor' || color === 'inherit') return 'none';

    const rgb = parseColor(color);
    if (!rgb) return 'none';

    const target = new Color(rgb.r, rgb.g, rgb.b);
    const solver = new Solver(target);
    const result = solver.solve();
    return result.filter;
  } catch (e) {
    return 'none';
  }
}

module.exports = plugin(function ({ matchUtilities, theme }) {
  matchUtilities(
    { tint: (value) => ({ filter: getFilterForColor(value) }) },
    { values: flattenColorPalette(theme('colors')), type: 'color' },
  );
});
