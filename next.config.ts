import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["puppeteer-core", "@sparticuz/chromium", "puppeteer-extra", "puppeteer-extra-plugin-stealth", "is-plain-object", "clone-deep", "shallow-clone"],
};

export default nextConfig;
