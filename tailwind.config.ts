import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Sampled from 10federalstorage.com logo — verify in Task 8.1
        '10f-red': '#C8102E',
        '10f-red-dark': '#9E0C24',
        '10f-bg': '#FFFFFF',
        '10f-surface': '#FAFAFA',
        '10f-border': '#E5E7EB',
        '10f-text': '#111827',
        '10f-text-muted': '#6B7280',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
