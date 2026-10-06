import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#000926",
          light: "#001240",
          dark: "#000514",
        },
        sapphire: {
          DEFAULT: "#0F52BA",
          light: "#1A6DD4",
          dark: "#0A3D8A",
        },
        ice: {
          DEFAULT: "#D6E6F3",
          light: "#E8F1F8",
          dark: "#B8D4EA",
        },
        powder: {
          DEFAULT: "#A6C5D7",
          light: "#C0D8E6",
          dark: "#8AB3C8",
        },
        surface: {
          white: "#FFFFFF",
          offwhite: "#F8FBFE",
          card: "#FFFFFF",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        display: ["Outfit", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        "2xl": "24px",
      },
      boxShadow: {
        subtle: "0 1px 3px rgba(0, 9, 38, 0.06), 0 1px 2px rgba(0, 9, 38, 0.04)",
        card: "0 4px 12px rgba(0, 9, 38, 0.08), 0 2px 4px rgba(0, 9, 38, 0.04)",
        elevated: "0 10px 30px rgba(0, 9, 38, 0.10), 0 4px 8px rgba(0, 9, 38, 0.05)",
        sapphire: "0 4px 20px rgba(15, 82, 186, 0.25)",
        "sapphire-hover": "0 6px 24px rgba(15, 82, 186, 0.35)",
      },
      animation: {
        "float": "float 3s ease-in-out infinite",
        "pulse-subtle": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;

