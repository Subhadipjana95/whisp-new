/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#5e6ad2',
        'primary-hover': '#828fff',
        'primary-focus': '#5e69d1',
        canvas: '#010102',
        'surface-1': '#151618',
        'surface-2': '#1e2023',
        'surface-3': '#282b30',
        hairline: '#23252a',
        'hairline-strong': '#343841',
        ink: '#f7f8f8',
        'ink-muted': '#d0d6e0',
        'ink-subtle': '#8a8f98',
        success: '#27a644',
      },
    },
  },
  darkMode: 'class',
};
