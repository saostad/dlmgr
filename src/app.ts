import { createLogger, writeLog } from "fast-node-logger";
import { scrap } from "./scraper";
import { downloadFile } from "./download";

export async function main() {
  await createLogger({
    prettyPrint: {
      colorize: true,
      translateTime: "SYS:standard",
    },
  });

  const rawLinks = await scrap();

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
  writeLog(err);
});
