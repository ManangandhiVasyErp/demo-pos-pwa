const path = require("path");

module.exports = function override(config) {
  config.output.filename = "static/js/main.js";
  config.output.chunkFilename = "static/js/[name].chunk.js";
  config.plugins[5].options.filename = "static/css/main.css";

  return config;
};
