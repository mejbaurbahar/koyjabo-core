/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./App.tsx",
        "./*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'dhaka-red': '#EF4444',
                'dhaka-green': '#10B981',
                'dhaka-dark': '#1F2937',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                bengali: ['Noto Sans Bengali', 'Arial', 'sans-serif'],
            },
            spacing: {
                'nav-safe': '5rem',
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            boxShadow: {
                'card': '0 2px 8px rgba(0, 0, 0, 0.04)',
            }
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
}
