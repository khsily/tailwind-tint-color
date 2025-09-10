'use strict';

/**
 * Parse hex color string and convert to RGB values
 * Supports both 3-digit (#RGB) and 6-digit (#RRGGBB) formats
 * @param {string} hex - Hex color string (e.g., "#ff0000" or "#f00")
 * @returns {Object|null} RGB object with r, g, b properties or null if invalid
 */
function parseHexColor(hex) {
  let s = String(hex).trim();
  if (!s.startsWith('#')) return null;
  s = s.slice(1);
  if (s.length === 3)
    s = s
      .split('')
      .map((c) => c + c)
      .join('');
  if (s.length !== 6) return null;
  const r = parseInt(s.slice(0, 2), 16);
  const g = parseInt(s.slice(2, 4), 16);
  const b = parseInt(s.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null;
  return { r, g, b };
}

/**
 * Parse RGB color string and convert to RGB values
 * Supports both rgb() and rgba() formats
 * @param {string} rgb - RGB color string (e.g., "rgb(255, 0, 0)" or "rgba(255, 0, 0, 0.5)")
 * @returns {Object|null} RGB object with r, g, b properties or null if invalid
 */
function parseRgbColor(rgb) {
  const m = String(rgb)
    .trim()
    .match(/rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (!m) return null;
  return { r: +m[1], g: +m[2], b: +m[3] };
}

/**
 * Convert HSL color values to RGB using W3C standard algorithm
 * @param {number} h - Hue value (0-1)
 * @param {number} s - Saturation value (0-1)
 * @param {number} l - Lightness value (0-1)
 * @returns {Object} RGB object with r, g, b properties (0-255)
 * 
 * @link https://www.w3.org/TR/css-color-4/#hsl-to-rgb
 */
function hslToRgb(h, s, l) {
  const hue = h * 360;
  const sat = s * 100;
  const light = l * 100;
  
  const f = (n) => {
    const k = (n + hue / 30) % 12;
    const a = sat * Math.min(light, 100 - light) / 100;
    return light - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  
  return {
    r: Math.round(f(0) * 2.55),
    g: Math.round(f(8) * 2.55),
    b: Math.round(f(4) * 2.55)
  };
}

/**
 * Parse HSL color string and convert to RGB values
 * Supports both hsl() and hsla() formats
 * @param {string} hsl - HSL color string (e.g., "hsl(0, 100%, 50%)" or "hsla(0, 100%, 50%, 0.5)")
 * @returns {Object|null} RGB object with r, g, b properties or null if invalid
 */
function parseHslColor(hsl) {
  const m = String(hsl)
    .trim()
    .match(/hsla?\((\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%/i);
  if (!m) return null;
  const h = parseInt(m[1], 10) / 360;
  const s = parseInt(m[2], 10) / 100;
  const l = parseInt(m[3], 10) / 100;
  return hslToRgb(h, s, l);
}

/**
 * Parse any color format string and convert to RGB values
 * Supports hex, RGB, HSL, OKLCH, and OKLAB color formats
 * @param {string} input - Color string in any supported format
 * @returns {Object|null} RGB object with r, g, b properties or null if invalid
 */
function parseColor(input) {
  const s = String(input).trim();
  if (s.startsWith('#')) return parseHexColor(s);
  if (s.toLowerCase().startsWith('rgb')) return parseRgbColor(s);
  if (s.toLowerCase().startsWith('hsl')) return parseHslColor(s);
  if (s.toLowerCase().startsWith('oklch')) return parseOklchColor(s);
  if (s.toLowerCase().startsWith('oklab')) return parseOklabColor(s);
  return null;
}

// --- OKLCH/OKLAB parsing & conversion ---

/**
 * Clamp a value between 0 and 1
 * @param {number} x - Value to clamp
 * @returns {number} Clamped value between 0 and 1
 */
function clamp01(x) {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

/**
 * Apply sRGB companding (gamma correction) to linear RGB value
 * @param {number} x - Linear RGB value (0-1)
 * @returns {number} sRGB companded value (0-1)
 */
function srgbCompand(x) {
  return x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
}

/**
 * Convert linear RGB values to sRGB values
 * @param {number} r - Red component (0-1)
 * @param {number} g - Green component (0-1)
 * @param {number} b - Blue component (0-1)
 * @returns {Object} sRGB object with r, g, b properties (0-255)
 */
function linearToSrgb(r, g, b) {
  return {
    r: Math.round(clamp01(srgbCompand(r)) * 255),
    g: Math.round(clamp01(srgbCompand(g)) * 255),
    b: Math.round(clamp01(srgbCompand(b)) * 255),
  };
}

/**
 * Convert OKLAB color values to linear RGB values
 * @param {number} L - Lightness component (0-1)
 * @param {number} a - Green-red component (-0.4 to 0.4)
 * @param {number} b - Blue-yellow component (-0.4 to 0.4)
 * @returns {Object} Linear RGB object with r, g, b properties (0-1)
 */
function oklabToLinearRgb(L, a, b) {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  const r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bl = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

  return { r, g, b: bl };
}

/**
 * Parse a number or percentage string and return as decimal
 * @param {string} token - Number string (e.g., "50" or "50%")
 * @returns {number} Decimal value (0-1 for percentages, 0-100 for numbers)
 */
function parseNumberOrPercent(token) {
  const t = token.trim();
  if (t.endsWith('%')) return parseFloat(t) / 100;
  return parseFloat(t);
}

/**
 * Parse angle string and convert to degrees
 * Supports deg, grad, rad, and turn units
 * @param {string} token - Angle string (e.g., "90deg", "100grad", "1.57rad", "0.25turn")
 * @returns {number} Angle in degrees
 */
function parseAngle(token) {
  const t = token.trim().toLowerCase();
  if (t.endsWith('deg')) return parseFloat(t);
  if (t.endsWith('grad')) return parseFloat(t) * 0.9;
  if (t.endsWith('rad')) return (parseFloat(t) * 180) / Math.PI;
  if (t.endsWith('turn')) return parseFloat(t) * 360;
  const v = parseFloat(t);
  return isNaN(v) ? 0 : v;
}

/**
 * Parse OKLCH color string and convert to RGB values
 * Supports both OKLCH and OKLCH with alpha formats
 * @param {string} str - OKLCH color string (e.g., "oklch(0.7 0.15 180)" or "oklch(0.7 0.15 180 / 0.8)")
 * @returns {Object|null} RGB object with r, g, b properties or null if invalid
 */
function parseOklchColor(str) {
  const m = str.match(/oklch\(\s*([^\s\/]+)\s+([^\s\/]+)\s+([^\s\/\)]+)(?:\s*\/\s*[^\)]+)?\s*\)/i);
  if (!m) return null;
  let L = parseNumberOrPercent(m[1]);
  let C = parseFloat(m[2]);
  let h = parseAngle(m[3]);
  if (L > 1) L = L / 100;
  const hr = (h * Math.PI) / 180;
  const a = C * Math.cos(hr);
  const b = C * Math.sin(hr);
  const { r, g, b: bl } = oklabToLinearRgb(L, a, b);
  return linearToSrgb(r, g, bl);
}

/**
 * Parse OKLAB color string and convert to RGB values
 * Supports both OKLAB and OKLAB with alpha formats
 * @param {string} str - OKLAB color string (e.g., "oklab(0.7 0.1 0.05)" or "oklab(0.7 0.1 0.05 / 0.8)")
 * @returns {Object|null} RGB object with r, g, b properties or null if invalid
 */
function parseOklabColor(str) {
  const m = str.match(/oklab\(\s*([^\s\/]+)\s+([^\s\/]+)\s+([^\s\/\)]+)(?:\s*\/\s*[^\)]+)?\s*\)/i);
  if (!m) return null;
  let L = parseNumberOrPercent(m[1]);
  let a = parseFloat(m[2]);
  let b = parseFloat(m[3]);
  if (L > 1) L = L / 100;
  const { r, g, b: bl } = oklabToLinearRgb(L, a, b);
  return linearToSrgb(r, g, bl);
}

module.exports = { parseColor };
