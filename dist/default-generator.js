"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultGenerator = void 0;
var DefaultGenerator = /** @class */ (function () {
    function DefaultGenerator() {
        this.code = '';
        this.stdout = '';
    }
    DefaultGenerator.prototype.echo = function (text) {
        this.stdout += text;
    };
    return DefaultGenerator;
}());
exports.DefaultGenerator = DefaultGenerator;
