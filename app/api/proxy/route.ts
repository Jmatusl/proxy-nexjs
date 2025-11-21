import { NextResponse } from "next/server";

export const maxDuration = 60; // Set max duration for Vercel Function
export const dynamic = "force-dynamic";

const PROXY_TOKEN = process.env.PROXY_TOKEN;

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/121.0",
  "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/121.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
];

const getRandomUserAgent = () => USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

const isCloudflareChallenge = (status: number, content: string) => {
  if (status === 403 || status === 503) {
    if (content.includes("Just a moment...") || content.includes("Enable JavaScript and cookies") || content.includes("challenge-platform") || content.includes("Cloudflare")) {
      return true;
    }
  }
  return false;
};

export async function POST(req: Request) {
  try {
    // 1. Validation
    const token = req.headers.get("Token");
    if (token !== PROXY_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let url: string | null = null;

    // Try getting URL from JSON body
    try {
      const body = await req.json();
      url = body.url;
    } catch (e) {
      // Body might be empty or not JSON, ignore error
    }

    // If not in body, try query params
    if (!url) {
      const { searchParams } = new URL(req.url);
      url = searchParams.get("url");
    }

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const userAgent = getRandomUserAgent();
    const headers = {
      "User-Agent": userAgent,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
      DNT: "1",
      Connection: "keep-alive",
      "Upgrade-Insecure-Requests": "1",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
      "Sec-Fetch-User": "?1",
      "Cache-Control": "max-age=0",
      ...(req.headers.get("cookie") ? { Cookie: req.headers.get("cookie")! } : {}),
      ...(req.headers.get("authorization") ? { Authorization: req.headers.get("authorization")! } : {}),
    };

    // 2. Attempt 1: Native Fetch
    console.log(`[Proxy] Attempting fetch for: ${url}`);
    try {
      const response = await fetch(url, {
        headers: headers,
        redirect: "follow",
      });

      const content = await response.text();
      const status = response.status;

      if (!isCloudflareChallenge(status, content)) {
        console.log(`[Proxy] Fetch successful (Status: ${status})`);
        return new NextResponse(content, {
          status: status,
          headers: {
            "Content-Type": response.headers.get("content-type") || "text/html",
          },
        });
      }
      console.log(`[Proxy] Cloudflare challenge detected (Status: ${status}). Switching to Puppeteer.`);
    } catch (error) {
      console.log(`[Proxy] Fetch failed: ${error}. Switching to Puppeteer.`);
    }

    // 3. Attempt 2: Puppeteer
    console.log(`[Proxy] Launching Puppeteer...`);
    let browser;
    try {
      const puppeteerCore = require("puppeteer-core");
      const { addExtra } = require("puppeteer-extra");
      const StealthPlugin = require("puppeteer-extra-plugin-stealth");

      // Force inclusion of is-plain-object for Vercel
      require("is-plain-object");

      const puppeteer = addExtra(puppeteerCore);
      puppeteer.use(StealthPlugin());

      const isLocal = process.env.NODE_ENV === "development";

      let executablePath;
      let args;
      let headless;
      let defaultViewport;

      if (isLocal) {
        // Local development
        try {
          const p = require("puppeteer");
          executablePath = p.executablePath();
          args = puppeteerCore.defaultArgs();
          headless = true;
          defaultViewport = null;
        } catch (e) {
          console.warn("Could not find local puppeteer executable");
        }
      } else {
        // Production (Vercel)
        const chromium = require("@sparticuz/chromium");
        executablePath = await chromium.executablePath();
        args = chromium.args;
        headless = chromium.headless;
        defaultViewport = chromium.defaultViewport;
      }

      browser = await puppeteer.launch({
        args,
        defaultViewport,
        executablePath,
        headless,
        ignoreHTTPSErrors: true,
      });

      const page = await browser.newPage();

      // Set headers
      await page.setExtraHTTPHeaders(headers);
      await page.setUserAgent(userAgent);

      // Navigate
      await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

      // Check for Cloudflare challenge clearing
      try {
        const title = await page.title();
        if (title.includes("Just a moment...")) {
          console.log("[Proxy] Waiting for challenge to clear...");
          await page.waitForFunction(() => !document.title.includes("Just a moment..."), { timeout: 10000 });
        }
      } catch (e) {
        // Ignore timeout waiting for title change
      }

      const content = await page.content();
      const status = 200;

      await browser.close();

      return new NextResponse(content, {
        status: status,
        headers: {
          "Content-Type": "text/html",
        },
      });
    } catch (error: any) {
      console.error(`[Proxy] Puppeteer failed:`, error);
      if (browser) await browser.close();
      return NextResponse.json({ error: "Proxy failed", details: error.message }, { status: 500 });
    }
  } catch (error: any) {
    console.error(`[Proxy] Internal Error:`, error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
