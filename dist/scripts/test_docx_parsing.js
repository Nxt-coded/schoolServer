"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio = __importStar(require("cheerio"));
// Mock the Mammoth output (HTML string)
const mockHtml = `
<p>1. What is the chemical formula for water?</p>
<p>A. H<sub>2</sub>O</p>
<p>B. CO<sub>2</sub></p>
<p>C. NaCl</p>
<p>D. O<sub>2</sub></p>
<p>Answer: A</p>
<p>Explanation: Water consists of two hydrogen atoms and one oxygen atom.</p>
<p>2. Solve for x: x<sup>2</sup> = 4</p>
<p>A. 2</p>
<p>B. -2</p>
<p>C. ±2</p>
<p>D. 4</p>
<p>Answer: C</p>
`;
const parseHtml = (html) => {
    const $ = cheerio.load(html);
    const blocks = [];
    const elems = $("body").children();
    let value = [];
    let questionData = {};
    let options = [];
    const BRACKET_URL_REGEX = /\[(https?:\/\/[^\]]+|data:[^\]]+)\]/;
    elems.each((el) => {
        const text = $(el).text().trim();
        const htmlContent = $(el).html()?.trim() || "";
        if (!text)
            return;
        if (/^\d+\./.test(text)) {
            if (Object.keys(questionData).length) {
                questionData.options = options;
                value.push(questionData);
                questionData = {};
                options = [];
            }
            const match = text.match(BRACKET_URL_REGEX);
            const url = match ? match[1].trim() : null;
            let cleanHtml = htmlContent;
            // Simple strip of numbering for test verification if needed, 
            // but current logic keeps it in HTML if it's there.
            if (url) {
                cleanHtml = cleanHtml.replace(BRACKET_URL_REGEX, "").trim();
            }
            questionData = { question: cleanHtml };
            if (url) {
                questionData.images = [url];
            }
        }
        else if (/^[A-D]\./.test(text)) {
            options.push(htmlContent);
        }
        else if (text.startsWith("Answer:")) {
            questionData.answer = text.replace("Answer:", "").trim();
        }
        else if (text.startsWith("Explanation:")) {
            questionData.explanation = text.replace("Explanation:", "").trim();
        }
        else {
            if (questionData.question && options.length === 0) {
                questionData.question += `<br/>${htmlContent}`;
                const match = text.match(BRACKET_URL_REGEX);
                const url = match ? match[1].trim() : null;
                if (url) {
                    if (!questionData.images)
                        questionData.images = [];
                    questionData.images.push(url);
                    questionData.question = questionData.question.replace(BRACKET_URL_REGEX, "");
                }
            }
        }
    });
    if (Object.keys(questionData).length) {
        questionData.options = options;
        value.push(questionData);
    }
    return value;
};
const result = parseHtml(mockHtml);
console.log(JSON.stringify(result, null, 2));
// Assertions
if (result.length !== 2) {
    console.error("FAILED: Expected 2 questions");
    process.exit(1);
}
if (!result[0].options[0].includes("<sub>2</sub>")) {
    console.error("FAILED: Subscript formatting lost in option A of Q1");
    process.exit(1);
}
if (!result[1].question.includes("<sup>2</sup>")) {
    console.error("FAILED: Superscript formatting lost in Q2");
    process.exit(1);
}
console.log("SUCCESS: Formatting preserved!");
