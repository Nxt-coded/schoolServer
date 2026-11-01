const fs=require("fs"),path=require("path"),zlib=require("zlib");
const P="For the woman, the task of looking after the home and __21__ up the children is not easy. Although, the house may have every modern __22__, there is still much __23__ to keep her __24__ cooking, cleaning, mending, washing and ironing. If she is lucky to have a __25__ help, her task is made somehow easier. The working woman spends much of her income on beauty care. She buys a lot of __26__ and visits __27__ regularly. Most women are so occupied with the daily __28__ that they need these things to __29__ themselves up. Thus, the responsibilities of a __30__ are quite demanding and she could be so busy as to have little time for social engagements.";
const C=n=>`Choose the word most suitable to fill the numbered gap in the passage for Question ${n}: ${P}`;
const Q=[
[1,"detention",["DE-ten-tion","de-ten-TION","de-TEN-tion","DE-TEN-tion"],"de-TEN-tion",null],
[2,"Juliet seldom comes to school. The underlined word is a/an____",["preposition","adjective","adverb","article"],"adverb","seldom"],
[3,"duplicate",["DU-pli-cate","du-PLI-cate","dU-pli-cate","du-pli-CATE"],"DU-pli-cate",null],
[4,"legible",["le-GI-ble","LE-gi-ble","le-GI-BLE","le-gi-bLE"],"LE-gi-ble",null],
[5,"Choose the word or group of words which best completes each sentence: ___her parents died when she was about to leave secondary school, Sade still managed to educate herself",["Despite","Although","Since","However"],"Although",null],
[6,"Choose the word or group of words which best completes each sentence: ___you asked so nicely, you may type up the report on the group project",["So","After","Although","Because"],"Because",null],
[7,"Choose the word or group of words which best completes each sentence: ____Yetunde visited Akeem, she called to know if he was at the office",["So that","Until","If","Before"],"Before",null],
[8,"Choose the word or group of words which best completes each sentence: ____Paul had studied hard, he would not have failed his exam",["Although","Unless","If","Until"],"If",null],
[9,"Choose the word or group of words which best completes each sentence: The Assistant Secretary had to be replaced ____she was not suitable for the position",["although","but","so that","since"],"since",null],
[10,"Which of these words introduces a subordinate clause?",["so","ever since","between","however"],"ever since",null],
[11,"Identify the main clause in this sentence: I feel as if I have lost my place in the family because my little brother has moved into my room at home",["I feel","I have lost my place","because my little brother has moved into my room at home","as if I have lost my place in the family"],"I feel",null],
[12,"I need some____ to complete the assignment",["informations","information","inform","informs"],"information",null],
[13,"Ade bought a piece of ___",["furnitures","furnishes","furniture","furnisure"],"furniture",null],
[14,"I borrowed an___ from the library",["enclopedia","encyclopedia","encyclopedea","enciclopedia"],"encyclopedia",null],
[15,"The doctor gave her good ____",["advices","advice","advise","advising"],"advice",null],
[16,"The hotel provided comfortable ___ for guests",["accommodation","acommodation","acommodasion","accomodation"],"accommodation",null],
[17,"A___ of lions was seen in the field",["herd","pride","flock","team"],"pride",null],
[18,"The police arrested a___ of thieves",["pack","bunch","gang","group"],"gang",null],
[19,"The tone used in a semi-formal letter is ___",["intimate","strict","chatty","polite and respectful"],"polite and respectful",null],
[20,"A purpose for writing a semi-formal letter is to____",["tell stories","entertain","give updates","make a request"],"make a request",null],
[21,"The semi-formal letter does not use___",["standard language","idioms","polite tone","courteous language"],"idioms",null],
[22,C(22),["taking","pulling","getting","bringing"],"bringing",null],
[23,C(23),["convenience","necessity","assistance","convention"],"assistance",null],
[24,C(24),["thing","engagement","work","labour"],"work",null],
[25,C(25),["tied","busy","alert","ready"],"busy",null],
[26,C(26),["willing","fraternal","matrimonial","domestic"],"domestic",null],
[27,C(27),["decorations","condiments","ornaments","cosmetics"],"cosmetics",null],
[28,C(28),["saloon","shop","store","salon"],"salon",null],
[29,C(29),["events","chores","needs","requirement"],"chores",null],
[30,C(30),["smile","encourage","cheer","laugh"],"cheer",null],
[31,C(31),["housemaids","housemistress","householder","housewife"],"housewife",null],
[32,"Choose the word or group of words nearest in meaning to the underlined expression: The governor's orders are imperative",["authoritative","genuine","optional","lenient"],"authoritative","imperative"],
[33,"Choose the word or group of words nearest in meaning to the underlined expression: The lawyer's argument of the case was exhaustive",["thorough","interesting","exaggerating","fascinating"],"thorough","exhaustive"],
[34,"Choose the word or group of words nearest in meaning to the underlined expression: The superintendent was appalled by the attitude of some of the employees towards their work",["shocked","disappointed","annoyed","provoked"],"disappointed","appalled"],
[35,"Choose the word or group of words nearest in meaning to the underlined expression: Death is inevitable for man",["unavoidable","essential","necessary","immortable"],"unavoidable","inevitable"],
[36,"Choose the word or group of words nearest in meaning to the underlined expression: The decision taken by the panel is irrevocable",["irreversible","unexpected","irresponsible","acceptable"],"irreversible","irrevocable"],
[37,"Samuel's idea of healthy eating is to have a double cheeseburger without putting any salt on it. The purpose of this sentence is ___",["entertain","persuade","inform","soliloquy"],"entertain",null],
[38,"I think Tina Turner is a terrific role model for anyone who thinks he or she cannot overcome obstacles early in life. Turner grew up in poverty, survived an abusive marriage, and dealt with dishonest business associates early in her career. Many people might have just given in at any point along the way. But Turner had the determination and inner strength to go it alone. The tone of this passage is __",["caring","admiring","critical","pessimistic"],"admiring",null],
[39,"Choose the word opposite in meaning to the underlined word: A gully, which is a natural phenomenon could not be mistaken for a tunnel which is ___",["artificial","false","imitative","modern"],"artificial","natural phenomenon"],
[40,"Choose the word opposite in meaning to the underlined word: Although he is usually well-informed about most events in the town, he seemed to be ___ of the recent developments",["innocent","disinterested","ignorant","misinformed"],"ignorant","well-informed"],
[41,"Choose the word opposite in meaning to the underlined word: Although the building itself was quite ancient, the interior turned out to be very ___",["recent","fashionable","contemporary","modern"],"modern","ancient"],
];
function x(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}
function run(t,u=false){const r=u?`<w:rPr><w:u w:val="single"/></w:rPr>`:"";return`<w:r>${r}<w:t xml:space="preserve">${x(t)}</w:t></w:r>`}
function para(runs){return`<w:p><w:pPr><w:spacing w:after="0"/></w:pPr>${runs.join("")}</w:p>`}
const L=["A","B","C","D"];
const paras=[];
for(const[num,q,opts,ans,ul]of Q){
  const pre=`${num}. `;
  if(ul&&q.includes(ul)){const i=q.indexOf(ul);paras.push(para([run(pre+q.slice(0,i)),run(ul,true),run(q.slice(i+ul.length))]))}
  else paras.push(para([run(pre+q)]));
  opts.forEach((o,i)=>paras.push(para([run(`${L[i]}. ${o}`)])));
  paras.push(para([run(`Answer: ${ans}`)]));
  paras.push(para([run("")]));
}
const docXml=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><w:body>${paras.join("")}<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr></w:body></w:document>`;
const ct=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`;
const rels=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`;
const wrels=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>`;
function crc32(b){let c=0xFFFFFFFF;const t=new Uint32Array(256);for(let i=0;i<256;i++){let v=i;for(let j=0;j<8;j++)v=(v&1)?(0xEDB88320^(v>>>1)):(v>>>1);t[i]=v}for(const byte of b)c=t[(c^byte)&0xFF]^(c>>>8);return(c^0xFFFFFFFF)>>>0}
function u16(b,o,v){b[o]=v&255;b[o+1]=(v>>8)&255}
function u32(b,o,v){b[o]=v&255;b[o+1]=(v>>8)&255;b[o+2]=(v>>16)&255;b[o+3]=(v>>24)&255}
function zip(files){const lhs=[],parts=[];let off=0;for(const f of files){const nb=Buffer.from(f.name,"utf8"),comp=zlib.deflateRawSync(f.data,{level:6}),crc=crc32(f.data),lh=Buffer.alloc(30+nb.length);u32(lh,0,0x04034B50);u16(lh,4,20);u16(lh,6,0);u16(lh,8,8);u16(lh,10,0);u16(lh,12,0);u32(lh,14,crc);u32(lh,18,comp.length);u32(lh,22,f.data.length);u16(lh,26,nb.length);u16(lh,28,0);nb.copy(lh,30);lhs.push({nb,crc,comp,ul:f.data.length,off});off+=lh.length+comp.length;parts.push(lh,comp)}
const cdp=[];let cds=0;for(const lh of lhs){const cd=Buffer.alloc(46+lh.nb.length);u32(cd,0,0x02014B50);u16(cd,4,20);u16(cd,6,20);u16(cd,8,0);u16(cd,10,8);u16(cd,12,0);u16(cd,14,0);u32(cd,16,lh.crc);u32(cd,20,lh.comp.length);u32(cd,24,lh.ul);u16(cd,28,lh.nb.length);u16(cd,30,0);u16(cd,32,0);u16(cd,34,0);u16(cd,36,0);u32(cd,38,0);u32(cd,42,lh.off);lh.nb.copy(cd,46);cdp.push(cd);cds+=cd.length}
const eo=Buffer.alloc(22);u32(eo,0,0x06054B50);u16(eo,4,0);u16(eo,6,0);u16(eo,8,lhs.length);u16(eo,10,lhs.length);u32(eo,12,cds);u32(eo,16,off);u16(eo,20,0);return Buffer.concat([...parts,...cdp,eo])}
const buf=zip([
  {name:"[Content_Types].xml",data:Buffer.from(ct,"utf8")},
  {name:"_rels/.rels",data:Buffer.from(rels,"utf8")},
  {name:"word/_rels/document.xml.rels",data:Buffer.from(wrels,"utf8")},
  {name:"word/document.xml",data:Buffer.from(docXml,"utf8")},
]);
const out=path.join(__dirname,"SS2 English file.docx");
fs.writeFileSync(out,buf);
console.log("Done! File saved to:",out);
