/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Logo / HASH primary: light cyan-blue — use for active states, primary actions, focus rings
        brand: {
          DEFAULT: '#3BC2DB',
          hover: '#2AA3BA',
          soft: '#E0F5FA',
        },
        accent: {
          DEFAULT: '#3BC2DB',
          hover: '#2AA3BA',
          soft: '#E0F5FA',
        },
        app: {
          bg: '#F8FAFC',
          card: '#FFFFFF',
          sidebar: '#0F172A',
          border: '#E2E8F0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        md: '8px',
        lg: '10px',
        xl: '12px',
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(15, 23, 42, 0.06)',
        elevated: '0 8px 24px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
}

