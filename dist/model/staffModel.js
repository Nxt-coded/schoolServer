"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const staffModel = new mongoose_1.Schema({
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
    presentClassID: {
        type: String,
    },
    schoolIDs: {
        type: String,
    },
    gender: {
        type: String,
    },
    avatar: {
        type: String,
    },
    avatarID: {
        type: String,
    },
    salary: {
        type: Number,
    },
    schoolName: {
        type: String,
    },
    enrollmentID: {
        type: String,
    },
    email: {
        type: String,
    },
    staffAddress: {
        type: String,
    },
    activeStatus: {
        type: Boolean,
        default: false,
    },
    password: {
        type: String,
    },
    staffAvatar: {
        type: String,
    },
    staffAvatarID: {
        type: String,
    },
    signature: {
        type: String,
    },
    signatureID: {
        type: String,
    },
    staffName: {
        type: String,
    },
    facebookAcct: {
        type: String,
    },
    instagramAcct: {
        type: String,
    },
    xAcct: {
        type: String,
    },
    linkedinAcct: {
        type: String,
    },
    staffRole: {
        type: String,
    },
    staffRating: {
        type: Number,
        default: 0,
    },
    classesAssigned: {
        type: [],
    },
    subjectAssigned: {
        type: [],
    },
    schedule: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "timeTables",
        },
    ],
    assignment: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "assignments",
        },
    ],
    assignmentResolve: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "resolves",
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
    purchaseHistory: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "purchasedHistories",
        },
    ],
    attendance: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "attendances",
        },
    ],
    lessonNotes: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "lessonNotes",
        },
    ],
    remark: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "remakes",
        },
    ],
    quiz: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "quizes",
        },
    ],
    midTest: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "midTests",
        },
    ],
    examination: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "examinations",
        },
    ],
    phone: {
        type: String,
    },
    status: {
        type: String,
    },
    school: {
        type: mongoose_1.Types.ObjectId,
        ref: "schools",
    },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("staffs", staffModel);
