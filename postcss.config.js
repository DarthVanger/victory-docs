module.exports = {
  plugins: [
    // require('postcss-inline-svg'),
    // require('postcss-svgo'),
    // require('postcss-assets')({loadPaths: ['/static/']}),
    require('postcss-custom-media'),
    require("postcss-import"),
    require("postcss-url")({ url: "inline", encodeType: "base64"}),
    require("postcss-browser-reporter"),
    require("postcss-reporter"),
    require("postcss-preset-env")({stage: 0})
  ]
};
