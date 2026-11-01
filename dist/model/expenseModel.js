"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const expenseModel = new mongoose_1.Schema({
    item: {
        type: String,
    },
    description: {
        type: String,
    },
    paymentMode: {
        type: String,
    },
    paymentCategory: {
        type: String,
    },
    amount: {
        type: Number,
    },
    term: {
        type: mongoose_1.Types.ObjectId,
        ref: "academicSessionsTerms",
    },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("expenses", expenseModel);
