"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStudentMidReportCard = exports.createStudentreportCard = void 0;
const schoolModel_1 = __importDefault(require("../model/schoolModel"));
const staffModel_1 = __importDefault(require("../model/staffModel"));
const studentModel_1 = __importDefault(require("../model/studentModel"));
const mongoose_1 = require("mongoose");
const classroomModel_1 = __importDefault(require("../model/classroomModel"));
const reportCardModel_1 = __importDefault(require("../model/reportCardModel"));
const midReportCardModel_1 = __importDefault(require("../model/midReportCardModel"));
const createStudentreportCard = async (req, res) => {
    try {
        const { schoolID, staffID, studentID } = req.params;
        const { newTermDate, date, principalRemark, teachersRemark, totalGrade, totalObtainableScore, toataTage, totalObtainedScore, classAVG, remarks, position, grade, totalScore, examScore, continuousAssesment, color, clubSociety, wt, ht, age, DOB, } = req.body;
        const school = await schoolModel_1.default.findById(schoolID);
        const staff = await staffModel_1.default.findById(staffID);
        const student = await studentModel_1.default.findById(studentID);
        // const hold = ;
        const classData = await classroomModel_1.default.findOne({
            className: staff?.classesAssigned,
        });
        console.log("started here!");
        if (school && school.schoolName && staff && classData) {
            const report = await reportCardModel_1.default.create({
                teacherName: staff?.staffName,
                classes: staff?.classesAssigned,
                // name: ,
                image: student?.avatar,
                classAVG,
                newTermDate,
                date,
                principalRemark,
                teachersRemark,
                totalGrade,
                totalObtainableScore,
                totalObtainedScore,
                remarks,
                position,
                grade,
                totalScore,
                examScore,
                continuousAssesment,
                color,
                clubSociety: "JET",
                wt: student?.weight,
                ht: student?.height,
                age: student?.age,
                DOB: student?.DoB,
                session: school?.session,
                toataTage,
            });
            school?.reportCard.push(new mongoose_1.Types.ObjectId(report?._id));
            school?.save();
            staff?.reportCard.push(new mongoose_1.Types.ObjectId(report?._id));
            staff?.save();
            student?.reportCard.push(new mongoose_1.Types.ObjectId(report?._id));
            student?.save();
            return res.status(201).json({
                message: "lesson report created",
                data: report,
                status: 201,
            });
        }
        else {
            return res.status(404).json({
                message: "school not found",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating lesson report",
            status: 404,
            data: error.message,
        });
    }
};
exports.createStudentreportCard = createStudentreportCard;
const createStudentMidReportCard = async (req, res) => {
    try {
        const { schoolID, staffID, studentID } = req.params;
        const { newTermDate, date, principalRemark, teachersRemark, totalGrade, totalObtainableScore, toataTage, totalObtainedScore, classAVG, remarks, position, grade, totalScore, examScore, continuousAssesment, color, clubSociety, wt, ht, age, DOB, } = req.body;
        const school = await schoolModel_1.default.findById(schoolID);
        const staff = await staffModel_1.default.findById(staffID);
        const student = await studentModel_1.default.findById(studentID);
        // const hold = ;
        const classData = await classroomModel_1.default.findOne({
            className: staff?.classesAssigned,
        });
        if (school && school.schoolName && staff && classData) {
            const report = await midReportCardModel_1.default.create({
                teacherName: staff?.staffName,
                classes: staff?.classesAssigned,
                // name: ,
                image: student?.avatar,
                classAVG,
                newTermDate,
                date,
                principalRemark,
                teachersRemark,
                totalGrade,
                totalObtainableScore,
                totalObtainedScore,
                remarks,
                position,
                grade,
                totalScore,
                examScore,
                continuousAssesment,
                color,
                clubSociety: "JET",
                wt: student?.weight,
                ht: student?.height,
                age: student?.age,
                DOB: student?.DoB,
                session: school?.session,
                toataTage,
            });
            school?.reportCard.push(new mongoose_1.Types.ObjectId(report?._id));
            school?.save();
            staff?.reportCard.push(new mongoose_1.Types.ObjectId(report?._id));
            staff?.save();
            student?.reportCard.push(new mongoose_1.Types.ObjectId(report?._id));
            student?.save();
            return res.status(201).json({
                message: "mid report created",
                data: report,
                status: 201,
            });
        }
        else {
            return res.status(404).json({
                message: "school not found",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating lesson report",
            status: 404,
            data: error.message,
        });
    }
};
exports.createStudentMidReportCard = createStudentMidReportCard;
