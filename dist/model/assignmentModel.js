"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const assignmentModel = new mongoose_1.Schema({
    assignmentTopic: {
        type: String,
    },
    assignmentDetails: {
        type: String,
    },
    assignmentDeadline: {
        type: String,
    },
    subjectTitle: {
        type: String,
    },
    subject: {
        type: mongoose_1.Types.ObjectId,
        ref: "subjects",
    },
    staff: {
        type: mongoose_1.Types.ObjectId,
        ref: "staffs",
    },
    class: {
        type: mongoose_1.Types.ObjectId,
        ref: "classes",
    },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("assignments", assignmentModel);
