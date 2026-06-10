/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eefff4',
          100: '#d7ffe9',
          200: '#b2ffd4',
          300: '#76ffb0',
          400: '#34f585',
          500: '#0de066',
          600: '#03ba4f',
          700: '#069240',
          800: '#0b7235',
          900: '#0a5e2d',
          950: '#013518',
        },
        dark: {
          950: '#060a0f',
          900: '#0b1118',
          800: '#111820',
          700: '#19232f',
          600: '#1e2d3d',
          500: '#243446',
          400: '#2e4057',
        },
        accent: {
          cyan:   '#00e5ff',
          purple: '#a855f7',
          orange: '#f97316',
          yellow: '#eab308',
          pink:   '#ec4899',
          red:    '#ef4444',
        }
      },
      fontFamily: {
        display: ['"Space Mono"', 'monospace'],
        body:    ['"DM Sans"', 'sans-serif'],
        code:    ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'glow-pulse': 'glow 2s ease-in-out infinite',
        'slide-up':   'slideUp 0.4s ease-out',
        'fade-in':    'fadeIn 0.3s ease-out',
        'bounce-in':  'bounceIn 0.5s cubic-bezier(0.175,0.885,0.32,1.275)',
        'float':      'float 3s ease-in-out infinite',
        'shimmer':    'shimmer 2s linear infinite',
      },
      keyframes: {
        glow: {
          '0%,100%': { boxShadow: '0 0 20px rgba(13,224,102,0.3)' },
          '50%':     { boxShadow: '0 0 40px rgba(13,224,102,0.6)' }
        },
        slideUp: {
          from: { transform: 'translateY(20px)', opacity: '0' },
          to:   { transform: 'translateY(0)',    opacity: '1' }
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' }
        },
        bounceIn: {
          from: { transform: 'scale(0.3)', opacity: '0' },
          to:   { transform: 'scale(1)',   opacity: '1' }
        },
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%':     { transform: 'translateY(-8px)' }
        },
        shimmer: {
          '0%':   { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' }
        }
      },
      backgroundImage: {
        'grid-pattern': "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230de066' fill-opacity='0.03'%3E%3Cpath d='M0 0h40v1H0zM0 0v40h1V0z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      }
    }
  },
  plugins: []
}
