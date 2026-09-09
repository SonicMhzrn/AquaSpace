/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        // Deep ocean / brand tones
        abyss: {
          950: '#020b17',
          900: '#0a0a0a',
          800: '#071a30',
          700: '#0b2540',
        },
        // Aqua / teal accents
        tide: {
          50: '#eafffb',
          100: '#c8fff2',
          200: '#8ffde3',
          300: '#4ff2d2',
          400: '#1fdcbc',
          500: '#0fbfa3',
          600: '#0b9985',
          700: '#0d7a6c',
          800: '#0f6157',
          900: '#0f4f48',
        },
        seafoam: {
          50: '#f1fbf8',
          100: '#dcf6ee',
          200: '#b6ecdc',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'depth-gradient': 'linear-gradient(180deg, #020b17 0%, #071a30 55%, #0b2540 100%)',
        'tide-gradient': 'linear-gradient(120deg, #0b9985 0%, #0fbfa3 50%, #1fdcbc 100%)',
        'surface-glow': 'radial-gradient(circle at 30% 20%, rgba(31,220,188,0.18), transparent 60%)',
      },
      boxShadow: {
        deep: '0 20px 60px -20px rgba(2, 11, 23, 0.6)',
        glow: '0 0 40px -8px rgba(31, 220, 188, 0.35)',
      },
      animation: {
        drift: 'drift 12s ease-in-out infinite',
        rise: 'rise 6s linear infinite',
      },
      keyframes: {
        drift: {
          '0%, 100%': { transform: 'translateY(0) translateX(0)' },
          '50%': { transform: 'translateY(-8px) translateX(4px)' },
        },
        rise: {
          '0%': { transform: 'translateY(0)', opacity: '0' },
          '10%': { opacity: '0.6' },
          '100%': { transform: 'translateY(-120px)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};
