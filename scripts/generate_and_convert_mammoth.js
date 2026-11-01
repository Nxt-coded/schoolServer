const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');
const { Document, Packer, Paragraph, TextRun } = require('docx');

(async () => {
  try {
    const outDir = path.join(__dirname, 'test_docs');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({ children: [new TextRun('1. If 3^(2x) = 1/27, find the value of x.')] }),
            new Paragraph({ children: [new TextRun('A. -2')] }),
            new Paragraph({ children: [new TextRun('B. -3/2')] }),
            new Paragraph({ children: [new TextRun('C. 3/2')] }),
            new Paragraph({ children: [new TextRun('D. 2')] }),
            new Paragraph({ children: [new TextRun('Answer: -3/2')] }),
            new Paragraph({ children: [new TextRun('')] }),
            new Paragraph({ children: [new TextRun('2. Consider the chemical concentration μ = 5 × 10^-3 mol/L and constant α. What is μ + α?')] }),
            new Paragraph({ children: [new TextRun('A. 5e-3')] }),
            new Paragraph({ children: [new TextRun('B. α')] }),
            new Paragraph({ children: [new TextRun('C. μ + α')] }),
            new Paragraph({ children: [new TextRun('D. Cannot determine')] }),
            new Paragraph({ children: [new TextRun('Answer: μ + α')] }),
            new Paragraph({ children: [new TextRun('')] }),
            new Paragraph({ children: [new TextRun('3. Physics equation example: E = mc^2 (as plain text) and LaTeX example: $$E=mc^2$$')] }),
            new Paragraph({ children: [new TextRun('A. Option 1')] }),
            new Paragraph({ children: [new TextRun('B. Option 2')] }),
            new Paragraph({ children: [new TextRun('C. Option 3')] }),
            new Paragraph({ children: [new TextRun('D. Option 4')] }),
            new Paragraph({ children: [new TextRun('Answer: A')] }),
          ],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    const docxPath = path.join(outDir, 'test_science.docx');
    fs.writeFileSync(docxPath, buffer);
    console.log('Wrote', docxPath);

    const result = await mammoth.convertToHtml({ path: docxPath }, { includeEmbeddedStyleMap: true });
    console.log('\n--- MAMMOTH HTML OUTPUT ---\n');
    console.log(result.value);
    console.log('\n--- END OUTPUT ---\n');
  } catch (err) {
    console.error('Error:', err);
  }
})();
