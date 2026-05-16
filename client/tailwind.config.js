/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif']
      },
      colors: {
        bg: '#0a0a0a',
        surface: '#121212',
        card: '#1a1a1a',
        raised: '#222222',
        border: '#2a2a2a',
        muted: '#9ca3af',
        subtle: '#6b7280',
        accent: {
          DEFAULT: '#22d3ee',
          bright: '#67e8f9',
          dark: '#0891b2'
        },
        sun: {
          DEFAULT: '#facc15',
          bright: '#fde047'
        },
        ok: '#10b981',
        warn: '#f59e0b',
        bad: '#ef4444'
      },
      boxShadow: {
        'glow-cyan': '0 0 40px -10px rgba(34, 211, 238, 0.4)',
        'glow-sun': '0 0 40px -10px rgba(250, 204, 21, 0.4)'
      },
      backgroundImage: {
        'wave-blue': 'radial-gradient(ellipse 80% 50% at 50% 30%, rgba(34, 211, 238, 0.15), transparent 60%), radial-gradient(ellipse 60% 40% at 80% 70%, rgba(16, 185, 129, 0.1), transparent 60%)',
        'wave-green': 'radial-gradient(ellipse 80% 50% at 30% 50%, rgba(16, 185, 129, 0.18), transparent 60%), radial-gradient(ellipse 70% 50% at 70% 80%, rgba(34, 211, 238, 0.1), transparent 60%)',
        'wave-warm': 'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(250, 204, 21, 0.12), transparent 60%), radial-gradient(ellipse 60% 40% at 80% 30%, rgba(249, 115, 22, 0.08), transparent 60%)'
      }
    }
  },
  plugins: []
};
