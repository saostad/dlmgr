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
Object.defineProperty(exports, "__esModule", { value: true });
const fast_node_logger_1 = require("fast-node-logger");
const downloadFile_1 = require("./downloadFile");
const downloadList_1 = require("./downloadList");
const variables_1 = require("./helpers/variables");
function main() {
    var e_1, _a;
    return __awaiter(this, void 0, void 0, function* () {
        yield fast_node_logger_1.createLogger({
            prettyPrint: {
                colorize: true,
                translateTime: "SYS:standard",
            },
        });
        // const rawLinks = await getListFromUri({
        //   uri: fetchUrl,
        //   keyWord: keyWord,
        //   propToSearchInElements,
        //   elementToFindInPage,
        // });
        // await saveListToFile({
        //   data: rawLinks,
        //   filePath: downloadListFileLocation,
        // });
        const rawLinks = yield downloadList_1.getListFromFile({
            filePath: variables_1.downloadListFileLocation,
        });
        function start() {
            return __asyncGenerator(this, arguments, function* start_1() {
                let index = 0;
                while (index < rawLinks.length) {
                    const result = yield __await(downloadFile_1.downloadFile(rawLinks[index]).catch(err => {
                        fast_node_logger_1.writeLog(err, { level: "error" });
                    }));
                    index++;
                    yield yield __await(result);
                }
            });
        }
        try {
            for (var _b = __asyncValues(start()), _c; _c = yield _b.next(), !_c.done;) {
                const iterator = _c.value;
                if (iterator === true) {
                    fast_node_logger_1.writeLog(`going to next link`);
                }
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
    fast_node_logger_1.writeLog(err, { stdout: true });
});
//# sourceMappingURL=app.js.map