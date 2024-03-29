module.exports = {
  purge: ["./src/**/*.tsx", "./public/index.html"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    fontFamily: {
      sans: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Oxygen",
        "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",
        "sans-serif"],
      mono: ["source-code-pro", "Menlo", "Monaco", "Consolas", "Courier New",
        "monospace"]
    },
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
