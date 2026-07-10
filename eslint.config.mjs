import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextVitals,
  ...nextTypescript,
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "next-env.d.ts",
      "dev-server.log",
      "dev-server.err.log",
      "index.html"
    ]
  }
];

export default eslintConfig;
