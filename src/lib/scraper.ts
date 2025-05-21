import puppeteer from "puppeteer";

export async function scrapeProduct(url: string) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "domcontentloaded" });

  const title = await page.$eval("#productTitle", (el) => el.textContent?.trim());
  const price = await page.$eval(".a-price .a-offscreen", (el) => el.textContent);

  await browser.close();
  return { title, price };
}
