"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const assignmentResolveModel = new mongoose_1.Schema({
    assignmentResult: {
        type: String,
    },
    assignmentID: {
        type: String,
    },
    remark: {
        type: String,
    },
    className: {
        type: String,
    },
    subjectTitle: {
        type: String,
    },
    studentName: {
        type: String,
    },
    subjectTeacher: {
        type: String,
    },
    studentGrade: {
        type: String,
    },
    studentScore: {
        type: Number,
    },
    performanceRating: {
        type: Number,
    },
    student: {
        type: mongoose_1.Types.ObjectId,
        ref: "students",
    },
    assignment: {
        type: mongoose_1.Types.ObjectId,
        ref: "assignments",
    },
    subject: {
        type: mongoose_1.Types.ObjectId,
        ref: "subjects",
    },
    class: {
        type: mongoose_1.Types.ObjectId,
        ref: "classrooms",
    },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("reolves", assignmentResolveModel);
