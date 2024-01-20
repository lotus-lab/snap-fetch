// rollup.config.js

import merge from "deepmerge";
import { createBasicConfig } from "@open-wc/building-rollup";
import typescript from "rollup-plugin-typescript2";
import { terser } from "rollup-plugin-terser";
const baseConfig = createBasicConfig();

export default merge(baseConfig, [
  {
    input: "./dist/esm/src/index.js",
    output: {
      dir: "lib/src",
      format: "esm",
      exports: "named",
    },
    context: "window",
    plugins: [
      typescript({
        rollupCommonJSResolveHack: false,
        clean: true,
      }),
      terser(),
    ],
    external: [
      "react",
      "react-redux",
      "redux-saga",
      "redux-saga/effects",
      "@reduxjs/toolkit",
    ],
  },
]);
