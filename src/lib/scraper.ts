import axios from "axios";
import * as cheerio from "cheerio";

export async function scrapeProduct(url: string) {
  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
      },
    });

    const $ = cheerio.load(response.data);
    const title = $("#productTitle").text().trim();
    const price = $(".a-price .a-offscreen").first().text().trim();

    if (!title || !price) {
      throw new Error("Could not extract title or price");
    }

    return { title, price };
  } catch (err: any) {
    console.error("Scraping failed:", err.message);
    throw new Error("Amazon page could not be scraped.");
  }
}
