import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(228 18% 5%)",
        surface: "hsl(228 16% 8%)",
        card: "hsl(228 15% 10%)",
        border: "hsl(228 12% 16%)",
        muted: "hsl(228 8% 55%)",
        foreground: "hsl(220 20% 96%)",
        primary: { DEFAULT: "hsl(160 84% 45%)", foreground: "hsl(160 90% 8%)" },
        accent: "hsl(200 95% 55%)",
        warning: "hsl(38 95% 58%)",
        danger: "hsl(0 78% 60%)"
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"]
      },
      borderRadius: { xl: "1rem", "2xl": "1.25rem" },
      boxShadow: {
        glow: "0 0 40px -12px hsl(160 84% 45% / 0.35)",
        card: "0 1px 0 0 hsl(228 20% 100% / 0.04) inset, 0 8px 32px -12px hsl(228 40% 2% / 0.6)"
      }
    }
  },
  plugins: []
} satisfies Config;
