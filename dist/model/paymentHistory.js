"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const paymentReceiptModel = new mongoose_1.Schema({
    paymentRef: {
        type: String,
    },
    costPaid: {
        type: Number,
    },
    school: {
        type: mongoose_1.Types.ObjectId,
        ref: "schools",
    },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("repts", paymentReceiptModel);
