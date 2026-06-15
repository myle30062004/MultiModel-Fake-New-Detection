/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#1877F2',
          hover: '#166FE5',
          soft: '#E7F3FF',
        },
        success: '#42B72A',
        danger: '#E41E3F',
        warning: '#F7B928',
        canvas: '#F0F2F5',
        ink: '#050505',
        muted: '#65676B',
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(0, 0, 0, 0.08)',
        lift: '0 12px 28px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
};
