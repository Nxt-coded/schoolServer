"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const timeTableModel = new mongoose_1.Schema({
    day: {
        type: String,
    },
    time: {
        type: String,
    },
    subject: {
        type: String,
    },
    subjectTeacherID: {
        type: String,
    },
    CR: {
        type: String,
    },
    classroom: {
        type: mongoose_1.Types.ObjectId,
        ref: "classes",
    },
    staff: {
        type: mongoose_1.Types.ObjectId,
        ref: "staffs",
    },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("timeTables", timeTableModel);
