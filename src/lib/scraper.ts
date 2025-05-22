import axios from "axios";
import * as cheerio from "cheerio";

export async function scrapeProduct(url: string) {
  const apiKey = process.env.SCRAPER_API_KEY;

  if (!apiKey) {
    console.error("Missing SCRAPER_API_KEY");
    throw new Error("Missing SCRAPER_API_KEY");
  }

  // Resolve redirects for short URLs
  let finalUrl = url;
  try {
    const headResponse = await axios.head(url, { maxRedirects: 5 });
    finalUrl = headResponse.request.res.responseUrl || url;
  } catch (err) {
    console.warn("Redirect resolution failed, proceeding with original URL.");
  }

  const scraperUrl = `http://api.scraperapi.com?api_key=${apiKey}&url=${encodeURIComponent(finalUrl)}`;

  try {
    const response = await axios.get(scraperUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    const $ = cheerio.load(response.data);
    const title = $("#productTitle").text().trim();

    // Attempt multiple selectors for price
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

    console.log("Scraped:", title, price);
    if (!title || !price) throw new Error("Product not found");

    return { title, price };
  } catch (err: any) {
    console.error("Scraper failed:", err.message);
    throw err;
  }
}
