"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ReportCardModel = new mongoose_1.Schema({
    teachersRemark: {
        type: String,
    },
    principalRemark: {
        type: String,
    },
    date: {
        type: String,
    },
    newTermDate: {
        type: String,
    },
    clubSociety: {
        type: String,
    },
    teacherName: {
        type: String,
    },
    gender: {
        type: String,
    },
    image: {
        type: String,
    },
    name: {
        type: String,
    },
    classes: {
        type: String,
    },
    session: {
        type: String,
    },
    age: {
        type: String,
    },
    wt: {
        type: String,
    },
    color: {
        type: String,
    },
    continuousAssesment: {
        type: String,
    },
    examScore: {
        type: String,
    },
    totalScore: {
        type: String,
    },
    grade: {
        type: String,
    },
    totalGrade: {
        type: String,
    },
    DOB: {
        type: String,
    },
    position: {
        type: String,
    },
    remarks: {
        type: String,
    },
    classAVG: {
        type: String,
    },
    totalObtainedScore: {
        type: String,
    },
    toataTage: {
        type: String,
    },
    ht: {
        type: String,
    },
    totalObtainableScore: {
        type: String,
    },
    adminSignation: {
        type: Boolean,
        default: false,
    },
    subject: [
        {
            type: mongoose_1.Types.ObjectId,
        },
    ],
    staff: {
        type: mongoose_1.Types.ObjectId,
        ref: "staffs",
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
exports.default = (0, mongoose_1.model)("reportCards", ReportCardModel);
