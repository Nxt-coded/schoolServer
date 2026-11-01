"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOneHistory = exports.getOneStudentHistory = exports.createPastQuestionHistory = void 0;
const pastQuestionModel_1 = __importDefault(require("../model/pastQuestionModel"));
const studentModel_1 = __importDefault(require("../model/studentModel"));
const mongoose_1 = require("mongoose");
const pastQuestionModel_2 = __importDefault(require("../model/pastQuestionModel"));
const createPastQuestionHistory = async (req, res) => {
    try {
        const { studentID } = req.params;
        const { year, subject, percent, score, chosenAnswers } = req.body;
        const student = await studentModel_1.default.findById(studentID);
        if (student) {
            const history = await pastQuestionModel_1.default.create({
                year,
                subject,
                percent,
                score,
                chosenAnswers,
            });
            student.pastQuestionHistory.push(new mongoose_1.Types.ObjectId(history?._id));
            student?.save();
            return res.status(201).json({
                message: "lesson note created",
                data: history,
                status: 201,
            });
        }
        else {
            return res.status(404).json({
                message: "Error finding student",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating lesson Note",
            status: 404,
            data: error.message,
        });
    }
};
exports.createPastQuestionHistory = createPastQuestionHistory;
const getOneStudentHistory = async (req, res) => {
    try {
        const { studentID } = req.params;
        const student = await studentModel_1.default
            .findById(studentID)
            .populate({ path: "pastQuestionHistory" });
        return res.status(201).json({
            message: "lesson note created",
            data: student?.pastQuestionHistory,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating lesson Note",
            status: 404,
            data: error.message,
        });
    }
};
exports.getOneStudentHistory = getOneStudentHistory;
const getOneHistory = async (req, res) => {
    try {
        const { historyID } = req.params;
        const history = await pastQuestionModel_2.default.findById(historyID);
        return res.status(201).json({
            message: "One history found",
            data: history,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error getting history",
            status: 404,
            data: error.message,
        });
    }
};
exports.getOneHistory = getOneHistory;
