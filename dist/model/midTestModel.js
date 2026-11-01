"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const midTestModel = new mongoose_1.Schema({
    quiz: {
        type: {},
    },
    term: {
        type: String,
    },
    session: {
        type: String,
    },
    subjectTitle: {
        type: String,
    },
    status: {
        type: String,
        default: "midTest",
    },
    subjectID: {
        type: String,
    },
    startMidTest: {
        type: Boolean,
        default: false,
    },
    randomize: {
        type: Boolean,
        default: false,
    },
    totalQuestions: {
        type: Number,
    },
    subject: {
        type: mongoose_1.Types.ObjectId,
        ref: "subjects",
    },
    staff: {
        type: mongoose_1.Types.ObjectId,
        ref: "staffs",
    },
    performance: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "performances",
        },
    ],
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("midTests", midTestModel);
