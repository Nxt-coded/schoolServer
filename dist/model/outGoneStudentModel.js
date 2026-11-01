"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const OutGoneStudentsModel = new mongoose_1.Schema({
    studentName: {
        type: String,
    },
    student: {
        type: mongoose_1.Types.ObjectId,
        ref: "students",
    },
    schoolInfo: {
        type: mongoose_1.Types.ObjectId,
        ref: "schools",
    },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("outGoneStudents", OutGoneStudentsModel);
