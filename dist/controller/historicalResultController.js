"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteResultHistory = exports.viewResultHistory = exports.createResultHistory = void 0;
const schoolModel_1 = __importDefault(require("../model/schoolModel"));
const studentModel_1 = __importDefault(require("../model/studentModel"));
const staffModel_1 = __importDefault(require("../model/staffModel"));
const studentHistoricalResultModel_1 = __importDefault(require("../model/studentHistoricalResultModel"));
const mongoose_1 = require("mongoose");
const createResultHistory = async (req, res) => {
    try {
        const { studentID, schoolID, teacherID } = req.params;
        const {} = req.body;
        const school = await schoolModel_1.default.findById(schoolID);
        const student = await studentModel_1.default.findById(studentID).populate({
            path: "historicalResult",
        });
        const teacher = await staffModel_1.default.findById(teacherID);
        if (school) {
            const result = await studentHistoricalResultModel_1.default.create({
                ...req.body,
                school,
                student,
            });
            student?.historicalResult?.push(new mongoose_1.Types.ObjectId(result._id));
            student?.save();
            return res.status(201).json({
                message: "done",
            });
        }
        else {
            return res.status(404).json({
                message: "Only school Admin can do this",
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error",
        });
    }
};
exports.createResultHistory = createResultHistory;
const viewResultHistory = async (req, res) => {
    try {
        const { studentID, schoolID, teacherID } = req.params;
        const {} = req.body;
        const school = await schoolModel_1.default.findById(schoolID);
        const student = await studentModel_1.default.findById(studentID).populate({
            path: "historicalResult",
            options: {
                sort: {
                    createdAt: -1,
                },
            },
        });
        const teacher = await staffModel_1.default.findById(teacherID);
        console.log("student", student?.historicalResult);
        return res.status(201).json({
            message: "done",
            data: student,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error",
        });
    }
};
exports.viewResultHistory = viewResultHistory;
const deleteResultHistory = async (req, res) => {
    try {
        const { studentID, schoolID, teacherID, resultID } = req.params;
        const school = await schoolModel_1.default.findById(schoolID);
        const student = await studentModel_1.default.findById(studentID).populate({
            path: "historicalResult",
            options: {
                sort: {
                    createdAt: -1,
                },
            },
        });
        await studentHistoricalResultModel_1.default?.findByIdAndDelete(resultID);
        await student?.historicalResult?.pull(new mongoose_1.Types.ObjectId(resultID));
        student.save();
        return res.status(201).json({
            message: "done",
            data: student,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error",
        });
    }
};
exports.deleteResultHistory = deleteResultHistory;
