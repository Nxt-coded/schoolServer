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
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const quizParsingUtils_1 = require("./utils/quizParsingUtils");
const docxGenerator_1 = require("./utils/docxGenerator");
const fullContent = `
1. /p/ and /b/ are___ sounds.
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

4. Select the word that has /s/ sound
A. boys
B. lose
C. loose
D. girls 

Answer: loose

5. The /z/ is a ____sound
A. voiced
B. voiceless 
C. aspirated 
D. syllabic

Answer: voiced

6. What does /p/, /t/ and /d/ have in common? They are all___sounds.
A. voiced
B. plosives 
C. fricatives 
D. alveolar 

Answer: plosives

7. From the alternatives listed A to D choose the phrasal verbs which best completes each of the following sentences: I can’t ______ his rude behavior anymore.
A. put on with
B. put up with
C. put off with
D. put in with
Answer: put up with

8. From the alternatives listed A to D choose the phrasal verbs which best completes each of the following sentences: She managed to ______ a brilliant idea for the project.
A. come up with
B. come out with
C. come off with
D. come in with

Answer: come up with

9. From the alternatives listed A to D choose the phrasal verbs which best completes each of the following sentences: The thief tried to ______ stealing the money.
A. get on with
B. get away with
C. get up with
D. get by with

Answer: get away with

10. From the alternatives listed A to D choose the phrasal verbs which best completes each of the following sentences: I am really ______ seeing you again.
A. looking up to
B. looking out for
C. looking forward to
D. looking down on

Answer: looking forward to

12. From the alternatives listed A to D choose the phrasal verbs which best completes each of the following sentences: The Government needs to ______ a solution to this problem quickly.
A. come up with
B. come down with
C. come across with
D. come over with
Answer: come up with

13. From the alternatives listed A to D choose the phrasal verbs which best completes each of the following sentences: Yetunde always tries to ______ his responsibilities.
A. get out of
B. get away with
C. get up to
D. get in with

Answer:  get out of

14. From the alternatives listed A to D choose the phrasal verbs which best completes each of the following sentences: The teacher cannot ______ the noise from the classroom.
A. put up with
B. put down with
C. put over with
D. put through with

Answer: put up with

15. From the alternatives listed A to D choose the phrasal verbs which best completes each of the following sentences: He tried to ______ his mistakes during the meeting.
A. get away with
B. get out of
C. get on with
D. get through with

Answer: get out of

16. From the alternatives listed A to D choose the phrasal verbs which best completes each of the following sentences: The company will not ______ such poor performance.
A. put up with
B. put off with
C. put down with
D. put away with

Answer: put up with
 
17. Choose the word that best complete each of the following sentences:  After he had run away from the fight, people called him a___
A. desperado 
B. dare-devil
C. coward 
D. caution 

Answer: coward

18. Choose the word that best complete each of the following sentences: The old lady ____on her son for financial support.
A. trusted 
B. depended 
C. related 
D. leaned 

Answer: depended

19. Choose the word that best complete each of the following sentences: She tried to ____the house mistress by entering the back door.
A. deflect 
B. evict 
C. refrain 
D. evade
Answer: evade

20. Choose the word that best complete each of the following sentences: Packages containing ___ goods should be well marked to prevent breakage. 
A. infirm
B. dilapidated
C. fragile 
D. durable 

Answer: fragile

              
21. In the following passage the numbered gaps indicate missing words. Against each number in the list below the passage, four choices are offered lettered A to D. For each question, choose the word that is the most suitable to fill the numbered gap 21: When you desire to erect a building, you must _21_ a plan that is _22_ both from the point of view of _23_ and that of _24_. The _25_ must be cleared thoroughly. Having decided _26_ the building _27_ to be used, the _28_ is then dug. The builder then _29_ the erection of the building. He _30_that the bricks are of the _31_ recommended by_32_builders. 
                     
A. work by 
B. work from
C. work in
D. work on

Answer: work on

22.   In the following passage the numbered gaps indicate missing words. Against each number in the list below the passage, four choices are offered lettered A to D. For each question, choose the word that is the most suitable to fill the numbered gap 22: When you desire to erect a building, you must _21_ a plan that is _22_ both from the point of view of _23_ and that of _24_. The _25_ must be cleared thoroughly. Having decided _26_ the building _27_ to be used, the _28_ is then dug. The builder then _29_ the erection of the building. He _30_that the bricks are of the _31_ recommended by_32_builders. 

A.  practicable   
B.  admirable     
C.  qualitative   
D. commendable 

Answer: practicable

23. In the following passage the numbered gaps indicate missing words. Against each number in the list below the passage, four choices are offered lettered A to D. For each question, choose the word that is the most suitable to fill the numbered gap 23:

When you desire to erect a building, you must _21_ a plan that is _22_ both from the point of view of _23_ and that of _24_. The _25_ must be cleared thoroughly. Having decided _26_ the building _27_ to be used, the _28_ is then dug. The builder then _29_ the erection of the building. He _30_that the bricks are of the _31_ recommended by_32_builders. 

A. price 
B. cost
C. amount 
D. profit 

Answer: cost

24. In the following passage the numbered gaps indicate missing words. Against each number in the list below the passage, four choices are offered lettered A to D. For each question, choose the word that is the most suitable to fill the numbered gap 24:

When you desire to erect a building, you must _21_ a plan that is _22_ both from the point of view of _23_ and that of _24_. The _25_ must be cleared thoroughly. Having decided _26_ the building _27_ to be used, the _28_ is then dug. The builder then _29_ the erection of the building. He _30_that the bricks are of the _31_ recommended by_32_builders. 

A. environs 
B. area
C. context 
D. atmosphere 

Answer: environs


25. In the following passage the numbered gaps indicate missing words. Against each number in the list below the passage, four choices are offered lettered A to D. For each question, choose the word that is the most suitable to fill the numbered gap 25:

When you desire to erect a building, you must _21_ a plan that is _22_ both from the point of view of _23_ and that of _24_. The _25_ must be cleared thoroughly. Having decided _26_ the building _27_ to be used, the _28_ is then dug. The builder then _29_ the erection of the building. He _30_that the bricks are of the _31_ recommended by_32_builders. 

A. floor
B. ground 
C. site
D. bush

Answer: site

26. In the following passage the numbered gaps indicate missing words. Against each number in the list below the passage, four choices are offered lettered A to D. For each question, choose the word that is the most suitable to fill the numbered gap 26:

When you desire to erect a building, you must _21_ a plan that is _22_ both from the point of view of _23_ and that of _24_. The _25_ must be cleared thoroughly. Having decided _26_ the building _27_ to be used, the _28_ is then dug. The builder then _29_ the erection of the building. He _30_that the bricks are of the _31_ recommended by_32_builders. 

A. with
B. on
C. under
D. for 

Answer: on

27. In the following passage the numbered gaps indicate missing words. Against each number in the list below the passage, four choices are offered lettered A to D. For each question, choose the word that is the most suitable to fill the numbered gap 27:

When you desire to erect a building, you must _21_ a plan that is _22_ both from the point of view of _23_ and that of _24_. The _25_ must be cleared thoroughly. Having decided _26_ the building _27_ to be used, the _28_ is then dug. The builder then _29_ the erection of the building. He _30_that the bricks are of the _31_ recommended by_32_builders. 

A. plans
B. gravel 
C. concrete 
D. materials 

Answer: plans

28. In the following passage the numbered gaps indicate missing words. Against each number in the list below the passage, four choices are offered lettered A to D. For each question, choose the word that is the most suitable to fill the numbered gap 28:

When you desire to erect a building, you must _21_ a plan that is _22_ both from the point of view of _23_ and that of _24_. The _25_ must be cleared thoroughly. Having decided _26_ the building _27_ to be used, the _28_ is then dug. The builder then _29_ the erection of the building. He _30_that the bricks are of the _31_ recommended by_32_builders. 

A. foundation 
B. hole
C. site
D. land

Answer: foundation

29. In the following passage the numbered gaps indicate missing words. Against each number in the list below the passage, four choices are offered lettered A to D. For each question, choose the word that is the most suitable to fill the numbered gap 29:

When you desire to erect a building, you must _21_ a plan that is _22_ both from the point of view of _23_ and that of _24_. The _25_ must be cleared thoroughly. Having decided _26_ the building _27_ to be used, the _28_ is then dug. The builder then _29_ the erection of the building. He _30_that the bricks are of the _31_ recommended by_32_builders. 

A. prepares 
B. commences 
C. prepares 
D. continues 

Answer: commences

30. In the following passage the numbered gaps indicate missing words. Against each number in the list below the passage, four choices are offered lettered A to D. For each question, choose the word that is the most suitable to fill the numbered gap 30:

When you desire to erect a building, you must _21_ a plan that is _22_ both from the point of view of _23_ and that of _24_. The _25_ must be cleared thoroughly. Having decided _26_ the building _27_ to be used, the _28_ is then dug. The builder then _29_ the erection of the building. He _30_that the bricks are of the _31_ recommended by_32_builders. 

A. assures
B. presumes 
C. ensures
D. assumes 

Answer: ensures

31. In the following passage the numbered gaps indicate missing words. Against each number in the list below the passage, four choices are offered lettered A to D. For each question, choose the word that is the most suitable to fill the numbered gap 31:

When you desire to erect a building, you must _21_ a plan that is _22_ both from the point of view of _23_ and that of _24_. The _25_ must be cleared thoroughly. Having decided _26_ the building _27_ to be used, the _28_ is then dug. The builder then _29_ the erection of the building. He _30_that the bricks are of the _31_ recommended by_32_builders. 

A. rigidity 
B. solidity 
C. flexibility 
D. standard 

Answer: standard

32. In the following passage the numbered gaps indicate missing words. Against each number in the list below the passage, four choices are offered lettered A to D. For each question, choose the word that is the most suitable to fill the numbered gap 32:

When you desire to erect a building, you must _21_ a plan that is _22_ both from the point of view of _23_ and that of _24_. The _25_ must be cleared thoroughly. Having decided _26_ the building _27_ to be used, the _28_ is then dug. The builder then _29_ the erection of the building. He _30_that the bricks are of the _31_ recommended by_32_builders. 

A. professional 
B. architectural 
C. supervisory 
D. commissioned 

Answer: professional


33. In this question, choose the option opposite in meaning to the word(s) or phrase underlined: His behaviour last night was out of character. 
A. usual 
B. untypical 
C. surprising 
D. wonderful 

Answer: usual

34. In this question, choose the option opposite in meaning to the word(s) or phrase underlined: The manager described him as an unindustrious worker.
A. a courageous 
B. a diligent 
C. a careful 
D. an intelligent 

Answer: a diligent

35. In this question, choose the option opposite in meaning to the word(s) or phrase underlined: The judge who passed the sentence was disinterested.
A. partial 
B. interested 
C. wicked 
D. fair

Answer: partial

36. In this question, choose the option opposite in meaning to the word(s) or phrase underlined: The product was given an enthusiastic reception.
A. a great
B. an indifferent 
C. a reasonable 
D. an inspiring 

Answer: an indifferent


37. In this question, choose the option nearest in meaning to the word(s) or phrase underlined:  
“Orinya was stabbed in the back, idiomatically speaking,” said Abu. 
A. wounded 
B. disillusioned 
C. dismayed 
D. betrayed 

Answer: betrayed

38. In this question, choose the option nearest in meaning to the word(s) or phrase underlined:  When the woman heard the news, she flew into an ungovernable rage. 
A. an extraordinary 
B. a noisy 
C. an unnecessary 
D. a violent 

Answer: a violent

39. In this question, choose the option nearest in meaning to the word(s) or phrase underlined:  Elelu was described as a very studious boy. 
A. bookish 
B. stubborn 
C. industrious 
D. quiet

Answer: bookish

40. In this question, choose the option nearest in meaning to the word(s) or phrase underlined:  The politician was accused of procrastinating in a very serious manner like  that. 
A.  taking sides 
B.  wasting time 
C.  prevaricating 
D.  rationalising 

Answer: wasting time
`;
console.log("Processing full text...");
const splitText = (0, quizParsingUtils_1.virtualSplit)(fullContent);
const questions = (0, quizParsingUtils_1.parseQuizText)(splitText);
console.log(`Successfully parsed \${questions.length} questions.`);
const buf = (0, docxGenerator_1.generateDocxBuffer)(questions);
const out = path.join(__dirname, "SS2 Data.docx");
fs.writeFileSync(out, buf);
console.log("SUCCESS: SS2 Data.docx has been generated at:", out);
