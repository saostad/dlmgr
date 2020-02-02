import dotenv from "dotenv";
import { createLogger, writeLog } from "fast-node-logger";
dotenv.config();
import puppeteer from "puppeteer";
import http from "http";
import url from "url";
import fs from "fs";
import path from "path";
import cliProgress from "cli-progress";

/**Configs */
const fetchUrl = "https://satina.website/download-friends/";
const elementToFindInPage = "a";
const propToSearchInElements = "href";
const keyWord = "1080";
const defaultDownloadDir = path.join(process.cwd(), "downloads");
const downloadDir = undefined;

export async function main() {
  const logger = await createLogger({
    prettyPrint: {
      colorize: true,
      translateTime: "SYS:standard",
    },
  });

  /** put your code below here */
  writeLog("Lunching Chromium...", { stdout: true });
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  writeLog(`opening page ${fetchUrl}`, { stdout: true });
  await page.goto(fetchUrl, {
    waitUntil: "networkidle2",
  });

  /**get all html a elements */
  const hyperlinks = await page.$$(elementToFindInPage);

  /**filter s elements with content of their link contain '1080'
   * for just getting full hd links
   * otherwise return false
   */
  writeLog(`searching for keyword '${keyWord}' in href of a HTML tags`, {
    stdout: true,
  });
  const data = hyperlinks.map(async el => {
    const prop = await el.getProperty(propToSearchInElements);
    const hrefLink = (await prop.jsonValue()) as string;
    if (hrefLink.includes(keyWord)) {
      return hrefLink;
    }
    return false;
  });

  const links = await Promise.all(data);
  await browser.close();

  /** filter raw kinks to get actual links */
  const rawLinks = links.filter(el => el !== false) as string[];

  const linkToDownload = rawLinks[1];

  const { protocol, hostname, pathname } = url.parse(linkToDownload);

  const progress = new cliProgress.SingleBar(
    { format: "progress [{bar}] {percentage}% | {value}/{total}" },
    cliProgress.Presets.shades_classic,
  );

  writeLog(`downloading file ${linkToDownload}`, { stdout: true });
  http.get(linkToDownload, res => {
    if (res.statusCode === 302) {
      const newLocation = res.headers.location;

      const redirectedUrl = `${protocol}//${hostname}${newLocation}`;

      const filename = pathname?.slice(pathname.lastIndexOf("/") + 1) as string;

      const pathInFS = path.join(downloadDir ?? defaultDownloadDir, filename);
      http.get(redirectedUrl, res => {
        if (res.statusCode === 200) {
          /** file size in bytes */
          const fileSize = res.headers["content-length"] as string;

          /** convert byte to mega byte */
          const byteToMB = (input: number | string): number => {
            let number: number;
            if (typeof input === "number") {
              number = input;
            } else {
              number = parseInt(input);
            }
            const result = (number / 1024 / 1024).toFixed(2);

            return Number(result);
          };

          const fileInFS = fs.createWriteStream(pathInFS);
          let totalReceivedData = 0;
          progress.start(byteToMB(fileSize), 0);

          res.on("error", function(err) {
            progress.stop();
            console.error(err);
          });

          res.on("data", function dataChunkHandler(chunk) {
            totalReceivedData += chunk.length;
            progress.update(byteToMB(totalReceivedData));
          });

          res.on("end", function end() {
            progress.stop();
            writeLog(`${filename} successfully downloaded`, { stdout: true });
          });

          res.pipe(fileInFS);
        }
      });
    }
  });
}

main().catch(err => {
  writeLog(err);
});
