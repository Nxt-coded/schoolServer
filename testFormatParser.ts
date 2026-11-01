function processParagraph(paraXml: string): string {
  const elements: { pos: number; content: string }[] = [];

  const textRunRegex = /<w:r(?: [^>]*)?>(.*?)<\/w:r>/gs;
  let match;
  while ((match = textRunRegex.exec(paraXml)) !== null) {
    if (!match[0].includes("<m:oMath") && !match[0].includes("<w:vertAlign")) {
      const rInner = match[1];
      let txtMatch = rInner.match(/<w:t(?: [^>]*)?>([^<]*)<\/w:t>/);
      if (txtMatch) {
        let text = txtMatch[1];
        if (text) {
          if (rInner.includes("<w:u ") || rInner.includes("<w:u/>")) text = `<u>${text}</u>`;
          if (rInner.includes("<w:b/>") || rInner.includes("<w:b ")) text = `<b>${text}</b>`;
          if (rInner.includes("<w:i/>") || rInner.includes("<w:i ")) text = `<i>${text}</i>`;
          elements.push({ pos: match.index, content: text });
        }
      }
    }
  }
  
  return elements.sort((a, b) => a.pos - b.pos).map(e => e.content).join('');
}

const testXml = `<w:r><w:rPr><w:u w:val="single"/></w:rPr><w:t>seldom</w:t></w:r>`;
console.log(processParagraph(testXml));

const testXml2 = `<w:p>
  <w:r><w:t>8. </w:t></w:r>
  <w:r><w:t>“You met him at home?”</w:t></w:r>
  <w:r><w:t xml:space="preserve"> This expression uses the ____ tone.</w:t></w:r>
</w:p>`;
console.log(processParagraph(testXml2));
