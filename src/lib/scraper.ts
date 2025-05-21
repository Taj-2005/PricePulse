import axios from "axios";
import * as cheerio from "cheerio";

const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;

export async function scrapeProduct(url: string) {
  if (!SCRAPER_API_KEY) {
    throw new Error("Missing SCRAPER_API_KEY in env");
  }

  const scraperUrl = `http://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${encodeURIComponent(url)}`;

  const response = await axios.get(scraperUrl);
  const $ = cheerio.load(response.data);

  const title = $("#productTitle").text().trim();
  const price = $(".a-price .a-offscreen").first().text().trim();

  if (!title || !price) {
    throw new Error("Could not find product info");
  }

  return { title, price };
}
