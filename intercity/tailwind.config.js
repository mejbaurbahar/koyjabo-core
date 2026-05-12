/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
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
                'kj-bg': 'var(--kj-bg)',
                'kj-panel': 'var(--kj-panel)',
                'kj-panel-muted': 'var(--kj-panel-muted)',
                'kj-line': 'var(--kj-line)',
                'kj-text': 'var(--kj-text)',
                'kj-text-dim': 'var(--kj-text-dim)',
                'kj-text-faint': 'var(--kj-text-faint)',
                'kj-chip-bg': 'var(--kj-chip-bg)',
                'kj-chip-text': 'var(--kj-chip-text)',
                'kj-input-bg': 'var(--kj-input-bg)',
                'kj-primary': 'var(--kj-primary)',
                'kj-primary-ink': 'var(--kj-primary-ink)',
                'kj-primary-soft': 'var(--kj-primary-soft)',
                'kj-primary-deep': 'var(--kj-primary-deep)',
                'kj-accent': 'var(--kj-accent)',
                'kj-accent-soft': 'var(--kj-accent-soft)',
                'kj-amber': 'var(--kj-amber)',
                'kj-amber-soft': 'var(--kj-amber-soft)',
                'kj-metro-bg': 'var(--kj-metro-bg)',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                bengali: ['Noto Sans Bengali', 'Arial', 'sans-serif'],
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            boxShadow: {
                'card': '0 2px 8px rgba(0, 0, 0, 0.04)',
            }
        },
    },
    plugins: [],
}
