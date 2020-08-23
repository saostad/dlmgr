import { createLogger, writeLog } from "fast-node-logger";
import path from "path";
import { downloadFile } from "./downloadFile";
import {
  getListFromUri,
  saveListToFile,
  getListFromFile,
} from "./downloadList";
// import {
//   fetchUrl,
//   keyWord,
//   propToSearchInElements,
//   elementToFindInPage,
//   downloadListFileLocation,
// } from "./helpers/variables";

export async function main() {
  await createLogger({
    prettyPrint: {
      colorize: true,
      translateTime: "SYS:standard",
    },
  });

  const config = require(path.join(process.cwd(), "config.json"));

  const rawLinks = await getListFromUri({
    uri: config.fetchUrl,
    keyWord: config.keyWord,
    propToSearchInElements: config.propToSearchInElements,
    elementToFindInPage: config.elementToFindInPage,
  });

  await saveListToFile({
    data: rawLinks,
    filePath: config.downloadListFileLocation,
  });

  // const rawLinks = await getListFromFile({
  //   filePath: downloadListFileLocation,
  // });

  async function* start() {
    let index = 0;
    while (index < rawLinks.length) {
      const result = await downloadFile(rawLinks[index]).catch((err) => {
        writeLog(err, { level: "error" });
      });
      index++;
      yield result;
    }
  }

  for await (const iterator of start()) {
    if (iterator === true) {
      writeLog(`going to next link`);
    }
  }
}

main().catch((err) => {
  writeLog(err, { stdout: true });
});
