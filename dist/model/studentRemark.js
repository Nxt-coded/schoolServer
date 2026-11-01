"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const remarkModel = new mongoose_1.Schema({
    remark: {
        type: String,
    },
    weekPerformanceRatio: {
        type: String,
    },
    attendanceRatio: {
        type: String,
    },
    best: {
        type: String,
    },
    worst: {
        type: String,
    },
    classParticipation: {
        type: String,
    },
    sportParticipation: {
        type: String,
    },
    topicFocus: {
        type: String,
    },
    payment: {
        type: Number,
    },
    generalPerformace: {
        type: String,
    },
    announcement: {
        type: {},
    },
    student: {
        type: mongoose_1.Types.ObjectId,
        ref: "students",
    },
    staff: {
        type: mongoose_1.Types.ObjectId,
        ref: "staffs",
    },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("remakes", remarkModel);
