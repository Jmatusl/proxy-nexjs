import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "puppeteer-core",
    "@sparticuz/chromium",
    "puppeteer-extra",
    "puppeteer-extra-plugin-stealth",
    "is-plain-object",
    "clone-deep",
    "shallow-clone",
    "puppeteer-extra-plugin-user-preferences",
    "puppeteer-extra-plugin-user-data-dir",
  ],
  experimental: {
    // @ts-ignore
    outputFileTracingIncludes: {
      "/api/proxy": ["./node_modules/puppeteer-extra-plugin-stealth/**/*", "./node_modules/puppeteer-extra-plugin-user-preferences/**/*", "./node_modules/puppeteer-extra-plugin-user-data-dir/**/*"],
    },
  },
};

export default nextConfig;
