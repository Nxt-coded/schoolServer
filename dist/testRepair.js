"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const quizParsingUtils_1 = require("./utils/quizParsingUtils");
const sampleMergedText = `
1. detention
A. DE-ten-tion B. de-ten-TION C. de-TEN-tion D. DE-TEN-tion
Answer: de-TEN-tion

21. Choose the word that is the most suitable to fill the numbered gap in the passage for Question 21: For the woman, the task of looking after the home and __21__ up the children is not easy. Although, the house may have every modern __22__, there is still much __23__ to keep her __24__ cooking, cleaning, mending, washing and ironing. If she is lucky to have a __25__ help, her task is made somehow easier. The working woman spends much of her income on beauty care. She buys a lot of __26__ and visits __27__ regularly. Most women are so occupied with the daily __28__ that they need these things to __29__ themselves up. Thus, the responsibilities of a __30__ are quite demanding and she could be so busy as to have little time for social engagements. A. taking B. pulling C. getting D. bringing
Answer: bringing

22. Choose the word that is the most suitable to fill the numbered gap in the passage... A. convenience B. necessity C. assistance D. convention
Answer: assistance
`;
console.log("--- ORIGINAL ---");
console.log(sampleMergedText);
const split = (0, quizParsingUtils_1.virtualSplit)(sampleMergedText);
console.log("\n--- AFTER VIRTUAL SPLIT ---");
console.log(split);
const questions = (0, quizParsingUtils_1.parseQuizText)(split);
console.log("\n--- PARSED JSON ---");
console.log(JSON.stringify(questions, null, 2));
if (questions.length === 3) {
    console.log("\n✅ SUCCESS: Found 3 questions.");
}
else {
    console.log(`\n❌ FAILED: Expected 3 questions, found ${questions.length}.`);
}
