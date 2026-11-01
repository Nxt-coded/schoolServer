import AdmZip from "adm-zip";
import * as path from "path";
import { uploadDataUri } from "./streamifier";

// ──────────────────────────────────────────────────────────────
// Decode XML numeric character references (&#xNNNN; and &#NNNN;)
// ──────────────────────────────────────────────────────────────
function decodeXmlEntities(text: string): string {
  let decoded = text.replace(/&#x([0-9A-Fa-f]+);/g, (_, hex) =>
    String.fromCodePoint(parseInt(hex, 16))
  );
  decoded = decoded.replace(/&#(\d+);/g, (_, dec) =>
    String.fromCodePoint(parseInt(dec, 10))
  );
  return decoded;
}

// ──────────────────────────────────────────────────────────────
// Unicode helpers for Subscript/Superscript
// ──────────────────────────────────────────────────────────────
export function toUnicodeSubscript(text: string): string {
  const map: Record<string, string> = {
    "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄",
    "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉",
    "+": "₊", "-": "₋", "=": "₌", "(": "₍", ")": "₎",
    a: "ₐ", e: "ₑ", h: "ₕ", i: "ᵢ", j: "ⱼ", k: "ₖ", l: "ₗ", m: "ₘ",
    n: "ₙ", o: "ₒ", p: "ₚ", r: "ᵣ", s: "ₛ", t: "ₜ", u: "ᵤ", v: "ᵥ", x: "ₓ",
  };
  return text.split("").map((c) => map[c.toLowerCase()] || c).join("");
}

export function toUnicodeSuperscript(text: string): string {
  const map: Record<string, string> = {
    "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
    "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
    "+": "⁺", "-": "⁻", "=": "", "(": "⁽", ")": "⁾",
    a: "ᵃ", b: "ᵇ", c: "ᶜ", d: "ᵈ", e: "ᵉ", f: "ᶠ", g: "ᵍ", h: "ʰ", i: "ⁱ", j: "ʲ", k: "ᵏ", l: "ˡ", m: "ᵐ",
    n: "ⁿ", o: "ᵒ", p: "ᵖ", r: "ʳ", s: "ˢ", t: "ᵗ", u: "ᵘ", v: "ᵛ", w: "ʷ", x: "ˣ", y: "ʸ", z: "ᶻ",
  };
  return text.split("").map((c) => map[c.toLowerCase()] || c).join("");
}

// ──────────────────────────────────────────────────────────────
// Extract DOCX → Text with Image Support
// ──────────────────────────────────────────────────────────────
export async function extractRawTextFromDocx(filePath: string): Promise<string> {
  try {
    const zip = new AdmZip(filePath);
    const documentXml = zip.readAsText("word/document.xml");
    
    let relsXml = "";
    try {
      relsXml = zip.readAsText("word/_rels/document.xml.rels");
    } catch (e) {
      relsXml = "";
    }
    
    const rels: Record<string, string> = {};
    if (relsXml) {
      const relRegex = /<Relationship[^>]*Id="([^\"]+)"[^>]*Target="([^\"]+)"/g;
      let rm;
      while ((rm = relRegex.exec(relsXml)) !== null) {
        let tgt = rm[2];
        if (tgt.startsWith("../")) tgt = tgt.replace(/^\.\.\//, "");
        rels[rm[1]] = tgt;
      }
    }

    let fullText = "";
    const paragraphs = documentXml.split(/<w:p[\s>]|<w:br[^>]*\/>/);
    
    for (const para of paragraphs) {
      if (!para.trim()) continue;
      let paraText = processParagraph(para);

      // Handle images
      const embeds = [...para.matchAll(/\br:(?:embed|id)="([^"]+)"/g)].map((m) => m[1]);
      const imageUrls: string[] = [];
      
      for (const rId of embeds) {
        try {
          const target = rels[rId];
          if (!target) continue;
          const mediaPath = `word/${target}`;
          const fileBuff = zip.readFile(mediaPath as any) as Buffer;
          if (!fileBuff) continue;
          
          const ext = path.extname(mediaPath).replace(".", "").toLowerCase();
          const mimeMap: Record<string, string> = {
            png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg",
            gif: "image/gif", svg: "image/svg+xml", webp: "image/webp", bmp: "image/bmp",
          };
          const mime = mimeMap[ext];
          if (!mime) continue;

          const dataUri = `data:${mime};base64,${fileBuff.toString("base64")}`;
          try {
            const uploadRes: any = await uploadDataUri(dataUri, "exams");
            if (uploadRes && uploadRes.secure_url) {
              imageUrls.push(uploadRes.secure_url);
            }
          } catch (uploadErr) {
            console.warn("Cloudinary upload failed for embedded image:", uploadErr);
          }
        } catch (ex) {
          console.warn("Error handling embedded image for rId", rId, ex);
        }
      }
      
      if (imageUrls.length > 0) {
        paraText += " " + imageUrls.map((u) => `[${u}]`).join(" ");
      }
      if (paraText.trim()) fullText += paraText.trim() + "\n";
    }

    let decodedText = fullText.replace(/\n\n\n+/g, "\n\n").trim();
    decodedText = decodeXmlEntities(decodedText);
    decodedText = decodedText.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, "&");
    return decodedText;
  } catch (error) {
    console.error("Error extracting DOCX:", error);
    throw error;
  }
}

function processParagraph(paraXml: string): string {
  const elements: { pos: number; content: string }[] = [];
  const runRegex = /<w:r[\s>](.*?)<\/w:r>/gs;
  let match;
  
  while ((match = runRegex.exec(paraXml)) !== null) {
    const runXml = match[1];
    const textRegex = /<w:t[^>]*>([^<]*)<\/w:t>/g;
    let tMatch;
    let runText = "";
    while ((tMatch = textRegex.exec(runXml)) !== null) {
      runText += tMatch[1];
    }

    if (runText) {
      runText = decodeXmlEntities(runText);
    }

    // Handle <w:sym> elements — Word stores special symbols (₦, −, ², etc.)
    const symRegex = /<w:sym[^>]*w:char="([0-9A-Fa-f]+)"[^>]*\/>/g;
    let symMatch;
    while ((symMatch = symRegex.exec(runXml)) !== null) {
      try {
        const codePoint = parseInt(symMatch[1], 16);
        if (codePoint > 0) {
          runText += String.fromCodePoint(codePoint);
        }
      } catch (e) {
        // Skip invalid code points
      }
    }

    if (runText) {
      if (runXml.includes('w:val="subscript"')) {
        elements.push({ pos: match.index, content: toUnicodeSubscript(runText) });
      } else if (runXml.includes('w:val="superscript"')) {
        elements.push({ pos: match.index, content: toUnicodeSuperscript(runText) });
      } else {
        let text = runText;
        const rPrMatch = runXml.match(/<w:rPr[^>]*>(.*?)<\/w:rPr>/s);
        if (rPrMatch) {
          const rPr = rPrMatch[1];
          if (/<w:u\s/.test(rPr) && !/<w:u\s[^>]*w:val="none"/.test(rPr)) text = `<u>${text}</u>`;
          if (/<w:b[\s\/]/.test(rPr) && !/<w:b\s[^>]*w:val="false"/.test(rPr)) text = `<b>${text}</b>`;
          if (/<w:i[\s\/]/.test(rPr) && !/<w:i\s[^>]*w:val="false"/.test(rPr)) text = `<i>${text}</i>`;
        }
        elements.push({ pos: match.index, content: text });
      }
    }
  }

  const mathRunRegex = /<m:oMath>(.*?)<\/m:oMath>/gs;
  while ((match = mathRunRegex.exec(paraXml)) !== null) {
    elements.push({ pos: match.index, content: processMathElement(match[1]) });
  }

  elements.sort((a, b) => a.pos - b.pos);
  return elements.map((e) => e.content).join("");
}

function processMathElement(mathXml: string): string {
  const SUPER: Record<string, string> = {
    "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
    "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
    "+": "⁺", "-": "⁻", "=": "", "(": "⁽", ")": "⁾",
    a: "ᵃ", b: "ᵇ", c: "ᶜ", d: "ᵈ", e: "ᵉ", f: "ᶠ", g: "ᵍ", h: "ʰ", i: "ⁱ", j: "ʲ", k: "ᵏ", l: "ˡ", m: "ᵐ",
    n: "ⁿ", o: "ᵒ", p: "ᵖ", r: "ʳ", s: "ˢ", t: "ᵗ", u: "ᵘ", v: "ᵛ", w: "ʷ", x: "ˣ", y: "ʸ", z: "ᶻ",
  };
  const SUB: Record<string, string> = {
    "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄",
    "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉",
    "+": "₊", "-": "₋", "=": "₌", "(": "₍", ")": "₎",
    a: "ₐ", e: "ₑ", h: "ₕ", i: "ᵢ", j: "ⱼ", k: "ₖ", l: "ₗ", m: "ₘ",
    n: "ₙ", o: "ₒ", p: "ₚ", r: "ᵣ", s: "ₛ", t: "ₜ", u: "ᵤ", v: "ᵥ", x: "ₓ",
  };

  const structures: { start: number; end: number; content: string }[] = [];
  const add = (s: { start: number; end: number; content: string }) => {
    if (structures.some((x) => !(s.end <= x.start || s.start >= x.end))) return;
    structures.push(s);
  };

  let m;
  const subSupRegex = /<m:sSubSup>(.*?)<\/m:sSubSup>/gs;
  while ((m = subSupRegex.exec(mathXml)) !== null) {
    const inner = m[1];
    const eMatch = inner.match(/<m:e>(.*?)<\/m:e>/s);
    const subMatch = inner.match(/<m:sub>(.*?)<\/m:sub>/s);
    const supMatch = inner.match(/<m:sup>(.*?)<\/m:sup>/s);
    if (eMatch && subMatch && supMatch) {
      const e = processMathElement(eMatch[1]);
      const sub = processMathElement(subMatch[1]).split("").map(c => SUB[c] || c).join("");
      const sup = processMathElement(supMatch[1]).split("").map(c => SUPER[c] || c).join("");
      add({ start: m.index, end: m.index + m[0].length, content: sup + sub + e });
    }
  }

  const subRegex = /<m:sSub>(.*?)<\/m:sSub>/gs;
  while ((m = subRegex.exec(mathXml)) !== null) {
    const inner = m[1];
    const eMatch = inner.match(/<m:e>(.*?)<\/m:e>/s);
    const subMatch = inner.match(/<m:sub>(.*?)<\/m:sub>/s);
    if (eMatch && subMatch) {
      const e = processMathElement(eMatch[1]);
      const sub = processMathElement(subMatch[1]).split("").map(c => SUB[c] || c).join("");
      add({ start: m.index, end: m.index + m[0].length, content: e + sub });
    }
  }

  const supRegex = /<m:sSup>(.*?)<\/m:sSup>/gs;
  while ((m = supRegex.exec(mathXml)) !== null) {
    const inner = m[1];
    const eMatch = inner.match(/<m:e>(.*?)<\/m:e>/s);
    const supMatch = inner.match(/<m:sup>(.*?)<\/m:sup>/s);
    if (eMatch && supMatch) {
      const e = processMathElement(eMatch[1]);
      const sup = processMathElement(supMatch[1]).split("").map(c => SUPER[c] || c).join("");
      add({ start: m.index, end: m.index + m[0].length, content: e + sup });
    }
  }

  const runRegex = /<m:r[^>]*>(.*?)<\/m:r>/gs;
  while ((m = runRegex.exec(mathXml)) !== null) {
    const inner = m[1];
    const textMatch = inner.match(/<m:t[^>]*>([^<]*)<\/m:t>/s);
    if (textMatch) {
      add({ start: m.index, end: m.index + m[0].length, content: textMatch[1] });
    }
  }

  structures.sort((a, b) => a.start - b.start);
  return structures.map(s => s.content).join("");
}
