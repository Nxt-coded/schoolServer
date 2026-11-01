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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStudentQuizRecords = exports.deleteQuiz = exports.getQuizRecords = exports.readQuizes = exports.readQuiz = exports.readTeacherSubjectQuiz = exports.readSubjectQuiz = exports.createSubjectQuiz = exports.startSubjectExamination = exports.readSubjectExamination = exports.createSubjectExam = exports.createSubjectQuizFromFile = void 0;
exports.testDocxParsing = testDocxParsing;
const adm_zip_1 = __importDefault(require("adm-zip"));
const mongoose_1 = require("mongoose");
const classroomModel_1 = __importDefault(require("../model/classroomModel"));
const staffModel_1 = __importDefault(require("../model/staffModel"));
const subjectModel_1 = __importDefault(require("../model/subjectModel"));
const quizModel_1 = __importDefault(require("../model/quizModel"));
const studentModel_1 = __importDefault(require("../model/studentModel"));
const csvtojson_1 = __importDefault(require("csvtojson"));
const streamifier_1 = require("../utils/streamifier");
const schoolModel_1 = __importDefault(require("../model/schoolModel"));
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const mammoth_1 = __importDefault(require("mammoth"));
const cheerio = __importStar(require("cheerio"));
// ──────────────────────────────────────────────────────────────
// Decode XML numeric character references (&#xNNNN; and &#NNNN;)
// ──────────────────────────────────────────────────────────────
function decodeXmlEntities(text) {
    let decoded = text.replace(/&#x([0-9A-Fa-f]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)));
    decoded = decoded.replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)));
    return decoded;
}
// ──────────────────────────────────────────────────────────────
// Unicode helpers
// ──────────────────────────────────────────────────────────────
function toUnicodeSubscript(text) {
    const map = {
        // Digits
        "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄",
        "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉",
        // Operators
        "+": "₊",
        "-": "₋",
        "=": "₌",
        "(": "₍",
        ")": "₎",
        // Alphabet (Partial common set)
        a: "ₐ", e: "ₑ", h: "ₕ", i: "ᵢ", j: "ⱼ", k: "ₖ", l: "ₗ", m: "ₘ",
        n: "ₙ", o: "ₒ", p: "ₚ", r: "ᵣ", s: "ₛ", t: "ₜ", u: "ᵤ", v: "ᵥ", x: "ₓ",
    };
    return text
        .split("")
        .map((c) => map[c.toLowerCase()] || c)
        .join("");
}
// helper to extract URLs from string
function extractUrlsFromText(text) {
    // Match both http(s) and data URIs
    const urlRegex = /(https?:\/\/[^\s\)\]]+|data:[^\s\)\]]+)/g;
    const matches = Array.from((text || "").matchAll(urlRegex));
    return matches.map((m) => m[0]);
}
// Attempts to trim trailing garbage after common image extensions
function sanitizeUrl(url) {
    if (!url || typeof url !== "string")
        return url;
    const extRegex = /(\.(?:png|jpe?g|gif|webp|svg|bmp|pdf|txt))(?:[?#][^\s\)\]]*)?/i;
    const match = url.match(extRegex);
    if (!match || match.index === undefined)
        return url;
    const endIndex = match.index + match[0].length;
    return url.slice(0, endIndex);
}
function toUnicodeSuperscript(text) {
    const map = {
        // Digits
        "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
        "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
        // Operators
        "+": "⁺",
        "-": "⁻",
        "=": "⁼",
        "(": "⁽",
        ")": "⁾",
        // Alphabet
        a: "ᵃ", b: "ᵇ", c: "ᶜ", d: "ᵈ", e: "ᵉ", f: "ᶠ", g: "ᵍ", h: "ʰ", i: "ⁱ", j: "ʲ", k: "ᵏ", l: "ˡ", m: "ᵐ",
        n: "ⁿ", o: "ᵒ", p: "ᵖ", r: "ʳ", s: "ˢ", t: "ᵗ", u: "ᵘ", v: "ᵛ", w: "ʷ", x: "ˣ", y: "ʸ", z: "ᶻ",
    };
    return text
        .split("")
        .map((c) => map[c.toLowerCase()] || c)
        .join("");
}
// ──────────────────────────────────────────────────────────────
// Extract DOCX → Text with perfect chemistry support
// ──────────────────────────────────────────────────────────────
async function extractRawTextFromDocx(filePath) {
    try {
        const zip = new adm_zip_1.default(filePath);
        const documentXml = zip.readAsText("word/document.xml");
        // Build a rels map rId -> target (e.g. media/image1.png)
        let relsXml = "";
        try {
            relsXml = zip.readAsText("word/_rels/document.xml.rels");
        }
        catch (e) {
            // No rels file, proceed without images
            relsXml = "";
        }
        const rels = {};
        if (relsXml) {
            const relRegex = /<Relationship[^>]*Id="([^\"]+)"[^>]*Target="([^\"]+)"/g;
            let rm;
            while ((rm = relRegex.exec(relsXml)) !== null) {
                let tgt = rm[2];
                // Normalize possible '../' path prefixes
                if (tgt.startsWith("../"))
                    tgt = tgt.replace(/^\.\.\//, "");
                rels[rm[1]] = tgt;
            }
        }
        let fullText = "";
        const paragraphs = documentXml.split(/<w:p[\s>]|<w:br[^>]*\/>/);
        for (const para of paragraphs) {
            if (!para.trim())
                continue;
            let paraText = processParagraph(para);
            // Find image references (r:embed or r:id) in the paragraph and upload
            // them to cloudinary, then append URLs in-line so downstream parsing
            // picks them up as images.
            const embeds = [...para.matchAll(/\br:(?:embed|id)="([^"]+)"/g)].map((m) => m[1]);
            const imageUrls = [];
            for (const rId of embeds) {
                try {
                    const target = rels[rId];
                    if (!target)
                        continue;
                    const mediaPath = `word/${target}`;
                    const fileBuff = zip.readFile(mediaPath);
                    if (!fileBuff)
                        continue;
                    const ext = node_path_1.default.extname(mediaPath).replace(".", "").toLowerCase();
                    const mimeMap = {
                        png: "image/png",
                        jpg: "image/jpeg",
                        jpeg: "image/jpeg",
                        gif: "image/gif",
                        svg: "image/svg+xml",
                        webp: "image/webp",
                        bmp: "image/bmp",
                    };
                    const mime = mimeMap[ext];
                    // Skip non-image files (e.g. EMF/WMF/XML metadata) — Cloudinary rejects them with 400
                    if (!mime)
                        continue;
                    const dataUri = `data:${mime};base64,${fileBuff.toString("base64")}`;
                    // Upload to cloudinary (if configured) so clients can fetch by URL
                    try {
                        const uploadRes = await (0, streamifier_1.uploadDataUri)(dataUri, "exams");
                        if (uploadRes && uploadRes.secure_url) {
                            imageUrls.push(uploadRes.secure_url);
                        }
                        // Skip if no URL — don't embed raw data URIs which can be very large
                    }
                    catch (uploadErr) {
                        // Upload failed silently — continue processing text
                        console.warn("Cloudinary upload failed for embedded image:", uploadErr?.message || uploadErr);
                    }
                }
                catch (ex) {
                    // ignore particular image failures – continue parsing text
                    console.warn("Error handling embedded image for rId", rId, ex?.message || ex);
                }
            }
            if (imageUrls.length > 0) {
                // Append each URL as bracketed url to be picked up later
                paraText += " " + imageUrls.map((u) => `[${u}]`).join(" ");
            }
            if (paraText.trim())
                fullText += paraText.trim() + "\n";
        }
        let decodedText = fullText.replace(/\n\n\n+/g, "\n\n").trim();
        decodedText = decodeXmlEntities(decodedText);
        decodedText = decodedText.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, "&");
        return decodedText;
    }
    catch (error) {
        console.error("Error creating exam:", error);
        throw error;
    }
}
function processParagraph(paraXml) {
    const elements = [];
    // Capture Runs, preserving their natural order, with formatting detection
    const runRegex = /<w:r[\s>](.*?)<\/w:r>/gs;
    let match;
    while ((match = runRegex.exec(paraXml)) !== null) {
        const runXml = match[1];
        // Extract ALL text elements within the run
        const textRegex = /<w:t[^>]*>([^<]*)<\/w:t>/g;
        let tMatch;
        let runText = "";
        while ((tMatch = textRegex.exec(runXml)) !== null) {
            runText += tMatch[1];
        }
        // Handle <w:sym> elements — Word stores special symbols (₦, −, ², etc.)
        // as <w:sym w:font="..." w:char="XXXX"/> where XXXX is a hex code point
        const symRegex = /<w:sym[^>]*w:char="([0-9A-Fa-f]+)"[^>]*\/>/g;
        let symMatch;
        while ((symMatch = symRegex.exec(runXml)) !== null) {
            try {
                const codePoint = parseInt(symMatch[1], 16);
                if (codePoint > 0) {
                    runText += String.fromCodePoint(codePoint);
                }
            }
            catch (e) {
                // Skip invalid code points
            }
        }
        // Decode any XML numeric character references in the extracted text
        if (runText) {
            runText = decodeXmlEntities(runText);
        }
        if (runText) {
            // Check for vertical alignment (subscript/superscript)
            if (runXml.includes('w:val="subscript"')) {
                elements.push({ pos: match.index, content: toUnicodeSubscript(runText) });
            }
            else if (runXml.includes('w:val="superscript"')) {
                elements.push({ pos: match.index, content: toUnicodeSuperscript(runText) });
            }
            else {
                // Check for inline formatting in w:rPr
                let text = runText;
                const rPrMatch = runXml.match(/<w:rPr[^>]*>(.*?)<\/w:rPr>/s);
                if (rPrMatch) {
                    const rPr = rPrMatch[1];
                    if (/<w:u\s/.test(rPr) && !/<w:u\s[^>]*w:val="none"/.test(rPr))
                        text = `<u>${text}</u>`;
                    if (/<w:b[\s\/]/.test(rPr) && !/<w:b\s[^>]*w:val="false"/.test(rPr))
                        text = `<b>${text}</b>`;
                    if (/<w:i[\s\/]/.test(rPr) && !/<w:i\s[^>]*w:val="false"/.test(rPr))
                        text = `<i>${text}</i>`;
                }
                elements.push({ pos: match.index, content: text });
            }
        }
    }
    // Capture Math elements
    const mathRunRegex = /<m:oMath>(.*?)<\/m:oMath>/gs;
    while ((match = mathRunRegex.exec(paraXml)) !== null) {
        elements.push({ pos: match.index, content: processMathElement(match[1]) });
    }
    elements.sort((a, b) => a.pos - b.pos);
    return elements.map((e) => e.content).join("");
}
// ──────────────────────────────────────────────────────────────
// PERFECT CHEMISTRY MATH PROCESSOR (FINAL VERSION)
// ──────────────────────────────────────────────────────────────
function processMathElement(mathXml) {
    const SUPER = {
        "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
        "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
        "+": "⁺", "-": "⁻", "=": "⁼", "(": "⁽", ")": "⁾",
        a: "ᵃ", b: "ᵇ", c: "ᶜ", d: "ᵈ", e: "ᵉ", f: "ᶠ", g: "ᵍ", h: "ʰ", i: "ⁱ", j: "ʲ", k: "ᵏ", l: "ˡ", m: "ᵐ",
        n: "ⁿ", o: "ᵒ", p: "ᵖ", r: "ʳ", s: "ˢ", t: "ᵗ", u: "ᵘ", v: "ᵛ", w: "ʷ", x: "ˣ", y: "ʸ", z: "ᶻ",
    };
    const SUB = {
        "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄",
        "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉",
        "+": "₊", "-": "₋", "=": "₌", "(": "₍", ")": "₎",
        a: "ₐ", e: "ₑ", h: "ₕ", i: "ᵢ", j: "ⱼ", k: "ₖ", l: "ₗ", m: "ₘ",
        n: "ₙ", o: "ₒ", p: "ₚ", r: "ᵣ", s: "ₛ", t: "ₜ", u: "ᵤ", v: "ᵥ", x: "ₓ",
    };
    const toSup = (s) => s
        .split("")
        .map((c) => SUPER[c] || c)
        .join("");
    const toSub = (s) => s
        .split("")
        .map((c) => SUB[c] || c)
        .join("");
    const isElementSymbol = (base) => /^[A-Z][a-z]?$/.test(base.trim());
    const nextRunStartsWithUpper = (index) => {
        const tail = mathXml.slice(index);
        const match = tail.match(/<m:r[^>]*>.*?<m:t[^>]*>([^<]*)<\/m:t>/s);
        if (!match)
            return false;
        const txt = (match[1] || "").trim();
        return /^[A-Z]/.test(txt);
    };
    const structures = [];
    const add = (s) => {
        if (structures.some((x) => !(s.end <= x.start || s.start >= x.end)))
            return;
        structures.push(s);
    };
    let m;
    // 1. sSubSup → ²³⁵₉₂U (most important)
    const subSupRegex = /<m:sSubSup>(.*?)<\/m:sSubSup>/gs;
    while ((m = subSupRegex.exec(mathXml)) !== null) {
        const xml = m[1];
        const base = processMathElement(xml.match(/<m:e>(.*?)<\/m:e>/s)?.[1] || "").trim();
        const sub = processMathElement(xml.match(/<m:sub>(.*?)<\/m:sub>/s)?.[1] || "").trim();
        const sup = processMathElement(xml.match(/<m:sup>(.*?)<\/m:sup>/s)?.[1] || "").trim();
        const content = isElementSymbol(base)
            ? `${toSup(sup)}${toSub(sub)}${base}` // ²³⁵₉₂U → correct
            : `${base}${toSub(sub)}${toSup(sup)}`;
        add({ start: m.index, end: m.index + m[0].length, content });
    }
    // 2. Superscript only → ¹⁴C
    const supRegex = /<m:sSup>(.*?)<\/m:sSup>/gs;
    while ((m = supRegex.exec(mathXml)) !== null) {
        const xml = m[1];
        const base = processMathElement(xml.match(/<m:e>(.*?)<\/m:e>/s)?.[1] || "").trim();
        const sup = processMathElement(xml.match(/<m:sup>(.*?)<\/m:sup>/s)?.[1] || "").trim();
        const content = isElementSymbol(base) && /^\d+$/.test(sup.replace(/[^\d]/g, ""))
            ? `${toSup(sup)}${base}`
            : `${base}${toSup(sup)}`;
        add({ start: m.index, end: m.index + m[0].length, content });
    }
    // 3. Subscript only → ₄Be, ₆C (atomic number) or H₂ (stoichiometry)
    const subRegex = /<m:sSub>(.*?)<\/m:sSub>/gs;
    while ((m = subRegex.exec(mathXml)) !== null) {
        const xml = m[1];
        const base = processMathElement(xml.match(/<m:e>(.*?)<\/m:e>/s)?.[1] || "").trim();
        const sub = processMathElement(xml.match(/<m:sub>(.*?)<\/m:sub>/s)?.[1] || "").trim();
        let content = "";
        if (isElementSymbol(base) && /^\d+$/.test(sub)) {
            // If the math token *after* this structure begins with an uppercase
            // letter then it's likely stoichiometry (e.g., H₂O) — put the subscript
            // after the element. Otherwise, treat it as atomic number prefix.
            if (nextRunStartsWithUpper(m.index + m[0].length)) {
                content = `${base}${toSub(sub)}`; // H₂ (stoichiometry)
            }
            else {
                content = `${toSub(sub)}${base}`; // ₄Be (atomic number)
            }
        }
        else {
            content = `${base}${toSub(sub)}`;
        }
        add({ start: m.index, end: m.index + m[0].length, content });
    }
    // Fractions & radicals (unchanged)
    const fracRegex = /<m:f>(.*?)<\/m:f>/gs;
    while ((m = fracRegex.exec(mathXml)) !== null) {
        const num = processMathElement(m[1].match(/<m:num>(.*?)<\/m:num>/s)?.[1] || "");
        const den = processMathElement(m[1].match(/<m:den>(.*?)<\/m:den>/s)?.[1] || "");
        add({
            start: m.index,
            end: m.index + m[0].length,
            content: `(${num})/(${den})`,
        });
    }
    const radRegex = /<m:rad>(.*?)<\/m:rad>/gs;
    while ((m = radRegex.exec(mathXml)) !== null) {
        const deg = processMathElement(m[1].match(/<m:deg>(.*?)<\/m:deg>/s)?.[1] || "").trim();
        const base = processMathElement(m[1].match(/<m:e>(.*?)<\/m:e>/s)?.[1] || "");
        const content = deg && deg !== "2" ? `${toSup(deg)}√(${base})` : `√(${base})`;
        add({ start: m.index, end: m.index + m[0].length, content });
    }
    // Final assembly
    structures.sort((a, b) => a.start - b.start);
    let pos = 0;
    let result = "";
    const runs = [];
    const runRegex = /<m:r>(.*?)<\/m:r>/gs;
    while ((m = runRegex.exec(mathXml)) !== null) {
        const text = (m[1].match(/<m:t[^>]*>([^<]*)<\/m:t>/g) || [])
            .map((t) => t.replace(/<[^>]*>/g, ""))
            .join("");
        if (text)
            runs.push({ start: m.index, content: text });
    }
    if (structures.length === 0) {
        result = runs.map((r) => r.content).join("");
    }
    else {
        for (const s of structures) {
            result += runs
                .filter((r) => r.start >= pos && r.start < s.start)
                .map((r) => r.content)
                .join("");
            result += s.content;
            pos = s.end;
        }
        result += runs
            .filter((r) => r.start >= pos)
            .map((r) => r.content)
            .join("");
    }
    return result.trim();
}
// Helpers: normalize unicode and safely strip leading numbering/option prefixes
const normalizeText = (s) => {
    try {
        return s ? s.normalize("NFC") : s || "";
    }
    catch (err) {
        return s || "";
    }
};
const stripLeadingNumberFromHtml = (html) => {
    if (!html)
        return html;
    // parse as fragment, modify first text node if it starts with numbering like "1. "
    const $frag = cheerio.load(`<div>${html}</div>`, { xmlMode: false });
    const container = $frag("div");
    const firstTextNode = container
        .contents()
        .filter((el) => el.type === "text")[0];
    if (firstTextNode && firstTextNode.data) {
        firstTextNode.data = firstTextNode.data.replace(/^\s*\d+\.\s*/u, "");
    }
    return container.html() || html;
};
const stripLeadingOptionLetter = (html) => {
    if (!html)
        return html;
    const $frag = cheerio.load(`<div>${html}</div>`, { xmlMode: false });
    const container = $frag("div");
    const firstTextNode = container
        .contents()
        .filter((i, el) => el.type === "text")[0];
    if (firstTextNode && firstTextNode.data) {
        firstTextNode.data = firstTextNode.data.replace(/^\s*[A-D]\.\s*/u, "");
    }
    return container.html() || html;
};
// Test utility to debug DOCX parsing
// Run this separately to see what's being extracted
async function testDocxParsing(filePath) {
    console.log("\n🔍 Testing DOCX Parsing...\n");
    // console.log("File:", filePath);
    try {
        // Check if file exists
        if (!node_fs_1.default.existsSync(filePath)) {
            console.error("❌ File not found:", filePath);
            return;
        }
        // Convert DOCX to HTML
        console.log("\n📄 Converting DOCX to HTML...");
        const result = await mammoth_1.default.convertToHtml({ path: filePath }, {
            includeDefaultStyleMap: true,
            includeEmbeddedStyleMap: true
        });
        const html = result.value || "";
        console.log("\n=== RAW HTML OUTPUT ===");
        console.log(html);
        console.log("=== END HTML ===\n");
        if (!html || html.trim() === "") {
            console.error("❌ HTML is empty!");
            return;
        }
        // Parse with Cheerio
        const $ = cheerio.load(html);
        const elems = $("body").children();
        console.log(`\n📊 Found ${elems.length} elements in body\n`);
        let value = [];
        let questionData = {};
        let options = [];
        console.log("=== PARSING ELEMENTS ===\n");
        elems.each((i, el) => {
            const rawText = $(el).text().trim();
            const normalizedText = normalizeText(rawText);
            const htmlContent = $(el).html()?.trim() || "";
            console.log(`[${i}] Element Type: ${el.tagName}`);
            console.log(`    Raw Text: "${rawText}"`);
            console.log(`    Normalized: "${normalizedText}"`);
            console.log(`    HTML: "${htmlContent.substring(0, 100)}..."`);
            if (!normalizedText) {
                console.log("    ⚠️ Skipped (empty)");
                return;
            }
            // Test question pattern
            const questionMatch = /^\d+[\.\)]/u.test(normalizedText);
            console.log(`    Question pattern match: ${questionMatch}`);
            if (questionMatch) {
                // Save previous question
                if (Object.keys(questionData).length > 0) {
                    questionData.options = options;
                    value.push(questionData);
                    console.log(`    ✅ Saved previous question (${options.length} options)`);
                    questionData = {};
                    options = [];
                }
                const cleanHtml = stripLeadingNumberFromHtml(htmlContent);
                questionData = { question: cleanHtml };
                console.log(`    ✅ NEW QUESTION: "${cleanHtml}"`);
            }
            // Test option pattern
            const optionMatch = /^[A-D][\.\)]/u.test(normalizedText);
            console.log(`    Option pattern match: ${optionMatch}`);
            if (optionMatch) {
                const cleanOption = stripLeadingOptionLetter(htmlContent);
                options.push(cleanOption);
                console.log(`    ✅ OPTION: "${cleanOption}"`);
            }
            // Test answer pattern
            const answerMatch = /^Answer:/i.test(normalizedText);
            console.log(`    Answer pattern match: ${answerMatch}`);
            if (answerMatch) {
                const answerText = normalizedText.replace(/^Answer:\s*/i, "").trim();
                questionData.answer = answerText;
                console.log(`    ✅ ANSWER: "${answerText}"`);
            }
            // Test explanation pattern
            const explanationMatch = /^Explanation:/i.test(normalizedText);
            console.log(`    Explanation pattern match: ${explanationMatch}`);
            if (explanationMatch) {
                const explanationText = normalizedText.replace(/^Explanation:\s*/i, "").trim();
                questionData.explanation = explanationText;
                console.log(`    ✅ EXPLANATION: "${explanationText}"`);
            }
        });
        // Save last question
        if (Object.keys(questionData).length > 0) {
            questionData.options = options;
            value.push(questionData);
        }
        console.log("\n\n=== FINAL PARSED QUESTIONS ===\n");
        console.log(JSON.stringify(value, null, 2));
        console.log("\n=== END ===\n");
        console.log(`\n✅ Successfully parsed ${value.length} questions`);
        // Validation
        console.log("\n📋 Validation Results:\n");
        value.forEach((q, i) => {
            console.log(`Question ${i + 1}:`);
            console.log(`  - Has question text: ${!!q.question && q.question !== ""}`);
            console.log(`  - Options count: ${q.options?.length || 0}`);
            console.log(`  - Has answer: ${!!q.answer && q.answer !== ""}`);
            console.log(`  - Has explanation: ${!!q.explanation && q.explanation !== ""}`);
        });
        return value;
    }
    catch (error) {
        console.error("\n❌ Error:", error.message);
        console.error(error.stack);
    }
}
// Validation function
const validateQuestion = (question, index) => {
    const errors = [];
    if (!question.question || question.question.trim() === "") {
        errors.push(`Question ${index + 1}: Missing question text`);
    }
    if (!question.options || question.options.length === 0) {
        errors.push(`Question ${index + 1}: No options provided`);
    }
    else if (question.options.length < 2) {
        errors.push(`Question ${index + 1}: At least 2 options required`);
    }
    else {
        // Check if any options are empty
        question.options.forEach((opt, i) => {
            if (!opt || opt.trim() === "") {
                errors.push(`Question ${index + 1}, Option ${String.fromCharCode(65 + i)}: Empty option`);
            }
        });
    }
    if (!question.answer || question.answer.trim() === "") {
        errors.push(`Question ${index + 1}: Missing answer`);
    }
    return {
        valid: errors.length === 0,
        errors
    };
};
// Image URL validation
const isValidUrl = (url) => {
    try {
        const urlObj = new URL(url);
        return urlObj.protocol === "http:" || urlObj.protocol === "https:";
    }
    catch {
        return false;
    }
};
const createSubjectQuizFromFile = async (req, res) => {
    let uploadedPath;
    try {
        const { classID, subjectID } = req.params;
        const { instruction, duration, mark } = req.body;
        console.log("found docx!!!!");
        // Validate required parameters
        if (!classID || !subjectID) {
            return res.status(400).json({
                message: "Missing required parameters: classID and subjectID",
                status: 400,
            });
        }
        if (!duration || !mark) {
            return res.status(400).json({
                message: "Missing required fields: duration and mark",
                status: 400,
            });
        }
        const classRoom = await classroomModel_1.default.findById(classID);
        if (!classRoom) {
            return res.status(404).json({
                message: "Classroom not found",
                status: 404,
            });
        }
        const checkForSubject = await subjectModel_1.default.findById(subjectID);
        if (!checkForSubject) {
            return res.status(404).json({
                message: "Subject doesn't exist for this class",
                status: 404,
            });
        }
        const findTeacher = await staffModel_1.default.findById(classRoom?.teacherID);
        const findSubjectTeacher = await staffModel_1.default.findById(checkForSubject?.teacherID);
        const school = await schoolModel_1.default.findById(findTeacher?.schoolIDs);
        uploadedPath = req?.file?.path;
        if (!uploadedPath) {
            return res.status(400).json({
                message: "No upload file provided",
                status: 400,
            });
        }
        const originalName = req?.file?.originalname || uploadedPath;
        const ext = node_path_1.default.extname(originalName).toLowerCase();
        let value = [];
        const parsingErrors = [];
        const debugInfo = []; // For debugging
        if (ext === ".doc" || ext === ".docx") {
            console.log("found docx");
            try {
                // Direct XML parsing for high-fidelity scientific/math support
                const rawText = await extractRawTextFromDocx(uploadedPath);
                // Virtual Splitting for merged lines
                let splitText = rawText;
                splitText = splitText.replace(/(\S)\s*([A-D][\.\)]\s+)/g, "$1\n$2");
                // Split only if preceded by end-of-sentence punctuation or letters, to avoid math like (C=12) or (n-2)
                splitText = splitText.replace(/([a-zA-Z!?."'>\)])\s+(\b\d+[\.\)]\s+)/g, "$1\n$2");
                splitText = splitText.replace(/(\S)\s*(Answer:\s*)/gi, "$1\n$2");
                splitText = splitText.replace(/(\S)\s*(Explanation:\s*)/gi, "$1\n$2");
                const lines = splitText
                    .split("\n")
                    .map((l) => l.trim())
                    .filter(Boolean);
                let questionData = {};
                let options = [];
                const BRACKET_URL_REGEX = /\[(https?:\/\/[^\]]+|data:[^\]]+)\]/;
                console.log("=== PARSING LINES ===");
                for (let i = 0; i < lines.length; i++) {
                    let line = lines[i];
                    console.log(`Line ${i}: "${line.substring(0, 80)}..."`);
                    if (/^\d+[\.\)]/.test(line)) {
                        // Save previous question
                        if (Object.keys(questionData).length > 0) {
                            questionData.options = options;
                            debugInfo.push({ ...questionData, optionsCount: options.length });
                            value.push(questionData);
                            questionData = {};
                            options = [];
                        }
                        const match = line.match(BRACKET_URL_REGEX);
                        let url = match ? match[1].trim() : null;
                        if (!url) {
                            const extracted = extractUrlsFromText(line);
                            if (extracted.length)
                                url = sanitizeUrl(extracted[0]);
                        }
                        line = line.replace(BRACKET_URL_REGEX, "").trim();
                        questionData = { question: line.replace(/^\d+[\.\)]\s*/, "") };
                        if (url) {
                            url = sanitizeUrl(url);
                            questionData.images = [url];
                            questionData.url = url;
                        }
                    }
                    else if (/^[A-E][\.\)]?\s*$/.test(line)) {
                        // Lone option letter on its own line — text will be on next line
                        options.push("");
                    }
                    else if (/^[A-E][\.\)]?\s+\S/.test(line)) {
                        options.push(line.replace(/^[A-E][\.\)]?\s+/, "").trim());
                    }
                    else if (/^Answer:/i.test(line)) {
                        questionData.answer = line.replace(/^Answer:\s*/i, "").replace(/<\/?(?:b|i|u)>/gi, "").trim();
                    }
                    else if (/^Explanation:/i.test(line)) {
                        questionData.explanation = line.replace(/^Explanation:\s*/i, "").trim();
                    }
                    else if (questionData.question && options.length === 0) {
                        // Continuation of question text (before any options start)
                        const match = line.match(BRACKET_URL_REGEX);
                        let url = match ? match[1].trim() : null;
                        if (!url) {
                            const extracted = extractUrlsFromText(line);
                            if (extracted.length)
                                url = sanitizeUrl(extracted[0]);
                        }
                        line = line.replace(BRACKET_URL_REGEX, "").trim();
                        questionData.question = `${questionData.question} ${line}`.trim();
                        if (url) {
                            url = sanitizeUrl(url);
                            if (!questionData.images)
                                questionData.images = [];
                            questionData.images.push(url);
                            if (!questionData.url)
                                questionData.url = url;
                        }
                    }
                    else if (options.length > 0) {
                        // Fill in lone-letter placeholder or append continuation to last option
                        if (options[options.length - 1] === "") {
                            options[options.length - 1] = line.trim();
                        }
                        else {
                            options[options.length - 1] += " " + line.trim();
                        }
                    }
                }
                // Save last question
                if (Object.keys(questionData).length > 0) {
                    questionData.options = options;
                    debugInfo.push({ ...questionData, optionsCount: options.length });
                    value.push(questionData);
                }
                console.log("=== PARSED QUESTIONS ===");
                console.log(JSON.stringify(debugInfo, null, 2));
                console.log("=== END PARSING ===");
                if (value.length === 0) {
                    return res.status(400).json({
                        message: "No valid questions found in the document. Please check the format.",
                        status: 400,
                        hint: "Expected format: '1. Question text', 'A. Option', 'B. Option', etc., 'Answer: ...'",
                    });
                }
            }
            catch (docError) {
                console.error("DOCX Parsing Error:", docError);
                return res.status(400).json({
                    message: "Error parsing DOCX file",
                    status: 400,
                    error: docError.message,
                });
            }
        }
        else if (ext === ".csv") {
            try {
                const data = await (0, csvtojson_1.default)().fromFile(uploadedPath);
                for (const i of data) {
                    const opts = i.options ? i.options.split(";;") : [];
                    const read = {
                        question: i.Question || i.question || i.questionText || i.questionTitle,
                        options: opts,
                        answer: i.Answer || i.answer,
                        explanation: i.Explanation || i.explanation,
                    };
                    value.push(read);
                }
                if (value.length === 0) {
                    return res.status(400).json({
                        message: "No valid questions found in CSV file",
                        status: 400,
                    });
                }
            }
            catch (csvError) {
                return res.status(400).json({
                    message: "Error parsing CSV file",
                    status: 400,
                    error: csvError.message,
                });
            }
        }
        else {
            return res.status(400).json({
                message: "Invalid file format. Please upload a CSV, DOC, or DOCX file",
                status: 400,
            });
        }
        // Validate all questions
        const validationErrors = [];
        value.forEach((question, index) => {
            const validation = validateQuestion(question, index);
            if (!validation.valid) {
                validationErrors.push(...validation.errors);
            }
        });
        if (validationErrors.length > 0) {
            return res.status(400).json({
                message: "Validation errors found in quiz questions",
                status: 400,
                errors: validationErrors,
                parsingWarnings: parsingErrors,
                debugData: debugInfo,
            });
        }
        // Create quiz
        const quizes = await quizModel_1.default.create({
            subjectTitle: checkForSubject?.subjectTitle,
            subjectID: checkForSubject?._id,
            session: school?.presentSession,
            term: school?.presentTerm,
            quiz: {
                instruction: { duration, mark, instruction },
                question: value,
            },
            totalQuestions: value?.length,
            status: "quiz",
            startExam: false,
        });
        // Update relationships
        checkForSubject?.quiz.push(new mongoose_1.Types.ObjectId(quizes._id));
        checkForSubject?.performance?.push(new mongoose_1.Types.ObjectId(quizes._id));
        await checkForSubject?.save();
        if (findTeacher) {
            findTeacher?.quiz.push(new mongoose_1.Types.ObjectId(quizes._id));
            await findTeacher?.save();
        }
        if (findSubjectTeacher) {
            findSubjectTeacher?.quiz.push(new mongoose_1.Types.ObjectId(quizes._id));
            await findSubjectTeacher?.save();
        }
        // Clean up uploaded file after successful processing
        const cleanupFile = () => {
            try {
                if (uploadedPath && node_fs_1.default.existsSync(uploadedPath)) {
                    node_fs_1.default.unlinkSync(uploadedPath);
                }
            }
            catch (cleanupError) {
                console.error("Error cleaning up file:", cleanupError);
            }
        };
        // Cleanup immediately after processing
        setTimeout(cleanupFile, 1000);
        return res.status(201).json({
            message: "Quiz entry successfully created from file",
            data: quizes,
            questionsImported: value.length,
            warnings: parsingErrors.length > 0 ? parsingErrors : undefined,
            status: 201,
        });
    }
    catch (error) {
        console.error("Error creating quiz:", error);
        // Clean up file on error
        if (uploadedPath && node_fs_1.default.existsSync(uploadedPath)) {
            try {
                node_fs_1.default.unlinkSync(uploadedPath);
            }
            catch (cleanupError) {
                console.error("Error cleaning up file on error:", cleanupError);
            }
        }
        return res.status(500).json({
            message: "Error creating class subject quiz from file",
            status: 500,
            error: error.message,
        });
    }
};
exports.createSubjectQuizFromFile = createSubjectQuizFromFile;
// Examination
const createSubjectExam = async (req, res) => {
    let uploadedPath;
    try {
        const { classID, subjectID } = req.params;
        const { instruction, duration, mark } = req.body;
        console.log("=== QUIZ UPLOAD REQUEST ===");
        console.log("Class ID:", classID);
        console.log("Subject ID:", subjectID);
        if (!classID || !subjectID) {
            return res.status(400).json({
                message: "Missing required parameters: classID and subjectID",
                status: 400,
            });
        }
        if (!duration || !mark) {
            return res.status(400).json({
                message: "Missing required fields: duration and mark",
                status: 400,
            });
        }
        if (!req.file) {
            return res.status(400).json({
                message: "No file uploaded. Please select a file.",
                status: 400,
            });
        }
        uploadedPath = req.file.path;
        console.log("File uploaded to:", uploadedPath);
        if (!node_fs_1.default.existsSync(uploadedPath)) {
            return res.status(400).json({
                message: "Uploaded file not found on server",
                status: 400,
            });
        }
        const fileStats = node_fs_1.default.statSync(uploadedPath);
        console.log("File size:", fileStats.size, "bytes");
        if (fileStats.size === 0) {
            return res.status(400).json({
                message: "Uploaded file is empty",
                status: 400,
            });
        }
        const classRoom = await classroomModel_1.default.findById(classID);
        if (!classRoom) {
            return res.status(404).json({
                message: "Classroom not found",
                status: 404,
            });
        }
        const checkForSubject = await subjectModel_1.default.findById(subjectID);
        if (!checkForSubject) {
            return res.status(404).json({
                message: "Subject doesn't exist for this class",
                status: 404,
            });
        }
        const findTeacher = await staffModel_1.default.findById(classRoom?.teacherID);
        const findSubjectTeacher = await staffModel_1.default.findById(checkForSubject?.teacherID);
        const school = await schoolModel_1.default.findById(findTeacher?.schoolIDs);
        const originalName = req.file.originalname || uploadedPath;
        const ext = node_path_1.default.extname(originalName).toLowerCase();
        let value = [];
        const parsingErrors = [];
        if (ext === ".doc" || ext === ".docx") {
            try {
                console.log("\n=== EXTRACTING RAW TEXT FROM DOCX (preserves LaTeX) ===");
                // Extract raw text to preserve LaTeX expressions
                const rawText = await extractRawTextFromDocx(uploadedPath);
                console.log("Raw text preview:");
                console.log(rawText.substring(0, 500));
                console.log("\nRaw text length:", rawText.length);
                if (!rawText || rawText.trim() === "") {
                    return res.status(400).json({
                        message: "The uploaded file appears to be empty or could not be read",
                        status: 400,
                    });
                }
                // Virtual Splitting for merged lines
                let splitText = rawText;
                splitText = splitText.replace(/(\S)\s*([A-D][\.\)]\s+)/g, "$1\n$2");
                // Split only if preceded by end-of-sentence punctuation or letters, to avoid math like (C=12) or (n-2)
                splitText = splitText.replace(/([a-zA-Z!?."'>\)])\s+(\b\d+[\.\)]\s+)/g, "$1\n$2");
                splitText = splitText.replace(/(\S)\s*(Answer:\s*)/gi, "$1\n$2");
                splitText = splitText.replace(/(\S)\s*(Explanation:\s*)/gi, "$1\n$2");
                // Split by lines and process
                const lines = splitText.split('\n').map(line => line.trim()).filter(line => line);
                console.log(`\nFound ${lines.length} lines to parse\n`);
                let questionData = {};
                let options = [];
                const BRACKET_URL_REGEX = /\[(https?:\/\/[^\]]+|data:[^\]]+)\]/;
                console.log("=== PARSING LINES ===");
                for (let i = 0; i < lines.length; i++) {
                    let line = lines[i];
                    console.log(`\nLine ${i}: "${line.substring(0, 80)}..."`);
                    if (!line) {
                        console.log("  -> Skipped (empty)");
                        continue;
                    }
                    // Detect new question (starts with number)
                    if (/^\d+[\.\)]/.test(line)) {
                        console.log("  -> Detected QUESTION");
                        // Save previous question if present
                        if (Object.keys(questionData).length > 0) {
                            questionData.options = options;
                            value.push(questionData);
                            console.log(`  -> Saved previous question (${options.length} options)`);
                            questionData = {};
                            options = [];
                        }
                        const match = line.match(BRACKET_URL_REGEX);
                        let url = match ? match[1].trim() : null;
                        if (!url) {
                            const extracted = extractUrlsFromText(line);
                            if (extracted.length)
                                url = sanitizeUrl(extracted[0]);
                        }
                        line = line.replace(BRACKET_URL_REGEX, "").trim();
                        questionData = { question: line.replace(/^\d+[\.\)]\s*/, "") };
                        if (url) {
                            url = sanitizeUrl(url);
                            questionData.images = [url];
                            questionData.url = url;
                        }
                    }
                    else if (/^[A-D][\.\)]/.test(line)) {
                        options.push(line.replace(/^[A-D][\.\)]\s*/, "").trim());
                        console.log(`  -> Detected OPTION: "${line}"`);
                    }
                    else if (/^Answer:/i.test(line)) {
                        const answerText = line.replace(/^Answer:\s*/i, "").trim();
                        questionData.answer = answerText;
                        console.log(`  -> Detected ANSWER: "${answerText}"`);
                    }
                    else if (/^Explanation:/i.test(line)) {
                        const explanationText = line.replace(/^Explanation:\s*/i, "").trim();
                        questionData.explanation = explanationText;
                        console.log(`  -> Detected EXPLANATION: "${explanationText.substring(0, 50)}..."`);
                    }
                    else if (questionData && !questionData.options && Object.keys(questionData).length > 0) {
                        // Continuation of question
                        const match = line.match(BRACKET_URL_REGEX);
                        let url = match ? match[1].trim() : null;
                        if (!url) {
                            const extracted = extractUrlsFromText(line);
                            if (extracted.length)
                                url = sanitizeUrl(extracted[0]);
                        }
                        line = line.replace(BRACKET_URL_REGEX, "").trim();
                        questionData.question = `${questionData.question} ${line}`.trim();
                        if (url) {
                            url = sanitizeUrl(url);
                            if (!questionData.images)
                                questionData.images = [];
                            questionData.images.push(url);
                            if (!questionData.url)
                                questionData.url = url;
                        }
                    }
                }
                // Save last question if present
                if (Object.keys(questionData).length > 0) {
                    questionData.options = options;
                    value.push(questionData);
                    console.log(`\nSaved last question (${options.length} options)`);
                }
                console.log(`\n=== PARSING COMPLETE: ${value.length} questions found ===`);
                if (value.length === 0) {
                    return res.status(400).json({
                        message: "No valid questions found in the document. Please check the format.",
                        status: 400,
                        hint: "Expected format: '1. Question text', 'A. Option', 'B. Option', etc., 'Answer: ...'",
                    });
                }
            }
            catch (docError) {
                console.error("DOCX Parsing Error:", docError);
                return res.status(400).json({
                    message: "Error parsing DOCX file",
                    status: 400,
                    error: docError.message,
                });
            }
        }
        else if (ext === ".csv") {
            try {
                console.log("\n=== PARSING CSV FILE ===");
                const data = await (0, csvtojson_1.default)().fromFile(uploadedPath);
                for (const i of data) {
                    const opts = i.options ? i.options.split(";;") : [];
                    const read = {
                        question: i.Question || i.question || i.questionText || i.questionTitle,
                        options: opts,
                        answer: i.Answer || i.answer,
                        explanation: i.Explanation || i.explanation,
                    };
                    value.push(read);
                }
                console.log(`CSV parsed: ${value.length} questions found\n`);
                if (value.length === 0) {
                    return res.status(400).json({
                        message: "No valid questions found in CSV file",
                        status: 400,
                    });
                }
            }
            catch (csvError) {
                console.error("CSV Parsing Error:", csvError);
                return res.status(400).json({
                    message: "Error parsing CSV file",
                    status: 400,
                    error: csvError.message,
                });
            }
        }
        else {
            return res.status(400).json({
                message: "Invalid file format. Please upload a CSV, DOC, or DOCX file",
                status: 400,
            });
        }
        // Validate all questions
        console.log("\n=== VALIDATING QUESTIONS ===");
        const validationErrors = [];
        value.forEach((question, index) => {
            const validation = validateQuestion(question, index);
            if (!validation.valid) {
                validationErrors.push(...validation.errors);
                console.log(`Question ${index + 1}: INVALID`);
                console.log(validation.errors);
            }
            else {
                console.log(`Question ${index + 1}: VALID ✓`);
            }
        });
        if (validationErrors.length > 0) {
            console.log("\n=== VALIDATION FAILED ===");
            console.log(validationErrors);
            return res.status(400).json({
                message: "Validation errors found in quiz questions",
                status: 400,
                errors: validationErrors,
                parsingWarnings: parsingErrors,
                questionsAttempted: value.length,
                sampleQuestion: value.length > 0 ? value[0] : null,
            });
        }
        console.log("=== VALIDATION PASSED ===\n");
        // Create quiz
        const quizes = await quizModel_1.default.create({
            subjectTitle: checkForSubject?.subjectTitle,
            subjectID: checkForSubject?._id,
            session: school?.presentSession,
            term: school?.presentTerm,
            quiz: {
                instruction: { duration, mark, instruction },
                question: value,
            },
            totalQuestions: value?.length,
            status: "quiz",
            startExam: false,
        });
        // Update relationships
        checkForSubject?.quiz.push(new mongoose_1.Types.ObjectId(quizes._id));
        checkForSubject?.performance?.push(new mongoose_1.Types.ObjectId(quizes._id));
        await checkForSubject?.save();
        if (findTeacher) {
            findTeacher?.quiz.push(new mongoose_1.Types.ObjectId(quizes._id));
            await findTeacher?.save();
        }
        if (findSubjectTeacher) {
            findSubjectTeacher?.quiz.push(new mongoose_1.Types.ObjectId(quizes._id));
            await findSubjectTeacher?.save();
        }
        // Clean up uploaded file
        const cleanupFile = () => {
            try {
                if (uploadedPath && node_fs_1.default.existsSync(uploadedPath)) {
                    node_fs_1.default.unlinkSync(uploadedPath);
                    console.log("File cleaned up successfully");
                }
            }
            catch (cleanupError) {
                console.error("Error cleaning up file:", cleanupError);
            }
        };
        setTimeout(cleanupFile, 1000);
        console.log("=== QUIZ CREATED SUCCESSFULLY ===\n");
        return res.status(201).json({
            message: "Quiz entry successfully created from file",
            data: quizes,
            questionsImported: value.length,
            warnings: parsingErrors.length > 0 ? parsingErrors : undefined,
            status: 201,
        });
    }
    catch (error) {
        console.error("=== ERROR CREATING QUIZ ===");
        console.error(error);
        if (uploadedPath && node_fs_1.default.existsSync(uploadedPath)) {
            try {
                node_fs_1.default.unlinkSync(uploadedPath);
                console.log("File cleaned up after error");
            }
            catch (cleanupError) {
                console.error("Error cleaning up file:", cleanupError);
            }
        }
        return res.status(500).json({
            message: "Error creating class subject quiz from file",
            status: 500,
            error: error.message,
        });
    }
};
exports.createSubjectExam = createSubjectExam;
// export const createSubjectExam = async (
//   req: any,
//   res: Response
// ): Promise<Response> => {
//   let uploadedPath: string | undefined;
//   try {
//     const { classID, subjectID } = req.params;
//     const { instruction, duration, mark } = req.body;
//     console.log("=== QUIZ UPLOAD REQUEST ===");
//     console.log("Class ID:", classID);
//     console.log("Subject ID:", subjectID);
//     console.log("Body:", req.body);
//     console.log("File:", req.file);
//     // Validate required parameters
//     if (!classID || !subjectID) {
//       return res.status(400).json({
//         message: "Missing required parameters: classID and subjectID",
//         status: 400,
//       });
//     }
//     if (!duration || !mark) {
//       return res.status(400).json({
//         message: "Missing required fields: duration and mark",
//         status: 400,
//       });
//     }
//     // Check if file was uploaded
//     if (!req.file) {
//       return res.status(400).json({
//         message: "No file uploaded. Please select a file.",
//         status: 400,
//       });
//     }
//     uploadedPath = req.file.path;
//     console.log("File uploaded to:", uploadedPath);
//     // Verify file exists
//     if (!fs.existsSync(uploadedPath!)) {
//       return res.status(400).json({
//         message: "Uploaded file not found on server",
//         status: 400,
//       });
//     }
//     const fileStats = fs.statSync(uploadedPath!);
//     console.log("File size:", fileStats.size, "bytes");
//     if (fileStats.size === 0) {
//       return res.status(400).json({
//         message: "Uploaded file is empty",
//         status: 400,
//       });
//     }
//     const classRoom = await classroomModel.findById(classID);
//     if (!classRoom) {
//       return res.status(404).json({
//         message: "Classroom not found",
//         status: 404,
//       });
//     }
//     const checkForSubject = await subjectModel.findById(subjectID);
//     if (!checkForSubject) {
//       return res.status(404).json({
//         message: "Subject doesn't exist for this class",
//         status: 404,
//       });
//     }
//     const findTeacher = await staffModel.findById(classRoom?.teacherID);
//     const findSubjectTeacher = await staffModel.findById(
//       checkForSubject?.teacherID
//     );
//     const school = await schoolModel.findById(findTeacher?.schoolIDs);
//     const originalName = req.file.originalname || uploadedPath;
//     const ext = path.extname(originalName).toLowerCase();
//     let value: any[] = [];
//     const parsingErrors: string[] = [];
//     if (ext === ".doc" || ext === ".docx") {
//       try {
//         console.log("\n=== CONVERTING DOCX TO HTML ===");
//         // Convert Word docx to HTML to preserve images and markup
//         const result = await mammoth.convertToHtml(
//           { path: uploadedPath as string },
//           { includeEmbeddedStyleMap: true }
//         );
//         const html = result.value || "";
//         console.log("HTML Output Preview:");
//         console.log(html.substring(0, 500));
//         console.log("HTML Length:", html.length);
//         if (!html || html.trim() === "") {
//           return res.status(400).json({
//             message: "The uploaded file appears to be empty or could not be converted",
//             status: 400,
//           });
//         }
//         const $ = cheerio.load(html);
//         const elems = $("body").children();
//         console.log(`\nFound ${elems.length} elements to parse`);
//         let questionData: any = {};
//         let options: string[] = [];
//         const BRACKET_URL_REGEX = /\[([^\]]+)\]/;
//         console.log("\n=== PARSING ELEMENTS ===");
//         elems.each((i, el) => {
//           // Use normalized text for pattern matching but keep HTML for storage
//           const rawText = normalizeText($(el).text().trim());
//           const htmlContent = $(el).html()?.trim() || "";
//           console.log(`\nElement ${i}: "${rawText.substring(0, 50)}..."`);
//           if (!rawText) {
//             console.log("  -> Skipped (empty)");
//             return; // skip empty blocks
//           }
//           // Detect new question (starts with number)
//           if (/^\d+[\.\)]/u.test(rawText)) {
//             console.log("  -> Detected QUESTION");
//             // Save previous question if present
//             if (Object.keys(questionData).length) {
//               questionData.options = options;
//               value.push(questionData);
//               console.log(`  -> Saved previous question (${options.length} options)`);
//               questionData = {};
//               options = [];
//             }
//             // Extract bracketed image URL if present
//             const match = rawText.match(BRACKET_URL_REGEX);
//             const url = match ? match[1].trim() : null;
//             // Store the HTML fragment for the question body
//             let cleanHtml = stripLeadingNumberFromHtml(htmlContent);
//             if (url) {
//               cleanHtml = cleanHtml.replace(BRACKET_URL_REGEX, "").trim();
//             }
//             console.log(`  -> Question HTML: "${cleanHtml.substring(0, 100)}..."`);
//             questionData = { question: cleanHtml };
//             if (url) {
//               if (isValidUrl(url)) {
//                 questionData.images = [url];
//                 console.log(`  -> Added image: ${url}`);
//               } else {
//                 parsingErrors.push(`Invalid image URL: ${url}`);
//                 console.log(`  -> Invalid URL: ${url}`);
//               }
//             }
//           } 
//           // Detect options (A. B. C. D.)
//           else if (/^[A-D][\.\)]/u.test(rawText)) {
//             const cleanOption = stripLeadingOptionLetter(htmlContent);
//             options.push(cleanOption);
//             console.log(`  -> Detected OPTION: "${cleanOption.substring(0, 50)}..."`);
//           } 
//           // Detect answer
//           else if (/^Answer:/i.test(rawText)) {
//             const answerText = normalizeText(rawText.replace(/^Answer:\s*/i, "").trim());
//             questionData.answer = answerText;
//             console.log(`  -> Detected ANSWER: "${answerText}"`);
//           } 
//           // Detect explanation
//           else if (/^Explanation:/i.test(rawText)) {
//             const explanationText = normalizeText(rawText.replace(/^Explanation:\s*/i, "").trim());
//             questionData.explanation = explanationText;
//             console.log(`  -> Detected EXPLANATION: "${explanationText.substring(0, 50)}..."`);
//           } 
//           // Continuation line
//           else {
//             if (questionData.question && options.length === 0) {
//               console.log("  -> Continuation of question");
//               questionData.question += `<br/>${htmlContent}`;
//               // Check for bracketed URLs in continuation text
//               const match = rawText.match(BRACKET_URL_REGEX);
//               const url = match ? match[1].trim() : null;
//               if (url) {
//                 if (isValidUrl(url)) {
//                   if (!questionData.images) questionData.images = [];
//                   questionData.images.push(url);
//                   questionData.question = questionData.question.replace(BRACKET_URL_REGEX, "");
//                   console.log(`  -> Added continuation image: ${url}`);
//                 } else {
//                   parsingErrors.push(`Invalid image URL: ${url}`);
//                 }
//               }
//             } else {
//               console.log("  -> Ignored (no active question)");
//             }
//           }
//         });
//         // Push last question if present
//         if (Object.keys(questionData).length) {
//           questionData.options = options;
//           value.push(questionData);
//           console.log(`\nSaved last question (${options.length} options)`);
//         }
//         console.log(`\n=== PARSING COMPLETE: ${value.length} questions found ===\n`);
//         if (value.length === 0) {
//           return res.status(400).json({
//             message: "No valid questions found in the document. Please check the format.",
//             status: 400,
//             hint: "Expected format: '1. Question text', 'A. Option', 'B. Option', etc., 'Answer: ...'",
//             htmlPreview: html.substring(0, 500),
//           });
//         }
//       } catch (docError: any) {
//         console.error("DOCX Parsing Error:", docError);
//         return res.status(400).json({
//           message: "Error parsing DOCX file",
//           status: 400,
//           error: docError.message,
//         });
//       }
//     } else if (ext === ".csv") {
//       try {
//         console.log("\n=== PARSING CSV FILE ===");
//         const data = await csv().fromFile(uploadedPath!);
//         for (const i of data) {
//           const opts = i.options ? i.options.split(";;") : [];
//           const read = {
//             question: i.Question || i.question || i.questionText || i.questionTitle,
//             options: opts,
//             answer: i.Answer || i.answer,
//             explanation: i.Explanation || i.explanation,
//           };
//           value.push(read);
//         }
//         console.log(`CSV parsed: ${value.length} questions found\n`);
//         if (value.length === 0) {
//           return res.status(400).json({
//             message: "No valid questions found in CSV file",
//             status: 400,
//           });
//         }
//       } catch (csvError: any) {
//         console.error("CSV Parsing Error:", csvError);
//         return res.status(400).json({
//           message: "Error parsing CSV file",
//           status: 400,
//           error: csvError.message,
//         });
//       }
//     } else {
//       return res.status(400).json({
//         message: "Invalid file format. Please upload a CSV, DOC, or DOCX file",
//         status: 400,
//       });
//     }
//     // Validate all questions
//     console.log("=== VALIDATING QUESTIONS ===");
//     const validationErrors: string[] = [];
//     value.forEach((question, index) => {
//       const validation = validateQuestion(question, index);
//       if (!validation.valid) {
//         validationErrors.push(...validation.errors);
//         console.log(`Question ${index + 1}: INVALID`);
//         console.log(validation.errors);
//       } else {
//         console.log(`Question ${index + 1}: VALID ✓`);
//       }
//     });
//     if (validationErrors.length > 0) {
//       console.log("\n=== VALIDATION FAILED ===");
//       console.log(validationErrors);
//       return res.status(400).json({
//         message: "Validation errors found in quiz questions",
//         status: 400,
//         errors: validationErrors,
//         parsingWarnings: parsingErrors,
//         questionsAttempted: value.length,
//       });
//     }
//     console.log("=== VALIDATION PASSED ===\n");
//     // Create quiz
//     const quizes = await quizModel.create({
//       subjectTitle: checkForSubject?.subjectTitle,
//       subjectID: checkForSubject?._id,
//       session: school?.presentSession,
//       term: school?.presentTerm,
//       quiz: {
//         instruction: { duration, mark, instruction },
//         question: value,
//       },
//       totalQuestions: value?.length,
//       status: "quiz",
//       startExam: false,
//     });
//     // Update relationships
//     checkForSubject?.quiz.push(new Types.ObjectId(quizes._id));
//     checkForSubject?.performance?.push(new Types.ObjectId(quizes._id));
//     await checkForSubject?.save();
//     if (findTeacher) {
//       findTeacher?.quiz.push(new Types.ObjectId(quizes._id));
//       await findTeacher?.save();
//     }
//     if (findSubjectTeacher) {
//       findSubjectTeacher?.quiz.push(new Types.ObjectId(quizes._id));
//       await findSubjectTeacher?.save();
//     }
//     // Clean up uploaded file
//     const cleanupFile = () => {
//       try {
//         if (uploadedPath && fs.existsSync(uploadedPath)) {
//           fs.unlinkSync(uploadedPath);
//           console.log("File cleaned up successfully");
//         }
//       } catch (cleanupError) {
//         console.error("Error cleaning up file:", cleanupError);
//       }
//     };
//     // Cleanup after 1 second
//     setTimeout(cleanupFile, 1000);
//     console.log("=== QUIZ CREATED SUCCESSFULLY ===\n");
//     return res.status(201).json({
//       message: "Quiz entry successfully created from file",
//       data: quizes,
//       questionsImported: value.length,
//       warnings: parsingErrors.length > 0 ? parsingErrors : undefined,
//       status: 201,
//     });
//   } catch (error: any) {
//     console.error("=== ERROR CREATING QUIZ ===");
//     console.error(error);
//     // Clean up file on error
//     if (uploadedPath && fs.existsSync(uploadedPath)) {
//       try {
//         fs.unlinkSync(uploadedPath);
//         console.log("File cleaned up after error");
//       } catch (cleanupError) {
//         console.error("Error cleaning up file:", cleanupError);
//       }
//     }
//     return res.status(500).json({
//       message: "Error creating class subject quiz from file",
//       status: 500,
//       error: error.message,
//     });
//   }
// };
// export const createSubjectExam = async (
//   req: any,
//   res: Response
// ): Promise<Response> => {
//   try {
//     const { classID, subjectID } = req.params;
//     const { instruction, duration, mark } = req.body;
//     const classRoom = await classroomModel.findById(classID);
//     const checkForSubject = await subjectModel.findById(subjectID);
//     const findTeacher = await staffModel.findById(checkForSubject?.teacherID);
//     const findSubjectTeacher = await staffModel.findById(
//       checkForSubject?.teacherID
//     );
//     const school = await schoolModel.findById(findTeacher?.schoolIDs);
//     // const { secure_url, public_id }: any = await streamUpload(req);
//     const uploadedPath = req?.file?.path;
//     if (!uploadedPath) {
//       return res.status(400).json({
//         message: "No upload file provided",
//         status: 400,
//       });
//     }
//     const originalName = req?.file?.originalname || uploadedPath;
//     const ext = path.extname(originalName).toLowerCase();
//     let value: any = [];
//     if (ext === ".doc" || ext === ".docx") {
//       // Convert Word docx to HTML to preserve images and markup.
//       // We preserve the HTML for each paragraph and only strip harmless numbering
//       // prefixes so frontend can render rich content (including special scientific characters).
//       const result = await mammoth.convertToHtml({ path: uploadedPath }, { includeEmbeddedStyleMap: true });
//       const html = result.value || "";
//       const $ = cheerio.load(html);
//       // We iterate over body children to preserve ordering (paragraphs, headings, list items)
//       const elems = $("body").children();
//       let questionData: any = {};
//       let options: string[] = [];
//       const BRACKET_URL_REGEX = /\[([^\]]+)\]/;
//       elems.each((i, el) => {
//         // Use normalized text for pattern matching but keep HTML for storage
//         const rawText = normalizeText($(el).text().trim());
//         const htmlContent = $(el).html()?.trim() || "";
//         if (!rawText) return; // skip empty blocks
//         if (/^\d+\./u.test(rawText)) {
//           // New question detected. Save previous question if present.
//           if (Object.keys(questionData).length) {
//             questionData.options = options;
//             value.push(questionData);
//             questionData = {};
//             options = [];
//           }
//           // Extract bracketed image URL if present in the text
//           const match = rawText.match(BRACKET_URL_REGEX);
//           const url = match ? match[1].trim() : null;
//           // Prefer storing the HTML fragment for the question body so special characters
//           // (Greek letters, scientific symbols, math-as-text) are preserved.
//           // Remove only the leading numbering from the first text node to avoid breaking tags.
//           let cleanHtml = stripLeadingNumberFromHtml(htmlContent);
//           if (url) {
//             // remove the [url] token from the HTML fragment too
//             cleanHtml = cleanHtml.replace(BRACKET_URL_REGEX, "").trim();
//           }
//           questionData = { question: cleanHtml };
//           if (url) questionData.images = [url];
//         } else if (/^[A-D]\./u.test(rawText)) {
//           // Option line — store option HTML but strip leading "A. " label from first text node
//           options.push(stripLeadingOptionLetter(htmlContent));
//         } else if (rawText.startsWith("Answer:")) {
//           questionData.answer = normalizeText(rawText.replace("Answer:", "").trim());
//         } else if (rawText.startsWith("Explanation:")) {
//           questionData.explanation = normalizeText(rawText.replace("Explanation:", "").trim());
//         } else {
//           // Continuation line — if we have a current question and no options yet, append
//           if (questionData.question && options.length === 0) {
//             questionData.question += `<br/>${htmlContent}`;
//             // check for bracketed URLs in continuation text
//             const match = rawText.match(BRACKET_URL_REGEX);
//             const url = match ? match[1].trim() : null;
//             if (url) {
//               if (!questionData.images) questionData.images = [];
//               questionData.images.push(url);
//               // remove bracketed token from the question HTML
//               questionData.question = questionData.question.replace(BRACKET_URL_REGEX, "");
//             }
//           }
//         }
//       });
//       // push last question if present
//       if (Object.keys(questionData).length) {
//         questionData.options = options;
//         value.push(questionData);
//       }
//     } else {
//       // CSV handling
//       let data = await csv().fromFile(req?.file?.path);
//       for (let i of data) {
//         i.options?.split(";;");
//         let read = { ...i, options: i.options?.split(";;") };
//         value.push(read);
//       }
//     }
//     let term = lodash.find(value, { term: school?.presentTerm });
//     let session = lodash.find(value, { session: school?.presentSession });
//     let filePath = path.join(__dirname, "uploads");
//     const deleteFilesInFolder = (folderPath: any) => {
//       if (fs.existsSync(folderPath)) {
//         const files = fs.readdirSync(folderPath);
//         files.forEach((file) => {
//           const filePath = path.join(folderPath, file);
//           fs.unlinkSync(filePath);
//         });
//         console.log(
//           `All files in the folder '${folderPath}' have been deleted.`
//         );
//       } else {
//         console.log(`The folder '${folderPath}' does not exist.`);
//       }
//     };
//     if (checkForSubject) {
//       const quizes = await quizModel.create({
//         subjectTitle: checkForSubject?.subjectTitle,
//         subjectID: checkForSubject?._id,
//         session: school?.presentSession,
//         term: school?.presentTerm,
//         quiz: {
//           instruction: { duration, mark, instruction },
//           question: value,
//         },
//         totalQuestions: value?.length,
//         status: "examination",
//         startExam: false,
//       });
//       checkForSubject?.quiz.push(new Types.ObjectId(quizes._id));
//       checkForSubject?.performance?.push(new Types.ObjectId(quizes._id));
//       checkForSubject?.save();
//       findTeacher?.quiz.push(new Types.ObjectId(quizes._id));
//       findTeacher?.save();
//       findSubjectTeacher?.quiz.push(new Types.ObjectId(quizes._id));
//       findSubjectTeacher?.save();
//       // await deleteFilesInFolder(filePath);
//       return res.status(201).json({
//         message: "exam entry successfully",
//         data: quizes,
//         status: 201,
//       });
//     } else {
//       return res.status(404).json({
//         message: "Subject doesn't exist for this class",
//         status: 404,
//       });
//     }
//   } catch (error: any) {
//     return res.status(404).json({
//       message: "Error creating class subject quiz",
//       status: 404,
//       error: error,
//       data: error?.message,
//     });
//   }
// };
// export const createSubjectExam = async (
//   req: any,
//   res: Response
// ): Promise<Response> => {
//   try {
//     const { classID, subjectID } = req.params;
//     const { theory, instruction, duration, mark, randomize } = req.body;
//     let filePath = path.join(__dirname, "../uploads/examination");
//     const classRoom = await classroomModel.findById(classID);
//     const checkForSubject = await subjectModel.findById(subjectID);
//     // teacher assigned to the class
//     const findTeacher = await staffModel.findById(classRoom?.teacherID);
//     // teacher assigned specifically to the subject (teacherID stored on subject)
//     const findSubjectTeacher = await staffModel.findById(
//       checkForSubject?.teacherID
//     );
//     const school = await schoolModel.findById(findTeacher?.schoolIDs);
//     // const { secure_url, public_id }: any = await streamUpload(req);
//     const uploadedPath = req?.file?.path;
//     if (!uploadedPath) {
//       return res.status(400).json({
//         message: "No upload file provided",
//         status: 400,
//       });
//     }
//     const originalName = req?.file?.originalname || uploadedPath;
//     const ext = path.extname(originalName).toLowerCase();
//     let value: any[] = [];
//     if (ext === ".doc" || ext === ".docx") {
//       // Convert Word docx to HTML to preserve images and markup
//       const result = await mammoth.convertToHtml(
//         { path: uploadedPath },
//         { includeEmbeddedStyleMap: true }
//       );
//       const html = result.value || "";
//       const $ = Cheerio.load(html);
//       // split by paragraphs and headings to get question blocks
//       const blocks: string[] = [];
//       const elems: any[] = $("p, h1, h2, h3, li").toArray();
//       for (const el of elems as any[]) {
//         const text = $(el as any)
//           .text()
//           .trim();
//         if (text) blocks.push(text);
//       }
//       // collect images mapped by their surrounding block index
//       const imagesByIndex: Record<number, string[]> = {};
//       const imgs: any[] = $("img").toArray();
//       for (const imgEl of imgs as any[]) {
//         const src = $(imgEl as any).attr("src");
//         if (!src) continue;
//         const parent = $(imgEl as any).closest("p, li, h1, h2, h3")[0] as any;
//         let idx = -1;
//         if (parent) {
//           idx = (elems as any[]).indexOf(parent);
//         }
//         const key = idx >= 0 ? idx : blocks.length;
//         imagesByIndex[key] = imagesByIndex[key] || [];
//         imagesByIndex[key].push(src);
//       }
//       // If images are data URIs (embedded), upload them to Cloudinary so they
//       // are visible and performant for students. Replace data URIs with hosted URLs.
//       for (const k of Object.keys(imagesByIndex)) {
//         const arr = imagesByIndex[Number(k)];
//         const uploadedUrls: string[] = [];
//         for (const src of arr) {
//           try {
//             if (typeof src === "string" && src.startsWith("data:")) {
//               const uploadRes: any = await uploadDataUri(src, "exams");
//               if (uploadRes && uploadRes.secure_url) {
//                 uploadedUrls.push(uploadRes.secure_url);
//               }
//             } else if (typeof src === "string") {
//               // not a data URI (likely a valid src already) — keep as-is
//               uploadedUrls.push(src);
//             }
//           } catch (err) {
//             // on failure, keep the original src so diagram isn't lost
//             uploadedUrls.push(src);
//           }
//         }
//         imagesByIndex[Number(k)] = uploadedUrls;
//       }
//       let questionData: any = {};
//       let options: string[] = [];
//       const BRACKET_URL_REGEX = /\[([^\]]+)\]/;
//       for (let idx = 0; idx < blocks.length; idx++) {
//         let line = blocks[idx];
//         if (/^\d+\./.test(line)) {
//           // Save previous question
//           if (Object.keys(questionData).length) {
//             questionData.options = options;
//             // attach images if any
//             if (imagesByIndex[idx - 1])
//               questionData.images = imagesByIndex[idx - 1];
//             value.push(questionData);
//             questionData = {};
//             options = [];
//           }
//           // Extract bracketed image URL if present
//           const match = line.match(BRACKET_URL_REGEX);
//           const url = match ? match[1].trim() : null;
//           line = line.replace(BRACKET_URL_REGEX, "").trim();
//           questionData = { question: line };
//           if (url) {
//             questionData.images = [url];
//           }
//         } else if (/^[A-D]\./.test(line)) {
//           options.push(line.replace(/^[A-D]\./, ""));
//         } else if (line.startsWith("Answer:")) {
//           questionData.answer = line.replace("Answer:", "").trim();
//         } else if (line.startsWith("Explanation:")) {
//           questionData.explanation = line.replace("Explanation:", "").trim();
//         } else {
//           // append to question if no options yet
//           if (questionData && !questionData.options) {
//             // Also extract bracketed image URL from continuation lines
//             const match = line.match(BRACKET_URL_REGEX);
//             const url = match ? match[1].trim() : null;
//             line = line.replace(BRACKET_URL_REGEX, "").trim();
//             questionData.question = `${questionData.question} ${line}`.trim();
//             if (url) {
//               if (!questionData.images) questionData.images = [];
//               questionData.images.push(url);
//             }
//           }
//         }
//       }
//       if (Object.keys(questionData).length) {
//         questionData.options = options;
//         const lastIdx = blocks.length - 1;
//         if (imagesByIndex[lastIdx])
//           questionData.images = imagesByIndex[lastIdx];
//         value.push(questionData);
//       }
//     } else {
//       // treat as CSV
//       const data = await csv().fromFile(uploadedPath);
//       for (const i of data as any[]) {
//         const opts = i.options ? i.options.split(";;") : [];
//         const read = {
//           question:
//             i.Question ||
//             i.question ||
//             i.questionText ||
//             i.questionTitle ||
//             i.question,
//           options: opts,
//           answer: i.Answer || i.answer,
//           explanation: i.Explanation || i.explanation,
//         };
//         value.push(read);
//       }
//     }
//     let term = lodash.find(value, { term: school?.presentTerm });
//     let session = lodash.find(value, { session: school?.presentSession });
//     const deleteFilesInFolder = (folderPath: any) => {
//       if (fs.existsSync(folderPath)) {
//         const files = fs.readdirSync(folderPath);
//         files.forEach((file) => {
//           const filePath = path.join(folderPath, file);
//           fs.unlinkSync(filePath);
//         });
//         console.log(
//           `All files in the folder '${folderPath}' have been deleted.`
//         );
//       } else {
//         console.log(`The folder '${folderPath}' does not exist.`);
//       }
//     };
//     // checkForSubject;
//     if (checkForSubject) {
//       // if (term && session) {
//       //   const quizes = await quizModel.findByIdAndUpdate(
//       //     term?._id,
//       //     {
//       //       quiz: {
//       //         instruction: { duration, mark, instruction },
//       //         question: value,
//       //       },
//       //       totalQuestions: value?.length,
//       //       startExam: false,
//       //     },
//       //     { new: true }
//       //   );
//       //   let filePath = path.join(__dirname, "uploads");
//       //   const deleteFilesInFolder = (folderPath: any) => {
//       //     if (fs.existsSync(folderPath)) {
//       //       const files = fs.readdirSync(folderPath);
//       //       files.forEach((file) => {
//       //         const filePath = path.join(folderPath, file);
//       //         fs.unlinkSync(filePath);
//       //       });
//       //       console.log(
//       //         `All files in the folder '${folderPath}' have been deleted.`
//       //       );
//       //     } else {
//       //       console.log(`The folder '${folderPath}' does not exist.`);
//       //     }
//       //   };
//       //   deleteFilesInFolder(filePath);
//       //   return res.status(201).json({
//       //     message: "update exam entry successfully",
//       //     data: quizes,
//       //     status: 201,
//       //   });
//       // } else {
//       //   const quizes = await quizModel.create({
//       //     subjectTitle: checkForSubject?.subjectTitle,
//       //     subjectID: checkForSubject?._id,
//       //     session: school?.presentSession,
//       //     term: school?.presentTerm,
//       //     quiz: {
//       //       instruction: { duration, mark, instruction },
//       //       question: value,
//       //     },
//       //     totalQuestions: value?.length,
//       //     status: "examination",
//       //     startExam: false,
//       //   });
//       //   checkForSubject?.quiz.push(new Types.ObjectId(quizes._id));
//       //   checkForSubject?.performance?.push(new Types.ObjectId(quizes._id));
//       //   checkForSubject?.save();
//       //   findTeacher?.quiz.push(new Types.ObjectId(quizes._id));
//       //   findTeacher?.save();
//       //   findSubjectTeacher?.quiz.push(new Types.ObjectId(quizes._id));
//       //   findSubjectTeacher?.save();
//       //   let filePath = path.join(__dirname, "uploads");
//       //   const deleteFilesInFolder = (folderPath: any) => {
//       //     if (fs.existsSync(folderPath)) {
//       //       const files = fs.readdirSync(folderPath);
//       //       files.forEach((file) => {
//       //         const filePath = path.join(folderPath, file);
//       //         fs.unlinkSync(filePath);
//       //       });
//       //       console.log(
//       //         `All files in the folder '${folderPath}' have been deleted.`
//       //       );
//       //     } else {
//       //       console.log(`The folder '${folderPath}' does not exist.`);
//       //     }
//       //   };
//       //   return res.status(201).json({
//       //     message: "exam entry successfully",
//       //     // data: quizes,
//       //     status: 201,
//       //   });
//       // }
//       // await examinationModel.deleteMany();
// const quizes = await quizModel.create({
//   subjectTitle: checkForSubject?.subjectTitle,
//   subjectID: checkForSubject?._id,
//   session: school?.presentSession,
//   term: school?.presentTerm,
//   // quiz: {
//   //   instruction: { duration, mark, instruction },
//   //   question: value,
//   // },
//   quiz: {
//     instruction: { duration, mark, instruction },
//     question: value,
//     theory,
//   },
//   totalQuestions: value?.length,
//   status: "examination",
//   startExam: false,
// });
// checkForSubject?.examination.push(new Types.ObjectId(quizes._id));
// checkForSubject?.performance?.push(new Types.ObjectId(quizes._id));
// checkForSubject?.save();
// findTeacher?.examination.push(new Types.ObjectId(quizes._id));
// findTeacher?.save();
// findSubjectTeacher?.examination.push(new Types.ObjectId(quizes._id));
// findSubjectTeacher?.save();
// const x = setTimeout(async () => {
//   await deleteFilesInFolder(filePath);
//   clearTimeout(x);
// }, 15000);
//       return res.status(201).json({
//         message: "exam entry successfully",
//         data: quizes,
//         exam: checkForSubject?.examination,
//         status: 201,
//       });
//     } else {
//       return res.status(404).json({
//         message: "Subject doesn't exist for this class",
//         status: 404,
//       });
//     }
//   } catch (error: any) {
//     return res.status(404).json({
//       message: "Error creating class subject quiz",
//       status: 404,
//       error: error,
//       data: error?.message,
//     });
//   }
// };
// Utility Functions
// const normalizeText = (text: string): string => {
//   if (!text) return "";
//   return text
//     .replace(/\u00A0/g, " ") // Replace non-breaking spaces
//     .replace(/\s+/g, " ") // Replace multiple spaces with single space
//     .trim();
// };
// const stripLeadingNumberFromHtml = (html: string): string => {
//   if (!html) return "";
//   // Remove leading number pattern like "1." or "10." from HTML while preserving the rest
//   return html.replace(/^(\d+\.?\s*)/, "").trim();
// };
// const stripLeadingOptionLetter = (html: string): string => {
//   if (!html) return "";
//   // Remove leading option letter like "A." or "B." from HTML while preserving the rest
//   return html.replace(/^([A-D]\.?\s*)/, "").trim();
// };
const readSubjectExamination = async (req, res) => {
    try {
        const { subjectID } = req.params;
        const subject = await subjectModel_1.default.findById(subjectID).populate({
            path: "examination",
            options: {
                sort: {
                    createdAt: -1,
                },
            },
        });
        const classId = subject?.subjectClassID || subject?.subjectClassIDs || subject?.classID;
        let classroom;
        if (classId) {
            classroom = await classroomModel_1.default.findById(classId);
        }
        if (!classroom && subject?.designated) {
            classroom = await classroomModel_1.default.findOne({
                className: subject.designated,
                ...(subject.school ? { school: subject.school } : {}),
            });
        }
        if (!classroom) {
            classroom = await classroomModel_1.default.findOne({ classSubjects: subjectID });
        }
        let school = null;
        const schoolId = classroom?.school ||
            classroom?.schoolIDs ||
            subject?.school ||
            subject?.schoolIDs;
        if (schoolId) {
            school = await schoolModel_1.default.findById(schoolId);
        }
        if (!school && classroom?.teacherID) {
            const teacher = await staffModel_1.default.findById(classroom.teacherID);
            if (teacher?.schoolIDs || teacher?.school) {
                school = await schoolModel_1.default.findById(teacher.schoolIDs || teacher.school);
            }
        }
        if (!school && subject?.teacherID) {
            const teacher = await staffModel_1.default.findById(subject.teacherID);
            if (teacher?.schoolIDs || teacher?.school) {
                school = await schoolModel_1.default.findById(teacher.schoolIDs || teacher.school);
            }
        }
        if (!school && (subject?.schoolName || classroom?.schoolName)) {
            school = await schoolModel_1.default.findOne({
                schoolName: subject?.schoolName || classroom?.schoolName,
            });
        }
        if (!school && classroom?._id) {
            school = await schoolModel_1.default.findOne({
                $or: [
                    { classRooms: classroom._id },
                    { classRM: classroom._id },
                    { classes: classroom._id },
                ],
            });
        }
        const presentTerm = (classroom?.presentTerm ||
            school?.presentTerm ||
            "")
            .trim()
            .toLowerCase();
        const presentSession = (school?.presentSession || "")
            .trim()
            .toLowerCase();
        const allExams = (subject?.examination || []).filter((e) => e?.status === "examination");
        let exam;
        if (presentTerm && presentSession) {
            exam = allExams.find((e) => {
                return ((e.term || "").trim().toLowerCase() === presentTerm &&
                    (e.session || "").trim().toLowerCase() === presentSession);
            });
        }
        if (!exam && presentTerm) {
            exam = allExams.find((e) => {
                return (e.term || "").trim().toLowerCase() === presentTerm;
            });
        }
        if (!exam && allExams.length > 0) {
            exam = allExams[0];
        }
        return res.status(201).json({
            message: "subject exam read successfully",
            exam,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error reading subject exam",
            status: 404,
        });
    }
};
exports.readSubjectExamination = readSubjectExamination;
const startSubjectExamination = async (req, res) => {
    try {
        const { examID } = req.params;
        const { started } = req.body;
        const subject = await quizModel_1.default.findByIdAndUpdate(examID, {
            startExam: started,
        }, { new: true });
        return res.status(201).json({
            message: "start subject exam read successfully",
            data: subject,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error reading subject exam",
            status: 404,
        });
    }
};
exports.startSubjectExamination = startSubjectExamination;
// Quiz
// export const createSubjectQuizFromFile = async (
//   req: any,
//   res: Response
// ): Promise<Response> => {
//   try {
//     const { classID, subjectID } = req.params;
//     const { instruction, duration, mark } = req.body;
//     let filePath = path.join(__dirname, "../uploads/quizzes");
//     const classRoom = await classroomModel.findById(classID);
//     const checkForSubject = await subjectModel.findById(subjectID);
//     const findTeacher = await staffModel.findById(classRoom?.teacherID);
//     const findSubjectTeacher = await staffModel.findById(
//       checkForSubject?.teacherID
//     );
//     const school = await schoolModel.findById(findTeacher?.schoolIDs);
//     const uploadedPath = req?.file?.path;
//     if (!uploadedPath) {
//       return res.status(400).json({
//         message: "No upload file provided",
//         status: 400,
//       });
//     }
//     const originalName = req?.file?.originalname || uploadedPath;
//     const ext = path.extname(originalName).toLowerCase();
//     let value: any[] = [];
//     if (ext === ".doc" || ext === ".docx") {
//       // Use convertToHtml to preserve formatting and special characters
//       const result = await mammoth.convertToHtml({ path: uploadedPath }, { includeEmbeddedStyleMap: true });
//       const html = result.value || "";
//       const $ = cheerio.load(html);
//       const elems = $("body").children();
//       let questionData: any = {};
//       let options: string[] = [];
//       const BRACKET_URL_REGEX = /\[([^\]]+)\]/;
//       elems.each((i, el) => {
//         const rawText = normalizeText($(el).text().trim());
//         const htmlContent = $(el).html()?.trim() || "";
//         if (!rawText) return;
//         if (/^\d+\./u.test(rawText)) {
//           if (Object.keys(questionData).length) {
//             questionData.options = options;
//             value.push(questionData);
//             questionData = {};
//             options = [];
//           }
//           const match = rawText.match(BRACKET_URL_REGEX);
//           const url = match ? match[1].trim() : null;
//           let cleanHtml = stripLeadingNumberFromHtml(htmlContent);
//           if (url) cleanHtml = cleanHtml.replace(BRACKET_URL_REGEX, "").trim();
//           questionData = { question: cleanHtml };
//           if (url) questionData.images = [url];
//         } else if (/^[A-D]\./u.test(rawText)) {
//           options.push(stripLeadingOptionLetter(htmlContent));
//         } else if (rawText.startsWith("Answer:")) {
//           questionData.answer = normalizeText(rawText.replace("Answer:", "").trim());
//         } else if (rawText.startsWith("Explanation:")) {
//           questionData.explanation = normalizeText(rawText.replace("Explanation:", "").trim());
//         } else {
//           if (questionData && !questionData.options) {
//             const match = rawText.match(BRACKET_URL_REGEX);
//             const url = match ? match[1].trim() : null;
//             questionData.question = `${questionData.question}<br/>${htmlContent}`.trim();
//             if (url) {
//               if (!questionData.images) questionData.images = [];
//               questionData.images.push(url);
//               questionData.question = questionData.question.replace(BRACKET_URL_REGEX, "");
//             }
//           }
//         }
//       });
//       if (Object.keys(questionData).length) {
//         questionData.options = options;
//         value.push(questionData);
//       }
//     } else if (ext === ".csv") {
//       const data = await csv().fromFile(uploadedPath);
//       for (const i of data) {
//         const opts = i.options ? i.options.split(";;") : [];
//         const read = {
//           question:
//             i.Question || i.question || i.questionText || i.questionTitle,
//           options: opts,
//           answer: i.Answer || i.answer,
//           explanation: i.Explanation || i.explanation,
//         };
//         value.push(read);
//       }
//     } else {
//       return res.status(400).json({
//         message: "Invalid file format. Please upload a CSV, DOC, or DOCX file",
//         status: 400,
//       });
//     }
//     if (checkForSubject) {
//       const quizes = await quizModel.create({
//         subjectTitle: checkForSubject?.subjectTitle,
//         subjectID: checkForSubject?._id,
//         session: school?.presentSession,
//         term: school?.presentTerm,
//         quiz: {
//           instruction: { duration, mark, instruction },
//           question: value,
//         },
//         totalQuestions: value?.length,
//         status: "quiz",
//         startExam: false,
//       });
//       checkForSubject?.quiz.push(new Types.ObjectId(quizes._id));
//       checkForSubject?.performance?.push(new Types.ObjectId(quizes._id));
//       checkForSubject?.save();
//       findTeacher?.quiz.push(new Types.ObjectId(quizes._id));
//       findTeacher?.save();
//       findSubjectTeacher?.quiz.push(new Types.ObjectId(quizes._id));
//       findSubjectTeacher?.save();
//       // Clean up uploaded file
//       const deleteFilesInFolder = (folderPath: any) => {
//         if (fs.existsSync(folderPath)) {
//           const files = fs.readdirSync(folderPath);
//           files.forEach((file) => {
//             const filePath = path.join(folderPath, file);
//             fs.unlinkSync(filePath);
//           });
//         }
//       };
//       const x = setTimeout(async () => {
//         await deleteFilesInFolder(filePath);
//         clearTimeout(x);
//       }, 15000);
//       return res.status(201).json({
//         message: "quiz entry successfully created from file",
//         data: quizes,
//         status: 201,
//       });
//     } else {
//       return res.status(404).json({
//         message: "Subject doesn't exist for this class",
//         status: 404,
//       });
//     }
//   } catch (error: any) {
//     return res.status(404).json({
//       message: "Error creating class subject quiz from file",
//       status: 404,
//       error: error,
//       data: error?.message,
//     });
//   }
// };
const createSubjectQuiz = async (req, res) => {
    try {
        const { classID, subjectID } = req.params;
        const { quiz, totalQuestions } = req.body;
        const classRoom = await classroomModel_1.default.findById(classID);
        const checkForSubject = await subjectModel_1.default.findById(subjectID);
        const findTeacher = await staffModel_1.default.findById(classRoom?.teacherID);
        const findSubjectTeacher = await staffModel_1.default.findById(checkForSubject?.teacherID);
        if (checkForSubject) {
            const quizes = await quizModel_1.default.create({
                subjectTitle: checkForSubject?.subjectTitle,
                subjectID: checkForSubject?._id,
                quiz,
                totalQuestions,
                status: "quiz",
            });
            checkForSubject?.quiz.push(new mongoose_1.Types.ObjectId(quizes._id));
            checkForSubject?.performance?.push(new mongoose_1.Types.ObjectId(quizes._id));
            checkForSubject?.save();
            findTeacher?.quiz.push(new mongoose_1.Types.ObjectId(quizes._id));
            findTeacher?.save();
            findSubjectTeacher?.quiz.push(new mongoose_1.Types.ObjectId(quizes._id));
            findSubjectTeacher?.save();
            return res.status(201).json({
                message: "quiz entry created successfully",
                data: quizes,
                status: 201,
            });
        }
        else {
            return res.status(404).json({
                message: "Subject doesn't exist for this class",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating class subject quiz",
            status: 404,
        });
    }
};
exports.createSubjectQuiz = createSubjectQuiz;
const readSubjectQuiz = async (req, res) => {
    try {
        const { subjectID } = req.params;
        const subject = await subjectModel_1.default.findById(subjectID).populate({
            path: "quiz",
            options: {
                sort: {
                    time: 1,
                },
            },
        });
        return res.status(201).json({
            message: "subject quiz read successfully",
            data: subject,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating subject quiz",
            status: 404,
        });
    }
};
exports.readSubjectQuiz = readSubjectQuiz;
const readTeacherSubjectQuiz = async (req, res) => {
    try {
        const { teacherID } = req.params;
        const quiz = await staffModel_1.default
            .findById(teacherID)
            .populate({ path: "quiz" });
        return res.status(201).json({
            message: "subject quiz read successfully",
            data: quiz,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating subject quiz",
            data: error.message,
            status: 404,
        });
    }
};
exports.readTeacherSubjectQuiz = readTeacherSubjectQuiz;
const readQuiz = async (req, res) => {
    try {
        const { quizID } = req.params;
        const quiz = await quizModel_1.default.findById(quizID);
        return res.status(201).json({
            message: "subject quiz read successfully",
            data: quiz,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating subject quiz",
            data: error.message,
            status: 404,
        });
    }
};
exports.readQuiz = readQuiz;
const readQuizes = async (req, res) => {
    try {
        const quiz = await quizModel_1.default.find().populate({
            path: "performance",
        });
        return res.status(201).json({
            message: "subject quiz read successfully",
            data: quiz,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating subject quiz",
            data: error.message,
            status: 404,
        });
    }
};
exports.readQuizes = readQuizes;
const getQuizRecords = async (req, res) => {
    try {
        const { studentID } = req.params;
        const quizzes = await studentModel_1.default
            .findById(studentID)
            .populate({ path: "performance" });
        return res.status(200).json({
            message: "Quiz records fetched successfully",
            data: quizzes,
            status: 200,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Error fetching quiz records",
            data: error.message,
            status: 500,
        });
    }
};
exports.getQuizRecords = getQuizRecords;
const deleteQuiz = async (req, res) => {
    try {
        const { quizID } = req.params;
        const quiz = await quizModel_1.default.findByIdAndDelete(quizID);
        if (!quiz) {
            return res.status(404).json({
                message: "Quiz not found",
                status: 404,
            });
        }
        const subjectUpdate = await subjectModel_1.default.updateMany({ quiz: quizID }, { $pull: { quiz: quizID } });
        const staffUpdate = await staffModel_1.default.updateMany({ quiz: quizID }, { $pull: { quiz: quizID } });
        const studentUpdate = await studentModel_1.default.updateMany({ quiz: quizID }, { $pull: { quiz: quizID } });
        return res.status(200).json({
            message: "Quiz deleted successfully",
            data: {
                deletedQuiz: quiz,
                subjectUpdate,
                staffUpdate,
                studentUpdate,
            },
            status: 200,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Error deleting quiz",
            data: error.message,
            status: 500,
        });
    }
};
exports.deleteQuiz = deleteQuiz;
const getStudentQuizRecords = async (req, res) => {
    try {
        const { teacherID } = req.params;
        const staff = await staffModel_1.default.findById(teacherID).populate({
            path: "quiz",
            populate: {
                path: "performance",
                select: "studentName studentScore studentGrade subjectTitle date",
            },
        });
        if (!staff) {
            return res.status(404).json({
                message: "Teacher not found or no quiz data available",
                status: 404,
            });
        }
        return res.status(200).json({
            message: "Student quiz records retrieved successfully",
            data: staff,
            status: 200,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Error retrieving student quiz records",
            data: error.message,
            status: 500,
        });
    }
};
exports.getStudentQuizRecords = getStudentQuizRecords;
