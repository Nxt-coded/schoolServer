"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const eventModel = new mongoose_1.Schema({
    title: {
        type: String,
    },
    details: {
        type: String,
    },
    status: {
        type: String,
    },
    date: {
        type: String,
    },
    school: {
        type: mongoose_1.Types.ObjectId,
        ref: "schools",
    },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("events", eventModel);
