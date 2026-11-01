"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schoolFessHistoryModel = new mongoose_1.Schema({
    studentID: {
        type: String,
    },
    termID: {
        type: String,
    },
    sessionID: {
        type: String,
    },
    date: {
        type: String,
    },
    session: {
        type: String,
    },
    image: {
        type: String,
    },
    term: {
        type: String,
    },
    studentName: {
        type: String,
    },
    studentClass: {
        type: String,
    },
    amount: {
        type: Number,
    },
    reference: {
        type: String,
    },
    purchasedID: {
        type: String,
    },
    confirm: {
        type: Boolean,
    },
    school: {
        type: mongoose_1.Types.ObjectId,
        ref: "schools",
    },
    student: {
        type: mongoose_1.Types.ObjectId,
        ref: "students",
    },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("schoolFeesHistories", schoolFessHistoryModel);
