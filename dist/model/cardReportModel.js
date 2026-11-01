"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const cardRportModel = new mongoose_1.Schema({
    result: [
        {
            type: {},
        },
    ],
    approve: {
        type: Boolean,
        default: false,
    },
    psycho: {
        type: Boolean,
        default: false,
    },
    points: {
        type: Number,
        default: 0,
    },
    studentID: {
        type: String,
    },
    classInfo: {
        type: String,
    },
    peopleSkill: {
        type: [],
    },
    physicalSkill: {
        type: [],
    },
    softSkill: {
        type: [],
    },
    grade: {
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
    classes: {
        type: mongoose_1.Types.ObjectId,
        ref: "classes",
    },
    school: {
        type: mongoose_1.Types.ObjectId,
        ref: "schools",
    },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("myReportCards", cardRportModel);
