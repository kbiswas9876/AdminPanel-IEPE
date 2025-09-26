/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'apple': {
          50: '#F5F5F7',  // Off-white background
          100: '#E8E8ED', // Light gray
          200: '#D2D2D7', // Border color
          300: '#86868B', // Secondary text
          400: '#515154', // Primary text
          500: '#1D1D1F', // Dark text
          600: '#000000', // Black text
        },
        'apple-blue': {
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#B9E6FE',
          300: '#7CD4FD',
          400: '#36BFFA',
          500: '#0BA5EC',  // Primary blue
          600: '#0086C9',
          700: '#026AA2',
          800: '#065986',
          900: '#0B4A6F',
        },
        'apple-green': {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E',  // Success green
          600: '#16A34A',
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
        },
      },
      fontFamily: {
        sans: ['Inter var', 'SF Pro Display', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'apple': '0.75rem',    // 12px
        'apple-lg': '1rem',    // 16px
        'apple-xl': '1.25rem',  // 20px
      },
      boxShadow: {
        'apple': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'apple-md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'apple-lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      },
      animation: {
        'apple-fade-in': 'apple-fade-in 0.2s ease-out',
        'apple-slide-up': 'apple-slide-up 0.2s ease-out',
        'apple-scale': 'apple-scale 0.2s ease-out',
      },
      keyframes: {
        'apple-fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'apple-slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'apple-scale': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}