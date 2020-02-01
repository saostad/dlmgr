import dotenv from "dotenv";
import { createLogger } from "fast-node-logger";

dotenv.config();

import puppeteer from "puppeteer";

export async function main() {
  await createLogger();

  /** put your code below here */

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto("https://satina.website/download-friends/", {
    waitUntil: "networkidle2",
  });

  const hyperlinks = await page.$$("a");
  const data = hyperlinks.map(async el => {
    const prop = await el.getProperty("href");
    const hrefLink = (await prop.jsonValue()) as string;
    if (hrefLink.includes("1080")) {
      return hrefLink;
    }
    return false;
  });

  const links = await Promise.all(data);
  const correctLinks = links.filter(el => el !== false);
  console.log(`File: app.ts,`, `Line: 32 => `, correctLinks);

  await browser.close();
}

main().catch(err => {
  console.log(`File: app.ts,`, `Line: 35 => `, err);
});
