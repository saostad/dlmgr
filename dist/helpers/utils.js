"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** convert byte to mega byte */
exports.byteToMB = (input) => {
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
//# sourceMappingURL=utils.js.map