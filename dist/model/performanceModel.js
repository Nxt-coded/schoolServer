"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const performanceModel = new mongoose_1.Schema({
    status: {
        type: String,
    },
    quizID: {
        type: String,
    },
    remark: {
        type: String,
    },
    quizDone: {
        type: Boolean,
        default: false,
    },
    quizRecorded: {
        type: Boolean,
        default: false,
    },
    className: {
        type: String,
    },
    subjectTitle: {
        type: String,
    },
    subjectID: {
        type: String,
    },
    studentName: {
        type: String,
    },
    studentAvatar: {
        type: String,
    },
    subjectTeacher: {
        type: String,
    },
    studentGrade: {
        type: String,
    },
    totalQuestions: {
        type: Number,
    },
    markPerQuestion: {
        type: String,
    },
    studentScore: {
        type: Number,
    },
    performanceRating: {
        type: Number,
    },
    attemptNumber: {
        type: Number,
        default: 1,
    },
    student: {
        type: mongoose_1.Types.ObjectId,
        ref: "students",
    },
    examination: {
        type: mongoose_1.Types.ObjectId,
        ref: "quizes",
    },
    quiz: {
        type: mongoose_1.Types.ObjectId,
        ref: "examinations",
    },
    subject: {
        type: mongoose_1.Types.ObjectId,
        ref: "subjects",
    },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("performances", performanceModel);
