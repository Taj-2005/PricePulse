import axios from "axios";
import * as cheerio from "cheerio";

export async function scrapeProduct(url: string) {
  const apiKey = process.env.SCRAPER_API_KEY;

  if (!apiKey) {
    console.error("Missing SCRAPER_API_KEY");
    throw new Error("Missing SCRAPER_API_KEY");
  }

  const scraperUrl = `http://api.scraperapi.com?api_key=${apiKey}&url=${encodeURIComponent(url)}`;

  try {
    const response = await axios.get(scraperUrl);
    const $ = cheerio.load(response.data);
    const title = $("#productTitle").text().trim();
    const price = $(".a-price .a-offscreen").first().text().trim();

    console.log("Scraped:", title, price);
    if (!title || !price) throw new Error("Product not found");

    return { title, price };
  } catch (err: any) {
    console.error("Scraper failed:", err.message);
    throw err;
  }
}
