// Used by @stylexjs/postcss-plugin when it extracts styles from source files.
// The Vite dev/build transform gets the same StyleX plugin via vite.config.ts.
module.exports = {
  presets: [["@babel/preset-typescript", { isTSX: true, allExtensions: true }]],
  plugins: [
    [
      "@stylexjs/babel-plugin",
      {
        dev: process.env.NODE_ENV === "development",
        runtimeInjection: false,
        treeshakeCompensation: true,
        unstable_moduleResolution: { type: "commonJS" },
      },
    ],
  ],
};
