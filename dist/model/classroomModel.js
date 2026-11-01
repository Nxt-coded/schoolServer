"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const classesModel = new mongoose_1.Schema({
    weekStudent: {
        type: {},
    },
    topStudents: [
        {
            type: {},
        },
    ],
    lessonNotes: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "lessonNotes",
        },
    ],
    schoolFeesHistory: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "schoolFeesHistories",
        },
    ],
    schoolFeesHistory2: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "schoolFeesHistories",
        },
    ],
    schoolFeesHistory3: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "schoolFeesHistories",
        },
    ],
    class1stFee: {
        type: Number,
    },
    class2ndFee: {
        type: Number,
    },
    class3rdFee: {
        type: Number,
    },
    schoolIDs: {
        type: String,
    },
    presentTerm: {
        type: String,
    },
    className: {
        type: String,
    },
    teacherID: {
        type: String,
    },
    classTeacherName: {
        type: String,
    },
    classPerformance: {
        type: Number,
        default: 0,
    },
    classSubjects: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "subjects",
        },
    ],
    classAttendence: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "attendances",
        },
    ],
    assignment: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "assignments",
        },
    ],
    students: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "students",
        },
    ],
    attendance: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "attendances",
        },
    ],
    assignmentResolve: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "resolvs",
        },
    ],
    timeTable: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "timeTables",
        },
    ],
    reportCard: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "myReportCards",
        },
    ],
    classHistory: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "classHistories",
        },
    ],
    // historys: [
    //   {
    //     type: Types.ObjectId,
    //     ref: "historys",
    //   },
    // ],
    school: {
        type: mongoose_1.Types.ObjectId,
        ref: "schools",
    },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("classes", classesModel);
