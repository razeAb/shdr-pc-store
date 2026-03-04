/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Bebas Neue'", "system-ui", "sans-serif"],
        body: ["'Manrope'", "system-ui", "sans-serif"]
      },
      colors: {
        night: "hsl(var(--night))",
        ink: "hsl(var(--ink))",
        sand: "hsl(var(--sand))",
        pulse: "hsl(var(--pulse))",
        rush: "hsl(var(--rush))",
        ember: "hsl(var(--ember))",
        steel: "hsl(var(--steel))",
        haze: "hsl(var(--haze))"
      },
      boxShadow: {
        glow: "0 0 40px rgba(255, 125, 59, 0.25)",
        card: "0 20px 50px rgba(15, 23, 42, 0.2)"
      },
      backgroundImage: {
        "hero-gradient": "radial-gradient(circle at top, rgba(255, 125, 59, 0.25), transparent 60%)"
      }
    }
  },
  plugins: []
};
