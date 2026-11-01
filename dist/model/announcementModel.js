"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const announcementModel = new mongoose_1.Schema({
    title: {
        type: String,
    },
    details: {
        type: String,
    },
    date: {
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
exports.default = (0, mongoose_1.model)("announcements", announcementModel);
