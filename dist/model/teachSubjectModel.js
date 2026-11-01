"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const subjectTeachesModel = new mongoose_1.Schema({
    title: {
        type: String,
    },
    description: {
        type: String,
    },
    totalLessons: {
        type: Number,
    },
    expectedOutcome: {
        type: String,
    },
    classCreatedFor: {
        type: String,
    },
    credit: {
        type: String,
    },
    relatedSubjectTags: {
        type: String,
    },
    subjectImage: {
        type: String,
    },
    topics: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "subjectTopics",
        },
    ],
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("subjectTeachings", subjectTeachesModel);
