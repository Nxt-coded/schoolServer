"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findSchoolOutGoneStudents = exports.viewSchoolOutGoneStudents = exports.createSchoolOutGoneStudent = void 0;
const schoolModel_1 = __importDefault(require("../model/schoolModel"));
const studentModel_1 = __importDefault(require("../model/studentModel"));
const outGoneStudentModel_1 = __importDefault(require("../model/outGoneStudentModel"));
const classroomModel_1 = __importDefault(require("../model/classroomModel"));
const mongoose_1 = require("mongoose");
const createSchoolOutGoneStudent = async (req, res) => {
    try {
        const { schoolID, studentID } = req.params;
        const school = await schoolModel_1.default.findById(schoolID);
        const student = await studentModel_1.default.findById(studentID);
        if (!student) {
            return res.status(404).json({
                message: "Student not found",
                status: 404,
            });
        }
        if (school && school.schoolName && school.status === "school-admin") {
            const checkFirst = (school?.students).some((el) => el.toString() === `${studentID}`);
            if (checkFirst) {
                // Create outgone student record
                const outGoneRecord = await outGoneStudentModel_1.default.create({
                    studentName: `${student?.studentFirstName} ${student?.studentLastName}`,
                    student: studentID,
                    schoolInfo: schoolID,
                    classAssigned: student?.classAssigned,
                });
                // Remove from current class if they're in one
                if (student.presentClassID) {
                    await classroomModel_1.default.findByIdAndUpdate(student.presentClassID, {
                        $pull: { students: new mongoose_1.Types.ObjectId(studentID) },
                    });
                }
                // Remove from school's student list
                await schoolModel_1.default.findByIdAndUpdate(schoolID, {
                    $pull: { students: new mongoose_1.Types.ObjectId(studentID) },
                    $push: { outGoneStudents: new mongoose_1.Types.ObjectId(outGoneRecord._id) },
                });
                return res.status(201).json({
                    message: "Student successfully moved to outgone list and removed from class",
                    data: outGoneRecord,
                    status: 201,
                });
            }
            else {
                return res.status(404).json({
                    message: "Student not found in school records",
                    status: 404,
                });
            }
        }
        else {
            return res.status(404).json({
                message: "School not found or unauthorized",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating outgone student record",
            status: 404,
            data: error.message,
        });
    }
};
exports.createSchoolOutGoneStudent = createSchoolOutGoneStudent;
const viewSchoolOutGoneStudents = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const announcement = await schoolModel_1.default.findById(schoolID).populate({
            path: "outGoneStudents",
            options: {
                sort: {
                    createdAt: -1,
                },
            },
        });
        return res.status(201).json({
            message: "announcement read successfully",
            data: announcement,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school announcement",
            status: 404,
        });
    }
};
exports.viewSchoolOutGoneStudents = viewSchoolOutGoneStudents;
const findSchoolOutGoneStudents = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const { studentName } = req.body;
        const announcement = await schoolModel_1.default
            .findById(schoolID)
            .populate({
            path: "outGoneStudents",
            options: {
                sort: {
                    createdAt: -1,
                },
            },
        })
            .find({ studentName });
        return res.status(201).json({
            message: "announcement read successfully",
            data: announcement,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school announcement",
            status: 404,
        });
    }
};
exports.findSchoolOutGoneStudents = findSchoolOutGoneStudents;
