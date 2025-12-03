import axios from "axios";
import * as cheerio from "cheerio";

export interface ScrapedProduct {
  title: string;
  price: string;
  priceNumber: number;
  imageUrl?: string;
  brand?: string;
  model?: string;
}

/**
 * Scrapes Amazon product data with exponential backoff retries
 * Timeout set to 20s to stay well within Vercel serverless limits (10s Hobby, 60s Pro)
 * Each attempt has a max timeout to prevent exceeding function limits
 */
export async function scrapeProduct(
  url: string,
  retries = 3
): Promise<ScrapedProduct> {
  const apiKey = process.env.SCRAPER_API_KEY;
  if (!apiKey) {
    console.error("[SCRAPER] Missing SCRAPER_API_KEY in environment variables");
    throw Object.assign(
      new Error("Missing SCRAPER_API_KEY in environment variables"),
      { status: 500 }
    );
  }

  let finalUrl = url;
  try {
    // Resolve redirects with shorter timeout
    const headResponse = await axios.head(url, {
      maxRedirects: 5,
      timeout: 3000, // Reduced to 3s for faster failure
      validateStatus: (status) => status < 400,
    });
    finalUrl = headResponse.request.res?.responseUrl || url;
  } catch (error: any) {
    console.warn("[SCRAPER] Redirect resolution failed, proceeding with original URL:", error.message);
  }

  const scraperUrl = `http://api.scraperapi.com?api_key=${apiKey}&url=${encodeURIComponent(finalUrl)}`;

  // Realistic browser headers to avoid detection
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
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
      console.log(`[SCRAPER] Attempt ${attempt}/${retries} for URL: ${url}`);
      
      const response = await axios.get(scraperUrl, {
        headers,
        timeout: 20000, // 20s timeout - safer for Vercel serverless (leaves buffer)
        maxRedirects: 5,
        validateStatus: (status) => status < 500, // Accept 4xx but retry on 5xx
      });

      // Check for CAPTCHA or blocked responses
      if (response.status === 403 || response.status === 429) {
        throw new Error(`Amazon blocked request: HTTP ${response.status}`);
      }

      const html = response.data;
      if (!html || typeof html !== "string") {
        throw new Error("Invalid HTML response from scraper");
      }

      // Check for CAPTCHA indicators in HTML
      const captchaIndicators = [
        "captcha",
        "robot",
        "automated access",
        "verify you are human",
        "sorry, we just need to make sure",
        "enter the characters you see",
      ];
      const htmlLower = html.toLowerCase();
      const hasCaptcha = captchaIndicators.some((indicator) => htmlLower.includes(indicator));
      
      if (hasCaptcha) {
        console.warn(`[SCRAPER] CAPTCHA detected in response (attempt ${attempt})`);
        if (attempt < retries) {
          const delay = Math.min(3000 * attempt, 8000); // Max 8s delay
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }
        throw Object.assign(
          new Error("Amazon CAPTCHA detected - blocking automated access"),
          { status: 403, isCaptcha: true }
        );
      }
      
      // Check for "Page Not Found" or similar errors
      if (htmlLower.includes("page not found") || htmlLower.includes("404") || htmlLower.includes("we couldn't find that page")) {
        throw Object.assign(
          new Error("Product page not found"),
          { status: 404 }
        );
      }
      
      // Check for "Currently unavailable" or out of stock
      if (htmlLower.includes("currently unavailable") && htmlLower.includes("out of stock")) {
        console.warn("[SCRAPER] Product appears to be out of stock");
      }

      const $ = cheerio.load(html);
      
      // Multiple selectors for title (Amazon layout changes)
      const titleSelectors = [
        "#productTitle",
        "h1.a-size-large.product-title-word-break",
        "h1[data-automation-id='title']",
        ".product-title",
      ];

      let title = "";
      for (const selector of titleSelectors) {
        title = $(selector).first().text().trim();
        if (title) break;
      }

      // Multiple selectors for price (Amazon layout changes)
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
        ".a-price-whole",
        "span.a-price-whole",
      ];

      let price = "";
      for (const selector of priceSelectors) {
        const priceElement = $(selector).first();
        price = priceElement.text().trim() || priceElement.attr("aria-label") || "";
        // Also check parent elements for price
        if (!price) {
          price = priceElement.parent().text().trim();
        }
        if (price) break;
      }

      // Image URL selectors
      const imageUrl =
        $("#landingImage").attr("src") ||
        $("#imgBlkFront").attr("src") ||
        $(".a-dynamic-image").first().attr("src") ||
        $("img[data-a-image-name='landingImage']").attr("src") ||
        "";

      if (!title) {
        console.warn(`[SCRAPER] Title not found. HTML length: ${html.length}`);
        throw new Error("Product title not found - page structure may have changed");
      }

      if (!price) {
        console.warn(`[SCRAPER] Price not found. Title found: ${title}`);
        throw new Error("Product price not found - product may be out of stock or unavailable");
      }

      const priceNumber = parseFloat(price.replace(/[^0-9.]/g, ""));
      if (isNaN(priceNumber) || priceNumber <= 0) {
        throw new Error(`Invalid price format: ${price}`);
      }

      const brandMatch = title.match(/^([^,]+)/);
      const brand = brandMatch ? brandMatch[1].trim() : undefined;

      const attemptTime = Date.now() - attemptStartTime;
      console.log(`[SCRAPER] ✅ Successfully scraped (attempt ${attempt}, ${attemptTime}ms): ${title.substring(0, 50)}... | ₹${priceNumber}`);
      
      return {
        title,
        price,
        priceNumber,
        imageUrl,
        brand,
      };
    } catch (error: any) {
      const isLastAttempt = attempt === retries;
      const errorMsg = error.message || "Unknown error";
      
      console.error(`[SCRAPER] Attempt ${attempt}/${retries} failed:`, errorMsg);
      
      if (isLastAttempt) {
        const attemptTime = Date.now() - attemptStartTime;
        console.error(`[SCRAPER] ❌ All ${retries} retries failed for URL: ${url} (last attempt: ${attemptTime}ms)`);
        throw Object.assign(
          new Error(`Failed to scrape product after ${retries} attempts: ${errorMsg}`),
          {
            status: error.status || 502,
            originalError: errorMsg,
            url,
            isCaptcha: error.isCaptcha || false,
          }
        );
      }
      
      // Exponential backoff: 1s, 2s, 4s (reduced to save time)
      const delayMs = Math.min(1000 * Math.pow(2, attempt - 1), 6000);
      console.log(`[SCRAPER] Retrying in ${delayMs}ms...`);
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }

  throw new Error("Unreachable code");
}
