/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Modern dark theme matching reference
        dark: {
          bg: '#2C2D3F',        // Main background
          card: '#353647',      // Dark cards
          lighter: '#3D3E52',   // Lighter dark sections
          text: '#8E90A6',      // Secondary text
        },
        light: {
          blue: '#8BC9E8',      // Light blue cards
          blueHover: '#A8D5E8', // Hover state
          text: '#FFFFFF',      // Primary text on dark
        },
        accent: {
          red: '#FF4B4B',       // Live badge
          green: '#4CAF50',     // Success states
          yellow: '#FFC107',    // Warnings
        },
        // Keep legacy colors for compatibility
        brand: {
          navy: '#2C2D3F',
          blue: '#5B9FED',
          cyan: '#8BC9E8',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#8E90A6',
          onDark: '#FFFFFF',
          muted: '#6B6D81',
        },
        bg: {
          dark: '#2C2D3F',
          card: '#353647',
          cardLight: '#3D3E52',
        },
        status: {
          live: '#FF4B4B',
          upcoming: '#FFC107',
          completed: '#4CAF50',
        },
      },
      borderRadius: {
        'card': '20px',
        'pill': '50px',
        'button': '16px',
      },
      boxShadow: {
        'card': '0 4px 12px rgba(0, 0, 0, 0.15)',
        'card-hover': '0 8px 24px rgba(0, 0, 0, 0.25)',
        'card-elevated': '0 12px 32px rgba(0, 0, 0, 0.3)',
      },
      backgroundImage: {
        'gradient-cyan': 'linear-gradient(135deg, #8BC9E8 0%, #A8D5E8 100%)',
      },
    },
  },
  plugins: [],
}
