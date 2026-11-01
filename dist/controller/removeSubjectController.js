"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeSubjectFromResult = void 0;
const cardReportModel_1 = __importDefault(require("../model/cardReportModel"));
const studentModel_1 = __importDefault(require("../model/studentModel"));
const schoolModel_1 = __importDefault(require("../model/schoolModel"));
const removeSubjectFromResult = async (req, res) => {
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
        // Update report card with filtered results
        const updatedReport = await cardReportModel_1.default.findByIdAndUpdate(reportCard._id, {
            result: updatedResults,
            // Recalculate total points and grade based on remaining subjects
            points: parseFloat((updatedResults
                .map((el) => el.points)
                .reduce((a, b) => a + b, 0) / updatedResults.length).toFixed(2))
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
