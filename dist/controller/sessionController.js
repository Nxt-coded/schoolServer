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
exports.migrateStudentsFromSSS1Holders = exports.getAllClassSessionResults = exports.createSessionHistory = exports.updateTermPay = exports.getAllSession = exports.viewTerm = exports.termPerSession = exports.studentsPerSession = exports.viewSchoolPresentSessionTerm = exports.viewSchoolPresentSession = exports.viewSchoolSession = exports.createNewSchoolSession = exports.createSchoolSession = void 0;
const schoolModel_1 = __importDefault(require("../model/schoolModel"));
const sessionModel_1 = __importDefault(require("../model/sessionModel"));
const mongoose_1 = require("mongoose");
const studentModel_1 = __importDefault(require("../model/studentModel"));
const termModel_1 = __importDefault(require("../model/termModel"));
const classroomModel_1 = __importDefault(require("../model/classroomModel"));
const classHistory_1 = __importDefault(require("../model/classHistory"));
const staffModel_1 = __importDefault(require("../model/staffModel"));
const cardReportModel_1 = __importDefault(require("../model/cardReportModel"));
const createSchoolSession = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const { year, term } = req.body;
        const school = await schoolModel_1.default.findById(schoolID);
        if (school && school.schoolName) {
            const session = await sessionModel_1.default.create({
                year,
                term,
            });
            school.session.push(new mongoose_1.Types.ObjectId(session._id));
            school.save();
            return res.status(201).json({
                message: "session created successfully",
                data: session,
                status: 201,
            });
        }
        else {
            return res.status(404).json({
                message: "unable to read school",
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school session",
        });
    }
};
exports.createSchoolSession = createSchoolSession;
// export const createNewSchoolSession = async (
//   req: Request,
//   res: Response
// ): Promise<Response> => {
//   try {
//     const { schoolID } = req.params;
//     const { year } = req.body;
//     let paid = 0;
//     let notPaid = 0;
//     const school: any = await schoolModel
//       .findById(schoolID)
//       .populate({ path: "students" });
//     const schoolClass: any = await schoolModel
//       .findById(schoolID)
//       .populate({ path: "classRooms" });
//     const schoolTeacher: any = await schoolModel
//       .findById(schoolID)
//       .populate({ path: "staff" });
//     const schl = await schoolModel.findByIdAndUpdate(
//       schoolID,
//       {
//         presentSession: year,
//         // presentSessionID: year,
//       },
//       { new: true }
//     );
//     // const schoolStudents: any = await schoolModel
//     //   .findById(schoolID)
//     //   .populate({ path: "students" });
//     // const pushClass = await schoolModel.findById(schoolID).populate({
//     //   path: "classHistory",
//     // });
//     let totalStudent = school?.students?.length;
//     let totalStaff = school?.staff?.length;
//     let totalSubjects = school?.subjects?.length;
//     const students: any = school?.students;
//     if (school && school.schoolName) {
//       for (let i of students!) {
//         totalStudent++;
//         if (i.feesPaid1st || i.feesPaid2nd || i.feesPaid2nd) {
//           paid++;
//           await studentModel.findByIdAndUpdate(
//             i?._id,
//             { feesPaid1st: false, feesPaid2nd: false, feesPaid3rd: false }
//             // { new: true }
//           );
//         } else {
//           notPaid++;
//         }
//       }
//       const session = await sessionModel.create({
//         schoolID,
//         year,
//         // term,
//         totalStudents: totalStudent,
//         numberOfTeachers: totalStaff,
//         numberOfSubjects: totalSubjects,
//         studentFeesNotPaid: notPaid,
//         studentFeesPaid: paid,
//       });
//       const schoolData = schoolModel.findByIdAndUpdate(
//         schoolID,
//         { presentSessionID: session?._id.toString() },
//         { new: true }
//       );
//       school.session.push(new Types.ObjectId(session._id));
//       school.classHistory.push(new Types.ObjectId(session?._id));
//       school.save();
//       schoolClass?.classRooms.find((el: any) => {
//         return;
//       });
//       for (let i of schoolClass?.classRooms) {
//         let num: number = parseInt(`${i.className}`?.match(/\d+/)![0]);
//         let name = i?.className?.split(`${num}`);
//         // {name[0].trim()} ${num + 1}${name[1].trim()}
//         if (num < 4 && name[0].trim() === "JSS") {
//           await classroomModel.findByIdAndUpdate(
//             i?._id,
//             {
//               className: `
//               ${
//                 num + 1 > 3
//                   ? `SSS ${1}${name[1]?.trim()}`
//                   : `${name[0]?.trim()} ${num + 1}${name[1]?.trim()}`
//               }
//               `,
//             },
//             { new: true }
//           );
//         } else if (num < 3 && name[0]?.trim() === "SSS") {
//           await classroomModel.findByIdAndUpdate(
//             i?._id,
//             {
//               className: `
//               ${name[0]?.trim()} ${num + 1}${name[1]?.trim()}
//               `,
//             },
//             { new: true }
//           );
//         } else {
//           await classroomModel.findByIdAndDelete(i?._id);
//           schoolClass.classRooms.pull(new Types.ObjectId(i?._id));
//           school?.classRooms?.pull(new Types.ObjectId(i?._id));
//           school.save();
//         }
//       }
//       for (let i of students!) {
//         let num: number = parseInt(`${i.classAssigned}`?.match(/\d+/)![0]);
//         let name = i?.classAssigned?.split(`${num}`);
//         if (num < 4 && name[0].trim() === "JSS") {
//           await studentModel.findByIdAndUpdate(
//             i?._id,
//             {
//               classAssigned: ` ${
//                 num + 1 > 3
//                   ? `SSS ${1}${name[1]?.trim()}`
//                   : `${name[0]?.trim()} ${num + 1}${name[1]?.trim()}`
//               }`,
//               attendance: null,
//               performance: null,
//               feesPaid1st: false,
//               feesPaid2nd: false,
//               feesPaid3rd: false,
//             },
//             { new: true }
//           );
//         } else if (num < 3 && name[0]?.trim() === "SSS") {
//           await studentModel.findByIdAndUpdate(
//             i?._id,
//             {
//               classAssigned: ` ${`${name[0]?.trim()} ${
//                 num + 1
//               }${name[1]?.trim()}`}`,
//               attendance: null,
//               performance: null,
//               feesPaid1st: false,
//               feesPaid2nd: false,
//               feesPaid3rd: false,
//             },
//             { new: true }
//           );
//         } else {
//           await studentModel.findByIdAndDelete(i?._id);
//           schoolClass.students.pull(new Types.ObjectId(i?._id));
//           school?.students.pull(new Types.ObjectId(i?._id));
//           school?.save();
//         }
//       }
//       for (let i of schoolTeacher?.staff!) {
//         i?.classesAssigned.map(async (el: any) => {
//           let num: number = parseInt(`${el?.className}`?.match(/\d+/)![0])
//             ? parseInt(`${el?.className}`?.match(/\d+/)![0])
//             : 0;
//           let name = el?.className?.split(`${num}`);
//           if (num < 4 && name[0].trim() === "JSS") {
//             el.className = ` ${
//               num + 1 > 3
//                 ? `SSS ${1}${name[1]?.trim()}`
//                 : `${name[0]?.trim()} ${num + 1}${name[1]?.trim()}`
//             }`;
//           } else if (num < 3 && name[0]?.trim() === "SSS") {
//             el.className = ` ${`${name[0]?.trim()} ${
//               num + 1
//             }${name[1]?.trim()}`}`;
//           } else {
//           }
//         });
//         i.save();
//       }
//       schoolTeacher.save();
//       return res.status(201).json({
//         message: "session created successfully",
//         data: session,
//       });
//     } else {
//       return res.status(404).json({
//         message: "unable to read school",
//       });
//     }
//   } catch (error: any) {
//     return res.status(404).json({
//       message: "Error creating school session",
//       data: error,
//       error: error.stack,
//     });
//   }
// };
const createNewSchoolSession = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const { year } = req.body;
        // Validation
        if (!year || typeof year !== "string") {
            return res.status(400).json({
                message: "Invalid year format",
            });
        }
        // Fetch school with all necessary populations in one query
        const school = await schoolModel_1.default
            .findById(schoolID)
            .populate({ path: "students" })
            .populate({ path: "classRooms" })
            .populate({ path: "staff" })
            .populate({ path: "session" });
        if (!school || !school.schoolName) {
            return res.status(404).json({
                message: "School not found",
            });
        }
        // Check for duplicate session
        const existingSession = school.session?.find((s) => s.year === year);
        if (existingSession) {
            return res.status(400).json({
                message: `Session for year ${year} already exists`,
            });
        }
        // Initialize counters
        let paidStudents = 0;
        let notPaidStudents = 0;
        const students = school.students || [];
        const classRooms = school.classRooms || [];
        const staff = school.staff || [];
        // Count paid/unpaid students
        for (const student of students) {
            if (student.feesPaid1st || student.feesPaid2nd || student.feesPaid3rd) {
                paidStudents++;
            }
            else {
                notPaidStudents++;
            }
        }
        // Create new session record
        const session = await sessionModel_1.default.create({
            schoolID,
            year,
            totalStudents: students.length,
            numberOfTeachers: staff.length,
            numberOfSubjects: school.subjects?.length || 0,
            studentFeesNotPaid: notPaidStudents,
            studentFeesPaid: paidStudents,
        });
        // Update school with new session info
        await schoolModel_1.default.findByIdAndUpdate(schoolID, {
            presentSession: year,
            presentSessionID: session._id.toString(),
            $push: {
                session: session._id,
                classHistory: session._id,
            },
            sendSMS: false,
        }, { new: true });
        // Helper function to promote class name
        const promoteClassName = (className) => {
            if (!className)
                return null;
            const match = className.match(/\d+/);
            if (!match)
                return null;
            const num = parseInt(match[0]);
            const parts = className.split(`${num}`);
            const prefix = parts[0]?.trim();
            const suffix = parts[1]?.trim() || "";
            if (prefix === "JSS") {
                if (num < 3) {
                    return `JSS ${num + 1}${suffix}`;
                }
                else if (num === 3) {
                    // JSS 3 students go to SSS 1Holders, not promoted to individual classes
                    return null;
                }
                else {
                    return null; // Graduate
                }
            }
            else if (prefix === "SSS") {
                if (num < 3) {
                    return `SSS ${num + 1}${suffix}`;
                }
                else {
                    return null; // Graduate (SSS 3 and above graduate)
                }
            }
            return null;
        };
        // Batch operations for better performance
        const classRoomUpdates = [];
        const classRoomDeletions = [];
        for (const classRoom of classRooms) {
            const newClassName = promoteClassName(classRoom.className);
            if (newClassName) {
                classRoomUpdates.push(classroomModel_1.default.findByIdAndUpdate(classRoom._id, { className: newClassName }, { new: true }));
            }
            else {
                classRoomDeletions.push(classRoom._id.toString());
            }
        }
        // Execute classroom updates
        await Promise.all(classRoomUpdates);
        // Delete graduated classrooms and update school
        if (classRoomDeletions.length > 0) {
            await classroomModel_1.default.deleteMany({ _id: { $in: classRoomDeletions } });
            await schoolModel_1.default.findByIdAndUpdate(schoolID, {
                $pull: { classRooms: { $in: classRoomDeletions } },
            });
        }
        // Process students
        const studentUpdates = [];
        const studentDeletions = [];
        const jss3Students = []; // Collect all JSS 3 students (JSS 3, JSS 3A, JSS 3B, JSS 3C, etc.) for SSS 1Holders class
        const isCardoso = schoolID === "7b92fdb8" ||
            school.email?.toLowerCase() === "richardmd44@yahoo.com" ||
            school.schoolName?.toLowerCase().includes("cardoso");
        for (const student of students) {
            const classAssignedTrimmed = student.classAssigned?.trim() || "";
            let shouldRepeat = false;
            if (isCardoso) {
                // Fetch report card matching this student and target session info
                const targetClassInfo = `${student.classAssigned} session: ${school.presentSession}(${school.presentTerm})`;
                const reportCard = await cardReportModel_1.default.findOne({
                    student: student._id,
                    classInfo: targetClassInfo,
                });
                if (reportCard) {
                    const results = reportCard.result || [];
                    const percentage = reportCard.points || 0;
                    const isSubjectFail = (sub) => {
                        if (!sub)
                            return false;
                        const mark = sub?.mark ??
                            ((sub?.test1 ?? 0) +
                                (sub?.test2 ?? 0) +
                                (sub?.test3 ?? 0) +
                                (sub?.test4 ?? 0) +
                                (sub?.exam ?? 0));
                        const grade = (sub?.grade || "").toString().toUpperCase();
                        return mark < 40 || grade === "F9" || grade === "F";
                    };
                    const mathSubject = results.find((item) => (item?.subject || "").toLowerCase().includes("math"));
                    const englishSubject = results.find((item) => (item?.subject || "").toLowerCase().includes("english"));
                    const failedMaths = mathSubject ? isSubjectFail(mathSubject) : false;
                    const failedEnglish = englishSubject ? isSubjectFail(englishSubject) : false;
                    const failedBothMathsAndEnglish = failedMaths && failedEnglish;
                    const isBelow45Percent = percentage < 45;
                    if (failedBothMathsAndEnglish || isBelow45Percent) {
                        shouldRepeat = true;
                    }
                }
            }
            if (shouldRepeat) {
                // Keep them in their current class room
                studentUpdates.push(studentModel_1.default.findByIdAndUpdate(student._id, {
                    classAssigned: student.classAssigned, // Unchanged
                    attendance: null,
                    performance: null,
                    feesPaid1st: false,
                    feesPaid2nd: false,
                    feesPaid3rd: false,
                }, { new: true }));
                continue;
            }
            // Collect all JSS 3 students (JSS 3, JSS 3A, JSS 3B, JSS 3C, etc.) BEFORE they are promoted
            if (classAssignedTrimmed.startsWith("JSS 3")) {
                jss3Students.push(student._id.toString());
                // Don't promote them individually; they'll be assigned to SSS 1Holders
                continue;
            }
            const newClassName = promoteClassName(student.classAssigned);
            if (newClassName) {
                studentUpdates.push(studentModel_1.default.findByIdAndUpdate(student._id, {
                    classAssigned: newClassName,
                    attendance: null,
                    performance: null,
                    feesPaid1st: false,
                    feesPaid2nd: false,
                    feesPaid3rd: false,
                }, { new: true }));
            }
            else {
                // Student has graduated (or is JSS 3 which will be handled separately)
                if (!classAssignedTrimmed.startsWith("JSS 3")) {
                    studentDeletions.push(student._id.toString());
                }
            }
        }
        // Execute student updates
        await Promise.all(studentUpdates);
        // Handle graduated students: create outGone entries, remove from school lists, and delete student records
        if (studentDeletions.length > 0) {
            for (const studentId of studentDeletions) {
                try {
                    const studentData = await studentModel_1.default.findById(studentId);
                    if (studentData) {
                        // create outGone record
                        const out = await (await Promise.resolve().then(() => __importStar(require("../model/outGoneStudentModel")))).default.create({
                            studentName: `${studentData.studentFirstName} ${studentData.studentLastName}`,
                            student: studentId,
                            schoolInfo: schoolID,
                        });
                        // push to school's outGoneStudents
                        await schoolModel_1.default.findByIdAndUpdate(schoolID, {
                            $push: { outGoneStudents: out._id },
                        });
                    }
                    // remove student from school's student array
                    await schoolModel_1.default.findByIdAndUpdate(schoolID, {
                        $pull: { students: studentId },
                    });
                    // finally delete the student record
                    await studentModel_1.default.findByIdAndDelete(studentId);
                }
                catch (err) {
                    // continue on errors for individual students
                    console.error(`Error processing graduated student ${studentId}:`, err);
                }
            }
        }
        // Process teachers' class assignments
        const teacherUpdates = [];
        for (const teacher of staff) {
            if (teacher.classesAssigned && Array.isArray(teacher.classesAssigned)) {
                // Build updated array preserving original entries but replacing className when promotion applies
                const updatedClasses = teacher.classesAssigned.map((classAssignment) => {
                    const newClassName = promoteClassName(classAssignment.className);
                    if (newClassName) {
                        return { ...classAssignment, className: newClassName };
                    }
                    return { ...classAssignment };
                });
                // Detect if any className changed (compare by index)
                const hasChanged = teacher.classesAssigned.some((orig, idx) => orig?.className !== updatedClasses[idx]?.className);
                if (hasChanged) {
                    teacherUpdates.push(staffModel_1.default.findByIdAndUpdate(teacher._id, { classesAssigned: updatedClasses }, { new: true }));
                }
            }
        }
        // Execute teacher updates
        await Promise.all(teacherUpdates);
        // Check if SSS 1Holders classroom exists, otherwise create it and assign JSS 3 students
        let sss1HoldersClassroom = null;
        let classroomCreated = false;
        if (jss3Students.length > 0) {
            try {
                // Check if SSS 1Holders classroom already exists for this school
                sss1HoldersClassroom = await classroomModel_1.default.findOne({
                    className: "SSS 1Holders",
                    schoolIDs: schoolID,
                });
                if (!sss1HoldersClassroom) {
                    // Create new SSS 1Holders classroom if it doesn't exist
                    sss1HoldersClassroom = await classroomModel_1.default.create({
                        className: "SSS 1Holders",
                        schoolIDs: schoolID,
                        students: jss3Students,
                    });
                    // Add the new classroom to school
                    await schoolModel_1.default.findByIdAndUpdate(schoolID, {
                        $push: { classRooms: sss1HoldersClassroom._id },
                    });
                    classroomCreated = true;
                }
                else {
                    // SSS 1Holders exists, add new students to it
                    await classroomModel_1.default.findByIdAndUpdate(sss1HoldersClassroom._id, {
                        $addToSet: { students: { $each: jss3Students } }, // $addToSet prevents duplicates
                    }, { new: true });
                }
                // Update each JSS 3 student to be assigned to this classroom
                for (const studentId of jss3Students) {
                    await studentModel_1.default.findByIdAndUpdate(studentId, {
                        classAssigned: "SSS 1Holders",
                    });
                }
            }
            catch (err) {
                console.error("Error handling SSS 1Holders classroom:", err);
            }
        }
        return res.status(201).json({
            message: "Session created and students promoted successfully",
            data: {
                session,
                promotedStudents: studentUpdates.length,
                graduatedStudents: studentDeletions.length,
                deletedClassRooms: classRoomDeletions.length,
                jss3HoldersCreated: classroomCreated,
                jss3StudentsAssigned: jss3Students.length,
            },
        });
    }
    catch (error) {
        console.error("Error creating school session:", error);
        return res.status(500).json({
            message: "Error creating school session",
            error: error.message,
        });
    }
};
exports.createNewSchoolSession = createNewSchoolSession;
const viewSchoolSession = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const school = await schoolModel_1.default.findById(schoolID).populate({
            path: "session",
            options: {
                sort: {
                    createdAt: -1,
                },
            },
        });
        return res.status(200).json({
            message: "viewing school session",
            data: school?.session,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error viewing school session",
            data: error.message,
        });
    }
};
exports.viewSchoolSession = viewSchoolSession;
const viewSchoolPresentSession = async (req, res) => {
    try {
        const { sessionID } = req.params;
        const school = await sessionModel_1.default.findById(sessionID).populate({
            path: "term",
        });
        return res.status(200).json({
            message: "viewing school session now!",
            data: school,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error viewing school session",
            data: error.message,
        });
    }
};
exports.viewSchoolPresentSession = viewSchoolPresentSession;
const viewSchoolPresentSessionTerm = async (req, res) => {
    try {
        const { termID } = req.params;
        const school = await termModel_1.default.findById(termID);
        return res.status(200).json({
            message: "viewing school session",
            data: school,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error viewing school session",
            data: error.message,
        });
    }
};
exports.viewSchoolPresentSessionTerm = viewSchoolPresentSessionTerm;
const studentsPerSession = async (req, res) => {
    try {
        const { sessionID } = req.params;
        const { totalStudents } = req.body;
        const session = await sessionModel_1.default.findById(sessionID);
        if (session) {
            const students = await sessionModel_1.default.findByIdAndUpdate(sessionID, { totalStudents }, { new: true });
            return res.status(200).json({
                message: "viewing session session",
                data: students,
            });
        }
        else {
            return res.status(404).json({
                message: "Error finding school session",
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error viewing school session",
        });
    }
};
exports.studentsPerSession = studentsPerSession;
const termPerSession = async (req, res) => {
    try {
        const { sessionID } = req.params;
        let { term } = req.body;
        const session = await sessionModel_1.default.findById(sessionID).populate({
            path: "term",
        });
        const schoolClass = await schoolModel_1.default
            .findById(session?.schoolID)
            .populate({ path: "classRooms" });
        if (session) {
            if (term === "1st Term" ||
                term === "First Term" ||
                term === "2nd Term" ||
                term === "Second Term" ||
                term === "3rd Term" ||
                term === "Third Term") {
                const capitalizedText = (str) => {
                    let result = "";
                    let word = str.split(" ");
                    for (let i of word) {
                        result = result + i[0].toUpperCase().concat(i.slice(1), " ");
                    }
                    return result.trim();
                };
                const check = session.term.some((el) => {
                    return el.term === capitalizedText(term);
                });
                if (check) {
                    return res.status(404).json({
                        message: "Term Already exist",
                    });
                }
                else {
                    // presentTerm
                    const viewDetail = await termModel_1.default.findById(session?.term[session?.term.length - 1]?._id);
                    let resultHist = [];
                    for (let i of schoolClass?.classRooms) {
                        resultHist.push({ ...i });
                        await termModel_1.default.findByIdAndUpdate(session?.term[session?.term.length - 1]?._id, {
                            classResult: resultHist,
                        }, { new: true });
                    }
                    const sessionRecorde = await sessionModel_1.default.findByIdAndUpdate(sessionID, { presentTerm: capitalizedText(term) }, { new: true });
                    for (let i of schoolClass?.classRooms) {
                        await classroomModel_1.default.findByIdAndUpdate(i?._id, {
                            presentTerm: capitalizedText(term),
                            attendance: [],
                            timeTable: [],
                            lessonNotes: [],
                            reportCard: [],
                            assignment: [],
                            assignmentResolve: [],
                            weekStudent: {},
                        }, { new: true });
                    }
                    const sessionTerm = await termModel_1.default.create({
                        term: capitalizedText(term),
                        year: session?.year,
                        presentTerm: term,
                    });
                    await schoolModel_1.default.findByIdAndUpdate(sessionRecorde?.schoolID, {
                        presentTermID: sessionTerm?._id?.toString(),
                        presentSessionID: sessionID,
                        presentTerm: term,
                        sendSMS: false,
                    }, { new: true });
                    session?.term.push(new mongoose_1.Types.ObjectId(sessionTerm?._id));
                    session?.save();
                    if (schoolClass?.session?.length > 1 || session?.term?.length > 1) {
                        await schoolModel_1.default.findByIdAndUpdate(sessionRecorde?.schoolID, {
                            presentTermID: sessionTerm?._id?.toString(),
                            freeMode: false,
                        }, { new: true });
                    }
                    return res.status(200).json({
                        message: "creating session term",
                        data: sessionTerm,
                        status: 201,
                    });
                }
            }
            else {
                return res.status(404).json({
                    message: "Term can't be created",
                });
            }
        }
        else {
            return res.status(404).json({
                message: "Error finding school session",
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error viewing school session",
        });
    }
};
exports.termPerSession = termPerSession;
const viewTerm = async (req, res) => {
    try {
        const { termID } = req.params;
        const getAll = await termModel_1.default.findById(termID);
        return res.status(200).json({
            message: "viewing term details",
            data: getAll,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "error getting session",
            data: error.message,
        });
    }
};
exports.viewTerm = viewTerm;
const getAllSession = async (req, res) => {
    try {
        const getAll = await sessionModel_1.default.find().populate({
            path: "term",
        });
        return res.status(200).json({
            message: "all session gotten",
            data: getAll,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "error getting session",
            data: error.message,
        });
    }
};
exports.getAllSession = getAllSession;
const updateTermPay = async (req, res) => {
    try {
        const { termID } = req.params;
        const { costPaid, payRef } = req.body;
        const getAll = await termModel_1.default.findByIdAndUpdate(termID, {
            plan: true,
            costPaid,
            payRef,
        }, { new: true });
        return res.status(200).json({
            message: "Term payment has been recorded successfully",
            data: getAll,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "error getting session",
            data: error.message,
        });
    }
};
exports.updateTermPay = updateTermPay;
const createSessionHistory = async (req, res) => {
    try {
        const { classID } = req.params;
        const { text } = req.body;
        const getClassRoom = await classroomModel_1.default.findById(classID);
        const teacher = await staffModel_1.default.findById(getClassRoom?.teacherID);
        const getSchool = await schoolModel_1.default
            .findById(teacher?.schoolIDs)
            .populate({ path: "session" });
        let history = [];
        for (let i of getClassRoom?.students) {
            let getStudentsData = await studentModel_1.default
                .findById(i)
                .populate({ path: "reportCard" });
            history.push(getStudentsData);
        }
        const getAll = await classHistory_1.default.create({
            resultHistory: history,
            // session: getSchool?.session[0]?.year!,
            // term: getSchool?.session[0]?.presentTerm!,
            session: getSchool?.presentSession,
            term: getSchool?.presentTerm,
            classTeacherName: getClassRoom?.classTeacherName,
            className: getClassRoom?.className,
            principalsRemark: text,
        });
        getClassRoom?.classHistory.push(new mongoose_1.Types.ObjectId(getAll?._id));
        getClassRoom?.save();
        return res.status(200).json({
            message: "all session gotten",
            data: getAll,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "error getting session",
            data: error.message,
        });
    }
};
exports.createSessionHistory = createSessionHistory;
const getAllClassSessionResults = async (req, res) => {
    try {
        const { classID } = req.params;
        const getAll = await classroomModel_1.default.findById(classID).populate({
            path: "classHistory",
        });
        return res.status(200).json({
            message: "all session gotten",
            data: getAll,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "error getting session",
            data: error.message,
        });
    }
};
exports.getAllClassSessionResults = getAllClassSessionResults;
const migrateStudentsFromSSS1Holders = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const { studentMigrations } = req.body; // Array of { studentId, targetClassName }
        // Validation
        if (!Array.isArray(studentMigrations) || studentMigrations.length === 0) {
            return res.status(400).json({
                message: "Invalid studentMigrations format. Expected non-empty array.",
                status: 400,
            });
        }
        const migrationResults = {
            successful: 0,
            failed: 0,
            errors: [],
        };
        // Process each student migration
        for (const migration of studentMigrations) {
            const { studentId, targetClassName } = migration;
            try {
                // Validate target classroom format
                if (!targetClassName || typeof targetClassName !== "string") {
                    migrationResults.failed++;
                    migrationResults.errors.push({
                        studentId,
                        error: "Invalid target classroom name",
                    });
                    continue;
                }
                // Fetch the student
                const student = await studentModel_1.default.findById(studentId);
                if (!student) {
                    migrationResults.failed++;
                    migrationResults.errors.push({
                        studentId,
                        error: "Student not found",
                    });
                    continue;
                }
                // Get the student's current class
                const currentClassName = student.classAssigned;
                if (!currentClassName) {
                    migrationResults.failed++;
                    migrationResults.errors.push({
                        studentId,
                        error: "Student has no current class assigned",
                    });
                    continue;
                }
                // Find target classroom (do NOT create if it doesn't exist)
                let targetClassroom = await classroomModel_1.default.findOne({
                    className: targetClassName,
                    $or: [{ school: schoolID }, { schoolIDs: schoolID }],
                });
                if (!targetClassroom) {
                    // Target classroom does not exist - fail this migration
                    migrationResults.failed++;
                    migrationResults.errors.push({
                        studentId,
                        error: `Target classroom "${targetClassName}" does not exist. Please create the class first.`,
                    });
                    continue;
                }
                // Find the student's current classroom
                let currentClassroom = await classroomModel_1.default.findOne({
                    className: currentClassName,
                    $or: [{ school: schoolID }, { schoolIDs: schoolID }],
                });
                if (!currentClassroom) {
                    migrationResults.failed++;
                    migrationResults.errors.push({
                        studentId,
                        error: `Current classroom "${currentClassName}" not found in this school.`,
                    });
                    continue;
                }
                // Add student to target classroom
                await classroomModel_1.default.findByIdAndUpdate(targetClassroom._id, {
                    $addToSet: { students: studentId },
                });
                // Remove student from current classroom
                try {
                    if (currentClassroom && currentClassroom._id) {
                        await classroomModel_1.default.findByIdAndUpdate(currentClassroom._id, { $pull: { students: studentId } }, { new: true });
                        // Keep local copy in sync if present
                        if (Array.isArray(currentClassroom.students)) {
                            currentClassroom.students = currentClassroom.students.filter((s) => s?.toString() !== studentId?.toString());
                        }
                    }
                    else {
                        // Fallback: try to find and remove the student from current class
                        await classroomModel_1.default.findOneAndUpdate({
                            className: currentClassName,
                            $or: [{ school: schoolID }, { schoolIDs: schoolID }],
                        }, { $pull: { students: studentId } });
                    }
                }
                catch (err) {
                    // Non-fatal: record error and continue with migration
                    migrationResults.failed++;
                    migrationResults.errors.push({
                        studentId,
                        error: `Failed to remove from ${currentClassName}: ${err?.message || err}`,
                    });
                    continue;
                }
                // Update student's class assignment
                await studentModel_1.default.findByIdAndUpdate(studentId, {
                    classAssigned: targetClassName,
                });
                migrationResults.successful++;
            }
            catch (err) {
                migrationResults.failed++;
                migrationResults.errors.push({
                    studentId,
                    error: err.message,
                });
            }
        }
        return res.status(200).json({
            message: "Student migration completed",
            data: migrationResults,
            status: 200,
        });
    }
    catch (error) {
        console.error("Error migrating students:", error);
        return res.status(500).json({
            message: "Error migrating students",
            error: error.message,
            status: 500,
        });
    }
};
exports.migrateStudentsFromSSS1Holders = migrateStudentsFromSSS1Holders;
