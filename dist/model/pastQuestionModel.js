"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const pQuestionModel = new mongoose_1.Schema({
    year: {
        type: String,
    },
    subject: {
        type: String,
    },
    percent: {
        type: Number,
    },
    score: {
        type: Number,
    },
    chosenAnswers: {
        type: {},
    },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("pquestions", pQuestionModel);
