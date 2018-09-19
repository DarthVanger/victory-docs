module.exports = () => ({
  plugins: [
    require("postcss-import")(),
    require("postcss-url")({ url: "inline" }),
    require("postcss-cssnext")(),
    // Add plugins here:
    require("postcss-inline-svg")(),
    require("postcss-browser-reporter"),
    require("postcss-reporter")
  ]
});
