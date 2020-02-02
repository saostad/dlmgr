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
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const logger = yield fast_node_logger_1.createLogger({
            prettyPrint: {
                colorize: true,
                translateTime: "SYS:standard",
            },
        });
        /** put your code below here */
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
        yield browser.close();
        /** filter raw kinks to get actual links */
        const rawLinks = links.filter(el => el !== false);
        const linkToDownload = rawLinks[1];
        const { protocol, hostname, pathname } = url_1.default.parse(linkToDownload);
        const progress = new cli_progress_1.default.SingleBar({ format: "progress [{bar}] {percentage}% | {value}/{total}" }, cli_progress_1.default.Presets.shades_classic);
        fast_node_logger_1.writeLog(`downloading file ${linkToDownload}`, { stdout: true });
        http_1.default.get(linkToDownload, res => {
            var _a;
            if (res.statusCode === 302) {
                const newLocation = res.headers.location;
                const redirectedUrl = `${protocol}//${hostname}${newLocation}`;
                const filename = (_a = pathname) === null || _a === void 0 ? void 0 : _a.slice(pathname.lastIndexOf("/") + 1);
                const pathInFS = path_1.default.join(process.cwd(), "downloads", filename);
                http_1.default.get(redirectedUrl, res => {
                    if (res.statusCode === 200) {
                        /** file size in bytes */
                        const fileSize = res.headers["content-length"];
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
                        const fileInFS = fs_1.default.createWriteStream(pathInFS);
                        let totalReceivedData = 0;
                        progress.start(byteToMB(fileSize), 0);
                        res.on("error", function (err) {
                            progress.stop();
                            console.error(err);
                        });
                        res.on("data", function dataChunkHandler(chunk) {
                            totalReceivedData += chunk.length;
                            progress.update(byteToMB(totalReceivedData));
                        });
                        res.on("end", function end() {
                            progress.stop();
                            console.log(`${filename} successfully downloaded`);
                        });
                        res.pipe(fileInFS);
                    }
                });
            }
        });
    });
}
exports.main = main;
main().catch(err => {
    console.log(`File: app.ts,`, `Line: 35 => `, err);
});
//# sourceMappingURL=app.js.map