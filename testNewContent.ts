import { virtualSplit, parseQuizText } from "./utils/quizParsingUtils";

const testContent = `
1. /p/ and /b/ are___sounds.
A. fricatives 
B. nasal
C. plosives
D. glottal 

Answer: plosives

2. The additional puff of air in the production of /p/ is called ____
A. explosion 
B. air
C. aspiration 
D. friction 

Answer: aspiration

3. /t/ and /d/ are produced with the tip of the tongue touching the____
A. lip
B. vellum 
C. alveolar ridge
D. hard palate 

Answer: alveolar ridge
`;

console.log("--- ORIGINAL TEXT ---");
console.log(testContent.trim());

const splitText = virtualSplit(testContent);
console.log("\n--- AFTER VIRTUAL SPLIT ---");
console.log(splitText.trim());

const parsed = parseQuizText(splitText);
console.log("\n--- PARSED JSON ---");
console.log(JSON.stringify(parsed, null, 2));

if (parsed.length === 3) {
  console.log("\n✅ SUCCESS: Found 3 questions.");
} else {
  console.log(`\n❌ FAILED: Expected 3 questions, found ${parsed.length}.`);
}
