import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1.5", letterSpacing: "0.01em" }],
        sm: ["0.875rem", { lineHeight: "1.5", letterSpacing: "0.01em" }],
        base: ["1rem", { lineHeight: "1.5", letterSpacing: "0" }],
        lg: ["1.125rem", { lineHeight: "1.5", letterSpacing: "-0.01em" }],
        xl: ["1.25rem", { lineHeight: "1.4", letterSpacing: "-0.02em" }],
        "2xl": ["1.5rem", { lineHeight: "1.3", letterSpacing: "-0.02em" }],
        "3xl": ["1.875rem", { lineHeight: "1.2", letterSpacing: "-0.03em" }],
      },
      screens: {
        xs: "475px",
      },
    },
  },
  plugins: [],
};
export default config;
