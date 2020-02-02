"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const fast_node_logger_1 = require("fast-node-logger");
dotenv_1.default.config();
const puppeteer_1 = __importDefault(require("puppeteer"));
const http_1 = __importDefault(require("http"));
const url_1 = __importDefault(require("url"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const cli_progress_1 = __importDefault(require("cli-progress"));
/**Configs */
const fetchUrl = "https://satina.website/download-friends/";
const elementToFindInPage = "a";
const propToSearchInElements = "href";
const keyWord = "1080";
const defaultDownloadDir = path_1.default.join(process.cwd(), "downloads");
const downloadDir = undefined;
/** convert byte to mega byte */
const byteToMB = (input) => {
    let number;
    if (typeof input === "number") {
        number = input;
    }
    else {
        number = parseInt(input);
    }
    const result = (number / 1024 / 1024).toFixed(2);
    return Number(result);
};
function main() {
    var e_1, _a;
    return __awaiter(this, void 0, void 0, function* () {
        yield fast_node_logger_1.createLogger({
            prettyPrint: {
                colorize: true,
                translateTime: "SYS:standard",
            },
        });
        fast_node_logger_1.writeLog("Lunching Chromium...", { stdout: true });
        const browser = yield puppeteer_1.default.launch();
        const page = yield browser.newPage();
        fast_node_logger_1.writeLog(`opening page ${fetchUrl}`, { stdout: true });
        yield page.goto(fetchUrl, {
            waitUntil: "networkidle2",
        });
        /**get all html a elements */
        const hyperlinks = yield page.$$(elementToFindInPage);
        /**filter s elements with content of their link contain '1080'
         * for just getting full hd links
         * otherwise return false
         */
        fast_node_logger_1.writeLog(`searching for keyword '${keyWord}' in href of a HTML tags`, {
            stdout: true,
        });
        const data = hyperlinks.map((el) => __awaiter(this, void 0, void 0, function* () {
            const prop = yield el.getProperty(propToSearchInElements);
            const hrefLink = (yield prop.jsonValue());
            if (hrefLink.includes(keyWord)) {
                return hrefLink;
            }
            return false;
        }));
        const links = yield Promise.all(data);
        /**no need puppeteer instance anymore */
        yield browser.close();
        /** filter raw kinks to get actual links */
        const rawLinks = links.filter(el => el !== false);
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
                        const pathInFS = path_1.default.join((downloadDir !== null && downloadDir !== void 0 ? downloadDir : defaultDownloadDir), filename);
                        http_1.default.get(redirectedUrl, res => {
                            if (res.statusCode === 200) {
                                /** file size in bytes */
                                const fileSize = res.headers["content-length"];
                                const fileInFS = fs_1.default.createWriteStream(pathInFS);
                                let totalReceivedData = 0;
                                progress.start(byteToMB(fileSize), 0);
                                res.on("error", function (err) {
                                    progress.stop();
                                    fast_node_logger_1.writeLog(err, { stdout: true, level: "fatal" });
                                    reject(err);
                                });
                                res.on("data", function dataChunkHandler(chunk) {
                                    totalReceivedData += chunk.length;
                                    progress.update(byteToMB(totalReceivedData));
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
        function start() {
            return __asyncGenerator(this, arguments, function* start_1() {
                let index = 0;
                while (index < rawLinks.length) {
                    const result = yield __await(downloadFile(rawLinks[index]));
                    index++;
                    yield yield __await(result);
                }
            });
        }
        try {
            for (var _b = __asyncValues(start()), _c; _c = yield _b.next(), !_c.done;) {
                const iterator = _c.value;
                console.log(`File: app.ts,`, `Line: 142 => `, iterator);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) yield _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
    });
}
exports.main = main;
main().catch(err => {
    fast_node_logger_1.writeLog(err);
});
//# sourceMappingURL=app.js.map