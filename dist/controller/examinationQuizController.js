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
exports.createSubjectExamination = void 0;
// @ts-nocheck
const adm_zip_1 = __importDefault(require("adm-zip"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const streamifier_1 = require("../utils/streamifier");
const classroomModel_1 = __importDefault(require("../model/classroomModel"));
const staffModel_1 = __importDefault(require("../model/staffModel"));
const subjectModel_1 = __importDefault(require("../model/subjectModel"));
const examinationModel_1 = __importDefault(require("../model/examinationModel"));
const schoolModel_1 = __importDefault(require("../model/schoolModel"));
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
        "0": "₀",
        "1": "₁",
        "2": "₂",
        "3": "₃",
        "4": "₄",
        "5": "₅",
        "6": "₆",
        "7": "₇",
        "8": "₈",
        "9": "₉",
    };
    return text
        .split("")
        .map((c) => map[c] || c)
        .join("");
}
function toUnicodeSuperscript(text) {
    const map = {
        "0": "⁰",
        "1": "¹",
        "2": "²",
        "3": "³",
        "4": "⁴",
        "5": "⁵",
        "6": "⁶",
        "7": "⁷",
        "8": "⁸",
        "9": "⁹",
        "+": "⁺",
        "-": "⁻",
        "=": "⁼",
        "(": "⁽",
        ")": "⁾",
        n: "ⁿ",
        i: "ⁱ",
    };
    return text
        .split("")
        .map((c) => map[c] || c)
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
                    const ext = path.extname(mediaPath).replace(".", "").toLowerCase();
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
        console.error("Error extracting DOCX:", error);
        throw error;
    }
}
function processParagraph(paraXml) {
    const elements = [];
    // 1. Text runs (w:t) — with formatting detection (underline, bold, italic)
    const textRunRegex = /<w:r[^>]*>(.*?)<\/w:r>/gs;
    let match;
    while ((match = textRunRegex.exec(paraXml)) !== null) {
        const rInner = match[1];
        if (match[0].includes("<m:oMath") || match[0].includes("<w:vertAlign"))
            continue;
        // Extract text from <w:t> elements
        const tMatch = rInner.match(/<w:t[^>]*>([^<]*)<\/w:t>/);
        let text = tMatch ? tMatch[1] : "";
        // Handle <w:sym> elements — Word stores special symbols (₦, −, ², etc.)
        const symRegex = /<w:sym[^>]*w:char="([0-9A-Fa-f]+)"[^>]*\/>/g;
        let symMatch;
        while ((symMatch = symRegex.exec(rInner)) !== null) {
            try {
                const codePoint = parseInt(symMatch[1], 16);
                if (codePoint > 0) {
                    text += String.fromCodePoint(codePoint);
                }
            }
            catch (e) {
                // Skip invalid code points
            }
        }
        // Decode XML numeric character references
        if (text) {
            text = decodeXmlEntities(text);
        }
        if (!text)
            continue;
        const rPrMatch = rInner.match(/<w:rPr[^>]*>(.*?)<\/w:rPr>/s);
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
    // 2. Subscript w:r elements
    const subRegex = /<w:r[^>]*><w:rPr[^>]*><w:vertAlign w:val="subscript"\/><\/w:rPr>.*?<w:t[^>]*>([^<]+?)<\/w:t><\/w:r>/g;
    while ((match = subRegex.exec(paraXml)) !== null) {
        elements.push({ pos: match.index, content: toUnicodeSubscript(match[1]) });
    }
    // 3. Superscript w:r elements
    const supRegex = /<w:r[^>]*><w:rPr[^>]*><w:vertAlign w:val="superscript"\/><\/w:rPr>.*?<w:t[^>]*>([^<]+?)<\/w:t><\/w:r>/g;
    while ((match = supRegex.exec(paraXml)) !== null) {
        elements.push({ pos: match.index, content: toUnicodeSuperscript(match[1]) });
    }
    // 4. Math runs (m:oMath)
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
        "0": "⁰",
        "1": "¹",
        "2": "²",
        "3": "³",
        "4": "⁴",
        "5": "⁵",
        "6": "⁶",
        "7": "⁷",
        "8": "⁸",
        "9": "⁹",
        "+": "⁺",
        "-": "⁻",
        "=": "⁼",
        "(": "⁽",
        ")": "⁾",
        n: "ⁿ",
        i: "ⁱ",
        a: "ᵃ",
        b: "ᵇ",
        c: "ᶜ",
        d: "ᵈ",
        e: "ᵉ",
        f: "ᶠ",
        g: "ᵍ",
        h: "ʰ",
        j: "ʲ",
        k: "ᵏ",
        l: "ˡ",
        m: "ᵐ",
        o: "ᵒ",
        p: "ᵖ",
        r: "ʳ",
        s: "ˢ",
        t: "ᵗ",
        u: "ᵘ",
        v: "ᵛ",
        w: "ʷ",
        x: "ˣ",
        y: "ʸ",
        z: "ᶻ",
    };
    const SUB = {
        "0": "₀",
        "1": "₁",
        "2": "₂",
        "3": "₃",
        "4": "₄",
        "5": "₅",
        "6": "₆",
        "7": "₇",
        "8": "₈",
        "9": "₉",
        "+": "₊",
        "-": "₋",
        "=": "₌",
        "(": "₍",
        ")": "₎",
        a: "ₐ",
        e: "ₑ",
        h: "ₕ",
        i: "ᵢ",
        j: "ⱼ",
        k: "ₖ",
        l: "ₗ",
        m: "ₘ",
        n: "ₙ",
        o: "ₒ",
        p: "ₚ",
        r: "ᵣ",
        s: "ₛ",
        t: "ₜ",
        u: "ᵤ",
        v: "ᵥ",
        x: "ₓ",
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
    // ──────────────────────────────────────────────────────────────
    // FINAL POST-PROCESSING: Fix only stoichiometry (H₂O), NOT atomic numbers
    // ──────────────────────────────────────────────────────────────
    // No additional post-processing replacements required: the parsing logic
    // already prefers stoichiometry vs atomic numbering based on surrounding
    // context (next token's first character). If specific replacements are
    // required for odd cases, consider adding explicit rules with careful
    // context checks above.
    // DO NOT TOUCH: ₄Be, ₆C, ₇N, ₈O, ₉₂U → these are correct!
    return result.trim();
}
// ──────────────────────────────────────────────────────────────
// Rest of your controller (unchanged)
// ──────────────────────────────────────────────────────────────
function extractUrlsFromText(text) {
    const urlRegex = /(https?:\/\/[^\s\)\]]+|data:[^\s\)\]]+)/g;
    return Array.from((text || "").matchAll(urlRegex)).map((m) => m[0]);
}
function sanitizeUrl(url) {
    if (!url)
        return url;
    const match = url.match(/(\.(?:png|jpe?g|gif|webp|svg|bmp|pdf|txt))(?:[?#][^\s\)\]]*)?/i);
    return match ? url.slice(0, match.index + match[0].length) : url;
}
const validateQuestion = (q, i) => {
    const errors = [];
    if (!q.question?.trim())
        errors.push(`Question ${i + 1}: Missing text`);
    if (!q.options || q.options.length < 2)
        errors.push(`Question ${i + 1}: Need ≥2 options`);
    if (!q.answer?.trim())
        errors.push(`Question ${i + 1}: Missing answer`);
    return { valid: errors.length === 0, errors };
};
const createSubjectExamination = async (req, res) => {
    let uploadedPath;
    try {
        const { classID, subjectID } = req.params;
        const { instruction, duration, mark } = req.body;
        // Log request context for diagnostics
        console.log("createSubjectExamination called", {
            classID,
            subjectID,
            duration,
            mark,
            file: req.file
                ? { originalname: req.file.originalname, size: req.file.size }
                : null,
        });
        const missing = {};
        if (!req.file)
            missing.file = true;
        if (!classID)
            missing.classID = true;
        if (!subjectID)
            missing.subjectID = true;
        if (!duration)
            missing.duration = true;
        if (!mark)
            missing.mark = true;
        if (Object.keys(missing).length > 0)
            return res
                .status(400)
                .json({ message: "Missing file or required fields", missing });
        uploadedPath = req.file.path;
        const ext = path.extname(req.file.originalname || "").toLowerCase();
        console.log("Uploaded file ext:", ext);
        // DOC legacy format (.doc) is not a zip and will fail to parse with AdmZip.
        if (ext === ".doc") {
            console.error("Legacy .doc format uploaded — please convert to .docx or CSV.");
            return res.status(400).json({
                message: "Unsupported file format: .doc. Please use .docx or .csv",
            });
        }
        const subject = await subjectModel_1.default.findById(subjectID);
        if (!subject)
            return res.status(404).json({ message: "Subject not found" });
        let questions = [];
        if (ext === ".docx" || ext === ".doc") {
            const raw = await extractRawTextFromDocx(uploadedPath);
            // Debug: log first 2000 chars to see what raw text looks like
            console.log("=== RAW DOCX TEXT (first 2000 chars) ===");
            console.log(raw.slice(0, 2000));
            console.log("=== END RAW ===");
            // Virtual splitting — same as midTestController
            let splitText = raw;
            splitText = splitText.replace(/(\S)\s*([A-E][\.\)]\s+)/g, "$1\n$2");
            splitText = splitText.replace(/([a-zA-Z!?."'>\)])\s+(\b\d+[\\.\\)]\s+)/g, "$1\n$2");
            splitText = splitText.replace(/(\S)\s*(Answer:\s*)/gi, "$1\n$2");
            splitText = splitText.replace(/(\S)\s*(Explanation:\s*)/gi, "$1\n$2");
            // Split before no-dot option letters e.g. "D bringing A convenience"
            splitText = splitText.replace(/([a-z,\.!\?])\s+([A-E]\s+[A-Z])/g, "$1\n$2");
            const lines = splitText
                .split("\n")
                .map((l) => l.trim())
                .filter(Boolean);
            let current = { images: [] };
            let options = [];
            for (const line of lines) {
                if (/^\d+[\.\)]\s/.test(line)) {
                    if (current.question) {
                        current.options = options;
                        questions.push(current);
                    }
                    current = {
                        question: line.replace(/^\d+[\.\)]\s*/, "").trim(),
                        images: [],
                    };
                    options = [];
                    const urls = extractUrlsFromText(line);
                    if (urls && urls.length > 0) {
                        const su = urls.map((u) => sanitizeUrl(u));
                        current.images = su;
                        current.url = su[0];
                    }
                }
                else if (/^[A-E][\.\)]?\s*$/.test(line)) {
                    // Lone option letter on its own line — text will be on the next line
                    options.push("");
                }
                else if (/^[A-E][\.\)]?\s+\S/.test(line)) {
                    options.push(line.replace(/^[A-E][\.\)]?\s+/, "").trim());
                }
                else if (/^Answer:/i.test(line)) {
                    current.answer = line.replace(/^Answer:\s*/i, "").replace(/<\/?(?:b|i|u)>/gi, "").trim();
                }
                else if (current.question && options.length === 0) {
                    current.question += " " + line;
                }
                else if (options.length > 0) {
                    // Fill in lone-letter placeholder or append continuation
                    if (options[options.length - 1] === "") {
                        options[options.length - 1] = line.trim();
                    }
                    else {
                        options[options.length - 1] += " " + line.trim();
                    }
                }
            }
            if (current.question) {
                current.options = options;
                questions.push(current);
            }
        }
        console.log("Parsed questions count:", questions.length);
        if (questions.length === 0) {
            console.error("No questions parsed — returning error. First 300 chars of raw: ", (await extractRawTextFromDocx(uploadedPath)).slice(0, 300));
            return res.status(400).json({
                message: "No questions parsed",
                hint: "Check file format (questions must be numbered like '1. Question').",
            });
        }
        const errors = questions
            .map((q, i) => validateQuestion(q, i))
            .flatMap((v) => (v.valid ? [] : v.errors));
        if (errors.length > 0) {
            console.error("Validation failed. Errors:", errors);
            // Include a sample troublesome question for debugging
            const invalidSamples = questions
                .map((q, i) => ({ q, i }))
                .filter((_, idx) => idx < 3)
                .map((x) => ({
                index: x.i,
                question: x.q.question,
                options: x.q.options?.length,
            }));
            return res
                .status(400)
                .json({ message: "Validation failed", errors, invalidSamples });
        }
        console.log("Creating exam with", {
            subjectID: subject._id,
            totalQuestions: questions.length,
        });
        // Fetch current term/session from the classroom so the exam can be filtered later
        const classroom = await classroomModel_1.default.findById(classID);
        // Robust school lookup
        let schoolId = classroom?.school || classroom?.schoolIDs;
        if (!schoolId && classroom?.teacherID) {
            const teacher = await staffModel_1.default.findById(classroom.teacherID);
            schoolId = teacher?.schoolIDs;
        }
        const school = await schoolModel_1.default.findById(schoolId);
        const presentTerm = classroom?.presentTerm || school?.presentTerm || "";
        const presentSession = school?.presentSession || "";
        let exam;
        try {
            exam = await examinationModel_1.default.create({
                subjectID: subject._id,
                subjectTitle: subject.subjectTitle,
                term: presentTerm,
                session: presentSession,
                quiz: {
                    instruction: { duration, mark, instruction },
                    question: questions,
                },
                totalQuestions: questions.length,
                status: "examination",
                startExam: false,
            });
        }
        catch (createErr) {
            console.error("Failed to create exam in DB:", createErr);
            return res.status(500).json({
                message: "Failed to create exam in DB",
                error: String(createErr?.message || createErr),
            });
        }
        subject.examination.push(exam._id);
        await subject.save();
        return res.status(201).json({
            message: "Exam created successfully!",
            questionsImported: questions.length,
            data: exam,
        });
    }
    catch (err) {
        console.error(err);
        return res
            .status(500)
            .json({ message: "Server error", error: err.message });
    }
    finally {
        if (uploadedPath && fs.existsSync(uploadedPath)) {
            setTimeout(() => fs.unlinkSync(uploadedPath), 2000);
        }
    }
};
exports.createSubjectExamination = createSubjectExamination;
