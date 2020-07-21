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
    { name: 'comment', test: /^<#((?:.|\s)*?)(?:#>)/ },
    { name: 'text', test: /^(?:<\?|\s*<!)=(.*?)(?:\?>|!>\s*)/ },
    { name: 'html', test: /^(?:<\?|\s*<!)-(.*?)(?:\?>|!>\s*)/ },
    { name: 'code', test: /^(?:<\?|\s*<!)(.*?)(?:\?>|!>\s*)/ },
    { name: 'content', test: /^((?:.|\s)+?)(?:([\s]*<!|<\?))/ },
    { name: 'content', test: /^(.+)/ },
];
function lexer(code) {
    var tokens = [];
    while (code) {
        var match = void 0;
        for (var _i = 0, tokenTypes_1 = tokenTypes; _i < tokenTypes_1.length; _i++) {
            var type = tokenTypes_1[_i];
            match = type.test.exec(code);
            if (match) {
                tokens.push({
                    type: type.name,
                    match: match
                });
                if (type.name === 'content') {
                    code = code.substr(match[1].length);
                }
                else {
                    code = code.substr(match[0].length);
                }
                break;
            }
        }
        if (!match) {
            code = code.substr(1);
        }
    }
    return tokens;
}
var utils = {
    safeText: function (text) {
        return String(text)
            .replace(/&/gim, '&amp;')
            .replace(/</gim, '&lt;')
            .replace(/>/gim, '&gt;');
    }
};
function quote(text) {
    return '`' + text + '`';
}
function append(exp) {
    return "$$ += " + exp + ";\n";
}
function util(name) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    return "$." + name + "(" + args.join(', ') + ")";
}
function flush() {
    return '\nreturn $$;';
}
function parser(tokens) {
    var code = "let $$ = '';\n";
    while (tokens.length) {
        var token = tokens.shift();
        if (token.type === 'comment')
            continue;
        if (token.type === 'content') {
            code += append(quote(token.match[1]));
            continue;
        }
        if (token.type === 'text' || token.type === 'html') {
            var exp = String(token.match[1]).trim();
            if (token.type === 'text') {
                code += append(util('safeText', exp));
            }
            else {
                code += append(exp);
            }
            continue;
        }
        if (token.type === 'code') {
            code += token.match[1] + '\n';
        }
        if (token.type === 'end_code') {
            continue;
        }
    }
    code += flush();
    return code;
}
// eslint-disable-next-line
var AsyncFunction = eval('Object.getPrototypeOf(async function() {}).constructor');
function parse(code) {
    var result = parser(lexer(code));
    return {
        code: result,
        // eslint-disable-next-line
        render: new Function('$', '$data', "with ($data) {" + result + "}").bind(null, utils),
        renderAsync: new AsyncFunction('$', '$data', "with ($data) {" + result + "}").bind(null, utils)
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
