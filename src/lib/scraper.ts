import axios from "axios";
import * as cheerio from "cheerio";

export async function scrapeProduct(url: string, retries = 3): Promise<{title: string, price: string}> {
  const apiKey = process.env.SCRAPER_API_KEY;
  if (!apiKey) throw new Error("Missing SCRAPER_API_KEY");

  let finalUrl = url;
  try {
    const headResponse = await axios.head(url, { maxRedirects: 5 });
    finalUrl = headResponse.request.res.responseUrl || url;
  } catch {
    console.warn("Redirect resolution failed, proceeding with original URL.");
  }

  const scraperUrl = `http://api.scraperapi.com?api_key=${apiKey}&url=${encodeURIComponent(finalUrl)}`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios.get(scraperUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
          "Accept-Language": "en-US,en;q=0.9",
        },
      });

      const $ = cheerio.load(response.data);
      const title = $("#productTitle").text().trim();

      const priceSelectors = [
        "#priceblock_dealprice",
        "#priceblock_ourprice",
        "#priceblock_saleprice",
        ".a-price .a-offscreen",
        ".a-price-whole",
      ];

      let price = "";
      for (const selector of priceSelectors) {
        price = $(selector).first().text().trim();
        if (price) break;
      }

      if (!title || !price) {
        throw new Error("Product not found or price missing");
      }

      console.log(`Scraped (attempt ${attempt}):`, title, price);
      return { title, price };
    } catch (error: any) {
      console.warn(`Attempt ${attempt} failed: ${error.message}`);
      if (attempt === retries) {
        console.error("All retries failed");
        throw Object.assign(new Error("Failed to scrape product after multiple attempts"), {
          status: 502,
        });
      }
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  throw new Error("Unreachable code");
}
