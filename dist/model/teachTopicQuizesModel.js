"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const subjectTopicQuizesModel = new mongoose_1.Schema({
    question: {
        type: String,
    },
    explanation: {
        type: String,
    },
    correctAnswer: {
        type: Number,
    },
    options: {
        type: [],
    },
    subjectTopic: {
        type: mongoose_1.Types.ObjectId,
        ref: "subjectTopics",
    },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("subjectTopicQuizes", subjectTopicQuizesModel);
