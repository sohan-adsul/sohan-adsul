const path = require("path");

module.exports = {
  entry: "./src/index.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
            plugins: ["@babel/plugin-proposal-private-property-in-object"],
          },
        },
      },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx"], // Add extensions to resolve
  },
  // Other configurations like optimization, plugins, etc.
};
