"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const subjectTopicsModel = new mongoose_1.Schema({
    title: {
        type: String,
    },
    duration: {
        type: String,
    },
    video: {
        type: String,
    },
    description: {
        type: String,
    },
    topicImage: {
        type: String,
    },
    keyPoints: {
        type: [],
    },
    subjectTopic: {
        type: mongoose_1.Types.ObjectId,
        ref: "subjectTeachings",
    },
    quizQuestions: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "subjectTopicQuizes",
        },
    ],
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("subjectTopics", subjectTopicsModel);
