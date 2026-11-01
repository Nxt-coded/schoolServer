"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const classHistoryModel = new mongoose_1.Schema({
    resultHistory: {
        type: [],
    },
    principalsRemark: {
        type: String,
    },
    session: {
        type: String,
    },
    term: {
        type: String,
    },
    classTeacherName: {
        type: String,
    },
    className: {
        type: String,
    },
    classRoom: {
        type: mongoose_1.Types.ObjectId,
        ref: "classes",
    },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("classHistories", classHistoryModel);
