import url from "url";
import http from "http";
import https from "https";
import path from "path";
import fs from "fs";

import cliProgress from "cli-progress";
import { writeLog } from "fast-node-logger";
import { byteToMB } from "./helpers/utils";
import {
  downloadDir,
  defaultDownloadDir,
  trackingMode,
  downloadListFileLocation,
} from "./helpers/variables";
import { updateListFile } from "./downloadList";

/** some websites redirect link to another location
 * this function follows the redirect and get the final link
 * it handle http or https links
 */
function getRealLink(linkToCheck: string): Promise<string> {
  writeLog(`getRealLink()`, { level: "trace" });
  return new Promise((resolve, reject) => {
    const onError = (err: Error, cb: any) => {
      writeLog(err, { stdout: true, level: "error" });
      cb(err);
    };

    const { protocol, hostname } = url.parse(linkToCheck);

    if (protocol?.toLowerCase() === "https:") {
      https.get(linkToCheck, res => {
        if (res.statusCode?.toString().startsWith("2")) {
          /** thats a real file */
          res.destroy();
          resolve(linkToCheck);
        }

        res.on("error", err => onError(err, reject));

        if (res.statusCode === 302) {
          const newLocation = res.headers.location;

          resolve(url.format({ protocol, hostname, pathname: newLocation }));
        }
      });
    } else {
      http.get(linkToCheck, res => {
        if (res.statusCode?.toString().startsWith("2")) {
          /** thats a real file */
          res.destroy();
          resolve(linkToCheck);
        }

        res.on("error", err => onError(err, reject));

        if (res.statusCode === 302) {
          const newLocation = res.headers.location;

          resolve(url.format({ protocol, hostname, pathname: newLocation }));
        }
      });
    }
  });
}

export function downloadFile(linkToDownload: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const { protocol, hostname, pathname } = url.parse(linkToDownload);

    const progress = new cliProgress.SingleBar(
      { format: "progress [{bar}] {percentage}% | {value}MB/{total}MB" },
      cliProgress.Presets.shades_classic,
    );

    writeLog(`downloading file ${linkToDownload}`, { stdout: true });

    const filename = pathname?.slice(pathname.lastIndexOf("/") + 1) as string;

    const pathInFS = path.join(downloadDir ?? defaultDownloadDir, filename);

    getRealLink(linkToDownload).then(checkedLink => {
      const { path: urlPath } = url.parse(checkedLink);

      let totalReceivedData = 0;

      function onError(err: Error) {
        progress.stop();
        writeLog(err, { stdout: true, level: "fatal" });
        reject(err);
      }

      function onDataChunk(chunk: any) {
        totalReceivedData += chunk.length;
        progress.update(byteToMB(totalReceivedData));
      }

      function onEnd() {
        progress.stop();
        writeLog(`${filename} successfully downloaded`, {
          stdout: true,
        });

        if (trackingMode) {
          /** update the text file and add # in beginning of the line of successfully downloaded link */
          updateListFile({
            filePath: downloadListFileLocation,
            link: linkToDownload,
            status: "success",
          });
        }

        resolve(true);
      }

      const opts: http.RequestOptions = {
        timeout: 2,
        method: "GET",
        protocol,
        path: urlPath,
        hostname,
      };

      if (protocol?.toLowerCase() === "https:") {
        https.get(opts, res => {
          if (res.statusCode === 200) {
            /** file size in bytes */
            const fileSize = res.headers["content-length"] as string;

            const fileWriteStreamInFS = fs.createWriteStream(pathInFS);

            progress.start(byteToMB(fileSize), 0);

            res.on("error", onError);

            res.on("data", onDataChunk);

            res.on("end", onEnd);

            res.pipe(fileWriteStreamInFS);
          }
        });
      } else {
        http.get(opts, res => {
          if (res.statusCode === 200) {
            /** file size in bytes */
            const fileSize = res.headers["content-length"] as string;

            const fileWriteStreamInFS = fs.createWriteStream(pathInFS);

            progress.start(byteToMB(fileSize), 0);

            res.on("error", onError);

            res.on("data", onDataChunk);

            res.on("end", onEnd);

            res.pipe(fileWriteStreamInFS);
          }
        });
      }
    });
  });
}
