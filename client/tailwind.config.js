/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        void: {
          DEFAULT: '#040405',
          deep: '#020203',
        },
        carbon: '#0E121B',
        bone: {
          DEFAULT: '#F6F4F1',
          muted: '#D8D4CC',
        },
        navy: {
          950: '#060B14',
          DEFAULT: '#0B1325',
          light: '#14213D',
          surface: '#182747',
          dark: '#050911',
        },
        ivory: {
          50: '#f8fbfd',
          DEFAULT: '#f4f9fc',
          dark: '#edf4f8',
          border: '#dce8f0',
        },
        gold: {
          shimmer: '#dff9ff',
          light: '#5dc4ff',
          DEFAULT: '#13b8c8',
          dark: '#087d99',
          deep: '#075a70',
          glow: '#7ef9ff',
          flare: '#7f8cff',
        },
        dust: '#828C99',
        beige: '#e7faff',
        success: '#1B5E3C',
      },
      fontFamily: {
        display: ['Sora', 'Segoe UI', 'sans-serif'],
        serif: ['Sora', 'Segoe UI', 'sans-serif'],
        cormorant: ['Sora', 'Segoe UI', 'sans-serif'],
        cinzel: ['Sora', 'Segoe UI', 'sans-serif'],
        sans: ['Manrope', 'Segoe UI', 'sans-serif'],
        body: ['Manrope', 'Segoe UI', 'sans-serif'],
        ui: ['Sora', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        gold: '0 4px 25px rgba(19, 184, 200, 0.18)',
        'gold-lg': '0 10px 40px rgba(93, 196, 255, 0.22)',
        'gold-neon': '0 0 30px rgba(126, 249, 255, 0.24)',
        luxury: '0 20px 50px -15px rgba(11, 29, 46, 0.12), 0 0 1px 1px rgba(19, 184, 200, 0.12)',
        'luxury-dark': '0 20px 50px -15px rgba(0, 0, 0, 0.5), 0 0 1px 1px rgba(126, 249, 255, 0.18)',
      },
    },
  },
  plugins: [],
}
