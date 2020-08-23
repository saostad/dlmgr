import readline from "readline";
import fs from "fs";
import { scrap } from "./scraper";
import { ScrapInput } from "./typings/interfaces";
import { writeLog } from "fast-node-logger";
import urlJoin from "url-join";

export async function getListFromUri({
  uri,
  elementToFindInPage,
  propToSearchInElements,
  keyWord,
}: ScrapInput) {
  const rawLinks = await scrap({
    uri,
    keyWord,
    propToSearchInElements,
    elementToFindInPage,
  });

  const correctedLinks: string[] = [];
  rawLinks.forEach((link) => {
    if (!(link.startsWith("http") || link.startsWith("https"))) {
      console.warn(`link ${link} is invalid.`, "adding base uri to link.");
      correctedLinks.push(urlJoin([uri, link]));
    } else {
      correctedLinks.push(link);
    }
  });
  return correctedLinks;
}

interface GetListFromFileInput {
  filePath: string;
}
export async function getListFromFile({
  filePath,
}: GetListFromFileInput): Promise<string[]> {
  const fileStream = fs.createReadStream(filePath, { encoding: "utf8" });

  fileStream.on("open", () => {
    writeLog(`read file ${filePath} started`, { level: "trace" });
  });

  fileStream.on("close", () => {
    writeLog(`read file ${filePath} finished`, { level: "trace" });
  });

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  const links = [];

  for await (const line of rl) {
    if (!line.startsWith("#")) {
      links.push(line);
    }
  }
  fileStream.close();
  return links;
}

interface SaveListToFileInput {
  filePath: string;
  data: string[];
}
export async function saveListToFile({
  filePath,
  data,
}: SaveListToFileInput): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const writeFileStream = fs.createWriteStream(filePath);

    let counter = 0;

    data.forEach((el) => {
      writeFileStream.write(`${el}\n`, (err) => {
        if (err) {
          writeLog(err, { level: "error" });
          reject(err);
        }

        counter++;

        if (counter === data.length) {
          writeFileStream.end(() => {
            resolve(true);
          });
        }
      });
    });
  });
}

interface UpdateListFileInput {
  link: string;
  status: "success" | "fail";
  filePath: string;
}
export async function updateListFile({
  link,
  status,
  filePath,
}: UpdateListFileInput) {
  const fileStream = fs.createReadStream(filePath, { encoding: "utf8" });

  fileStream.on("open", () => {
    writeLog(`read file ${filePath} started`, { level: "trace" });
  });

  fileStream.on("close", () => {
    writeLog(`read file ${filePath} finished`, { level: "trace" });
  });

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  const links = [];
  for await (const line of rl) {
    if (line === link) {
      if (status === "success") {
        /** add # in beginning of the line to prevent from downloading it next time */
        links.push(`#${line}`);
      }
    } else {
      links.push(line);
    }
  }

  fileStream.close();

  /**time to rewrite the file with updated data */
  return saveListToFile({ filePath, data: links });
}
