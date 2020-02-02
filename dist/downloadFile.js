"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const url_1 = __importDefault(require("url"));
const http_1 = __importDefault(require("http"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const cli_progress_1 = __importDefault(require("cli-progress"));
const fast_node_logger_1 = require("fast-node-logger");
const utils_1 = require("./helpers/utils");
const variables_1 = require("./helpers/variables");
function downloadFile(linkToDownload) {
    return new Promise((resolve, reject) => {
        const { protocol, hostname, pathname } = url_1.default.parse(linkToDownload);
        const progress = new cli_progress_1.default.SingleBar({ format: "progress [{bar}] {percentage}% | {value}MB/{total}MB" }, cli_progress_1.default.Presets.shades_classic);
        fast_node_logger_1.writeLog(`downloading file ${linkToDownload}`, { stdout: true });
        http_1.default.get(linkToDownload, res => {
            var _a;
            if (res.statusCode === 302) {
                const newLocation = res.headers.location;
                const redirectedUrl = `${protocol}//${hostname}${newLocation}`;
                const filename = (_a = pathname) === null || _a === void 0 ? void 0 : _a.slice(pathname.lastIndexOf("/") + 1);
                const pathInFS = path_1.default.join((variables_1.downloadDir !== null && variables_1.downloadDir !== void 0 ? variables_1.downloadDir : variables_1.defaultDownloadDir), filename);
                http_1.default.get(redirectedUrl, res => {
                    if (res.statusCode === 200) {
                        /** file size in bytes */
                        const fileSize = res.headers["content-length"];
                        const fileInFS = fs_1.default.createWriteStream(pathInFS);
                        let totalReceivedData = 0;
                        progress.start(utils_1.byteToMB(fileSize), 0);
                        res.on("error", function (err) {
                            progress.stop();
                            fast_node_logger_1.writeLog(err, { stdout: true, level: "fatal" });
                            reject(err);
                        });
                        res.on("data", function dataChunkHandler(chunk) {
                            totalReceivedData += chunk.length;
                            progress.update(utils_1.byteToMB(totalReceivedData));
                        });
                        res.on("end", function end() {
                            progress.stop();
                            fast_node_logger_1.writeLog(`${filename} successfully downloaded`, {
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
exports.downloadFile = downloadFile;
//# sourceMappingURL=downloadFile.js.map