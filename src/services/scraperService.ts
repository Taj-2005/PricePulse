import axios from "axios";
import * as cheerio from "cheerio";

export interface ScrapedProduct {
  title: string;
  price: string;
  priceNumber: number;
  imageUrl?: string;
  brand?: string;
  model?: string;
  rating?: number;
  asin?: string;
}

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
];

function normalizeUrl(url: string): string {
  if (url.includes("amzn.in") || url.includes("amzn.to")) {
    url = url.replace(/^https?:\/\/(www\.)?(amzn\.(in|to))/, "https://www.amazon.in");
  }
  
  const urlObj = new URL(url);
  const pathParts = urlObj.pathname.split("/");
  const dpIndex = pathParts.indexOf("dp");
  
  if (dpIndex !== -1 && pathParts[dpIndex + 1]) {
    urlObj.pathname = `/dp/${pathParts[dpIndex + 1]}`;
    urlObj.search = "";
    urlObj.hash = "";
  }
  
  return urlObj.toString();
}

function extractAsin(url: string): string | null {
  const dpMatch = url.match(/\/dp\/([A-Z0-9]{10})/);
  if (dpMatch) return dpMatch[1];
  
  const gpMatch = url.match(/\/gp\/product\/([A-Z0-9]{10})/);
  if (gpMatch) return gpMatch[1];
  
  return null;
}

async function resolveRedirects(url: string, maxRedirects = 5): Promise<string> {
  try {
    const response = await axios.head(url, {
      maxRedirects,
      timeout: 5000,
      validateStatus: (status) => status < 400,
    });
    return response.request.res?.responseUrl || url;
  } catch {
    return url;
  }
}

export async function scrapeProduct(
  url: string,
  retries = 3
): Promise<ScrapedProduct> {
  const apiKey = process.env.SCRAPER_API_KEY;
  if (!apiKey) {
    throw Object.assign(
      new Error("SCRAPER_API_KEY not configured"),
      { status: 500 }
    );
  }

  let normalizedUrl = normalizeUrl(url);
  normalizedUrl = await resolveRedirects(normalizedUrl);
  const asin = extractAsin(normalizedUrl);

  const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
  
  const scraperParams = new URLSearchParams({
    api_key: apiKey,
    url: normalizedUrl,
    render: "true",
    country_code: "in",
    premium: "true",
    session_number: "1",
  });

  const scraperUrl = `http://api.scraperapi.com?${scraperParams.toString()}`;

  const headers = {
    "User-Agent": userAgent,
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "DNT": "1",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Cache-Control": "max-age=0",
  };

  for (let attempt = 1; attempt <= retries; attempt++) {
    const attemptStartTime = Date.now();
    
    try {
      const response = await axios.get(scraperUrl, {
        headers,
        timeout: 25000,
        maxRedirects: 5,
        validateStatus: (status) => status < 500,
      });

      if (response.status === 403 || response.status === 429) {
        throw Object.assign(
          new Error(`Blocked: HTTP ${response.status}`),
          { status: response.status }
        );
      }

      const html = response.data;
      if (!html || typeof html !== "string") {
        throw new Error("Invalid HTML response");
      }

      const htmlLower = html.toLowerCase();
      const captchaIndicators = [
        "captcha",
        "robot",
        "automated access",
        "verify you are human",
        "sorry, we just need to make sure",
        "enter the characters you see",
        "cloudflare",
      ];
      
      if (captchaIndicators.some((indicator) => htmlLower.includes(indicator))) {
        if (attempt < retries) {
          await new Promise((r) => setTimeout(r, 3000 * attempt));
          continue;
        }
        throw Object.assign(
          new Error("CAPTCHA detected"),
          { status: 403, isCaptcha: true }
        );
      }

      if (htmlLower.includes("page not found") || htmlLower.includes("404") || htmlLower.includes("we couldn't find that page")) {
        throw Object.assign(
          new Error("Product not found"),
          { status: 404 }
        );
      }

      const $ = cheerio.load(html);

      const titleSelectors = [
        "#productTitle",
        "h1.a-size-large.product-title-word-break",
        "h1[data-automation-id='title']",
        ".product-title",
        "h1.a-size-base-plus",
        "#title",
        "span#productTitle",
      ];

      let title = "";
      for (const selector of titleSelectors) {
        title = $(selector).first().text().trim();
        if (title) break;
      }

      const priceSelectors = [
        "#priceblock_dealprice",
        "#priceblock_ourprice",
        "#priceblock_saleprice",
        ".a-price .a-offscreen",
        ".a-price-whole",
        "#price_inside_buybox",
        ".a-price-range .a-offscreen",
        "span.a-price[data-a-color='base'] .a-offscreen",
        ".aok-align-center .a-price .a-offscreen",
        "[data-a-color='price'] .a-offscreen",
        "span.a-price-whole",
        ".a-price-whole",
        ".a-price .a-price-whole",
        "#corePrice_desktop .a-price-whole",
      ];

      let price = "";
      for (const selector of priceSelectors) {
        const priceElement = $(selector).first();
        price = priceElement.text().trim() || priceElement.attr("aria-label") || "";
        if (!price) {
          price = priceElement.parent().text().trim();
        }
        if (price) break;
      }

      const imageSelectors = [
        "#landingImage",
        "#imgBlkFront",
        ".a-dynamic-image",
        "img[data-a-image-name='landingImage']",
        "#main-image",
        ".a-button-selected img",
        "#altImages img",
      ];

      let imageUrl = "";
      for (const selector of imageSelectors) {
        imageUrl = $(selector).first().attr("src") || $(selector).first().attr("data-src") || "";
        if (imageUrl && !imageUrl.includes("placeholder")) break;
      }

      const ratingText = $(".a-icon-alt").first().text().trim();
      const ratingMatch = ratingText.match(/(\d+\.?\d*)/);
      const rating = ratingMatch ? parseFloat(ratingMatch[1]) : undefined;

      if (!title) {
        throw Object.assign(
          new Error("Title not found"),
          { status: 404 }
        );
      }

      if (!price) {
        throw Object.assign(
          new Error("Price not found - product may be unavailable"),
          { status: 404 }
        );
      }

      const priceNumber = parseFloat(price.replace(/[^0-9.]/g, ""));
      if (isNaN(priceNumber) || priceNumber <= 0) {
        throw new Error(`Invalid price: ${price}`);
      }

      const brandMatch = title.match(/^([^,]+)/);
      const brand = brandMatch ? brandMatch[1].trim() : undefined;

      return {
        title,
        price,
        priceNumber,
        imageUrl,
        brand,
        rating,
        asin: asin || undefined,
      };
    } catch (error: any) {
      if (attempt === retries) {
        throw Object.assign(
          new Error(`Scraping failed: ${error.message || "Unknown error"}`),
          {
            status: error.status || 502,
            originalError: error.message,
            url: normalizedUrl,
            isCaptcha: error.isCaptcha || false,
          }
        );
      }

      const delayMs = Math.min(1000 * Math.pow(2, attempt - 1), 6000);
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }

  throw new Error("Unreachable");
}
