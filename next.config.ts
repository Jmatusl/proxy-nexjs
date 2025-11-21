import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["puppeteer-core", "@sparticuz/chromium", "puppeteer-extra", "puppeteer-extra-plugin-stealth", "is-plain-object", "clone-deep", "shallow-clone"],
  experimental: {
    // @ts-ignore
    outputFileTracingIncludes: {
      "/api/proxy": ["./node_modules/puppeteer-extra-plugin-stealth/**/*"],
    },
  },
};

export default nextConfig;
