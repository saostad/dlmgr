import { createLogger, writeLog } from "fast-node-logger";
import { downloadFile } from "./downloadFile";
import {
  getListFromUri,
  saveListToFile,
  getListFromFile,
} from "./downloadList";
import {
  fetchUrl,
  keyWord,
  propToSearchInElements,
  elementToFindInPage,
} from "./helpers/variables";
import { join } from "path";

export async function main() {
  await createLogger({
    prettyPrint: {
      colorize: true,
      translateTime: "SYS:standard",
    },
  });

  // const rawLinks = await getListFromUri({
  //   uri: fetchUrl,
  //   keyWord: keyWord,
  //   propToSearchInElements,
  //   elementToFindInPage,
  // });

  // await saveListToFile({
  //   data: rawLinks,
  //   filePath: join(process.cwd(), "export.txt"),
  // });

  const rawLinks = await getListFromFile({
    filePath: join(process.cwd(), "export.txt"),
  });

  async function* start() {
    let index = 0;
    while (index < rawLinks.length) {
      const result = await downloadFile(rawLinks[index]);
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

main().catch(err => {
  writeLog(err, { stdout: true });
});
