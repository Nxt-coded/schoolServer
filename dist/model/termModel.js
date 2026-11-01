"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const termModel = new mongoose_1.Schema({
    year: {
        type: String,
    },
    paymentOptions: {
        type: [],
    },
    classResult: {
        type: [],
    },
    expensePayOut: {
        type: [],
    },
    schoolFeePayment: {
        type: [],
    },
    storePayment: {
        type: [],
    },
    presentTerm: {
        type: String,
    },
    budget: {
        type: Number,
    },
    expense: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "expenses",
        },
    ],
    payRef: {
        type: String,
        default: "",
    },
    costPaid: {
        type: Number,
    },
    plan: {
        type: Boolean,
        default: false,
    },
    term: {
        type: String,
    },
    studentFeesPaid: {
        type: Number,
        default: 0,
    },
    studentFeesNotPaid: {
        type: Number,
        default: 0,
    },
    numberOfTeachers: {
        type: Number,
        default: 0,
    },
    numberOfSubjects: {
        type: Number,
        default: 0,
    },
    totalStudents: {
        type: Number,
        default: 0,
    },
    recordPayments: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "recordPayments",
        },
    ],
    totalAmountRecieved: {
        type: Number,
        default: 0,
    },
    session: {
        type: mongoose_1.Types.ObjectId,
        ref: "academicSessions",
    },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("academicSessionsTerms", termModel);
