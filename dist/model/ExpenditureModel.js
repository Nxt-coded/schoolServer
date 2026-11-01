"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const expenditureModel = new mongoose_1.Schema({
    budget: {
        type: String,
    },
    StartDate: {
        type: String,
    },
    EndDate: {
        type: String,
    },
    expenseAmount: {
        type: Number,
    },
    paymentMethod: {
        type: String,
    },
    description: {
        type: String,
    },
    school: {
        type: mongoose_1.Types.ObjectId,
        ref: "schools",
    },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("expenditures", expenditureModel);
