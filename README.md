# Tint Color Plugin for Tailwind CSS

![Example of Tint Colors](https://github.com/khsily/tailwind-tint-color/blob/main/example.png?raw=true)

A Tailwind CSS plugin that adds tint color utilities using CSS filters. Perfect for changing the color of icons, images, and graphics without needing separate colored versions.

## Installation

```bash
npm install --save-dev tailwind-tint-color
```

## Usage

Add the plugin to your main stylesheet:

```css
/* app.css */
@import "tailwindcss";
@plugin "tailwind-tint-color";
```

Then use the `tint-*` utilities in your HTML:

```html
<!-- Using predefined colors -->
<img src="icon.svg" class="tint-red-500" alt="Red tinted icon" />

<!-- Using arbitrary values -->
<img src="icon.svg" class="tint-[#ff6b6b]" alt="Custom color tinted icon" />
<img src="icon.svg" class="tint-[rgb(34,197,94)]" alt="RGB color tinted icon" />
```

## Credits

This plugin is based on the CSS filter generator by [Barrett Sonntag](https://gist.github.com/barretts/e90d7e5251f36b183c67e02ba54c9ae1) which converts colors to CSS filters.

- **CSS filter generation**: Based on [Barrett Sonntag's approach](https://gist.github.com/barretts/e90d7e5251f36b183c67e02ba54c9ae1)
- **Color conversion algorithms**: Based on W3C CSS Color Module Level 4 specifications:
  - [HSL to RGB conversion](https://www.w3.org/TR/css-color-4/#hsl-to-rgb)
  - [sRGB companding](https://www.w3.org/TR/css-color-4/#srgb-companding)
  - [OKLAB/OKLCH color spaces](https://www.w3.org/TR/css-color-4/#ok-lab)

## License

MIT
