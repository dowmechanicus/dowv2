module.exports = {
  purge: ['./pages/**/*.{js, ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'media', // or 'media' or 'class'
  themes: [
    'light',
    'dark'
  ],
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
