import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextVitals,
  ...nextTypescript,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_"
        }
      ]
    }
  },
  {
    files: ["components/product-options.tsx"],
    rules: {
      "react-hooks/set-state-in-effect": "off"
    }
  },
  {
    files: ["components/limited-offer-carousel.tsx"],
    rules: {
      "react-hooks/exhaustive-deps": "off"
    }
  },
  {
    ignores: [
      ".next*/**",
      "node_modules/**",
      "next-env.d.ts",
      "dev-server.log",
      "dev-server.err.log",
      "index.html"
    ]
  }
];

export default eslintConfig;
