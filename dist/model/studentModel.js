"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const studentModel = new mongoose_1.Schema({
    feesPaid1st: {
        type: Boolean,
        default: false,
    },
    otherPayment: {
        type: [],
        default: [],
    },
    clockIn: {
        type: Boolean,
        default: false,
    },
    viewReportCard: {
        type: Boolean,
        default: false,
    },
    clockOut: {
        type: Boolean,
        default: false,
    },
    clockInTime: {
        type: String,
    },
    clockOutTime: {
        type: String,
    },
    BOD: {
        type: String,
    },
    LGA: {
        type: String,
    },
    stateOrigin: {
        type: String,
    },
    admissionNumber: {
        type: String,
    },
    admissionYear: {
        type: String,
    },
    performanceRemark: {
        type: String,
    },
    graduationYear: {
        type: String,
    },
    leaveYear: {
        type: String,
    },
    monitor: {
        type: Boolean,
        default: false,
    },
    records: {
        type: (Array),
    },
    classTermFee: {
        type: Number,
    },
    feesPaid2nd: {
        type: Boolean,
        default: false,
    },
    feesPaid3rd: {
        type: Boolean,
        default: false,
    },
    schoolIDs: {
        type: String,
    },
    parentPhoneNumber: {
        type: String,
    },
    presentClassID: {
        type: String,
    },
    avatar: {
        type: String,
    },
    facebookAccount: {
        type: String,
    },
    xAccount: {
        type: String,
    },
    instagramAccount: {
        type: String,
    },
    linkedinAccount: {
        type: String,
    },
    avatarID: {
        type: String,
    },
    password: {
        type: String,
    },
    studentFirstName: {
        type: String,
    },
    studentLastName: {
        type: String,
    },
    totalPerformance: {
        type: Number,
    },
    classAssigned: {
        type: String,
    },
    gender: {
        type: String,
    },
    email: {
        type: String,
    },
    parentEmail: {
        type: String,
        default: "",
    },
    schoolName: {
        type: String,
    },
    started: {
        type: Boolean,
        default: true,
    },
    status: {
        type: String,
    },
    enrollmentID: {
        type: String,
    },
    schoolID: {
        type: String,
    },
    studentAddress: {
        type: String,
    },
    studentAvatar: {
        type: String,
    },
    studentAvatarID: {
        type: String,
    },
    phone: {
        type: String,
    },
    school: {
        type: mongoose_1.Types.ObjectId,
        ref: "schools",
    },
    classroom: {
        type: mongoose_1.Types.ObjectId,
        ref: "classes",
    },
    attendance: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "attendances",
        },
    ],
    history: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "historys",
        },
    ],
    historicalResult: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "historicalResults",
        },
    ],
    subjects: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "subjects",
        },
    ],
    performance: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "performances",
            default: [],
        },
    ],
    assignmentResolve: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "resolvs",
        },
    ],
    remark: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "remakes",
        },
    ],
    articles: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "articles",
        },
    ],
    complain: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "complains",
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
    pastQuestionHistory: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "pquestions",
        },
    ],
    purchaseHistory: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "purchasedHistories",
        },
    ],
    recordPayments: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "recordPayments",
        },
    ],
    schoolFeesHistory: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "schoolFeesHistories",
        },
    ],
    lastActionTimestamp: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("students", studentModel);
