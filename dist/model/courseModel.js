"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const topicSchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    title: { type: String, required: true },
    duration: { type: String, required: true },
    video: { type: String, required: true },
    completed: { type: Boolean, default: false },
    description: { type: String, required: true },
    keyPoints: [{ type: String }],
});
const courseSchema = new mongoose_1.Schema({
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    instructor: { type: String, required: true },
    totalLessons: { type: Number, required: true },
    completedLessons: { type: Number, default: 0 },
    topics: [topicSchema],
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("Course", courseSchema);
