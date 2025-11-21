import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["puppeteer-core", "@sparticuz/chromium", "puppeteer-extra", "puppeteer-extra-plugin-stealth", "is-plain-object"],
};

export default nextConfig;
