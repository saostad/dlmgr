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
const axios_1 = __importDefault(require("axios"));
const cheerio_1 = __importDefault(require("cheerio"));
const fast_node_logger_1 = require("fast-node-logger");
function getUriBody(uri) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield axios_1.default.get(uri);
        if (!response.status.toString().startsWith("2")) {
            throw `url ${uri} is not valid!`;
        }
        return response.data;
    });
}
function scrap({ uri, keyWord, elementToFindInPage, propToSearchInElements, }) {
    return __awaiter(this, void 0, void 0, function* () {
        fast_node_logger_1.writeLog(`opening page ${uri}`, { stdout: true });
        const body = yield getUriBody(uri);
        const $ = cheerio_1.default.load(body);
        fast_node_logger_1.writeLog(`searching for keyword '${keyWord}' in href of a HTML tags`, {
            stdout: true,
        });
        /**filter s elements with content of their link contain '1080'
         * for just getting full hd links
         * otherwise return false
         */
        const rawLinks = [];
        $(elementToFindInPage).each((index, element) => {
            if (element.attribs[propToSearchInElements].includes(keyWord)) {
                rawLinks.push(element.attribs[propToSearchInElements]);
            }
        });
        return rawLinks;
    });
}
exports.scrap = scrap;
//# sourceMappingURL=scraper.js.map