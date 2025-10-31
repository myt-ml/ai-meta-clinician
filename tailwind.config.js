/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Clinical palette
        surface: "#FFFFFF",
        surfaceAlt: "#F8FAFC",
        border: "#E2E8F0",
        textMain: "#0F172A",
        textSubtle: "#475569",
        textMuted: "#94A3B8",

        // Primary clinical blue
        primary: {
          DEFAULT: "#1E40AF", // safely dark, accessible
          light: "#3B82F6",
          dark: "#1E3A8A",
        },

        // Status
        success: "#15803D",
        warning: "#B45309",
        danger: {
          DEFAULT: "#B91C1C",
          soft: "#FEE2E2",
        },
      },

      fontFamily: {
        sans: ["Inter", "Noto Sans Arabic", "system-ui", "sans-serif"],
      },

      fontSize: {
        h1: ["1.5rem", "2rem"], // 24/32
        h2: ["1.25rem", "1.75rem"], // 20/28
        h3: ["1.125rem", "1.6rem"], // 18/26
        body: ["0.9375rem", "1.5rem"], // 15/24
        caption: ["0.75rem", "1.25rem"], // 12/20
      },

      spacing: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
      },

      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
      },

      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.08)",
        focus: "0 0 0 2px rgba(59,130,246,0.5)",
      },

      animation: {
        pulseSlow: "pulse 2.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
