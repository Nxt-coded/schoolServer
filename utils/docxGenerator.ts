import * as zlib from "zlib";
import { QuizQuestion } from "./quizParsingUtils";

function escapeXml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function makeRunsFromHtml(html: string): string {
  // Tokenize by tags: <b>, </b>, <i>, </i>, <u>, </u>
  const tokens = html.split(/(<\/?(?:b|i|u)>)/gi);
  let isB = false;
  let isI = false;
  let isU = false;
  let runs = "";

  for (const token of tokens) {
    if (!token) continue;
    const tLower = token.toLowerCase();
    if (tLower === "<b>") { isB = true; continue; }
    if (tLower === "</b>") { isB = false; continue; }
    if (tLower === "<i>") { isI = true; continue; }
    if (tLower === "</i>") { isI = false; continue; }
    if (tLower === "<u>") { isU = true; continue; }
    if (tLower === "</u>") { isU = false; continue; }

    // It's text
    const textXml = escapeXml(token);
    if (!textXml) continue;
    
    let rPr = "";
    if (isB || isI || isU) {
      rPr += "<w:rPr>";
      if (isB) rPr += `<w:b/>`;
      if (isI) rPr += `<w:i/>`;
      if (isU) rPr += `<w:u w:val="single"/>`;
      rPr += "</w:rPr>";
    }
    
    runs += `<w:r>${rPr}<w:t xml:space="preserve">${textXml}</w:t></w:r>`;
  }
  return runs;
}

function makeParagraph(runsXml: string) {
  return `<w:p><w:pPr><w:spacing w:after="200"/></w:pPr>${runsXml}</w:p>`;
}

function buildBody(questions: QuizQuestion[]) {
  const LETTERS = ["A", "B", "C", "D", "E"];
  const paras: string[] = [];

  for (const q of questions) {
    const num = q.num || (questions.indexOf(q) + 1);
    const prefix = `${num}. `;
    
    paras.push(makeParagraph(makeRunsFromHtml(prefix + q.question)));

    // Options
    q.options.forEach((opt, i) => {
      if (opt.trim()) {
        paras.push(makeParagraph(makeRunsFromHtml(`${LETTERS[i]}. ${opt}`)));
      }
    });

    // Answer
    if (q.answer) {
      paras.push(makeParagraph(makeRunsFromHtml(`Answer: ${q.answer}`)));
    }
    
    // Explanation
    if (q.explanation) {
      paras.push(makeParagraph(makeRunsFromHtml(`Explanation: ${q.explanation}`)));
    }

    // Separator
    paras.push(makeParagraph(makeRunsFromHtml("")));
  }

  return paras.join("\n");
}

function buildDocumentXml(questions: QuizQuestion[]) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
${buildBody(questions)}
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/>
    </w:sectPr>
  </w:body>
</w:document>`;
}

// ── ZIP BUILDER (Manual) ────────────────────────────────────────

function crc32(buf: Buffer): number {
  let crc = 0xffffffff;
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c;
  }
  for (const b of buf) crc = table[(crc ^ b) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function writeUint16LE(buf: Buffer, offset: number, val: number) {
  buf[offset] = val & 0xff;
  buf[offset + 1] = (val >> 8) & 0xff;
}

function writeUint32LE(buf: Buffer, offset: number, val: number) {
  buf[offset] = val & 0xff;
  buf[offset + 1] = (val >> 8) & 0xff;
  buf[offset + 2] = (val >> 16) & 0xff;
  buf[offset + 3] = (val >> 24) & 0xff;
}

function buildZip(files: { name: string; data: Buffer }[]): Buffer {
  const localHeaders: any[] = [];
  let offset = 0;
  const parts: Buffer[] = [];

  for (const file of files) {
    const nameBytes = Buffer.from(file.name, "utf8");
    const compressed = zlib.deflateRawSync(file.data, { level: 6 });
    const crc = crc32(file.data);

    const lh = Buffer.alloc(30 + nameBytes.length);
    writeUint32LE(lh, 0, 0x04034b50);
    writeUint16LE(lh, 4, 20);
    writeUint16LE(lh, 6, 0);
    writeUint16LE(lh, 8, 8);
    writeUint16LE(lh, 10, 0);
    writeUint16LE(lh, 12, 0);
    writeUint32LE(lh, 14, crc);
    writeUint32LE(lh, 18, compressed.length);
    writeUint32LE(lh, 22, file.data.length);
    writeUint16LE(lh, 26, nameBytes.length);
    writeUint16LE(lh, 28, 0);
    nameBytes.copy(lh, 30);

    localHeaders.push({ name: nameBytes, crc, compressed, uncompressed: file.data.length, offset });
    offset += lh.length + compressed.length;
    parts.push(lh, compressed);
  }

  const cdParts: Buffer[] = [];
  let cdSize = 0;
  for (const lh of localHeaders) {
    const cd = Buffer.alloc(46 + lh.name.length);
    writeUint32LE(cd, 0, 0x02014b50);
    writeUint16LE(cd, 4, 20);
    writeUint16LE(cd, 6, 20);
    writeUint16LE(cd, 8, 0);
    writeUint16LE(cd, 10, 8);
    writeUint16LE(cd, 12, 0);
    writeUint16LE(cd, 14, 0);
    writeUint32LE(cd, 16, lh.crc);
    writeUint32LE(cd, 20, lh.compressed.length);
    writeUint32LE(cd, 24, lh.uncompressed);
    writeUint16LE(cd, 28, lh.name.length);
    writeUint16LE(cd, 30, 0);
    writeUint16LE(cd, 32, 0);
    writeUint16LE(cd, 34, 0);
    writeUint16LE(cd, 36, 0);
    writeUint32LE(cd, 38, 0);
    writeUint32LE(cd, 42, lh.offset);
    lh.name.copy(cd, 46);
    cdParts.push(cd);
    cdSize += cd.length;
  }

  const eocd = Buffer.alloc(22);
  writeUint32LE(eocd, 0, 0x06054b50);
  writeUint16LE(eocd, 4, 0);
  writeUint16LE(eocd, 6, 0);
  writeUint16LE(eocd, 8, localHeaders.length);
  writeUint16LE(eocd, 10, localHeaders.length);
  writeUint32LE(eocd, 12, cdSize);
  writeUint32LE(eocd, 16, offset);
  writeUint16LE(eocd, 20, 0);

  return Buffer.concat([...parts, ...cdParts, eocd]);
}

export function generateDocxBuffer(questions: QuizQuestion[]): Buffer {
  const documentXml = buildDocumentXml(questions);
  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`;
  const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`;

  return buildZip([
    { name: "[Content_Types].xml", data: Buffer.from(contentTypes, "utf8") },
    { name: "_rels/.rels", data: Buffer.from(rels, "utf8") },
    { name: "word/document.xml", data: Buffer.from(documentXml, "utf8") },
  ]);
}
