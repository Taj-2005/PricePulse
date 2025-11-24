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

export async function scrapeProduct(
  url: string,
  retries = 3
): Promise<ScrapedProduct> {
  const apiKey = process.env.SCRAPER_API_KEY;
  if (!apiKey) {
    throw new Error("Missing SCRAPER_API_KEY in environment variables");
  }

  let finalUrl = url;
  try {
    const headResponse = await axios.head(url, { maxRedirects: 5, timeout: 10000 });
    finalUrl = headResponse.request.res.responseUrl || url;
  } catch (error) {
    console.warn("Redirect resolution failed, proceeding with original URL.");
  }

  const scraperUrl = `http://api.scraperapi.com?api_key=${apiKey}&url=${encodeURIComponent(finalUrl)}`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios.get(scraperUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9",
        },
        timeout: 30000,
      });

      const $ = cheerio.load(response.data);
      const title = $("#productTitle").text().trim();

      const priceSelectors = [
        "#priceblock_dealprice",
        "#priceblock_ourprice",
        "#priceblock_saleprice",
        ".a-price .a-offscreen",
        ".a-price-whole",
        "#price_inside_buybox",
        ".a-price-range .a-offscreen",
      ];

      let price = "";
      for (const selector of priceSelectors) {
        const priceElement = $(selector).first();
        price = priceElement.text().trim();
        if (price) break;
      }

      // Extract image URL
      const imageUrl =
        $("#landingImage").attr("src") ||
        $("#imgBlkFront").attr("src") ||
        $(".a-dynamic-image").first().attr("src") ||
        "";

      if (!title || !price) {
        throw new Error("Product not found or price missing");
      }

      // Extract numeric price
      const priceNumber = parseFloat(price.replace(/[^0-9.]/g, ""));
      if (isNaN(priceNumber)) {
        throw new Error("Invalid price format");
      }

      // Try to extract brand and model (basic extraction)
      const brandMatch = title.match(/^([^,]+)/);
      const brand = brandMatch ? brandMatch[1].trim() : undefined;

      console.log(`✅ Scraped (attempt ${attempt}):`, title, `₹${priceNumber}`);
      return {
        title,
        price,
        priceNumber,
        imageUrl,
        brand,
      };
    } catch (error: any) {
      console.warn(`Attempt ${attempt} failed: ${error.message}`);
      if (attempt === retries) {
        console.error("All retries failed for URL:", url);
        throw Object.assign(
          new Error("Failed to scrape product after multiple attempts"),
          {
            status: 502,
            originalError: error.message,
          }
        );
      }
      await new Promise((r) => setTimeout(r, 2000 * attempt)); // Exponential backoff
    }
  }

  throw new Error("Unreachable code");
}

