"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const subjectModel = new mongoose_1.Schema({
    recordData: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "myReportCards",
        },
    ],
    assignmentResolve: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "resolvs",
        },
    ],
    quiz: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "quizes",
        },
    ],
    midTest: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "midTests",
        },
    ],
    examination: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "examinations",
        },
    ],
    assignment: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "assignments",
        },
    ],
    performance: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "performances",
        },
    ],
    midReportCard: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "myMidReportCards",
        },
    ],
    subjectClassIDs: {
        type: String,
    },
    subjectClassID: {
        type: String,
    },
    teacherID: {
        type: String,
    },
    classID: {
        type: String,
    },
    schoolName: {
        type: String,
    },
    subjectTeacherName: {
        type: String,
    },
    subjectTitle: {
        type: String,
    },
    designated: {
        type: String,
    },
    classDetails: {
        type: {},
    },
    subjectPerformance: {
        type: Number,
        default: 0,
    },
    school: {
        type: mongoose_1.Types.ObjectId,
        ref: "schools",
    },
    class: {
        type: mongoose_1.Types.ObjectId,
        ref: "classes",
    },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("subjects", subjectModel);
