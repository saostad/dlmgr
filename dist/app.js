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
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        yield fast_node_logger_1.createLogger();
        /** put your code below here */
        const browser = yield puppeteer_1.default.launch();
        const page = yield browser.newPage();
        yield page.goto("https://satina.website/download-friends/", {
            waitUntil: "networkidle2",
        });
        const hyperlinks = yield page.$$("a");
        const data = hyperlinks.map((el) => __awaiter(this, void 0, void 0, function* () {
            const prop = yield el.getProperty("href");
            const hrefLink = (yield prop.jsonValue());
            if (hrefLink.includes("1080")) {
                return hrefLink;
            }
            return false;
        }));
        const links = yield Promise.all(data);
        const correctLinks = links.filter(el => el !== false);
        console.log(`File: app.ts,`, `Line: 32 => `, correctLinks);
        yield browser.close();
    });
}
exports.main = main;
main().catch(err => {
    console.log(`File: app.ts,`, `Line: 35 => `, err);
});
//# sourceMappingURL=app.js.map