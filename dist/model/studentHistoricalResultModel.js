"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const historicalResultModel = new mongoose_1.Schema({
    results: [
        {
            type: {},
        },
    ],
    approve: {
        type: Boolean,
        default: true,
    },
    totalPoints: {
        type: Number,
        default: 0,
    },
    studentID: {
        type: String,
    },
    classInfo: {
        type: String,
    },
    session: {
        type: String,
    },
    term: {
        type: String,
    },
    mainGrade: {
        type: String,
        default: "Not Recorded Yet",
    },
    adminComment: {
        type: String,
    },
    attendance: {
        type: String,
    },
    classTeacherComment: {
        type: String,
    },
    student: {
        type: mongoose_1.Types.ObjectId,
        ref: "students",
    },
    subject: {
        type: mongoose_1.Types.ObjectId,
        ref: "subjects",
    },
    classes: {
        type: mongoose_1.Types.ObjectId,
        ref: "classes",
    },
    school: {
        type: mongoose_1.Types.ObjectId,
        ref: "schools",
    },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("historicalResults", historicalResultModel);
