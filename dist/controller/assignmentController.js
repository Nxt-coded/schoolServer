"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readAssignmentResult = exports.readStudentAssignmentResult = exports.readSubjectAssignmentResult = exports.createAssignmentPerformance = exports.readAssignment = exports.readTeacherSubjectAssignment = exports.readClassSubjectAssignment = exports.readSubjectAssignment = exports.createSubjectAssignment = void 0;
const mongoose_1 = require("mongoose");
const classroomModel_1 = __importDefault(require("../model/classroomModel"));
const staffModel_1 = __importDefault(require("../model/staffModel"));
const subjectModel_1 = __importDefault(require("../model/subjectModel"));
const quizModel_1 = __importDefault(require("../model/quizModel"));
const studentModel_1 = __importDefault(require("../model/studentModel"));
const assignmentResolvedModel_1 = __importDefault(require("../model/assignmentResolvedModel"));
const assignmentModel_1 = __importDefault(require("../model/assignmentModel"));
const createSubjectAssignment = async (req, res) => {
    try {
        const { classID, subjectID } = req.params;
        const { assignmentTopic, assignmentDetails, assignmentDeadline } = req.body;
        const classRoom = await classroomModel_1.default.findById(classID);
        const checkForSubject = await subjectModel_1.default.findById(subjectID);
        const findTeacher = await staffModel_1.default.findById(classRoom?.teacherID);
        if (checkForSubject) {
            const quizes = await assignmentModel_1.default.create({
                subjectTitle: checkForSubject?.subjectTitle,
                assignmentTopic,
                assignmentDetails,
                assignmentDeadline,
            });
            checkForSubject?.assignment.push(new mongoose_1.Types.ObjectId(quizes._id));
            checkForSubject?.save();
            classRoom?.assignment.push(new mongoose_1.Types.ObjectId(quizes._id));
            classRoom?.save();
            findTeacher?.assignment.push(new mongoose_1.Types.ObjectId(quizes._id));
            findTeacher?.save();
            return res.status(201).json({
                message: "assignment resolve entry created successfully",
                data: quizes,
                status: 201,
            });
        }
        else {
            return res.status(404).json({
                message: "Subject doesn't exist for this class",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating class subject quiz",
            status: 404,
        });
    }
};
exports.createSubjectAssignment = createSubjectAssignment;
const readSubjectAssignment = async (req, res) => {
    try {
        const { subjectID } = req.params;
        const subject = await subjectModel_1.default.findById(subjectID).populate({
            path: "assignment",
            options: {
                sort: {
                    time: 1,
                },
            },
        });
        return res.status(201).json({
            message: "subject quiz read successfully",
            data: subject,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating subject quiz",
            status: 404,
        });
    }
};
exports.readSubjectAssignment = readSubjectAssignment;
// export const readClassSubjectAssignment = async (
//   req: Request,
//   res: Response
// ): Promise<Response> => {
//   try {
//     const { classID } = req.params;
//     const quiz: any = await staffModel.findById(classID).populate({
//       path: "assignment",
//       options: {
//         sort: { createdAt: -1 },
//       },
//     });
//     return res.status(201).json({
//       message: "subject quiz read successfully",
//       data: quiz,
//       status: 201,
//     });
//   } catch (error: any) {
//     return res.status(404).json({
//       message: "Error creating subject quiz",
//       data: error.message,
//       status: 404,
//     });
//   }
// };
const readClassSubjectAssignment = async (req, res) => {
    try {
        const { classID } = req.params;
        const quiz = await classroomModel_1.default.findById(classID).populate({
            path: "assignment",
            options: {
                sort: { createdAt: -1 },
            },
        });
        return res.status(201).json({
            message: "subject quiz read successfully",
            data: quiz,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating subject quiz",
            data: error.message,
            status: 404,
        });
    }
};
exports.readClassSubjectAssignment = readClassSubjectAssignment;
const readTeacherSubjectAssignment = async (req, res) => {
    try {
        const { teacherID } = req.params;
        const quiz = await staffModel_1.default.findById(teacherID).populate({
            path: "assignment",
            options: {
                sort: { createdAt: -1 },
            },
        });
        return res.status(201).json({
            message: "subject quiz read successfully",
            data: quiz,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating subject quiz",
            data: error.message,
            status: 404,
        });
    }
};
exports.readTeacherSubjectAssignment = readTeacherSubjectAssignment;
const readAssignment = async (req, res) => {
    try {
        const { assignmentID } = req.params;
        const quiz = await quizModel_1.default.findById(assignmentID);
        return res.status(201).json({
            message: "subject quiz read successfully",
            data: quiz,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating subject quiz",
            data: error.message,
            status: 404,
        });
    }
};
exports.readAssignment = readAssignment;
// Assignment Resolve Session/EndPoints
const createAssignmentPerformance = async (req, res) => {
    try {
        const { studentID, assignmentID } = req.params;
        const { studentScore, studentGrade, remark, assignmentResult } = req.body;
        const studentInfo = await studentModel_1.default
            .findById(studentID)
            .populate({ path: "assignment" });
        const quizData = await assignmentModel_1.default.findById(assignmentID);
        const findSubject = await subjectModel_1.default.findOne({
            subjectTitle: quizData?.subjectTitle,
        });
        if (quizData) {
            const quizes = await assignmentResolvedModel_1.default.create({
                assignmentResult,
                subjectTitle: quizData?.subjectTitle,
                // studentScore,
                // studentGrade,
                // subjectTeacher: findTeacher?.staffName,
                // performanceRating: parseInt(
                //   ((studentScore / quizData?.quiz[1]?.question.length) * 100).toFixed(2)
                // ),
                className: studentInfo?.classAssigned,
                assignmentID: assignmentID,
                studentName: `${studentInfo?.studentFirstName} ${studentInfo?.studentLastName}`,
            });
            quizData?.assignmentResult.push(new mongoose_1.Types.ObjectId(quizes._id));
            quizData?.save();
            studentInfo?.performance.push(new mongoose_1.Types.ObjectId(quizes._id));
            studentInfo?.save();
            findSubject?.performance.push(new mongoose_1.Types.ObjectId(quizes._id));
            findSubject?.save();
            let view = [];
            let notView = [];
            const getStudent = await studentModel_1.default.findById(studentID).populate({
                path: "performance",
            });
            const record = await studentModel_1.default.findByIdAndUpdate(studentID, {
                totalPerformance: view.reduce((a, b) => {
                    return a + b;
                }, 0) / studentInfo?.performance?.length,
            }, { new: true });
            return res.status(201).json({
                message: "quiz entry created successfully",
                data: { quizes, record },
                status: 201,
            });
        }
        else {
            return res.status(404).json({
                message: "Subject doesn't exist for this class",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating class subject quiz",
            status: 404,
        });
    }
};
exports.createAssignmentPerformance = createAssignmentPerformance;
const readSubjectAssignmentResult = async (req, res) => {
    try {
        const { subjectID } = req.params;
        const subject = await subjectModel_1.default.findById(subjectID).populate({
            path: "assignmentResolve",
            options: {
                sort: {
                    time: 1,
                },
            },
        });
        return res.status(201).json({
            message: "subject assignmentResolve performance read successfully",
            data: subject,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating subject quiz",
            status: 404,
        });
    }
};
exports.readSubjectAssignmentResult = readSubjectAssignmentResult;
const readStudentAssignmentResult = async (req, res) => {
    try {
        const { studentID } = req.params;
        const subject = await studentModel_1.default.findById(studentID).populate({
            path: "assignmentResolve",
            options: {
                sort: {
                    time: 1,
                },
            },
        });
        return res.status(201).json({
            message: "subject quiz performance read successfully",
            data: subject,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating subject quiz",
            status: 404,
        });
    }
};
exports.readStudentAssignmentResult = readStudentAssignmentResult;
const readAssignmentResult = async (req, res) => {
    try {
        const { resolveID } = req.params;
        const subject = await assignmentResolvedModel_1.default.findById(resolveID).populate({
            path: "assignmentResolve",
            options: {
                sort: {
                    time: 1,
                },
            },
        });
        return res.status(201).json({
            message: "subject quiz performance read successfully",
            data: subject,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating subject quiz",
            status: 404,
        });
    }
};
exports.readAssignmentResult = readAssignmentResult;
// update to mark
