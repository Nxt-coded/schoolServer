"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const attendanceModel = new mongoose_1.default.Schema({
    date: {
        type: String,
        require: true,
    },
    studentFirstName: {
        type: String,
        require: true,
    },
    studentLastName: {
        type: String,
        require: true,
    },
    className: {
        type: String,
        require: true,
    },
    classTeacher: {
        type: String,
        require: true,
    },
    present: {
        type: Boolean,
        default: null,
    },
    absent: {
        type: Boolean,
        default: null,
    },
    dateTime: {
        type: String,
        require: true,
    },
    staffs: {
        type: mongoose_1.default.Types.ObjectId,
        ref: "staffs",
    },
    students: {
        type: mongoose_1.default.Types.ObjectId,
        ref: "students",
    },
    classes: {
        type: mongoose_1.default.Types.ObjectId,
        ref: "classes",
    },
}, { timestamps: true });
exports.default = mongoose_1.default.model("attendances", attendanceModel);
