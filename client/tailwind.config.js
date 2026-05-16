/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Archivo', 'system-ui', 'sans-serif'],
        display: ['Unbounded', 'Archivo', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace']
      },
      colors: {
        ink: '#0a0a0a',
        paper: '#f4f0e8',
        cream: '#faf6ec',
        sun: '#ffe119',
        bolt: '#3b82f6',
        coral: '#ff5a5f',
        lime: '#84cc16',
        lilac: '#c4b5fd',
        sky: '#7dd3fc'
      },
      boxShadow: {
        brutal: '4px 4px 0 0 #0a0a0a',
        'brutal-lg': '6px 6px 0 0 #0a0a0a',
        'brutal-sm': '3px 3px 0 0 #0a0a0a',
        'brutal-hover': '2px 2px 0 0 #0a0a0a'
      }
    }
  },
  plugins: []
};
