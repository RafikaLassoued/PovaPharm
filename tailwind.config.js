/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        beige:      '#F5EFE6',
        'beige-dark':'#E8DCCC',
        'beige-deep':'#D4C5AD',
        green: {
          DEFAULT: '#4A7C59',
          light:   '#6FAE82',
          pale:    '#E8F2EB',
        },
        blue: {
          DEFAULT: '#2E5F8A',
          light:   '#4A88C7',
          pale:    '#E5EEF7',
        },
        'text-dark':  '#1A1A2E',
        'text-mid':   '#4A4A6A',
        'text-light': '#8A8AAA',
      },
      fontFamily: {
        playfair: ['"Playfair Display"', 'serif'],
        jost:     ['Jost', 'sans-serif'],
      },
      borderRadius: {
        xl2: '16px',
      },
      boxShadow: {
        card: '0 4px 20px rgba(46,95,138,0.10)',
        'card-lg': '0 8px 40px rgba(46,95,138,0.15)',
      },
    },
  },
  plugins: [],
}
