/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0055A4", // Assuming a standard blue, will refine
        secondary: "#EF4136", // Assuming a standard red
        neutral: "#FFFFFF", // White
        "brand-blue": "#0055A4",
        "brand-red": "#EF4136",
      },
    },
  },
  plugins: [],
};
