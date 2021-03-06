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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderAsync = exports.render = exports.parseAsync = exports.parse = void 0;
var tokenTypes = [
    { name: 'comment', test: /^(?:<#|\s*<!#)([\s\S]*?)(?:#>|#!>\s*)/ },
    { name: 'raw', test: /^(?:\s*<!|<\?)([\-=])([\s\S]*?)(?:!>\s*|\?>)/ },
    { name: 'code', test: /^(?:\s*<!|<\?)([\s\S]*?)(?:!>\s*|\?>)/ },
    { name: 'content', test: /^([\s\S]*?)(?:<\?|\s*<![#\-=]?)|(?:[\s\S]+)/ },
];
var tokenTypesLen = tokenTypes.length;
function lexer(code) {
    var tokens = [];
    while (code) {
        var match = void 0;
        for (var i = 0; i < tokenTypesLen; i++) {
            var type = tokenTypes[i];
            match = type.test.exec(code);
            if (match) {
                var token = {
                    type: type.name,
                    content: match[1] || match[0],
                    escape: false
                };
                if (token.type === 'raw') {
                    token.content = match[2];
                    token.escape = match[1] === '=';
                }
                if (token.type === 'content') {
                    code = code.substring(token.content.length);
                }
                else {
                    code = code.substring(match[0].length);
                }
                tokens.push(token);
                break;
            }
        }
        if (!match) {
            throw new Error("Invalid token \"" + code[0] + "\"");
        }
    }
    return tokens;
}
function quote(text) {
    return '`' + text.replace('`', '\\`') + '`';
}
function parser(tokens) {
    var code = '';
    var len = tokens.length;
    for (var i = 0; i < len; i++) {
        var token = tokens[i];
        if (token.type === 'comment')
            continue;
        if (token.type === 'content') {
            code += "; $__append(" + quote(token.content) + ")\n";
            continue;
        }
        if (token.type === 'raw') {
            code += "; $__append(" + String(token.content).trim() + ", " + token.escape + ")\n";
            continue;
        }
        if (token.type === 'code') {
            code += "; " + token.content + "\n";
            continue;
        }
    }
    return code;
}
// eslint-disable-next-line
var AsyncFunction = eval('Object.getPrototypeOf(async function() {}).constructor');
function parse(code) {
    var result = parser(lexer(code));
    var source = "\n  let $$ = '';\n\n  const $__append = (exp, escape) => {\n    if (exp == undefined || exp == null) {\n      return;\n    }\n    \n    if (escape) {\n      $$ += String(exp)\n        .replace(/&/gim, '&amp;')\n        .replace(/</gim, '&lt;')\n        .replace(/>/gim, '&gt;');\n    } else {\n      $$ += String(exp);\n    }\n  };\n\n  with (Object.assign({ $$: undefined }, locals)) {\n    " + result + "\n  };\n\n  return $$;";
    return {
        source: source,
        render: new Function('locals', source),
        renderAsync: new AsyncFunction('locals', source)
    };
}
exports.parse = parse;
function parseAsync(code) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    setTimeout(function () {
                        try {
                            resolve(parse(code));
                        }
                        catch (err) {
                            reject(err);
                        }
                    }, 0);
                })];
        });
    });
}
exports.parseAsync = parseAsync;
function render(code, data) {
    if (data === void 0) { data = {}; }
    return parse(code).render(data);
}
exports.render = render;
function renderAsync(code, data) {
    if (data === void 0) { data = {}; }
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, parseAsync(code).then(function (jstpl) { return jstpl.renderAsync(data); })];
        });
    });
}
exports.renderAsync = renderAsync;
