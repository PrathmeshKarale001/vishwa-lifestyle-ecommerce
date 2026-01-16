/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                "background-alt": "var(--background-alt)",
                "foreground-muted": "var(--foreground-muted)",
                "accent-gold": "var(--accent-gold)",
                "accent-sage": "var(--accent-sage)",
                "accent-terracotta": "var(--accent-terracotta)",
            },
            fontFamily: {
                serif: ["var(--font-playfair)", "serif"],
                sans: ["var(--font-lato)", "sans-serif"],
            },
        },
    },
    plugins: [],
};
