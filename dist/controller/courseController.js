"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTopicStatus = exports.deleteCourse = exports.updateCourse = exports.getCourse = exports.getAllCourses = exports.createCourse = void 0;
const courseModel_1 = __importDefault(require("../model/courseModel"));
const handleError_1 = require("../error/handleError");
// Create a new course
const createCourse = async (req, res, next) => {
    try {
        const course = await courseModel_1.default.create(req.body);
        return res.status(201).json({
            message: "Course created successfully",
            data: course,
        });
    }
    catch (error) {
        return (0, handleError_1.handleError)(error, req, res, next);
    }
};
exports.createCourse = createCourse;
// Get all courses
const getAllCourses = async (req, res, next) => {
    try {
        const courses = await courseModel_1.default.find();
        return res.status(200).json({
            message: "Courses retrieved successfully",
            data: courses,
        });
    }
    catch (error) {
        return (0, handleError_1.handleError)(error, req, res, next);
    }
};
exports.getAllCourses = getAllCourses;
// Get a single course
const getCourse = async (req, res) => {
    try {
        const course = await courseModel_1.default.findOne({ id: req.params.id });
        if (!course) {
            return res.status(404).json({
                message: "Course not found",
            });
        }
        return res.status(200).json({
            message: "Course retrieved successfully",
            data: course,
        });
    }
    catch (error) {
        return (0, handleError_1.handleError)(error, req, res);
    }
};
exports.getCourse = getCourse;
// Update a course
const updateCourse = async (req, res) => {
    try {
        const course = await courseModel_1.default.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
        if (!course) {
            return res.status(404).json({
                message: "Course not found",
            });
        }
        return res.status(200).json({
            message: "Course updated successfully",
            data: course,
        });
    }
    catch (error) {
        return (0, handleError_1.handleError)(error, req, res);
    }
};
exports.updateCourse = updateCourse;
// Delete a course
const deleteCourse = async (req, res) => {
    try {
        const course = await courseModel_1.default.findOneAndDelete({ id: req.params.id });
        if (!course) {
            return res.status(404).json({
                message: "Course not found",
            });
        }
        return res.status(200).json({
            message: "Course deleted successfully",
        });
    }
    catch (error) {
        return (0, handleError_1.handleError)(error, req, res);
    }
};
exports.deleteCourse = deleteCourse;
// Update topic completion status
const updateTopicStatus = async (req, res) => {
    try {
        const { courseId, topicId } = req.params;
        const course = await courseModel_1.default.findOne({ id: courseId });
        if (!course) {
            return res.status(404).json({
                message: "Course not found",
            });
        }
        const topic = course.topics.find((t) => t.id === topicId);
        if (!topic) {
            return res.status(404).json({
                message: "Topic not found",
            });
        }
        topic.completed = !topic.completed;
        course.completedLessons = course.topics.filter((t) => t.completed).length;
        await course.save();
        return res.status(200).json({
            message: "Topic status updated successfully",
            data: course,
        });
    }
    catch (error) {
        return (0, handleError_1.handleError)(error, req, res);
    }
};
exports.updateTopicStatus = updateTopicStatus;
