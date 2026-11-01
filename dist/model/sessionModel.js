"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const sessionModel = new mongoose_1.Schema({
    presentTerm: {
        type: String,
    },
    schoolID: {
        type: String,
    },
    year: {
        type: String,
    },
    school: {
        type: mongoose_1.Types.ObjectId,
        ref: "schools",
    },
    term: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "academicSessionsTerms",
        },
    ],
    studentFeesPaid: {
        type: Number,
        default: 0,
    },
    studentFeesNotPaid: {
        type: Number,
        default: 0,
    },
    numberOfTeachers: {
        type: Number,
        default: 0,
    },
    numberOfSubjects: {
        type: Number,
        default: 0,
    },
    totalStudents: {
        type: Number,
        default: 0,
    },
    totalAmountRecieved: {
        type: Number,
        default: 0,
    },
    profit: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("academicSessions", sessionModel);
