module.exports = {
  mode: 'jit',
  purge: ['./pages/**/*.{js, ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      maxHeight: {
        'screen-80': '87vh'
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require('daisyui')],
}
