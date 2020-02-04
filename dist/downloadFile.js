"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const url_1 = __importDefault(require("url"));
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const cli_progress_1 = __importDefault(require("cli-progress"));
const fast_node_logger_1 = require("fast-node-logger");
const utils_1 = require("./helpers/utils");
const variables_1 = require("./helpers/variables");
const downloadList_1 = require("./downloadList");
/** some websites redirect link to another location
 * this function follows the redirect and get the final link
 * it handle http or https links
 */
function getRealLink(linkToCheck) {
    fast_node_logger_1.writeLog(`getRealLink()`, { level: "trace" });
    return new Promise((resolve, reject) => {
        var _a;
        const onError = (err, cb) => {
            fast_node_logger_1.writeLog(err, { stdout: true, level: "error" });
            cb(err);
        };
        const { protocol, hostname } = url_1.default.parse(linkToCheck);
        if (((_a = protocol) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === "https:") {
            https_1.default.get(linkToCheck, res => {
                var _a;
                if ((_a = res.statusCode) === null || _a === void 0 ? void 0 : _a.toString().startsWith("2")) {
                    /** thats a real file */
                    res.destroy();
                    resolve(linkToCheck);
                }
                res.on("error", err => onError(err, reject));
                if (res.statusCode === 302) {
                    const newLocation = res.headers.location;
                    resolve(url_1.default.format({ protocol, hostname, pathname: newLocation }));
                }
            });
        }
        else {
            http_1.default.get(linkToCheck, res => {
                var _a;
                if ((_a = res.statusCode) === null || _a === void 0 ? void 0 : _a.toString().startsWith("2")) {
                    /** thats a real file */
                    res.destroy();
                    resolve(linkToCheck);
                }
                res.on("error", err => onError(err, reject));
                if (res.statusCode === 302) {
                    const newLocation = res.headers.location;
                    resolve(url_1.default.format({ protocol, hostname, pathname: newLocation }));
                }
            });
        }
    });
}
function downloadFile(linkToDownload) {
    return new Promise((resolve, reject) => {
        var _a;
        const { protocol, hostname, pathname } = url_1.default.parse(linkToDownload);
        const progress = new cli_progress_1.default.SingleBar({ format: "progress [{bar}] {percentage}% | {value}MB/{total}MB" }, cli_progress_1.default.Presets.shades_classic);
        fast_node_logger_1.writeLog(`downloading file ${linkToDownload}`, { stdout: true });
        const filename = (_a = pathname) === null || _a === void 0 ? void 0 : _a.slice(pathname.lastIndexOf("/") + 1);
        const pathInFS = path_1.default.join((variables_1.downloadDir !== null && variables_1.downloadDir !== void 0 ? variables_1.downloadDir : variables_1.defaultDownloadDir), filename);
        getRealLink(linkToDownload).then(checkedLink => {
            var _a;
            const { path: urlPath } = url_1.default.parse(checkedLink);
            let totalReceivedData = 0;
            function onError(err) {
                progress.stop();
                fast_node_logger_1.writeLog(err, { stdout: true, level: "fatal" });
                reject(err);
            }
            function onDataChunk(chunk) {
                totalReceivedData += chunk.length;
                progress.update(utils_1.byteToMB(totalReceivedData));
            }
            function onEnd() {
                progress.stop();
                fast_node_logger_1.writeLog(`${filename} successfully downloaded`, {
                    stdout: true,
                });
                if (variables_1.trackingMode) {
                    /** update the text file and add # in beginning of the line of successfully downloaded link */
                    downloadList_1.updateListFile({
                        filePath: variables_1.downloadListFileLocation,
                        link: linkToDownload,
                        status: "success",
                    });
                }
                resolve(true);
            }
            const opts = {
                timeout: 2,
                method: "GET",
                protocol,
                path: urlPath,
                hostname,
            };
            if (((_a = protocol) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === "https:") {
                https_1.default.get(opts, res => {
                    if (res.statusCode === 200) {
                        /** file size in bytes */
                        const fileSize = res.headers["content-length"];
                        const fileWriteStreamInFS = fs_1.default.createWriteStream(pathInFS);
                        progress.start(utils_1.byteToMB(fileSize), 0);
                        res.on("error", onError);
                        res.on("data", onDataChunk);
                        res.on("end", onEnd);
                        res.pipe(fileWriteStreamInFS);
                    }
                });
            }
            else {
                http_1.default.get(opts, res => {
                    if (res.statusCode === 200) {
                        /** file size in bytes */
                        const fileSize = res.headers["content-length"];
                        const fileWriteStreamInFS = fs_1.default.createWriteStream(pathInFS);
                        progress.start(utils_1.byteToMB(fileSize), 0);
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
exports.downloadFile = downloadFile;
//# sourceMappingURL=downloadFile.js.map