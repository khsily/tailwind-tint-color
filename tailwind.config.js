/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./example/**/*.{html,js}",
    "./src/**/*.js"
  ],
  plugins: [
    require('./src/index.js')
  ],
}
