import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--bg-primary)",
        foreground: "var(--text-primary)",
        card: {
          DEFAULT: "var(--bg-card)",
          hover: "var(--bg-card-hover)",
        },
        accent: {
          saffron: "var(--accent-saffron)",
          gold: "var(--accent-gold)",
          "gold-metallic": "#D4AF37",
          "gold-bright": "#FFD700",
          "gold-muted": "#B8860B",
          green: "var(--accent-green)",
          red: "var(--accent-red)",
          blue: "var(--accent-blue)",
          purple: "var(--accent-purple)",
          vintage: "#F4EBD0",
        },
        text: {
          primary: "var(--text-primary)",
          muted: "var(--text-muted)",
          muted2: "var(--text-muted2)",
        },
        border: {
          DEFAULT: "var(--border-default)",
          accent: "var(--border-accent)",
        }
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "sans-serif"],
        serif: ["var(--font-playfair)", "serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
        'shimmer': 'linear-gradient(90deg, transparent, rgba(255,153,51,0.1), transparent)',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glow-saffron': '0 0 20px rgba(255, 153, 51, 0.2)',
      },
      animation: {
        'shimmer': 'shimmer 2s infinite linear',
        'border-glow': 'border-glow 4s infinite linear',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'border-glow': {
          '0%, 100%': { borderColor: 'rgba(255,153,51,0.28)' },
          '50%': { borderColor: 'rgba(255,153,51,0.6)' },
        }
      }
    },
  },
  plugins: [],
};
export default config;
