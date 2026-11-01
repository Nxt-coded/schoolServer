"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const lessonNoteModel = new mongoose_1.Schema({
    rate: {
        type: Number,
    },
    rateData: {
        type: [],
    },
    topic: {
        type: String,
    },
    teacher: {
        type: String,
    },
    teacherID: {
        type: String,
    },
    teacherClass: {
        type: String,
    },
    week: {
        type: String,
    },
    endingAt: {
        type: String,
    },
    createDate: {
        type: String,
    },
    classes: {
        type: String,
    },
    subTopic: {
        type: String,
    },
    period: {
        type: String,
    },
    duration: {
        type: String,
    },
    instructionalMaterial: {
        type: String,
    },
    referenceMaterial: {
        type: String,
    },
    previousKnowledge: {
        type: String,
    },
    subject: {
        type: String,
    },
    specificObjectives: {
        type: String,
    },
    content: {
        type: String,
    },
    evaluation: {
        type: String,
    },
    summary: {
        type: String,
    },
    presentation: {
        type: String,
    },
    term: {
        type: String,
    },
    assignment: {
        type: String,
    },
    responseDetail: {
        type: String,
        default: "",
    },
    deadline: {
        type: String,
    },
    profilePic: {
        type: String,
    },
    messageSent: {
        type: Boolean,
        default: false,
    },
    adminSignation: {
        type: Boolean,
        default: false,
    },
    staff: {
        type: mongoose_1.Types.ObjectId,
        ref: "staffs",
    },
    school: {
        type: mongoose_1.Types.ObjectId,
        ref: "schools",
    },
    class: {
        type: mongoose_1.Types.ObjectId,
        ref: "classes",
    },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("lessonNotes", lessonNoteModel);
