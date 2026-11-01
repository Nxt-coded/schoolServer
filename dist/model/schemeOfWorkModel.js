"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const LearningItemSchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    value: { type: String, required: true },
});
const SchemeModel = new mongoose_1.Schema({
    classType: { type: String, required: true },
    weeks: { type: String, required: true },
    status: { type: String },
    topics: { type: [LearningItemSchema], required: true },
    subject: { type: String, required: true },
    term: { type: String },
    learningObject: { type: [LearningItemSchema], default: [] },
    learningActivities: { type: [LearningItemSchema], default: [] },
    learningResource: { type: [LearningItemSchema], default: [] },
    embeddedCoreSkills: { type: [LearningItemSchema], default: [] },
    meta: {
        type: {
            uploaded: { type: Boolean, default: false },
            uniqueId: { type: String, unique: true },
        },
    },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("Scheme", SchemeModel);
