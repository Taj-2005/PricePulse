import axios from "axios";
import * as cheerio from "cheerio";

export async function scrapeProduct(url: string) {
  const apiKey = process.env.SCRAPER_API_KEY;

  if (!apiKey) {
    throw new Error("SCRAPER_API_KEY not set");
  }

  const scraperUrl = `http://api.scraperapi.com?api_key=${apiKey}&url=${encodeURIComponent(url)}`;

  const response = await axios.get(scraperUrl);
  const $ = cheerio.load(response.data);

  const title = $("#productTitle").text().trim();
  const price = $(".a-price .a-offscreen").first().text().trim();

  if (!title || !price) {
    throw new Error("Failed to scrape product info — check page structure or if bot-check blocked");
  }

  return { title, price };
}
