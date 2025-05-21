import axios from "axios";
import * as cheerio from "cheerio";

export async function scrapeProduct(url: string) {
  try {
    const apiKey = process.env.SCRAPER_API_KEY;

    if (!apiKey) {
      console.error("SCRAPER_API_KEY missing");
      throw new Error("Missing SCRAPER_API_KEY");
    }

    const scraperUrl = `http://api.scraperapi.com?api_key=${apiKey}&url=${encodeURIComponent(url)}`;

    const response = await axios.get(scraperUrl);
    const $ = cheerio.load(response.data);

    const title = $("#productTitle").text().trim();
    const price = $(".a-price .a-offscreen").first().text().trim();

    console.log("Scraped Title:", title);
    console.log("Scraped Price:", price);

    if (!title || !price) {
      throw new Error("Could not extract product info from Amazon");
    }

    return { title, price };
  } catch (err: any) {
    console.error("Scraper failed:", err.message);
    throw err;
  }
}
