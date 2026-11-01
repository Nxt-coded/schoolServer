"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const recordPaymentModel = new mongoose_1.Schema({
    feePaid: [
        {
            type: Number,
        },
    ],
    feePaidDate: {
        type: String,
    },
    feeBalance: {
        type: Number,
    },
    paidByWho: {
        type: String,
    },
    paymentMode: {
        type: String,
    },
    studentID: {
        type: String,
    },
    studentFirstName: {
        type: String,
    },
    studentLastName: {
        type: String,
    },
    studentClass: {
        type: String,
    },
    studentAvatar: {
        type: String,
    },
    parentMail: {
        type: String,
    },
    classFees: {
        type: Number,
    },
    currentTerm: {
        type: String,
    },
    feePaymentComplete: {
        default: false,
        type: Boolean,
    },
    student: {
        type: mongoose_1.Types.ObjectId,
        ref: "students",
    },
    term: {
        type: mongoose_1.Types.ObjectId,
        ref: "academicSessionsTerms",
    },
    school: {
        type: mongoose_1.Types.ObjectId,
        ref: "schools",
    },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("recordPayments", recordPaymentModel);
