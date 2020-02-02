"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
exports.fetchUrl = "https://satina.website/download-friends/";
exports.elementToFindInPage = "a";
exports.propToSearchInElements = "href";
exports.keyWord = "1080";
exports.defaultDownloadDir = path_1.default.join(process.cwd(), "downloads");
exports.downloadDir = undefined;
//# sourceMappingURL=variables.js.map