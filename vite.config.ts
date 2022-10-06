import path from "path";
import { defineConfig } from "vite";
import packageJson from "./package.json";

const packageName = packageJson.name.replace('@smonn/', '')
const packageNameCamelCase = packageName.replace(/-./g, (char) => char[1].toUpperCase());

const fileName = {
  es: `${packageName}.mjs`,
  cjs: `${packageName}.cjs`,
  iife: `${packageName}.iife.js`,
};

export default defineConfig({
  base: "./",
  build: {
    minify: false,
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: packageNameCamelCase,
      formats: ["es", "cjs", "iife"],
      fileName: (format) => fileName[format],
    },
  },
});
