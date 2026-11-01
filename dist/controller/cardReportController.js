"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClassReportCards = exports.deleteReportCardEntry = exports.removeSubjectFromResult = exports.studentPsychoReport = exports.studentMidReportRemark = exports.studentReportRemark = exports.adminMidReportRemark = exports.classTeacherMidReportRemark = exports.classTeacherReportRemark = exports.adminReportRemark = exports.classTeacherPhychoReportRemark = exports.updateReportScores = exports.createMidReportCardEntry = exports.createReportCardEntry = void 0;
const staffModel_1 = __importDefault(require("../model/staffModel"));
const subjectModel_1 = __importDefault(require("../model/subjectModel"));
const mongoose_1 = require("mongoose");
const cardReportModel_1 = __importDefault(require("../model/cardReportModel"));
const studentModel_1 = __importDefault(require("../model/studentModel"));
const schoolModel_1 = __importDefault(require("../model/schoolModel"));
const classroomModel_1 = __importDefault(require("../model/classroomModel"));
const midReportCardModel_1 = __importDefault(require("../model/midReportCardModel"));
const studentHistoricalResultModel_1 = __importDefault(require("../model/studentHistoricalResultModel"));
// export const createReportCardEntry = async (
//   req: Request,
//   res: Response
// ): Promise<Response> => {
//   try {
//     const { teacherID, studentID } = req.params;
//     const {
//       subject,
//       test1 = 0,
//       test2 = 0,
//       test3 = 0,
//       test4 = 0,
//       exam = 0,
//     } = req.body;
//     const teacher = await staffModel.findById(teacherID);
//     const school: any = await schoolModel
//       .findById(teacher?.schoolIDs)
//       .populate({
//         path: "session",
//         options: {
//           sort: {
//             createdAt: -1,
//           },
//         },
//       });
//     const student: any = await studentModel.findById(studentID).populate({
//       path: "reportCard",
//     });
//     const subjectData = await subjectModel.findOne({ subjectTitle: subject });
//     const studentCheck = student?.reportCard.some((el: any) => {
//       return (
//         el.classInfo ===
//         `${
//           student?.classAssigned
//         } session: ${school?.presentSession!}(${school?.presentTerm!})`
//       );
//     });
//     // presentSession;
//     if (teacher && student) {
//       if (studentCheck) {
//         console.log("Awesome!!");
//         const getReportSubject: any = await studentModel
//           .findById(studentID)
//           .populate({
//             path: "reportCard",
//           });
//         const getData: any = getReportSubject?.reportCard?.find((el: any) => {
//           return (
//             el.classInfo ===
//             `${
//               student?.classAssigned
//             } session: ${school?.presentSession!}(${school?.presentTerm!})`
//           );
//         });
//         const data = getReportSubject?.reportCard?.find((el: any) => {
//           return el.result.find((el: any) => {
//             return el.subject === subject;
//           });
//         });
//         const dataFIle = getReportSubject?.reportCard?.find((el: any) => {
//           return el.result.find((el: any) => {
//             return el.subject === subject;
//           });
//         });
//         const read = dataFIle?.result.find((el: any) => {
//           return el.subject === subject;
//         });
//         if (data) {
//           let x1 = 0;
//           let x2 = 0;
//           let x3 = 0;
//           let x4 = !test4 ? read?.test4 : test4 ? test4 : 0;
//           let x5 = !exam ? read?.exam : exam ? exam : 0;
//           let y1 = 0;
//           let y2 = 0;
//           let y3 = 0;
//           let y4 = x4 !== null ? x4 : 0;
//           let y5 = x5 !== null ? x5 : 0;
//           let mark = y1 + y2 + y3 + y4 + y5;
//           let myTest1: number;
//           let myTest2: number;
//           let myTest3: number;
//           let myTest4: number;
//           let examination: number;
//           let w1 = x1 !== 0 ? (myTest1 = 10) : 0;
//           let w2 = x2 !== 0 ? (myTest2 = 10) : 0;
//           let w3 = x3 !== 0 ? (myTest3 = 10) : 0;
//           let w4 = x4 !== 0 ? (myTest4 = 10) : 0;
//           let w5 = x5 !== 0 ? (examination = 60) : 0;
//           let score = w1 + w2 + w3 + w4 + w5;
//           let updated = getData.result.filter((el: any) => {
//             return el.subject !== subject;
//           });
//           const report: any = await cardReportModel.findByIdAndUpdate(
//             getData?._id,
//             {
//               result: [
//                 ...updated,
//                 {
//                   subject: !subject ? read?.subject : subject,
//                   test1: 0,
//                   test2: 0,
//                   test3: 0,
//                   test4: y4,
//                   exam: y5,
//                   mark,
//                   score: y1 > 10 ? (y5 ? 60 : 0) + (y1 ? 40 : 0) : score,
//                   points: mark,
//                   // y1 > 10
//                   //   ? parseFloat(((mark / score) * 100).toFixed(2))
//                   //   : parseFloat(((mark / score) * 100).toFixed(2)),
//                   grade:
//                     mark >= 0 && mark <= 39
//                       ? "F9"
//                       : mark >= 39 && mark <= 44
//                       ? "E8"
//                       : mark >= 44 && mark <= 49
//                       ? "D7"
//                       : mark >= 49 && mark <= 54
//                       ? "C6"
//                       : mark >= 54 && mark <= 59
//                       ? "C5"
//                       : mark >= 59 && mark <= 64
//                       ? "C4"
//                       : mark >= 64 && mark <= 69
//                       ? "B3"
//                       : mark >= 69 && mark <= 74
//                       ? "B2"
//                       : mark >= 74 && mark <= 100
//                       ? "A1"
//                       : null,
//                 },
//               ],
//             },
//             { new: true }
//           );
//           let genPoint = parseFloat(
//             (
//               report?.result
//                 ?.map((el: any) => {
//                   return el.points;
//                 })
//                 .reduce((a: number, b: number) => {
//                   return a + b;
//                 }, 0) / report?.result?.length!
//             ).toFixed(2)
//           );
//           let grade =
//             genPoint >= 0 && genPoint <= 39
//               ? "F9"
//               : genPoint >= 39 && genPoint <= 44
//               ? "E8"
//               : genPoint >= 44 && genPoint <= 49
//               ? "D7"
//               : genPoint >= 49 && genPoint <= 54
//               ? "C6"
//               : genPoint >= 54 && genPoint <= 59
//               ? "C5"
//               : genPoint >= 59 && genPoint <= 64
//               ? "C4"
//               : genPoint >= 64 && genPoint <= 69
//               ? "B3"
//               : genPoint >= 69 && genPoint <= 74
//               ? "B2"
//               : genPoint >= 74 && genPoint <= 100
//               ? "A1"
//               : null;
//           let x =
//             genPoint >= 0 && genPoint <= 5
//               ? "This is a very poor result."
//               : genPoint >= 6 && genPoint <= 11
//               ? "This result is poor; it's not satisfactory."
//               : genPoint >= 11 && genPoint <= 15
//               ? "Below average; needs significant improvement."
//               : genPoint >= 16 && genPoint <= 21
//               ? "Below average; more effort required."
//               : genPoint >= 21 && genPoint <= 25
//               ? "Fair but not satisfactory; strive harder."
//               : genPoint >= 26 && genPoint <= 31
//               ? "Fair performance; potential for improvement."
//               : genPoint >= 31 && genPoint <= 35
//               ? "Average; a steady effort is needed."
//               : genPoint >= 36 && genPoint <= 41
//               ? "Average; showing gradual improvement."
//               : genPoint >= 41 && genPoint <= 45
//               ? "Slightly above average; keep it up."
//               : genPoint >= 46 && genPoint <= 51
//               ? "Decent work; shows potential."
//               : genPoint >= 51 && genPoint <= 55
//               ? "Passable; satisfactory effort."
//               : genPoint >= 56 && genPoint <= 61
//               ? "Satisfactory; good progress."
//               : genPoint >= 61 && genPoint <= 65
//               ? "Good work; keep striving for excellence."
//               : genPoint >= 66 && genPoint <= 71
//               ? "Commendable effort; very good."
//               : genPoint >= 71 && genPoint <= 75
//               ? "Very good; consistent effort is visible."
//               : genPoint >= 76 && genPoint <= 81
//               ? "Excellent performance; well done!"
//               : genPoint >= 81 && genPoint <= 85
//               ? "Exceptional result; keep up the great work!"
//               : genPoint >= 86 && genPoint <= 91
//               ? "Outstanding achievement; impressive work!"
//               : genPoint >= 91 && genPoint <= 95
//               ? "Brilliant performance; you’re a star!"
//               : genPoint >= 96 && genPoint <= 100
//               ? "Outstanding achievement; impressive work!"
//               : ``;
//           let xx =
//             genPoint >= 0 && genPoint <= 5
//               ? "The submission demonstrates a lack of understanding of the topic. Please see me for guidance"
//               : genPoint >= 6 && genPoint <= 11
//               ? "Very minimal effort is evident in the work. It's essential to review the material thoroughly."
//               : genPoint >= 11 && genPoint <= 15
//               ? "This effort does not meet the basic requirements. Please focus on the foundational concepts."
//               : genPoint >= 16 && genPoint <= 21
//               ? "The response is incomplete and lacks critical understanding. Improvement is needed in future submissions."
//               : genPoint >= 21 && genPoint <= 25
//               ? "Some attempt is evident, but significant gaps in understanding remain. More effort is required."
//               : genPoint >= 26 && genPoint <= 31
//               ? "The work shows minimal understanding of the topic. Focus on building your foundational knowledge."
//               : genPoint >= 31 && genPoint <= 35
//               ? "A basic attempt is made, but it falls short of expectations. Review the feedback to improve"
//               : genPoint >= 36 && genPoint <= 41
//               ? "You are starting to grasp the material, but more depth and accuracy are needed."
//               : genPoint >= 41 && genPoint <= 45
//               ? "An acceptable effort, but there is room for improvement in clarity and depth"
//               : genPoint >= 46 && genPoint <= 51
//               ? "Some understanding is demonstrated, but key concepts are missing or incorrect."
//               : genPoint >= 51 && genPoint <= 55
//               ? "You are making progress but need to develop your analysis further to meet the standard"
//               : genPoint >= 56 && genPoint <= 61
//               ? "A decent attempt that meets some expectations but lacks polish and depth in certain areas"
//               : genPoint >= 61 && genPoint <= 65
//               ? "Good work; keep striving for excellence."
//               : genPoint >= 66 && genPoint <= 71
//               ? "A solid understanding is evident, though there are areas to refine."
//               : genPoint >= 71 && genPoint <= 75
//               ? "This work meets expectations and demonstrates clear effort. Great job, but there's room for more depth."
//               : genPoint >= 76 && genPoint <= 81
//               ? "Strong work overall! A little more attention to detail could make it exceptional!"
//               : genPoint >= 81 && genPoint <= 85
//               ? "Well done! You have a good grasp of the material. Aim for more critical analysis next time!"
//               : genPoint >= 86 && genPoint <= 91
//               ? "Excellent work! You’ve exceeded expectations. Keep up the fantastic effort!"
//               : genPoint >= 91 && genPoint <= 95
//               ? "Outstanding! Your understanding and presentation are impressive. A near-perfect submission!"
//               : genPoint >= 96 && genPoint <= 100
//               ? "Perfect! Flawless work that reflects deep understanding and careful attention to detail. Congratulation!"
//               : ``;
//           let nice = await cardReportModel.findByIdAndUpdate(
//             report?.id,
//             {
//               points: genPoint,
//               adminComment: x,
//               classTeacherComment: xx,
//               grade,
//             },
//             { new: true }
//           );
//           return res.status(201).json({
//             message: "teacher updated report successfully",
//             data: nice,
//             status: 201,
//           });
//         } else {
//           let x1 = 0;
//           let x2 = 0;
//           let x3 = 0;
//           let x4 = !test4 ? read?.test4 : test4 ? test4 : 0;
//           let x5 = !exam ? read?.exam : exam ? exam : 0;
//           let y1 = 0;
//           let y2 = 0;
//           let y3 = 0;
//           let y4 = x4 !== null ? x4 : 0;
//           let y5 = x5 !== null ? x5 : 0;
//           let mark = y1 + y2 + y3 + y4 + y5;
//           let myTest1: number;
//           let myTest2: number;
//           let myTest3: number;
//           let myTest4: number;
//           let examination: number;
//           let w1 = x1 !== 0 ? (myTest1 = 10) : 0;
//           let w2 = x2 !== 0 ? (myTest2 = 10) : 0;
//           let w3 = x3 !== 0 ? (myTest3 = 10) : 0;
//           let w4 = x4 !== 0 ? (myTest4 = 10) : 0;
//           let w5 = x5 !== 0 ? (examination = 60) : 0;
//           let score = w1 + w2 + w3 + w4 + w5;
//           const report = await cardReportModel.findByIdAndUpdate(
//             getData?._id,
//             {
//               result: [
//                 ...getData.result,
//                 {
//                   subject: !subject ? read?.subject : subject,
//                   test1: y1,
//                   test2: y2,
//                   test3: y3,
//                   test4: y4,
//                   exam: y5,
//                   mark,
//                   score: y1 > 10 ? (y5 ? 60 : 0) + (y1 ? 40 : 0) : score,
//                   points:
//                     y1 > 10
//                       ? parseFloat(((mark / score) * 100).toFixed(2))
//                       : parseFloat(((mark / score) * 100).toFixed(2)),
//                   grade:
//                     mark >= 0 && mark <= 39
//                       ? "F9"
//                       : mark >= 39 && mark <= 44
//                       ? "E8"
//                       : mark >= 44 && mark <= 49
//                       ? "D7"
//                       : mark >= 49 && mark <= 54
//                       ? "C6"
//                       : mark >= 54 && mark <= 59
//                       ? "C5"
//                       : mark >= 59 && mark <= 64
//                       ? "C4"
//                       : mark >= 64 && mark <= 69
//                       ? "B3"
//                       : mark >= 69 && mark <= 74
//                       ? "B2"
//                       : mark >= 74 && mark <= 100
//                       ? "A1"
//                       : null,
//                 },
//               ],
//             },
//             { new: true }
//           );
//           let genPoint = parseFloat(
//             (
//               report?.result
//                 ?.map((el: any) => {
//                   return el.points;
//                 })
//                 .reduce((a: number, b: number) => {
//                   return a + b;
//                 }, 0) / report?.result?.length!
//             ).toFixed(2)
//           );
//           let grade =
//             genPoint >= 0 && genPoint <= 39
//               ? "F9"
//               : genPoint >= 39 && genPoint <= 44
//               ? "E8"
//               : genPoint >= 44 && genPoint <= 49
//               ? "D7"
//               : genPoint >= 49 && genPoint <= 54
//               ? "C6"
//               : genPoint >= 54 && genPoint <= 59
//               ? "C5"
//               : genPoint >= 59 && genPoint <= 64
//               ? "C4"
//               : genPoint >= 64 && genPoint <= 69
//               ? "B3"
//               : genPoint >= 69 && genPoint <= 74
//               ? "B2"
//               : genPoint >= 74 && genPoint <= 100
//               ? "A1"
//               : null;
//           let nice = await cardReportModel.findByIdAndUpdate(
//             report?.id,
//             {
//               points: genPoint,
//               grade,
//             },
//             { new: true }
//           );
//           return res.status(201).json({
//             message: "can't report entry created successfully",
//             data: nice,
//             status: 201,
//           });
//         }
//       } else {
//         const report = await cardReportModel.create({
//           result: [
//             {
//               subject,
//               test1: 0,
//               test2: 0,
//               test3: 0,
//               test4,
//               exam,
//             },
//           ],
//           classInfo: `${
//             student?.classAssigned
//           } session: ${school?.presentSession!}(${school?.presentTerm!})`,
//           studentID,
//         });
//         let genPoint = parseFloat(
//           (
//             report?.result
//               ?.map((el: any) => {
//                 return el.points;
//               })
//               .reduce((a: number, b: number) => {
//                 return a + b;
//               }, 0) / report?.result?.length!
//           ).toFixed(2)
//         );
//         let numb = [test1, test2, test3, test4, exam];
//         let count = 0;
//         let resultNumb = 0;
//         let resultNumbAva = 0;
//         for (let i = 0; i < numb.length; i++) {
//           if (numb[i] > 0) {
//             resultNumb += numb[i];
//             count++;
//           }
//         }
//         resultNumbAva = resultNumb / count;
//         let grade =
//           genPoint >= 0 && genPoint <= 39
//             ? "F"
//             : genPoint >= 40 && genPoint <= 49
//             ? "E"
//             : genPoint >= 50 && genPoint <= 59
//             ? "D"
//             : genPoint >= 60 && genPoint <= 69
//             ? "C"
//             : genPoint >= 70 && genPoint <= 79
//             ? "B"
//             : genPoint >= 80 && genPoint <= 100
//             ? "A"
//             : null;
//         const nice = await cardReportModel.findByIdAndUpdate(
//           report?.id,
//           {
//             points: resultNumb,
//             grade: "Nill",
//           },
//           { new: true }
//         );
//         student?.reportCard?.push(new Types.ObjectId(nice?._id));
//         student?.save();
//         subjectData?.reportCard?.push(new Types.ObjectId(nice?._id));
//         subjectData?.save();
//         // school?.reportCard.push(new Types.ObjectId(report._id));
//         // school?.save();
//         console.log("report data: ");
//         return res.status(201).json({
//           message: "report entry created successfully",
//           data: { nice, student },
//           status: 201,
//         });
//       }
//     } else {
//       return res.status(404).json({
//         message: "student and teacher doesn't exist for this class",
//         status: 404,
//       });
//     }
//   } catch (error: any) {
//     return res.status(404).json({
//       message: "Error creating class subject report",
//       data: error.message,
//       status: 404,
//     });
//   }
// };
// 
const createReportCardEntry = async (req, res) => {
    try {
        const { 
        // teacherID,
        studentID, } = req.params;
        const { subject, test1 = 0, test2 = 0, test3 = 0, test4 = 0, exam = 0, teacherComment, } = req.body;
        // Validate required fields
        if (!subject) {
            return res.status(400).json({
                message: "Subject is required",
                status: 400,
            });
        }
        // Fetch teacher and verify existence
        const teacher = await studentModel_1.default.findById(studentID);
        if (!teacher) {
            return res.status(404).json({
                message: "Teacher not found",
                status: 404,
            });
        }
        // Fetch school with current session info
        const school = await schoolModel_1.default.findById(teacher.schoolIDs).populate({
            path: "session",
            options: { sort: { createdAt: -1 } },
        });
        if (!school) {
            return res.status(404).json({
                message: "School not found",
                status: 404,
            });
        }
        // Fetch student with report cards
        const student = await studentModel_1.default
            .findById(studentID)
            .populate({ path: "reportCard" });
        if (!student) {
            return res.status(404).json({
                message: "Student not found",
                status: 404,
            });
        }
        // Fetch subject data
        const subjectData = await subjectModel_1.default.findOne({ subjectTitle: subject });
        // Generate current class info identifier
        const currentClassInfo = `${student.classAssigned} session: ${school.presentSession}(${school.presentTerm})`;
        // Check if report card exists for current session/term
        const existingReportCard = student.reportCard.find((card) => {
            return card.classInfo === currentClassInfo;
        });
        // Helper function to calculate grade from marks
        const calculateGrade = (mark) => {
            if (mark >= 75)
                return "A1";
            if (mark >= 70)
                return "B2";
            if (mark >= 65)
                return "B3";
            if (mark >= 60)
                return "C4";
            if (mark >= 55)
                return "C5";
            if (mark >= 50)
                return "C6";
            if (mark >= 45)
                return "D7";
            if (mark >= 40)
                return "E8";
            if (mark >= 0)
                return "F9";
            return null;
        };
        // Helper function to generate admin comment
        const generateAdminComment = (points) => {
            if (points >= 90)
                return "Brilliant performance; you're a star!";
            if (points >= 85)
                return "Outstanding achievement; impressive work!";
            if (points >= 80)
                return "Exceptional result; keep up the great work!";
            if (points >= 75)
                return "Excellent performance; well done!";
            if (points >= 70)
                return "Very good; consistent effort is visible.";
            if (points >= 65)
                return "Commendable effort; very good.";
            if (points >= 60)
                return "Good work; keep striving for excellence.";
            if (points >= 55)
                return "Satisfactory; good progress.";
            if (points >= 50)
                return "Passable; satisfactory effort.";
            if (points >= 45)
                return "Decent work; shows potential.";
            if (points >= 40)
                return "Slightly above average; keep it up.";
            if (points >= 35)
                return "Average; showing gradual improvement.";
            if (points >= 30)
                return "Average; a steady effort is needed.";
            if (points >= 25)
                return "Fair performance; potential for improvement.";
            if (points >= 20)
                return "Fair but not satisfactory; strive harder.";
            if (points >= 15)
                return "Below average; more effort required.";
            if (points >= 10)
                return "Below average; needs significant improvement.";
            if (points >= 5)
                return "This result is poor; it's not satisfactory.";
            return "This is a very poor result.";
        };
        // Helper function to generate teacher comment
        const generateTeacherComment = (points) => {
            if (points >= 90)
                return "Perfect! Flawless work that reflects deep understanding and careful attention to detail. Congratulations!";
            if (points >= 85)
                return "Outstanding! Your understanding and presentation are impressive. A near-perfect submission!";
            if (points >= 80)
                return "Excellent work! You've exceeded expectations. Keep up the fantastic effort!";
            if (points >= 75)
                return "Well done! You have a good grasp of the material. Aim for more critical analysis next time!";
            if (points >= 70)
                return "Strong work overall! A little more attention to detail could make it exceptional!";
            if (points >= 65)
                return "This work meets expectations and demonstrates clear effort. Great job, but there's room for more depth.";
            if (points >= 60)
                return "A solid understanding is evident, though there are areas to refine.";
            if (points >= 55)
                return "Good work; keep striving for excellence.";
            if (points >= 50)
                return "A decent attempt that meets some expectations but lacks polish and depth in certain areas.";
            if (points >= 45)
                return "You are making progress but need to develop your analysis further to meet the standard.";
            if (points >= 40)
                return "Some understanding is demonstrated, but key concepts are missing or incorrect.";
            if (points >= 35)
                return "An acceptable effort, but there is room for improvement in clarity and depth.";
            if (points >= 30)
                return "You are starting to grasp the material, but more depth and accuracy are needed.";
            if (points >= 25)
                return "A basic attempt is made, but it falls short of expectations. Review the feedback to improve.";
            if (points >= 20)
                return "The work shows minimal understanding of the topic. Focus on building your foundational knowledge.";
            if (points >= 15)
                return "Some attempt is evident, but significant gaps in understanding remain. More effort is required.";
            if (points >= 10)
                return "The response is incomplete and lacks critical understanding. Improvement is needed in future submissions.";
            if (points >= 5)
                return "This effort does not meet the basic requirements. Please focus on the foundational concepts.";
            return "Very minimal effort is evident in the work. It's essential to review the material thoroughly.";
        };
        // Calculate scores and grade for the subject
        const calculateSubjectScore = (t4, ex) => {
            const test4Score = t4 || 0;
            const examScore = ex || 0;
            const totalMark = test4Score + examScore;
            // Calculate actual score based on what tests were taken
            // test4 is worth 40 points, exam is worth 60 points (total 100)
            let maxScore = 0;
            if (test4Score > 0)
                maxScore += 40;
            if (examScore > 0)
                maxScore += 60;
            console.log("test4Score: ", test4Score, teacherComment);
            return {
                test4: test4Score,
                exam: examScore,
                mark: totalMark,
                score: maxScore,
                points: totalMark,
                grade: calculateGrade(totalMark),
                teacherComment: teacherComment || generateTeacherComment(totalMark),
            };
        };
        if (existingReportCard) {
            // Report card exists - update or add subject
            const existingSubject = existingReportCard.result.find((r) => r.subject === subject);
            let updatedResults;
            if (existingSubject) {
                // Update existing subject - merge with existing scores
                const scores = calculateSubjectScore(test4 || existingSubject.test4, exam || existingSubject.exam);
                updatedResults = existingReportCard.result.map((r) => {
                    if (r.subject === subject) {
                        return {
                            subject,
                            test1: 0,
                            test2: 0,
                            test3: 0,
                            ...scores,
                        };
                    }
                    return r;
                });
            }
            else {
                // Add new subject
                const scores = calculateSubjectScore(test4, exam);
                updatedResults = [
                    ...existingReportCard.result,
                    {
                        subject,
                        test1: 0,
                        test2: 0,
                        test3: 0,
                        ...scores,
                    },
                ];
            }
            // Update report card
            const updatedReport = await cardReportModel_1.default.findByIdAndUpdate(existingReportCard._id, { result: updatedResults }, { new: true });
            // Calculate overall points and grade (filtering out unoffered subjects with 0 marks)
            const offeredResults = (updatedReport.result || []).filter((r) => {
                const currentTotal = (r.test1 || 0) + (r.test2 || 0) + (r.test3 || 0) + (r.test4 || 0) + (r.exam || 0) + (r.points || 0);
                return currentTotal > 0;
            });
            const totalPoints = offeredResults.reduce((sum, r) => sum + (r.points || 0), 0);
            const avgPoints = parseFloat((totalPoints / (offeredResults.length || 1)).toFixed(2));
            const overallGrade = calculateGrade(avgPoints);
            // Update with calculated values and comments
            const finalReport = await cardReportModel_1.default.findByIdAndUpdate(updatedReport._id, {
                points: avgPoints,
                grade: overallGrade,
                adminComment: generateAdminComment(avgPoints),
                classTeacherComment: generateTeacherComment(avgPoints),
            }, { new: true });
            return res.status(200).json({
                message: "Report card updated successfully",
                data: finalReport,
                status: 200,
            });
        }
        else {
            // Create new report card for this session/term
            const scores = calculateSubjectScore(test4, exam);
            const newReport = await cardReportModel_1.default.create({
                result: [
                    {
                        subject,
                        test1: 0,
                        test2: 0,
                        test3: 0,
                        ...scores,
                    },
                ],
                classInfo: currentClassInfo,
                studentID,
                points: scores.points,
                grade: scores.grade || "Nill",
            });
            // Link report card to student
            student.reportCard.push(new mongoose_1.Types.ObjectId(newReport._id));
            await student.save();
            // Link to subject if exists
            if (subjectData) {
                subjectData.reportCard.push(new mongoose_1.Types.ObjectId(newReport._id));
                await subjectData.save();
            }
            return res.status(201).json({
                message: "Report card created successfully",
                data: newReport,
                status: 201,
            });
        }
    }
    catch (error) {
        console.error("Error in createReportCardEntry:", error);
        return res.status(500).json({
            message: "Error creating/updating report card entry",
            error: error.message,
            status: 500,
        });
    }
};
exports.createReportCardEntry = createReportCardEntry;
// {""}
// export const createMidReportCardEntry = async (
//   req: Request,
//   res: Response
// ): Promise<Response> => {
//   try {
//     const { studentID } = req.params;
//     const { subject, test1, test2, test3, test4, exam } = req.body;
//     const teacher = await studentModel.findById(studentID);
//     const school: any = await schoolModel
//       .findById(teacher?.schoolIDs)
//       .populate({
//         path: "session",
//         options: {
//           sort: {
//             createdAt: -1,
//           },
//         },
//       });
//     const student: any = await studentModel.findById(studentID).populate({
//       path: "midReportCard",
//     });
//     const subjectData = await subjectModel.findOne({ subjectTitle: subject });
//     const studentCheck = student?.midReportCard.some((el: any) => {
//       return (
//         el.classInfo ===
//         `${
//           student?.classAssigned
//         } session: ${school?.presentSession!}(${school?.presentTerm!})`
//       );
//     });
//     if (teacher && student) {
//       if (studentCheck) {
//         // check
//         const getReportSubject: any = await studentModel
//           .findById(studentID)
//           .populate({
//             path: "midReportCard",
//           });
//         const getData: any = getReportSubject?.midReportCard?.find(
//           (el: any) => {
//             return (
//               el.classInfo ===
//               `${
//                 student?.classAssigned
//               } session: ${school?.presentSession!}(${school?.presentTerm!})`
//             );
//           }
//         );
//         const data = getReportSubject?.midReportCard?.find((el: any) => {
//           return el.result.find((el: any) => {
//             return el.subject === subject;
//           });
//         });
//         const dataFIle = getReportSubject?.midReportCard?.find((el: any) => {
//           return el.result.find((el: any) => {
//             return el.subject === subject;
//           });
//         });
//         const read = dataFIle?.result.find((el: any) => {
//           return el.subject === subject;
//         });
//         if (data) {
//           let x1 = !test1 ? read?.test1 : test1 ? test1 : 0;
//           let x2 = !test2 ? read?.test2 : test2 ? test2 : 0;
//           let x3 = !test3 ? read?.test3 : test3 ? test3 : 0;
//           let x4 = !test4 ? read?.test4 : test4 ? test4 : 0;
//           let x5 = !exam ? read?.exam : exam ? exam : 0;
//           let y1 = x1 !== null ? x1 : 0;
//           let y2 = x2 !== null ? x2 : 0;
//           let y3 = x3 !== null ? x3 : 0;
//           let y4 = x4 !== null ? x4 : 0;
//           let y5 = x5 !== null ? x5 : 0;
//           let mark = y1 + y2 + y3 + y4 + y5;
//           let myTest1: number;
//           let myTest2: number;
//           let myTest3: number;
//           let myTest4: number;
//           let examination: number;
//           let w1 = x1 !== 0 ? (myTest1 = 10) : 0;
//           let w2 = x2 !== 0 ? (myTest2 = 10) : 0;
//           let w3 = x3 !== 0 ? (myTest3 = 10) : 0;
//           let w4 = x4 !== 0 ? (myTest4 = 10) : 0;
//           let w5 = x5 !== 0 ? (examination = 60) : 0;
//           let score = w1 + w2 + w3 + w4 + w5;
//           let updated = getData.result.filter((el: any) => {
//             return el.subject !== subject;
//           });
//           console.log("This isc Second Create");
//           // await midReportCardModel.create({
//           //   result: [
//           //     {
//           //       subject,
//           //       test1: 0,
//           //       test2: 0,
//           //       test3: 0,
//           //       test4,
//           //       exam,
//           //       total: exam,
//           //       grade:
//           //         exam >= 0 && exam <= 39
//           //           ? "F9"
//           //           : exam >= 39 && exam <= 44
//           //           ? "E8"
//           //           : exam >= 44 && exam <= 49
//           //           ? "D7"
//           //           : exam >= 49 && exam <= 54
//           //           ? "C6"
//           //           : exam >= 54 && exam <= 59
//           //           ? "C5"
//           //           : exam >= 59 && exam <= 64
//           //           ? "C4"
//           //           : exam >= 64 && exam <= 69
//           //           ? "B3"
//           //           : exam >= 69 && exam <= 74
//           //           ? "B2"
//           //           : exam >= 74 && exam <= 100
//           //           ? "A1"
//           //           : null,
//           //     },
//           //   ],
//           //   classInfo: `${
//           //     student?.classAssigned
//           //   } session: ${school?.presentSession!}(${school?.presentTerm!})`,
//           //   studentID,
//           // });
//           const report: any = await midReportCardModel.findByIdAndUpdate(
//             getData?._id,
//             {
//               result: [
//                 ...updated,
//                 {
//                   subject: !subject ? read?.subject : subject,
//                   test1: y1,
//                   test2: y2,
//                   test3: y3,
//                   test4: y4,
//                   exam: y5,
//                   approved: true,
//                   mark,
//                   score: y1 > 10 ? (y5 ? 60 : 0) + (y1 ? 40 : 0) : score,
//                   points: mark,
//                   // y1 > 10
//                   //   ? parseFloat(((mark / score) * 100).toFixed(2))
//                   //   : parseFloat(((mark / score) * 100).toFixed(2)),
//                   grade:
//                     mark >= 0 && mark <= 39
//                       ? "F9"
//                       : mark >= 39 && mark <= 44
//                       ? "E8"
//                       : mark >= 44 && mark <= 49
//                       ? "D7"
//                       : mark >= 49 && mark <= 54
//                       ? "C6"
//                       : mark >= 54 && mark <= 59
//                       ? "C5"
//                       : mark >= 59 && mark <= 64
//                       ? "C4"
//                       : mark >= 64 && mark <= 69
//                       ? "B3"
//                       : mark >= 69 && mark <= 74
//                       ? "B2"
//                       : mark >= 74 && mark <= 100
//                       ? "A1"
//                       : null,
//                 },
//               ],
//             },
//             { new: true }
//           );
//           // let genPoint = parseFloat(
//           //   (
//           //     report?.result
//           //       ?.map((el: any) => {
//           //         return el.points;
//           //       })
//           //       .reduce((a: number, b: number) => {
//           //         return a + b;
//           //       }, 0) / report?.result?.length!
//           //   ).toFixed(2)
//           // );
//           let genPoint = parseFloat(
//   (
//     report?.result
//       ?.map((el: any) => el?.points)
//       .filter((points: number) => points != null) // Remove null/undefined
//       .reduce((a: number, b: number) => a + b, 0) / 
//     (report?.result?.filter((el: any) => el?.points != null).length || 1) // Avoid division by 0
//   ).toFixed(2)
// );
//           let grade =
//             genPoint >= 0 && genPoint <= 39
//               ? "F9"
//               : genPoint >= 39 && genPoint <= 44
//               ? "E8"
//               : genPoint >= 44 && genPoint <= 49
//               ? "D7"
//               : genPoint >= 49 && genPoint <= 54
//               ? "C6"
//               : genPoint >= 54 && genPoint <= 59
//               ? "C5"
//               : genPoint >= 59 && genPoint <= 64
//               ? "C4"
//               : genPoint >= 64 && genPoint <= 69
//               ? "B3"
//               : genPoint >= 69 && genPoint <= 74
//               ? "B2"
//               : genPoint >= 74 && genPoint <= 100
//               ? "A1"
//               : null;
//           let x =
//             genPoint >= 0 && genPoint <= 5
//               ? "This is a very poor result."
//               : genPoint >= 6 && genPoint <= 11
//               ? "This result is poor; it's not satisfactory."
//               : genPoint >= 11 && genPoint <= 15
//               ? "Below average; needs significant improvement."
//               : genPoint >= 16 && genPoint <= 21
//               ? "Below average; more effort required."
//               : genPoint >= 21 && genPoint <= 25
//               ? "Fair but not satisfactory; strive harder."
//               : genPoint >= 26 && genPoint <= 31
//               ? "Fair performance; potential for improvement."
//               : genPoint >= 31 && genPoint <= 35
//               ? "Average; a steady effort is needed."
//               : genPoint >= 36 && genPoint <= 41
//               ? "Average; showing gradual improvement."
//               : genPoint >= 41 && genPoint <= 45
//               ? "Slightly above average; keep it up."
//               : genPoint >= 46 && genPoint <= 51
//               ? "Decent work; shows potential."
//               : genPoint >= 51 && genPoint <= 55
//               ? "Passable; satisfactory effort."
//               : genPoint >= 56 && genPoint <= 61
//               ? "Satisfactory; good progress."
//               : genPoint >= 61 && genPoint <= 65
//               ? "Good work; keep striving for excellence."
//               : genPoint >= 66 && genPoint <= 71
//               ? "Commendable effort; very good."
//               : genPoint >= 71 && genPoint <= 75
//               ? "Very good; consistent effort is visible."
//               : genPoint >= 76 && genPoint <= 81
//               ? "Excellent performance; well done!"
//               : genPoint >= 81 && genPoint <= 85
//               ? "Exceptional result; keep up the great work!"
//               : genPoint >= 86 && genPoint <= 91
//               ? "Outstanding achievement; impressive work!"
//               : genPoint >= 91 && genPoint <= 95
//               ? "Brilliant performance; you’re a star!"
//               : genPoint >= 96 && genPoint <= 100
//               ? "Outstanding achievement; impressive work!"
//               : ``;
//           let xx =
//             genPoint >= 0 && genPoint <= 5
//               ? "The submission demonstrates a lack of understanding of the topic. Please see me for guidance"
//               : genPoint >= 6 && genPoint <= 11
//               ? "Very minimal effort is evident in the work. It's essential to review the material thoroughly."
//               : genPoint >= 11 && genPoint <= 15
//               ? "This effort does not meet the basic requirements. Please focus on the foundational concepts."
//               : genPoint >= 16 && genPoint <= 21
//               ? "The response is incomplete and lacks critical understanding. Improvement is needed in future submissions."
//               : genPoint >= 21 && genPoint <= 25
//               ? "Some attempt is evident, but significant gaps in understanding remain. More effort is required."
//               : genPoint >= 26 && genPoint <= 31
//               ? "The work shows minimal understanding of the topic. Focus on building your foundational knowledge."
//               : genPoint >= 31 && genPoint <= 35
//               ? "A basic attempt is made, but it falls short of expectations. Review the feedback to improve"
//               : genPoint >= 36 && genPoint <= 41
//               ? "You are starting to grasp the material, but more depth and accuracy are needed."
//               : genPoint >= 41 && genPoint <= 45
//               ? "An acceptable effort, but there is room for improvement in clarity and depth"
//               : genPoint >= 46 && genPoint <= 51
//               ? "Some understanding is demonstrated, but key concepts are missing or incorrect."
//               : genPoint >= 51 && genPoint <= 55
//               ? "You are making progress but need to develop your analysis further to meet the standard"
//               : genPoint >= 56 && genPoint <= 61
//               ? "A decent attempt that meets some expectations but lacks polish and depth in certain areas"
//               : genPoint >= 61 && genPoint <= 65
//               ? "Good work; keep striving for excellence."
//               : genPoint >= 66 && genPoint <= 71
//               ? "A solid understanding is evident, though there are areas to refine."
//               : genPoint >= 71 && genPoint <= 75
//               ? "This work meets expectations and demonstrates clear effort. Great job, but there's room for more depth."
//               : genPoint >= 76 && genPoint <= 81
//               ? "Strong work overall! A little more attention to detail could make it exceptional!"
//               : genPoint >= 81 && genPoint <= 85
//               ? "Well done! You have a good grasp of the material. Aim for more critical analysis next time!"
//               : genPoint >= 86 && genPoint <= 91
//               ? "Excellent work! You’ve exceeded expectations. Keep up the fantastic effort!"
//               : genPoint >= 91 && genPoint <= 95
//               ? "Outstanding! Your understanding and presentation are impressive. A near-perfect submission!"
//               : genPoint >= 96 && genPoint <= 100
//               ? "Perfect! Flawless work that reflects deep understanding and careful attention to detail. Congratulation!"
//               : ``;
//           let nice = await midReportCardModel.findByIdAndUpdate(
//             report?.id,
//             {
//               points: genPoint,
//               adminComment: x,
//               classTeacherComment: xx,
//               grade,
//             },
//             { new: true }
//           );
//           console.log("report: ", nice);
//           return res.status(201).json({
//             message: "teacher updated report successfully",
//             data: nice,
//             status: 201,
//           });
//         } else {
//           let x1 = 0;
//           let x2 = 0;
//           let x3 = 0;
//           let x4 = 0;
//           let x5 = !exam ? read?.exam : exam ? exam : 0;
//           let y1 = x1 !== null ? x1 : 0;
//           let y2 = x2 !== null ? x2 : 0;
//           let y3 = x3 !== null ? x3 : 0;
//           let y4 = x4 !== null ? x4 : 0;
//           let y5 = x5 !== null ? x5 : 0;
//           let mark = y1 + y2 + y3 + y4 + y5;
//           let myTest1: number;
//           let myTest2: number;
//           let myTest3: number;
//           let myTest4: number;
//           let examination: number;
//           let w1 = x1 !== 0 ? (myTest1 = 10) : 0;
//           let w2 = x2 !== 0 ? (myTest2 = 10) : 0;
//           let w3 = x3 !== 0 ? (myTest3 = 10) : 0;
//           let w4 = x4 !== 0 ? (myTest4 = 10) : 0;
//           let w5 = x5 !== 0 ? (examination = 60) : 0;
//           let score = w1 + w2 + w3 + w4 + w5;
//           const report = await midReportCardModel.findByIdAndUpdate(
//             getData?._id,
//             {
//               result: [
//                 ...getData.result,
//                 {
//                   subject: !subject ? read?.subject : subject,
//                   test1: y1,
//                   test2: y2,
//                   test3: y3,
//                   test4: y4,
//                   exam: y5,
//                   approved: true,
//                   mark,
//                   score: y1 > 10 ? (y5 ? 60 : 0) + (y1 ? 40 : 0) : score,
//                   points: mark,
//                   grade:
//                     mark >= 0 && mark <= 39
//                       ? "F9"
//                       : mark >= 39 && mark <= 44
//                       ? "E8"
//                       : mark >= 44 && mark <= 49
//                       ? "D7"
//                       : mark >= 49 && mark <= 54
//                       ? "C6"
//                       : mark >= 54 && mark <= 59
//                       ? "C5"
//                       : mark >= 59 && mark <= 64
//                       ? "C4"
//                       : mark >= 64 && mark <= 69
//                       ? "B3"
//                       : mark >= 69 && mark <= 74
//                       ? "B2"
//                       : mark >= 74 && mark <= 100
//                       ? "A1"
//                       : null,
//                 },
//               ],
//             },
//             { new: true }
//           );
//           // let genPoint = parseFloat(
//           //   (
//           //     report?.result
//           //       ?.map((el: any) => {
//           //         return el.points ;
//           //       })
//           //       .reduce((a: number, b: number) => {
//           //         return a + b;
//           //       }, 0) / report?.result?.length!
//           //   ).toFixed(2)
//           // );
//           let genPoint = parseFloat(
//             (
//               report?.result
//                 ?.map((el: any) => el?.points)
//                 .filter((points: number) => points != null) // Remove null/undefined
//                 .reduce((a: number, b: number) => a + b, 0) /
//               (report?.result?.filter((el: any) => el?.points != null).length ||
//                 1)
//             ) // Avoid division by 0
//               .toFixed(2)
//           );
//           let grade =
//             genPoint >= 0 && genPoint <= 39
//               ? "F9"
//               : genPoint >= 39 && genPoint <= 44
//               ? "E8"
//               : genPoint >= 44 && genPoint <= 49
//               ? "D7"
//               : genPoint >= 49 && genPoint <= 54
//               ? "C6"
//               : genPoint >= 54 && genPoint <= 59
//               ? "C5"
//               : genPoint >= 59 && genPoint <= 64
//               ? "C4"
//               : genPoint >= 64 && genPoint <= 69
//               ? "B3"
//               : genPoint >= 69 && genPoint <= 74
//               ? "B2"
//               : genPoint >= 74 && genPoint <= 100
//               ? "A1"
//               : null;
//           let nice = await midReportCardModel.findByIdAndUpdate(
//             report?.id,
//             {
//               points: genPoint,
//               grade,
//             },
//             { new: true }
//           );
//           return res.status(201).json({
//             message: "can't report entry created successfully",
//             data: nice,
//             status: 201,
//           });
//         }
//       } else {
//         console.log("This is Third Create");
//         const report = await midReportCardModel.create({
//           result: [
//             {
//               subject,
//               test1: 0,
//               test2: 0,
//               test3: 0,
//               approved: true,
//               test4,
//               exam,
//               total: exam,
//               grade:
//                 exam >= 0 && exam <= 39
//                   ? "F9"
//                   : exam >= 39 && exam <= 44
//                   ? "E8"
//                   : exam >= 44 && exam <= 49
//                   ? "D7"
//                   : exam >= 49 && exam <= 54
//                   ? "C6"
//                   : exam >= 54 && exam <= 59
//                   ? "C5"
//                   : exam >= 59 && exam <= 64
//                   ? "C4"
//                   : exam >= 64 && exam <= 69
//                   ? "B3"
//                   : exam >= 69 && exam <= 74
//                   ? "B2"
//                   : exam >= 74 && exam <= 100
//                   ? "A1"
//                   : null,
//             },
//           ],
//           classInfo: `${
//             student?.classAssigned
//           } session: ${school?.presentSession!}(${school?.presentTerm!})`,
//           studentID,
//         });
//         let genPointScore = parseFloat(
//           (
//             report?.result
//               ?.map((el: any) => {
//                 return el.exam;
//               })
//               .reduce((a: number, b: number) => {
//                 return a + b;
//               }, 0) / report?.result?.length!
//           ).toFixed(2)
//         );
//         let numb = [test1, test2, test3, test4, exam];
//         let count = 0;
//         let resultNumb = 0;
//         let resultNumbAva = 0;
//         for (let i = 0; i < numb.length; i++) {
//           if (numb[i] > 0) {
//             resultNumb += numb[i];
//             count++;
//           }
//         }
//         resultNumbAva = resultNumb / count;
//         let x =
//           genPointScore >= 0 && genPointScore <= 5
//             ? "This is a very poor result."
//             : genPointScore >= 6 && genPointScore <= 11
//             ? "This result is poor; it's not satisfactory."
//             : genPointScore >= 11 && genPointScore <= 15
//             ? "Below average; needs significant improvement."
//             : genPointScore >= 16 && genPointScore <= 21
//             ? "Below average; more effort required."
//             : genPointScore >= 21 && genPointScore <= 25
//             ? "Fair but not satisfactory; strive harder."
//             : genPointScore >= 26 && genPointScore <= 31
//             ? "Fair performance; potential for improvement."
//             : genPointScore >= 31 && genPointScore <= 35
//             ? "Average; a steady effort is needed."
//             : genPointScore >= 36 && genPointScore <= 41
//             ? "Average; showing gradual improvement."
//             : genPointScore >= 41 && genPointScore <= 45
//             ? "Slightly above average; keep it up."
//             : genPointScore >= 46 && genPointScore <= 51
//             ? "Decent work; shows potential."
//             : genPointScore >= 51 && genPointScore <= 55
//             ? "Passable; satisfactory effort."
//             : genPointScore >= 56 && genPointScore <= 61
//             ? "Satisfactory; good progress."
//             : genPointScore >= 61 && genPointScore <= 65
//             ? "Good work; keep striving for excellence."
//             : genPointScore >= 66 && genPointScore <= 71
//             ? "Commendable effort; very good."
//             : genPointScore >= 71 && genPointScore <= 75
//             ? "Very good; consistent effort is visible."
//             : genPointScore >= 76 && genPointScore <= 81
//             ? "Excellent performance; well done!"
//             : genPointScore >= 81 && genPointScore <= 85
//             ? "Exceptional result; keep up the great work!"
//             : genPointScore >= 86 && genPointScore <= 91
//             ? "Outstanding achievement; impressive work!"
//             : genPointScore >= 91 && genPointScore <= 95
//             ? "Brilliant performance; you’re a star!"
//             : genPointScore >= 96 && genPointScore <= 100
//             ? "Outstanding achievement; impressive work!"
//             : ``;
//         let xx =
//           genPointScore >= 0 && genPointScore <= 5
//             ? "The submission demonstrates a lack of understanding of the topic. Please see me for guidance"
//             : genPointScore >= 6 && genPointScore <= 11
//             ? "Very minimal effort is evident in the work. It's essential to review the material thoroughly."
//             : genPointScore >= 11 && genPointScore <= 15
//             ? "This effort does not meet the basic requirements. Please focus on the foundational concepts."
//             : genPointScore >= 16 && genPointScore <= 21
//             ? "The response is incomplete and lacks critical understanding. Improvement is needed in future submissions."
//             : genPointScore >= 21 && genPointScore <= 25
//             ? "Some attempt is evident, but significant gaps in understanding remain. More effort is required."
//             : genPointScore >= 26 && genPointScore <= 31
//             ? "The work shows minimal understanding of the topic. Focus on building your foundational knowledge."
//             : genPointScore >= 31 && genPointScore <= 35
//             ? "A basic attempt is made, but it falls short of expectations. Review the feedback to improve"
//             : genPointScore >= 36 && genPointScore <= 41
//             ? "You are starting to grasp the material, but more depth and accuracy are needed."
//             : genPointScore >= 41 && genPointScore <= 45
//             ? "An acceptable effort, but there is room for improvement in clarity and depth"
//             : genPointScore >= 46 && genPointScore <= 51
//             ? "Some understanding is demonstrated, but key concepts are missing or incorrect."
//             : genPointScore >= 51 && genPointScore <= 55
//             ? "You are making progress but need to develop your analysis further to meet the standard"
//             : genPointScore >= 56 && genPointScore <= 61
//             ? "A decent attempt that meets some expectations but lacks polish and depth in certain areas"
//             : genPointScore >= 61 && genPointScore <= 65
//             ? "Good work; keep striving for excellence."
//             : genPointScore >= 66 && genPointScore <= 71
//             ? "A solid understanding is evident, though there are areas to refine."
//             : genPointScore >= 71 && genPointScore <= 75
//             ? "This work meets expectations and demonstrates clear effort. Great job, but there's room for more depth."
//             : genPointScore >= 76 && genPointScore <= 81
//             ? "Strong work overall! A little more attention to detail could make it exceptional!"
//             : genPointScore >= 81 && genPointScore <= 85
//             ? "Well done! You have a good grasp of the material. Aim for more critical analysis next time!"
//             : genPointScore >= 86 && genPointScore <= 91
//             ? "Excellent work! You’ve exceeded expectations. Keep up the fantastic effort!"
//             : genPointScore >= 91 && genPointScore <= 95
//             ? "Outstanding! Your understanding and presentation are impressive. A near-perfect submission!"
//             : genPointScore >= 96 && genPointScore <= 100
//             ? "Perfect! Flawless work that reflects deep understanding and careful attention to detail. Congratulation!"
//             : ``;
//         const nice = await midReportCardModel.findByIdAndUpdate(
//           report?.id,
//           {
//             points: resultNumb,
//             adminComment: x,
//             classTeacherComment: xx,
//             grade:
//               exam >= 0 && exam <= 39
//                 ? "F9"
//                 : exam >= 39 && exam <= 44
//                 ? "E8"
//                 : exam >= 44 && exam <= 49
//                 ? "D7"
//                 : exam >= 49 && exam <= 54
//                 ? "C6"
//                 : exam >= 54 && exam <= 59
//                 ? "C5"
//                 : exam >= 59 && exam <= 64
//                 ? "C4"
//                 : exam >= 64 && exam <= 69
//                 ? "B3"
//                 : exam >= 69 && exam <= 74
//                 ? "B2"
//                 : exam >= 74 && exam <= 100
//                 ? "A1"
//                 : null,
//           },
//           { new: true }
//         );
//         student?.midReportCard?.push(new Types.ObjectId(nice?._id));
//         student?.save();
//         subjectData?.midReportCard?.push(new Types.ObjectId(nice?._id));
//         subjectData?.save();
//         // school?.reportCard.push(new Types.ObjectId(report._id));
//         // school?.save();
//         return res.status(201).json({
//           message: "report entry created successfully",
//           data: { nice, student },
//           status: 201,
//         });
//       }
//     } else {
//       return res.status(404).json({
//         message: "student and teacher doesn't exist for this class",
//         status: 404,
//       });
//     }
//   } catch (error: any) {
//     return res.status(404).json({
//       message: "Error creating class subject report",
//       data: error.message,
//       status: 404,
//     });
//   }
// };
const createMidReportCardEntry = async (req, res) => {
    try {
        const { studentID } = req.params;
        const { subject, test4, exam } = req.body;
        // Fetch teacher, school, and student data
        const teacher = await studentModel_1.default.findById(studentID);
        const school = await schoolModel_1.default
            .findById(teacher?.schoolIDs)
            .populate({
            path: "session",
            options: { sort: { createdAt: -1 } },
        });
        const student = await studentModel_1.default
            .findById(studentID)
            .populate({ path: "midReportCard" });
        const subjectData = await subjectModel_1.default.findOne({ subjectTitle: subject });
        if (!teacher || !student) {
            return res.status(404).json({
                message: "Student and teacher doesn't exist for this class",
                status: 404,
            });
        }
        const classInfo = `${student?.classAssigned} session: ${school?.presentSession}(${school?.presentTerm})`;
        // Check if student already has a report card for this class/session
        const existingReport = student?.midReportCard?.find((el) => el.classInfo === classInfo);
        if (existingReport) {
            // Update existing report
            return await updateExistingReport(res, studentID, existingReport, subject, test4, exam, classInfo);
        }
        else {
            // Create new report
            return await createNewReport(res, student, subjectData, subject, test4, exam, classInfo, studentID);
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating class subject report",
            data: error.message,
            status: 404,
        });
    }
};
exports.createMidReportCardEntry = createMidReportCardEntry;
// Helper function to calculate grade
const calculateGrade = (mark) => {
    if (mark >= 74)
        return "A1";
    if (mark >= 69)
        return "B2";
    if (mark >= 64)
        return "B3";
    if (mark >= 59)
        return "C4";
    if (mark >= 54)
        return "C5";
    if (mark >= 49)
        return "C6";
    if (mark >= 44)
        return "D7";
    if (mark >= 39)
        return "E8";
    if (mark >= 0)
        return "F9";
    return null;
};
// Helper function to get admin comment based on points
const getAdminComment = (points) => {
    if (points >= 96)
        return "Outstanding achievement; impressive work!";
    if (points >= 91)
        return "Brilliant performance; you're a star!";
    if (points >= 86)
        return "Outstanding achievement; impressive work!";
    if (points >= 81)
        return "Exceptional result; keep up the great work!";
    if (points >= 76)
        return "Excellent performance; well done!";
    if (points >= 71)
        return "Very good; consistent effort is visible.";
    if (points >= 66)
        return "Commendable effort; very good.";
    if (points >= 61)
        return "Good work; keep striving for excellence.";
    if (points >= 56)
        return "Satisfactory; good progress.";
    if (points >= 51)
        return "Passable; satisfactory effort.";
    if (points >= 46)
        return "Decent work; shows potential.";
    if (points >= 41)
        return "Slightly above average; keep it up.";
    if (points >= 36)
        return "Average; showing gradual improvement.";
    if (points >= 31)
        return "Average; a steady effort is needed.";
    if (points >= 26)
        return "Fair performance; potential for improvement.";
    if (points >= 21)
        return "Fair but not satisfactory; strive harder.";
    if (points >= 16)
        return "Below average; more effort required.";
    if (points >= 11)
        return "Below average; needs significant improvement.";
    if (points >= 6)
        return "This result is poor; it's not satisfactory.";
    return "This is a very poor result.";
};
// Helper function to get teacher comment based on points
const getTeacherComment = (points) => {
    if (points >= 96)
        return "Perfect! Flawless work that reflects deep understanding and careful attention to detail. Congratulation!";
    if (points >= 91)
        return "Outstanding! Your understanding and presentation are impressive. A near-perfect submission!";
    if (points >= 86)
        return "Excellent work! You've exceeded expectations. Keep up the fantastic effort!";
    if (points >= 81)
        return "Well done! You have a good grasp of the material. Aim for more critical analysis next time!";
    if (points >= 76)
        return "Strong work overall! A little more attention to detail could make it exceptional!";
    if (points >= 71)
        return "This work meets expectations and demonstrates clear effort. Great job, but there's room for more depth.";
    if (points >= 66)
        return "A solid understanding is evident, though there are areas to refine.";
    if (points >= 61)
        return "Good work; keep striving for excellence.";
    if (points >= 56)
        return "A decent attempt that meets some expectations but lacks polish and depth in certain areas";
    if (points >= 51)
        return "You are making progress but need to develop your analysis further to meet the standard";
    if (points >= 46)
        return "Some understanding is demonstrated, but key concepts are missing or incorrect.";
    if (points >= 41)
        return "An acceptable effort, but there is room for improvement in clarity and depth";
    if (points >= 36)
        return "You are starting to grasp the material, but more depth and accuracy are needed.";
    if (points >= 31)
        return "A basic attempt is made, but it falls short of expectations. Review the feedback to improve";
    if (points >= 26)
        return "The work shows minimal understanding of the topic. Focus on building your foundational knowledge.";
    if (points >= 21)
        return "Some attempt is evident, but significant gaps in understanding remain. More effort is required.";
    if (points >= 16)
        return "The response is incomplete and lacks critical understanding. Improvement is needed in future submissions.";
    if (points >= 11)
        return "This effort does not meet the basic requirements. Please focus on the foundational concepts.";
    if (points >= 6)
        return "Very minimal effort is evident in the work. It's essential to review the material thoroughly.";
    return "The submission demonstrates a lack of understanding of the topic. Please see me for guidance";
};
// Update existing report card
async function updateExistingReport(res, studentID, existingReport, subject, test4, exam, classInfo) {
    const getReportSubject = await studentModel_1.default
        .findById(studentID)
        .populate({ path: "midReportCard" });
    const reportCard = getReportSubject?.midReportCard?.find((el) => el.classInfo === classInfo);
    const existingSubject = reportCard?.result?.find((el) => el.subject === subject);
    // Calculate scores
    const safeTest4 = test4 ?? existingSubject?.test4 ?? 0;
    const safeExam = exam ?? existingSubject?.exam ?? 0;
    const mark = safeTest4 + safeExam;
    // Calculate total possible score (test4: 10, exam: 60)
    const score = (safeTest4 !== 0 ? 10 : 0) + (safeExam !== 0 ? 60 : 0);
    // Remove existing subject entry if it exists
    const updatedResults = reportCard.result.filter((el) => el.subject !== subject);
    // Add new/updated subject entry
    const report = await midReportCardModel_1.default.findByIdAndUpdate(reportCard._id, {
        result: [
            ...updatedResults,
            {
                subject,
                test1: 0,
                test2: 0,
                test3: 0,
                test4: safeTest4,
                exam: safeExam,
                approved: true,
                mark,
                score,
                points: mark,
                grade: calculateGrade(mark),
            },
        ],
    }, { new: true });
    // Calculate overall average points (filtering out unoffered subjects with 0 marks)
    const offeredResults = (report?.result || []).filter((r) => {
        const currentTotal = (r.test1 || 0) + (r.test2 || 0) + (r.test3 || 0) + (r.test4 || 0) + (r.exam || 0) + (r.points || 0);
        return currentTotal > 0;
    });
    const validPoints = offeredResults
        ?.map((el) => el?.points)
        .filter((points) => points != null);
    const genPoint = validPoints.length > 0
        ? parseFloat((validPoints.reduce((a, b) => a + b, 0) /
            validPoints.length).toFixed(2))
        : 0;
    const grade = calculateGrade(genPoint);
    // Update report with overall metrics
    const finalReport = await midReportCardModel_1.default.findByIdAndUpdate(report._id, {
        points: genPoint,
        adminComment: getAdminComment(genPoint),
        classTeacherComment: getTeacherComment(genPoint),
        grade,
    }, { new: true });
    return res.status(201).json({
        message: "Teacher updated report successfully",
        data: finalReport,
        status: 201,
    });
}
// Create new report card
async function createNewReport(res, student, subjectData, subject, test4, exam, classInfo, studentID) {
    const safeTest4 = test4 ?? 0;
    const safeExam = exam ?? 0;
    const mark = safeTest4 + safeExam;
    const report = await midReportCardModel_1.default.create({
        result: [
            {
                subject,
                test1: 0,
                test2: 0,
                test3: 0,
                test4: safeTest4,
                exam: safeExam,
                approved: true,
                mark,
                score: (safeTest4 !== 0 ? 10 : 0) + (safeExam !== 0 ? 60 : 0),
                points: mark,
                grade: calculateGrade(mark),
            },
        ],
        classInfo,
        studentID,
    });
    const genPoint = mark; // For single subject, genPoint equals mark
    const finalReport = await midReportCardModel_1.default.findByIdAndUpdate(report._id, {
        points: genPoint,
        adminComment: getAdminComment(genPoint),
        classTeacherComment: getTeacherComment(genPoint),
        grade: calculateGrade(genPoint),
    }, { new: true });
    // Link report to student and subject
    student?.midReportCard?.push(new mongoose_1.Types.ObjectId(finalReport?._id));
    await student?.save();
    subjectData?.midReportCard?.push(new mongoose_1.Types.ObjectId(finalReport?._id));
    await subjectData?.save();
    return res.status(201).json({
        message: "Report entry created successfully",
        data: { report: finalReport, student },
        status: 201,
    });
}
const updateReportScores = async (req, res) => {
    try {
        const { studentID, teacherID } = req.params;
        const { subject, test1, test2, test3, exam } = req.body;
        const student = await studentModel_1.default.findById(studentID).populate({
            path: "reportCard",
        });
        const getReportSubject = student?.reportCard.find((el) => {
            return el?.result?.find((el) => {
                return el?.subject === subject;
            });
        });
        const teacher = await staffModel_1.default.findById(teacherID);
        if (teacher && student) {
            if (teacher) {
                const data = getReportSubject.result.find((el) => {
                    return el.subject === subject;
                });
                const report = await midReportCardModel_1.default.findByIdAndUpdate(getReportSubject?._id, {
                    result: [
                        {
                            subject: !subject ? data?.subject : subject,
                            "1st Test": !test1 ? data?.[`1st Test`] : test1,
                            "2nd Test": !test2 ? data?.[`2nd Test`] : test2,
                            "3rd Test": !test3 ? data?.[`3rd Test`] : test3,
                            Exam: !exam ? exam : data?.exam,
                        },
                    ],
                }, { new: true });
                return res.status(201).json({
                    message: "teacher updated report successfully",
                    data: report,
                    status: 201,
                });
            }
            else {
                return res.status(404).json({
                    message: "unable to find school Teacher",
                    status: 404,
                });
            }
        }
        else {
            return res.status(404).json({
                message: "unable to read school",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school session",
            status: 404,
        });
    }
};
exports.updateReportScores = updateReportScores;
const classTeacherPhychoReportRemark = async (req, res) => {
    try {
        const { teacherID, studentID, classID } = req.params;
        const { confidence, presentational, hardworking, resilient, sportship, empathy, punctuality, communication, leadership, } = req.body;
        const student = await studentModel_1.default
            .findById(studentID)
            .populate({ path: "reportCard" });
        const classRM = await classroomModel_1.default.findById(classID);
        const school = await schoolModel_1.default
            .findById(student?.schoolIDs)
            .populate({
            path: "session",
        });
        const getReportSubject = student?.reportCard.find((el) => {
            return (el.classInfo ===
                `${student?.classAssigned} session: ${school?.presentSession}(${school?.presentTerm})`);
        });
        const teacher = await staffModel_1.default.findById(teacherID);
        const teacherClassDataRomm = teacher?.classesAssigned.find((el) => {
            return el.className === student?.classAssigned;
        });
        if (teacherClassDataRomm?.className === student?.classAssigned) {
            const report = await cardReportModel_1.default.findByIdAndUpdate(getReportSubject?._id, {
                peopleSkill: [
                    {
                        confidence,
                        presentational,
                        hardworking,
                        resilient,
                    },
                ],
                softSkill: [
                    {
                        empathy,
                        punctuality,
                        communication,
                        leadership,
                    },
                ],
                physicalSkill: [
                    {
                        sportship,
                    },
                ],
                psycho: true,
            }, { new: true });
            return res.status(201).json({
                message: "class Teacher report remark successfully",
                data: report,
                status: 201,
            });
        }
        else {
            return res.status(404).json({
                message: "unable to read school",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school session",
            status: 404,
            data: error.message,
        });
    }
};
exports.classTeacherPhychoReportRemark = classTeacherPhychoReportRemark;
const adminReportRemark = async (req, res) => {
    try {
        const { studentID, schoolID } = req.params;
        const { adminComment } = req.body;
        const studentHistory = await studentModel_1.default.findById(studentID).populate({
            path: "historicalResult",
        });
        const student = await studentModel_1.default.findById(studentID).populate({
            path: "reportCard",
        });
        const school = await schoolModel_1.default.findById(schoolID).populate({
            path: "session",
        });
        const getReportSubject = student?.reportCard.find((el) => {
            return (el.classInfo ===
                `${student?.classAssigned} session: ${school?.presentSession}(${school?.presentTerm})`);
        });
        if (school) {
            const report = await cardReportModel_1.default.findByIdAndUpdate(getReportSubject?._id, {
                approve: true,
                adminComment,
            }, { new: true });
            const result = await studentHistoricalResultModel_1.default.create({
                results: report?.result,
                totalPoints: report?.points,
                mainGrade: report?.grade,
                classInfo: report?.classInfo,
                session: school?.presentSession,
                term: school?.presentTerm,
                adminComment: report?.adminComment,
                classTeacherComment: report?.classTeacherComment,
                school,
                student,
            });
            student?.historicalResult?.push(new mongoose_1.Types.ObjectId(result._id));
            student?.save();
            return res.status(201).json({
                message: "admin report remark successfully",
                data: report,
                status: 201,
            });
        }
        else {
            return res.status(404).json({
                message: "unable to find school",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school session",
            status: 404,
        });
    }
};
exports.adminReportRemark = adminReportRemark;
const classTeacherReportRemark = async (req, res) => {
    try {
        const { teacherID, studentID, classID } = req.params;
        const { teacherComment, attendance } = req.body;
        const student = await studentModel_1.default
            .findById(studentID)
            .populate({ path: "reportCard" });
        const classRM = await classroomModel_1.default.findById(classID);
        const school = await schoolModel_1.default
            .findById(student?.schoolIDs)
            .populate({
            path: "session",
        });
        const getReportSubject = student?.reportCard.find((el) => {
            return (el.classInfo ===
                `${student?.classAssigned} session: ${school?.presentSession}(${school?.presentTerm})`);
        });
        const teacher = await staffModel_1.default.findById(teacherID);
        const teacherClassDataRomm = teacher?.classesAssigned.find((el) => {
            return el.className === student?.classAssigned;
        });
        const x = student?.presentClassID;
        const xx = teacher?.classesAssigned?.find((el) => {
            return el?.classID === `${x}`;
        });
        if (xx?.classID === x) {
            const report = await cardReportModel_1.default.findByIdAndUpdate(getReportSubject?._id, {
                attendance,
                classTeacherComment: teacherComment,
            }, { new: true });
            return res.status(201).json({
                message: "class Teacher report remark successfully",
                data: report,
                status: 201,
            });
        }
        else {
            return res.status(404).json({
                message: "unable to read school",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school session",
            status: 404,
            data: error.message,
        });
    }
};
exports.classTeacherReportRemark = classTeacherReportRemark;
const classTeacherMidReportRemark = async (req, res) => {
    try {
        const { teacherID, studentID, classID } = req.params;
        const { teacherComment, attendance } = req.body;
        const student = await studentModel_1.default
            .findById(studentID)
            .populate({ path: "midReportCard" });
        const classRM = await classroomModel_1.default.findById(classID);
        const school = await schoolModel_1.default
            .findById(student?.schoolIDs)
            .populate({
            path: "session",
        });
        const getReportSubject = student?.midReportCard.find((el) => {
            return (el.classInfo ===
                `${student?.classAssigned} session: ${school?.presentSession}(${school?.presentTerm})`);
        });
        const teacher = await staffModel_1.default.findById(teacherID);
        const teacherClassDataRomm = teacher?.classesAssigned.find((el) => {
            return el.className === student?.classAssigned;
        });
        if (teacherClassDataRomm?.className === student?.classAssigned) {
            const report = await midReportCardModel_1.default.findByIdAndUpdate(getReportSubject?._id, {
                attendance,
                classTeacherComment: teacherComment,
            }, { new: true });
            return res.status(201).json({
                message: "class Teacher report remark successfully",
                data: report,
                status: 201,
            });
        }
        else {
            return res.status(404).json({
                message: "unable to read school",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school session",
            status: 404,
            data: error.message,
        });
    }
};
exports.classTeacherMidReportRemark = classTeacherMidReportRemark;
const adminMidReportRemark = async (req, res) => {
    try {
        const { studentID, schoolID } = req.params;
        const { adminComment } = req.body;
        const student = await studentModel_1.default.findById(studentID).populate({
            path: "midReportCard",
        });
        const school = await schoolModel_1.default.findById(schoolID).populate({
            path: "session",
        });
        const getReportSubject = student?.midReportCard.find((el) => {
            return (el.classInfo ===
                `${student?.classAssigned} session: ${school?.presentSession}(${school?.presentTerm})`);
        });
        if (school) {
            const report = await midReportCardModel_1.default.findByIdAndUpdate(getReportSubject?._id, {
                approve: true,
                adminComment,
            }, { new: true });
            return res.status(201).json({
                message: "admin report remark successfully",
                data: report,
                status: 201,
            });
        }
        else {
            return res.status(404).json({
                message: "unable to find school",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school session",
            status: 404,
        });
    }
};
exports.adminMidReportRemark = adminMidReportRemark;
const studentReportRemark = async (req, res) => {
    try {
        const { studentID } = req.params;
        const student = await studentModel_1.default
            .findById(studentID)
            .populate({ path: "reportCard" });
        return res.status(201).json({
            message: "class Teacher report grade",
            data: student,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school session",
            status: 404,
            data: error.message,
        });
    }
};
exports.studentReportRemark = studentReportRemark;
const studentMidReportRemark = async (req, res) => {
    try {
        const { studentID } = req.params;
        const student = await studentModel_1.default
            .findById(studentID)
            .populate({ path: "midReportCard" });
        return res.status(201).json({
            message: "class Teacher report grade",
            data: student,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school session",
            status: 404,
            data: error.message,
        });
    }
};
exports.studentMidReportRemark = studentMidReportRemark;
const studentPsychoReport = async (req, res) => {
    try {
        const { studentID } = req.params;
        const student = await studentModel_1.default
            .findById(studentID)
            .populate({ path: "reportCard" });
        return res.status(201).json({
            message: "class Teacher report grade",
            data: student,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school session",
            status: 404,
            data: error.message,
        });
    }
};
exports.studentPsychoReport = studentPsychoReport;
const removeSubjectFromResult = async (req, res) => {
    try {
        const { studentID } = req.params;
        const { subject } = req.body;
        // Find the student with their report card
        const student = await studentModel_1.default.findById(studentID).populate({
            path: "midReportCard",
        });
        if (!student) {
            return res.status(404).json({
                message: "Student not found",
                status: 404,
            });
        }
        // Get the current session's report card midReportCardModel
        const school = await schoolModel_1.default.findById(student?.schoolIDs);
        const currentClassInfo = `${student?.classAssigned} session: ${school?.presentSession}(${school?.presentTerm})`;
        const reportCard = student.midReportCard.find((card) => card.classInfo === currentClassInfo);
        if (!reportCard) {
            return res.status(404).json({
                message: "Report card not found for current session",
                status: 404,
            });
        }
        // Filter out the subject from results
        const updatedResults = reportCard.result.filter((result) => result.subject !== subject);
        if (updatedResults.length === reportCard.result.length) {
            return res.status(404).json({
                message: "Subject not found in report card",
                status: 404,
            });
        }
        const offeredResults = updatedResults.filter((el) => {
            const currentTotal = (el.test1 || 0) + (el.test2 || 0) + (el.test3 || 0) + (el.test4 || 0) + (el.exam || 0) + (el.points || 0);
            return currentTotal > 0;
        });
        const numb = parseFloat((offeredResults
            .map((el) => el.points)
            .reduce((a, b) => a + b, 0) / (offeredResults.length || 1)).toFixed(2));
        let x = numb >= 0 && numb <= 5
            ? "This is a very poor result."
            : numb >= 6 && numb <= 11
                ? "This result is poor; it's not satisfactory."
                : numb >= 11 && numb <= 15
                    ? "Below average; needs significant improvement."
                    : numb >= 16 && numb <= 21
                        ? "Below average; more effort required."
                        : numb >= 21 && numb <= 25
                            ? "Fair but not satisfactory; strive harder."
                            : numb >= 26 && numb <= 31
                                ? "Fair performance; potential for improvement."
                                : numb >= 31 && numb <= 35
                                    ? "Average; a steady effort is needed."
                                    : numb >= 36 && numb <= 41
                                        ? "Average; showing gradual improvement."
                                        : numb >= 41 && numb <= 45
                                            ? "Slightly above average; keep it up."
                                            : numb >= 46 && numb <= 51
                                                ? "Decent work; shows potential."
                                                : numb >= 51 && numb <= 55
                                                    ? "Passable; satisfactory effort."
                                                    : numb >= 56 && numb <= 61
                                                        ? "Satisfactory; good progress."
                                                        : numb >= 61 && numb <= 65
                                                            ? "Good work; keep striving for excellence."
                                                            : numb >= 66 && numb <= 71
                                                                ? "Commendable effort; very good."
                                                                : numb >= 71 && numb <= 75
                                                                    ? "Very good; consistent effort is visible."
                                                                    : numb >= 76 && numb <= 81
                                                                        ? "Excellent performance; well done!"
                                                                        : numb >= 81 && numb <= 85
                                                                            ? "Exceptional result; keep up the great work!"
                                                                            : numb >= 86 && numb <= 91
                                                                                ? "Outstanding achievement; impressive work!"
                                                                                : numb >= 91 && numb <= 95
                                                                                    ? "Brilliant performance; you’re a star!"
                                                                                    : numb >= 96 && numb <= 100
                                                                                        ? "Outstanding achievement; impressive work!"
                                                                                        : ``;
        let xx = numb >= 0 && numb <= 5
            ? "The submission demonstrates a lack of understanding of the topic. Please see me for guidance"
            : numb >= 6 && numb <= 11
                ? "Very minimal effort is evident in the work. It's essential to review the material thoroughly."
                : numb >= 11 && numb <= 15
                    ? "This effort does not meet the basic requirements. Please focus on the foundational concepts."
                    : numb >= 16 && numb <= 21
                        ? "The response is incomplete and lacks critical understanding. Improvement is needed in future submissions."
                        : numb >= 21 && numb <= 25
                            ? "Some attempt is evident, but significant gaps in understanding remain. More effort is required."
                            : numb >= 26 && numb <= 31
                                ? "The work shows minimal understanding of the topic. Focus on building your foundational knowledge."
                                : numb >= 31 && numb <= 35
                                    ? "A basic attempt is made, but it falls short of expectations. Review the feedback to improve"
                                    : numb >= 36 && numb <= 41
                                        ? "You are starting to grasp the material, but more depth and accuracy are needed."
                                        : numb >= 41 && numb <= 45
                                            ? "An acceptable effort, but there is room for improvement in clarity and depth"
                                            : numb >= 46 && numb <= 51
                                                ? "Some understanding is demonstrated, but key concepts are missing or incorrect."
                                                : numb >= 51 && numb <= 55
                                                    ? "You are making progress but need to develop your analysis further to meet the standard"
                                                    : numb >= 56 && numb <= 61
                                                        ? "A decent attempt that meets some expectations but lacks polish and depth in certain areas"
                                                        : numb >= 61 && numb <= 65
                                                            ? "Good work; keep striving for excellence."
                                                            : numb >= 66 && numb <= 71
                                                                ? "A solid understanding is evident, though there are areas to refine."
                                                                : numb >= 71 && numb <= 75
                                                                    ? "This work meets expectations and demonstrates clear effort. Great job, but there's room for more depth."
                                                                    : numb >= 76 && numb <= 81
                                                                        ? "Strong work overall! A little more attention to detail could make it exceptional!"
                                                                        : numb >= 81 && numb <= 85
                                                                            ? "Well done! You have a good grasp of the material. Aim for more critical analysis next time!"
                                                                            : numb >= 86 && numb <= 91
                                                                                ? "Excellent work! You’ve exceeded expectations. Keep up the fantastic effort!"
                                                                                : numb >= 91 && numb <= 95
                                                                                    ? "Outstanding! Your understanding and presentation are impressive. A near-perfect submission!"
                                                                                    : numb >= 96 && numb <= 100
                                                                                        ? "Perfect! Flawless work that reflects deep understanding and careful attention to detail. Congratulation!"
                                                                                        : ``;
        // Update report card with filtered results
        const updatedReport = await midReportCardModel_1.default.findByIdAndUpdate(reportCard._id, {
            result: updatedResults,
            // Recalculate total points and grade based on remaining subjects
            points: numb,
            adminComment: x,
            classTeacherComment: xx,
            grade: numb >= 0 && numb <= 39
                ? "F9"
                : numb >= 39 && numb <= 44
                    ? "E8"
                    : numb >= 44 && numb <= 49
                        ? "D7"
                        : numb >= 49 && numb <= 54
                            ? "C6"
                            : numb >= 54 && numb <= 59
                                ? "C5"
                                : numb >= 59 && numb <= 64
                                    ? "C4"
                                    : numb >= 64 && numb <= 69
                                        ? "B3"
                                        : numb >= 69 && numb <= 74
                                            ? "B2"
                                            : numb >= 74 && numb <= 100
                                                ? "A1"
                                                : null,
        }, { new: true });
        return res.status(200).json({
            message: "Subject removed from report card successfully",
            data: updatedReport,
            status: 200,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Error removing subject from report card",
            data: error.message,
            status: 500,
        });
    }
};
exports.removeSubjectFromResult = removeSubjectFromResult;
// Exporting delete entry function
const deleteReportCardEntry = async (req, res) => {
    try {
        const { studentID } = req.params;
        const { subject } = req.body;
        // Find the student with their report card
        const student = await studentModel_1.default.findById(studentID).populate({
            path: "reportCard",
        });
        if (!student) {
            return res.status(404).json({
                message: "Student not found",
                status: 404,
            });
        }
        // Get the current session's report card
        const school = await schoolModel_1.default.findById(student?.schoolIDs);
        const currentClassInfo = `${student?.classAssigned} session: ${school?.presentSession}(${school?.presentTerm})`;
        const reportCard = student.reportCard.find((card) => card.classInfo === currentClassInfo);
        if (!reportCard) {
            return res.status(404).json({
                message: "Report card not found for current session",
                status: 404,
            });
        }
        // Filter out the subject from results
        const updatedResults = reportCard.result.filter((result) => result.subject !== subject);
        if (updatedResults.length === reportCard.result.length) {
            return res.status(404).json({
                message: "Subject not found in report card",
                status: 404,
            });
        }
        // Recalculate generic metrics (filtering out unoffered subjects with 0 marks)
        const offeredResults = updatedResults.filter((el) => {
            const currentTotal = (el.test1 || 0) + (el.test2 || 0) + (el.test3 || 0) + (el.test4 || 0) + (el.exam || 0) + (el.points || 0);
            return currentTotal > 0;
        });
        const validPoints = offeredResults
            .map((el) => el.points)
            .filter((points) => points != null && !isNaN(points));
        const genPoint = validPoints.length > 0
            ? parseFloat((validPoints.reduce((a, b) => a + b, 0) /
                validPoints.length).toFixed(2))
            : 0;
        // Helper functions for comments (reusing logic from createReportCardEntry)
        const generateAdminComment = (points) => {
            if (points >= 96)
                return "Outstanding achievement; impressive work!";
            if (points >= 91)
                return "Brilliant performance; you're a star!";
            if (points >= 86)
                return "Outstanding achievement; impressive work!";
            if (points >= 81)
                return "Exceptional result; keep up the great work!";
            if (points >= 76)
                return "Excellent performance; well done!";
            if (points >= 71)
                return "Very good; consistent effort is visible.";
            if (points >= 66)
                return "Commendable effort; very good.";
            if (points >= 61)
                return "Good work; keep striving for excellence.";
            if (points >= 56)
                return "Satisfactory; good progress.";
            if (points >= 51)
                return "Passable; satisfactory effort.";
            if (points >= 46)
                return "Decent work; shows potential.";
            if (points >= 41)
                return "Slightly above average; keep it up.";
            if (points >= 36)
                return "Average; showing gradual improvement.";
            if (points >= 31)
                return "Average; a steady effort is needed.";
            if (points >= 26)
                return "Fair performance; potential for improvement.";
            if (points >= 21)
                return "Fair but not satisfactory; strive harder.";
            if (points >= 16)
                return "Below average; more effort required.";
            if (points >= 11)
                return "Below average; needs significant improvement.";
            if (points >= 6)
                return "This result is poor; it's not satisfactory.";
            return "This is a very poor result.";
        };
        const generateTeacherComment = (points) => {
            if (points >= 96)
                return "Perfect! Flawless work that reflects deep understanding and careful attention to detail. Congratulations!";
            if (points >= 91)
                return "Outstanding! Your understanding and presentation are impressive. A near-perfect submission!";
            if (points >= 86)
                return "Excellent work! You've exceeded expectations. Keep up the fantastic effort!";
            if (points >= 81)
                return "Well done! You have a good grasp of the material. Aim for more critical analysis next time!";
            if (points >= 76)
                return "Strong work overall! A little more attention to detail could make it exceptional!";
            if (points >= 71)
                return "This work meets expectations and demonstrates clear effort. Great job, but there's room for more depth.";
            if (points >= 66)
                return "A solid understanding is evident, though there are areas to refine.";
            if (points >= 61)
                return "Good work; keep striving for excellence.";
            if (points >= 56)
                return "A decent attempt that meets some expectations but lacks polish and depth in certain areas.";
            if (points >= 51)
                return "You are making progress but need to develop your analysis further to meet the standard.";
            if (points >= 46)
                return "Some understanding is demonstrated, but key concepts are missing or incorrect.";
            if (points >= 41)
                return "An acceptable effort, but there is room for improvement in clarity and depth.";
            if (points >= 36)
                return "You are starting to grasp the material, but more depth and accuracy are needed.";
            if (points >= 31)
                return "A basic attempt is made, but it falls short of expectations. Review the feedback to improve.";
            if (points >= 26)
                return "The work shows minimal understanding of the topic. Focus on building your foundational knowledge.";
            if (points >= 21)
                return "Some attempt is evident, but significant gaps in understanding remain. More effort is required.";
            if (points >= 16)
                return "The response is incomplete and lacks critical understanding. Improvement is needed in future submissions.";
            if (points >= 11)
                return "This effort does not meet the basic requirements. Please focus on the foundational concepts.";
            if (points >= 6)
                return "Very minimal effort is evident in the work. It's essential to review the material thoroughly.";
            return "The submission demonstrates a lack of understanding of the topic. Please see me for guidance.";
        };
        const calculateGrade = (mark) => {
            if (mark >= 74)
                return "A1";
            if (mark >= 69)
                return "B2";
            if (mark >= 64)
                return "B3";
            if (mark >= 59)
                return "C4";
            if (mark >= 54)
                return "C5";
            if (mark >= 49)
                return "C6";
            if (mark >= 44)
                return "D7";
            if (mark >= 39)
                return "E8";
            if (mark >= 0)
                return "F9";
            return null;
        };
        const grade = calculateGrade(genPoint);
        // Update the report card with filtered results and new stats
        const updatedReport = await cardReportModel_1.default.findByIdAndUpdate(reportCard._id, {
            result: updatedResults,
            points: genPoint,
            grade: grade,
            adminComment: generateAdminComment(genPoint),
            classTeacherComment: generateTeacherComment(genPoint),
        }, { new: true });
        return res.status(200).json({
            message: "Subject removed from report card successfully",
            data: updatedReport,
            status: 200,
        });
    }
    catch (error) {
        console.error("Error removing subject from report card:", error);
        return res.status(500).json({
            message: "Error removing subject from report card",
            error: error.message,
            status: 500,
        });
    }
};
exports.deleteReportCardEntry = deleteReportCardEntry;
/**
 * Bulk fetch report cards for all students in a class.
 * Used for computing class position efficiently (single DB round-trip).
 * GET /class-report-cards/:classID
 */
const getClassReportCards = async (req, res) => {
    try {
        const { classID } = req.params;
        // Fetch all students in the class with their report cards populated
        const students = await studentModel_1.default
            .find({ presentClassID: classID })
            .populate({ path: "reportCard" })
            .select("_id reportCard classAssigned");
        if (!students || students.length === 0) {
            return res.status(200).json({
                message: "No students found in class",
                data: [],
                status: 200,
            });
        }
        // Return only the data needed for position computation
        const data = students.map((s) => ({
            id: s._id?.toString(),
            classAssigned: s.classAssigned,
            reportCard: (s.reportCard || []).map((card) => ({
                classInfo: card.classInfo,
                result: (card.result || []).map((r) => ({
                    subject: r.subject,
                    test1: r.test1 ?? 0,
                    test2: r.test2 ?? 0,
                    test3: r.test3 ?? 0,
                    test4: r.test4 ?? 0,
                    exam: r.exam ?? 0,
                    mark: r.mark,
                })),
            })),
        }));
        return res.status(200).json({
            message: "Class report cards fetched successfully",
            data,
            status: 200,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Error fetching class report cards",
            error: error.message,
            status: 500,
        });
    }
};
exports.getClassReportCards = getClassReportCards;
