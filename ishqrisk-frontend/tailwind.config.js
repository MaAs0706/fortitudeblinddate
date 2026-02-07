/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0b0b0c",
        card: "#141416",
        primary: "#e6a5b4",
        muted: "#9ca3af",
      },
    },
  },
  plugins: [],
};
