"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const questionBankSchema = new mongoose_1.Schema({
    schoolID: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "schools",
        required: true,
        index: true,
    },
    subjectID: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "subjects",
        required: true,
        index: true,
    },
    assessmentType: {
        type: String,
        enum: ["examination", "midTest"],
        required: true,
        index: true,
    },
    questionKind: {
        type: String,
        enum: ["objective", "theory"],
        default: "objective",
        required: true,
    },
    question: {
        type: mongoose_1.Schema.Types.Mixed,
        required: true,
    },
    sourceAssessmentID: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
    },
    sourceQuestionIndex: {
        type: Number,
        required: true,
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
    },
}, { timestamps: true });
questionBankSchema.index({ sourceAssessmentID: 1, sourceQuestionIndex: 1 }, { unique: true });
exports.default = (0, mongoose_1.model)("questionBanks", questionBankSchema);
