"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RE_EXPLANATION = exports.RE_ANSWER = exports.RE_OPTION_STANDARD = exports.RE_OPTION_LONE = exports.RE_QUESTION_START = exports.RE_BRACKET_URL = void 0;
exports.extractUrlsFromText = extractUrlsFromText;
exports.sanitizeUrl = sanitizeUrl;
exports.virtualSplit = virtualSplit;
exports.parseQuizText = parseQuizText;
exports.RE_BRACKET_URL = /\[(https?:\/\/[^\]]+)\]/g;
exports.RE_QUESTION_START = /^\d+[\.\)]\s/;
exports.RE_OPTION_LONE = /^[A-E][\.\)]?\s*$/;
exports.RE_OPTION_STANDARD = /^[A-E][\.\)]?\s+\S/;
exports.RE_ANSWER = /^Answer:\s*/i;
exports.RE_EXPLANATION = /^Explanation:\s*/i;
function extractUrlsFromText(text) {
    const matches = [...text.matchAll(exports.RE_BRACKET_URL)];
    return matches.map((m) => m[1].trim());
}
function sanitizeUrl(url) {
    if (!url)
        return "";
    return url.replace(/[\[\]]/g, "").trim();
}
/**
 * Splits raw DOCX text into logical lines where Word/Users might have merged them.
 */
function virtualSplit(text) {
    let s = text;
    // Split before option letters (A. B. etc)
    s = s.replace(/(\S)\s*([A-E][\.\)]\s+)/g, "$1\n$2");
    // Split before question numbers (1. 2. etc)
    s = s.replace(/([^,(=])\s*(\b\d+[\.\)]\s+)/g, "$1\n$2");
    // Split before Answer:/Explanation:
    s = s.replace(/(\S)\s*(Answer:\s*)/gi, "$1\n$2");
    s = s.replace(/(\S)\s*(Explanation:\s*)/gi, "$1\n$2");
    // Split before no-dot option letters (Case: D bringing -> D\nbringing)
    s = s.replace(/([a-z,\\.!\?])\s+([A-E]\s+[A-Z])/g, "$1\n$2");
    return s;
}
/**
 * Parses normalized text into an array of QuizQuestion objects.
 */
function parseQuizText(text) {
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
    const questions = [];
    let current = null;
    let options = [];
    for (let line of lines) {
        if (exports.RE_QUESTION_START.test(line)) {
            // New question starts
            if (current) {
                current.options = options;
                questions.push(current);
            }
            const numMatch = line.match(/^(\d+)[\.\)]/);
            const num = numMatch ? parseInt(numMatch[1]) : undefined;
            current = {
                num,
                question: line.replace(exports.RE_QUESTION_START, "").trim(),
                options: [],
                images: [],
            };
            options = [];
            const urls = extractUrlsFromText(line);
            if (urls.length > 0) {
                current.images = urls.map(u => sanitizeUrl(u));
                current.url = current.images[0];
                // Remove bracketed URLs from the visible question text
                current.question = current.question.replace(exports.RE_BRACKET_URL, "").trim();
            }
        }
        else if (exports.RE_ANSWER.test(line)) {
            if (current)
                current.answer = line.replace(exports.RE_ANSWER, "").replace(/<\/?(?:b|i|u)>/gi, "").trim();
        }
        else if (exports.RE_EXPLANATION.test(line)) {
            if (current)
                current.explanation = line.replace(exports.RE_EXPLANATION, "").trim();
        }
        else if (exports.RE_OPTION_LONE.test(line)) {
            // Lone option letter (e.g. "D") — text is on the next line
            options.push("");
        }
        else if (exports.RE_OPTION_STANDARD.test(line)) {
            options.push(line.replace(/^[A-E][\.\)]?\s+/, "").trim());
        }
        else if (current) {
            if (options.length === 0) {
                // Continuation of question text
                const urls = extractUrlsFromText(line);
                if (urls.length > 0) {
                    if (!current.images)
                        current.images = [];
                    current.images.push(...urls.map(u => sanitizeUrl(u)));
                    if (!current.url)
                        current.url = current.images[0];
                    line = line.replace(exports.RE_BRACKET_URL, "").trim();
                }
                current.question = `${current.question} ${line}`.trim();
            }
            else {
                // Continuation of the last option (or filling in a lone-letter placeholder)
                if (options[options.length - 1] === "") {
                    options[options.length - 1] = line.trim();
                }
                else {
                    options[options.length - 1] += " " + line.trim();
                }
            }
        }
    }
    // Push final question
    if (current) {
        current.options = options;
        questions.push(current);
    }
    return questions;
}
