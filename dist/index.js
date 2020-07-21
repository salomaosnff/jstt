"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Template = void 0;
var tokenTypes = [
    { name: 'comment', test: /^<#((?:.|\s)*?)(?:#>)/ },
    { name: 'text', test: /^(?:<\?|\s*<!)=(.*?)(?:\?>|!>\s*)/ },
    { name: 'html', test: /^(?:<\?|\s*<!)-(.*?)(?:\?>|!>\s*)/ },
    { name: 'code', test: /^(?:<\?|\s*<!)(.*?)(?:\?>|!>\s*)/ },
    { name: 'content', test: /^((?:.|\s)*?)(?:([\s]*<!|<\?))/ },
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
var Template = /** @class */ (function () {
    function Template() {
    }
    Template.parse = function (code) {
        var result = parser(lexer(code));
        return {
            code: result,
            // eslint-disable-next-line
            render: new Function('$', '$data', "with ($data) {" + result + "}").bind(null, utils),
            renderAsync: new AsyncFunction('$', '$data', "with ($data) {" + result + "}").bind(null, utils)
        };
    };
    Template.parseAsync = function (code) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            setTimeout(function () {
                try {
                    resolve(_this.parse(code));
                }
                catch (err) {
                    reject(err);
                }
            }, 0);
        });
    };
    Template.render = function (code, data) {
        if (data === void 0) { data = {}; }
        return this.parse(code).render(data);
    };
    return Template;
}());
exports.Template = Template;
