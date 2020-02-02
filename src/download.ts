import url from "url";
import http from "http";
import path from "path";
import fs from "fs";

import cliProgress from "cli-progress";
import { writeLog } from "fast-node-logger";
import { byteToMB } from "./helpers/utils";
import { downloadDir, defaultDownloadDir } from "./helpers/variables";

export function downloadFile(linkToDownload: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const { protocol, hostname, pathname } = url.parse(linkToDownload);

    const progress = new cliProgress.SingleBar(
      { format: "progress [{bar}] {percentage}% | {value}MB/{total}MB" },
      cliProgress.Presets.shades_classic,
    );

    writeLog(`downloading file ${linkToDownload}`, { stdout: true });
    http.get(linkToDownload, res => {
      if (res.statusCode === 302) {
        const newLocation = res.headers.location;

        const redirectedUrl = `${protocol}//${hostname}${newLocation}`;

        const filename = pathname?.slice(
          pathname.lastIndexOf("/") + 1,
        ) as string;

        const pathInFS = path.join(downloadDir ?? defaultDownloadDir, filename);
        http.get(redirectedUrl, res => {
          if (res.statusCode === 200) {
            /** file size in bytes */
            const fileSize = res.headers["content-length"] as string;

            const fileInFS = fs.createWriteStream(pathInFS);
            let totalReceivedData = 0;
            progress.start(byteToMB(fileSize), 0);

            res.on("error", function(err) {
              progress.stop();
              writeLog(err, { stdout: true, level: "fatal" });
              reject(err);
            });

            res.on("data", function dataChunkHandler(chunk) {
              totalReceivedData += chunk.length;
              progress.update(byteToMB(totalReceivedData));
            });

            res.on("end", function end() {
              progress.stop();
              writeLog(`${filename} successfully downloaded`, {
                stdout: true,
              });
              resolve(true);
            });

            res.pipe(fileInFS);
          }
        });
      }
    });
  });
}
