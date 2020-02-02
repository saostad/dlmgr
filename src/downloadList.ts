import readline from "readline";
import fs from "fs";
import { scrap } from "./scraper";
import { ScrapInput } from "./typings/interfaces";
import { writeLog } from "fast-node-logger";

export async function getListFromUri({
  uri,
  elementToFindInPage,
  propToSearchInElements,
  keyWord,
}: ScrapInput) {
  return scrap({
    uri,
    keyWord,
    propToSearchInElements,
    elementToFindInPage,
  });
}

interface GetListFromFileInput {
  filePath: string;
}
export async function getListFromFile({ filePath }: GetListFromFileInput) {
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

  return links;
}

interface SaveListToFileInput {
  filePath: string;
  data: string[];
}
export async function saveListToFile({ filePath, data }: SaveListToFileInput) {
  return new Promise((resolve, reject) => {
    const writeFileStream = fs.createWriteStream(filePath);

    let counter = 0;

    data.forEach(el => {
      writeFileStream.write(`${el}\n`, err => {
        if (err) {
          writeLog(err, { level: "error" });
          reject(err);
        }

        counter++;

        if (counter === data.length) {
          writeFileStream.end(() => {
            resolve("done!");
          });
        }
      });
    });
  });
}
