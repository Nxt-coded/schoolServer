"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const complainModel = new mongoose_1.Schema({
    title: {
        type: String,
    },
    reporterID: {
        type: String,
    },
    importance: {
        type: String,
    },
    seen: {
        type: Boolean,
        default: false,
    },
    resolve: {
        type: Boolean,
        default: false,
    },
    school: {
        type: mongoose_1.Types.ObjectId,
        ref: "schools",
    },
    teacher: {
        type: mongoose_1.Types.ObjectId,
        ref: "staffs",
    },
    student: {
        type: mongoose_1.Types.ObjectId,
        ref: "students",
    },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("complains", complainModel);
