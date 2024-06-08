"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function GenerateMessage(alert, matchers) {
    let result, keywords;
    keywords = alert.match(new RegExp("{{\\w+}}", "gi"));
    if (keywords) {
        result = alert.replace(new RegExp(keywords === null || keywords === void 0 ? void 0 : keywords.join("|"), "gi"), (ev) => {
            return matchers[ev] || "N/A";
        });
    }
    else {
        result = alert;
    }
    return result;
}
exports.default = GenerateMessage;
