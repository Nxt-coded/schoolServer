"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const purchasedModel = new mongoose_1.Schema({
    date: {
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
    delievered: {
        type: Boolean,
    },
    cart: {
        type: [],
    },
    school: {
        type: mongoose_1.Types.ObjectId,
        ref: "schools",
    },
    student: {
        type: mongoose_1.Types.ObjectId,
        ref: "students",
    },
    staff: {
        type: mongoose_1.Types.ObjectId,
        ref: "staffs",
    },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("purchasedHistories", purchasedModel);
