/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Outfit'", "sans-serif"],
        display: ["'Fraunces'", "serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        ink: {
          50: "#f2f2f7",
          100: "#e4e4ef",
          200: "#c9c9de",
          300: "#a3a3c4",
          400: "#7878a8",
          500: "#565690",
          600: "#454578",
          700: "#393963",
          800: "#2e2e4f",
          900: "#1a1a2e",
          950: "#0d0d1a",
        },
        gold: {
          300: "#fde68a",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
        },
        jade: {
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
        },
        coral: {
          400: "#fb7185",
          500: "#f43f5e",
        },
      },
      backgroundImage: {
        "hero-gradient": "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        "card-gradient": "linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)",
      },
      animation: {
        "fade-up": "fadeUp 0.5s ease forwards",
        "fade-in": "fadeIn 0.3s ease forwards",
        "slide-in": "slideIn 0.4s ease forwards",
        shimmer: "shimmer 1.5s infinite",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideIn: {
          from: { opacity: "0", transform: "translateX(-20px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      boxShadow: {
        card: "0 4px 24px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.08)",
        glow: "0 0 30px rgba(245, 158, 11, 0.15)",
      },
    },
  },
  plugins: [],
};
