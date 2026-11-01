"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const mongoose_2 = require("mongoose");
const schoolModel = new mongoose_2.Schema({
    outGoneStudents: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "outGoneStudents",
        },
    ],
    purchaseHistory: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "purchasedHistories",
        },
    ],
    started: {
        type: Boolean,
        default: false,
    },
    presentSessionID: {
        type: String,
    },
    SchoolTeamResumption: {
        type: String,
    },
    SchoolTeamCloses: {
        type: String,
    },
    NumberOfDays: {
        type: String,
    },
    categoryType: {
        type: String,
    },
    startClass: {
        type: String,
    },
    endClass: {
        type: String,
    },
    startBreak: {
        type: String,
    },
    endBreak: {
        type: String,
    },
    peroid: {
        type: String,
    },
    timeTableStructure: {
        type: [],
    },
    paymentOptions: {
        type: [],
    },
    organizationType: {
        type: String,
    },
    adminCode: {
        type: String,
    },
    phone: {
        type: String,
    },
    avatar: {
        type: String,
    },
    freeMode: {
        type: Boolean,
        default: true,
    },
    presentTerm: {
        type: String,
    },
    presentSession: {
        type: String,
    },
    name: {
        type: String,
    },
    name2: {
        type: String,
    },
    avatarID: {
        type: String,
    },
    signature: {
        type: String,
    },
    signatureID: {
        type: String,
    },
    stamp: {
        type: String,
    },
    stampID: {
        type: String,
    },
    address: {
        type: String,
    },
    plan: {
        type: String,
        default: "in active",
    },
    schoolName: {
        type: String,
    },
    bankDetails: {
        type: {},
    },
    status: {
        type: String,
    },
    presentTermID: {
        type: String,
    },
    enrollmentID: {
        type: String,
    },
    email: {
        type: String,
        unique: true,
    },
    verify: {
        type: Boolean,
        default: false,
    },
    sendSMS: {
        type: Boolean,
        default: false,
    },
    allowClassTeacherGrading: {
        type: Boolean,
        default: true,
    },
    schoolTags: [
        {
            type: {},
        },
    ],
    session: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "academicSessions",
        },
    ],
    schoolFeesHistory: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "schoolFeesHistories",
        },
    ],
    historys: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "historys",
        },
    ],
    events: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "events",
        },
    ],
    classHistory: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "classHistroy",
        },
    ],
    announcements: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "announcements",
        },
    ],
    reportCard: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "myReportCards",
        },
    ],
    midReportCard: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "myMidReportCards",
        },
    ],
    subjects: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "subjects",
        },
    ],
    complain: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "complains",
        },
    ],
    pushClass: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "classHistories",
        },
    ],
    classRooms: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "classes",
        },
    ],
    staff: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "staffs",
        },
    ],
    payments: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "payments",
        },
    ],
    recordPayments: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "recordPayments",
        },
    ],
    students: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "students",
        },
    ],
    store: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "stores",
        },
    ],
    receipt: {
        type: [],
    },
    lessonNotes: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "lessonNotes",
        },
    ],
    articles: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "articles",
        },
    ],
    gallaries: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "gallaries",
        },
    ],
}, { timestamps: true });
exports.default = (0, mongoose_2.model)("schools", schoolModel);
