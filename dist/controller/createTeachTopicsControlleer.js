"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllTeachSubjectTopic = exports.deleteOneTeachSubjectTopic = exports.getOneTeachSubjectTopicNow = exports.getOneTeachSubjectTopic = exports.updateTeachSubjectTopic = exports.createTeachSubjectTopic = void 0;
const teachSubjectModel_1 = __importDefault(require("../model/teachSubjectModel"));
const teachSubjectTopics_1 = __importDefault(require("../model/teachSubjectTopics"));
const mongoose_1 = require("mongoose");
const createTeachSubjectTopic = async (req, res) => {
    try {
        const { title, duration, video, description, topicImage, keyPoints,
        // quizQuestions: Array<{}>;
        // subjectTopic: {};
         } = req.body;
        const { subjectID } = req.params;
        const getSubject = await teachSubjectModel_1.default.findById(subjectID);
        const teachSubject = await teachSubjectTopics_1.default.create({
            title,
            duration,
            video,
            description,
            topicImage,
            keyPoints,
        });
        getSubject?.topics.push(new mongoose_1.Types.ObjectId(teachSubject._id));
        await getSubject?.save();
        return res.status(201).json({
            message: "teach subject created successfully",
            data: teachSubject,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating teach subject ",
            data: error,
        });
    }
};
exports.createTeachSubjectTopic = createTeachSubjectTopic;
const updateTeachSubjectTopic = async (req, res) => {
    try {
        const { teachSubjectTopicID } = req.params;
        const { title, duration, video, description, topicImage, keyPoints, } = req.body;
        const teachSubject = await teachSubjectTopics_1.default.findByIdAndUpdate(teachSubjectTopicID, {
            title,
            duration,
            video,
            description,
            topicImage,
            keyPoints,
        }, { new: true });
        return res.status(201).json({
            message: "teach subject updated successfully",
            data: teachSubject,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating teach subject ",
        });
    }
};
exports.updateTeachSubjectTopic = updateTeachSubjectTopic;
const getOneTeachSubjectTopic = async (req, res) => {
    try {
        const { teachSubjectTopicID } = req.params;
        const teachSubject = await teachSubjectModel_1.default
            .findById(teachSubjectTopicID)
            .populate({ path: "topics" });
        return res.status(201).json({
            message: "teach subject created successfully",
            data: teachSubject,
            status: 201,
        });
    }
    catch (error) {
        console.log("error", error);
        return res.status(404).json({
            message: "Error creating teach subject ",
        });
    }
};
exports.getOneTeachSubjectTopic = getOneTeachSubjectTopic;
const getOneTeachSubjectTopicNow = async (req, res) => {
    try {
        const { teachSubjectTopicID } = req.params;
        console.log("teachSubjectTopicID", teachSubjectTopicID);
        const teachSubject = await teachSubjectTopics_1.default.findById(teachSubjectTopicID);
        return res.status(201).json({
            message: "teach subject created successfully",
            data: teachSubject,
            status: 201,
        });
    }
    catch (error) {
        console.log("error", error);
        return res.status(404).json({
            message: "Error creating teach subject ",
        });
    }
};
exports.getOneTeachSubjectTopicNow = getOneTeachSubjectTopicNow;
const deleteOneTeachSubjectTopic = async (req, res) => {
    try {
        const { teachSubjectTopicID, subjectID } = req.params;
        const getSubject = await teachSubjectModel_1.default.findById(subjectID);
        await teachSubjectTopics_1.default.findByIdAndDelete(teachSubjectTopicID);
        const teachSubject = await teachSubjectTopics_1.default.findByIdAndDelete(teachSubjectTopicID);
        getSubject?.topics?.pull(subjectID);
        await getSubject?.save();
        return res.status(201).json({
            message: "teach subject deleted successfully",
            data: teachSubject,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error deleting teach subject ",
        });
    }
};
exports.deleteOneTeachSubjectTopic = deleteOneTeachSubjectTopic;
const getAllTeachSubjectTopic = async (req, res) => {
    try {
        const teachSubject = await teachSubjectModel_1.default.find();
        return res.status(201).json({
            message: "teach subject created successfully",
            data: teachSubject,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating teach subject ",
        });
    }
};
exports.getAllTeachSubjectTopic = getAllTeachSubjectTopic;
