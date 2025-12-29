import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ginger: {
          // Nouvelle palette inspirée de Candy.ai et l'ancienne version
          bg: '#050508',
          dark: '#0a0612',
          surface: '#1a0c1e',
          card: '#0f0a15',
          primary: '#db2777', // Pink-600
          secondary: '#f43f5e', // Rose-500
          accent: '#f0abfc', // Fuchsia-300
          hot: '#be185d', // Pink-700
          text: '#fafafa',
          muted: '#71717a', // Zinc-500
          subtle: '#27272a', // Zinc-800
        }
      },
      fontFamily: {
        display: ['Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-ginger': 'linear-gradient(135deg, #db2777 0%, #be185d 100%)',
        'gradient-rose': 'linear-gradient(135deg, #f43f5e 0%, #db2777 100%)',
        'gradient-dark': 'linear-gradient(180deg, #0a0612 0%, #050508 100%)',
        'gradient-luxury': 'linear-gradient(135deg, rgba(219,39,119,0.1) 0%, rgba(244,63,94,0.05) 100%)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(219, 39, 119, 0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(219, 39, 119, 0.7)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'glow': {
          '0%': { opacity: '0.4' },
          '100%': { opacity: '0.7' },
        },
      },
      boxShadow: {
        'glow-pink': '0 0 40px rgba(219, 39, 119, 0.3)',
        'glow-rose': '0 0 40px rgba(244, 63, 94, 0.3)',
        'luxury': '0 20px 60px -15px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
}

export default config
