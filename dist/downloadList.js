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
const readline_1 = __importDefault(require("readline"));
const fs_1 = __importDefault(require("fs"));
const scraper_1 = require("./scraper");
const fast_node_logger_1 = require("fast-node-logger");
function getListFromUri({ uri, elementToFindInPage, propToSearchInElements, keyWord, }) {
    return __awaiter(this, void 0, void 0, function* () {
        return scraper_1.scrap({
            uri,
            keyWord,
            propToSearchInElements,
            elementToFindInPage,
        });
    });
}
exports.getListFromUri = getListFromUri;
function getListFromFile({ filePath, }) {
    var e_1, _a;
    return __awaiter(this, void 0, void 0, function* () {
        const fileStream = fs_1.default.createReadStream(filePath, { encoding: "utf8" });
        fileStream.on("open", () => {
            fast_node_logger_1.writeLog(`read file ${filePath} started`, { level: "trace" });
        });
        fileStream.on("close", () => {
            fast_node_logger_1.writeLog(`read file ${filePath} finished`, { level: "trace" });
        });
        const rl = readline_1.default.createInterface({
            input: fileStream,
            crlfDelay: Infinity,
        });
        const links = [];
        try {
            for (var rl_1 = __asyncValues(rl), rl_1_1; rl_1_1 = yield rl_1.next(), !rl_1_1.done;) {
                const line = rl_1_1.value;
                if (!line.startsWith("#")) {
                    links.push(line);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (rl_1_1 && !rl_1_1.done && (_a = rl_1.return)) yield _a.call(rl_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        fileStream.close();
        return links;
    });
}
exports.getListFromFile = getListFromFile;
function saveListToFile({ filePath, data, }) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const writeFileStream = fs_1.default.createWriteStream(filePath);
            let counter = 0;
            data.forEach(el => {
                writeFileStream.write(`${el}\n`, err => {
                    if (err) {
                        fast_node_logger_1.writeLog(err, { level: "error" });
                        reject(err);
                    }
                    counter++;
                    if (counter === data.length) {
                        writeFileStream.end(() => {
                            resolve(true);
                        });
                    }
                });
            });
        });
    });
}
exports.saveListToFile = saveListToFile;
function updateListFile({ link, status, filePath, }) {
    var e_2, _a;
    return __awaiter(this, void 0, void 0, function* () {
        const fileStream = fs_1.default.createReadStream(filePath, { encoding: "utf8" });
        fileStream.on("open", () => {
            fast_node_logger_1.writeLog(`read file ${filePath} started`, { level: "trace" });
        });
        fileStream.on("close", () => {
            fast_node_logger_1.writeLog(`read file ${filePath} finished`, { level: "trace" });
        });
        const rl = readline_1.default.createInterface({
            input: fileStream,
            crlfDelay: Infinity,
        });
        const links = [];
        try {
            for (var rl_2 = __asyncValues(rl), rl_2_1; rl_2_1 = yield rl_2.next(), !rl_2_1.done;) {
                const line = rl_2_1.value;
                if (line === link) {
                    if (status === "success") {
                        /** add # in beginning of the line to prevent from downloading it next time */
                        links.push(`#${line}`);
                    }
                }
                else {
                    links.push(line);
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (rl_2_1 && !rl_2_1.done && (_a = rl_2.return)) yield _a.call(rl_2);
            }
            finally { if (e_2) throw e_2.error; }
        }
        fileStream.close();
        /**time to rewrite the file with updated data */
        return saveListToFile({ filePath, data: links });
    });
}
exports.updateListFile = updateListFile;
//# sourceMappingURL=downloadList.js.map