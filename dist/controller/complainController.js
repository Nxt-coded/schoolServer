"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.viewStudentComplains = exports.viewTeacherComplains = exports.viewSchoolComplains = exports.markResolveComplain = exports.markAsSeenComplain = exports.createStudentComplain = exports.createTeacherComplain = void 0;
const schoolModel_1 = __importDefault(require("../model/schoolModel"));
const complainModel_1 = __importDefault(require("../model/complainModel"));
const mongoose_1 = require("mongoose");
const staffModel_1 = __importDefault(require("../model/staffModel"));
const studentModel_1 = __importDefault(require("../model/studentModel"));
const createTeacherComplain = async (req, res) => {
    try {
        const { teacherID } = req.params;
        const { title, importance } = req.body;
        const teacher = await staffModel_1.default.findById(teacherID);
        const school = await schoolModel_1.default.findById(teacher?.schoolIDs);
        if (teacher) {
            const complain = await complainModel_1.default.create({
                reporterID: teacherID,
                title,
                importance,
            });
            teacher?.complain.push(new mongoose_1.Types.ObjectId(complain._id));
            teacher.save();
            school?.complain.push(new mongoose_1.Types.ObjectId(complain._id));
            school?.save();
            return res.status(201).json({
                message: "teacher complain [posted] successfully",
                data: complain,
                status: 201,
            });
        }
        else {
            return res.status(404).json({
                message: "teacher must exist",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school session",
            data: error.message,
            status: 404,
        });
    }
};
exports.createTeacherComplain = createTeacherComplain;
const createStudentComplain = async (req, res) => {
    try {
        const { studentID } = req.params;
        const { title, importance } = req.body;
        const student = await studentModel_1.default.findById(studentID);
        const school = await schoolModel_1.default.findById(student?.schoolIDs);
        if (student) {
            const complain = await complainModel_1.default.create({
                reporterID: studentID,
                title,
                importance,
            });
            student?.complain.push(new mongoose_1.Types.ObjectId(complain._id));
            student.save();
            school?.complain.push(new mongoose_1.Types.ObjectId(complain._id));
            school?.save();
            return res.status(201).json({
                message: "student complain posted successfully",
                data: complain,
                status: 201,
            });
        }
        else {
            return res.status(404).json({
                message: "student must exist",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school session",
            data: error.message,
            status: 404,
        });
    }
};
exports.createStudentComplain = createStudentComplain;
const markAsSeenComplain = async (req, res) => {
    try {
        const { schoolID, complainID } = req.params;
        const school = await schoolModel_1.default.findById(schoolID);
        if (school) {
            const complain = await complainModel_1.default.findByIdAndUpdate(complainID, { seen: true }, { new: true });
            return res.status(201).json({
                message: "mark complain seen successfully",
                data: complain,
                status: 201,
            });
        }
        else {
            return res.status(404).json({
                message: "school must exist",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school session",
            data: error.message,
            status: 404,
        });
    }
};
exports.markAsSeenComplain = markAsSeenComplain;
const markResolveComplain = async (req, res) => {
    try {
        const { schoolID, complainID } = req.params;
        const school = await schoolModel_1.default.findById(schoolID);
        if (school) {
            const complain = await complainModel_1.default.findByIdAndUpdate(complainID, { resolve: true }, { new: true });
            return res.status(201).json({
                message: "mark complain resolved successfully",
                data: complain,
                status: 201,
            });
        }
        else {
            return res.status(404).json({
                message: "school must exist",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school session",
            data: error.message,
            status: 404,
        });
    }
};
exports.markResolveComplain = markResolveComplain;
const viewSchoolComplains = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const complain = await schoolModel_1.default.findById(schoolID).populate({
            path: "complain",
            options: {
                sort: {
                    createdAt: -1,
                },
            },
        });
        return res.status(201).json({
            message: "view complain successfully",
            data: complain,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school session",
            data: error.message,
            status: 404,
        });
    }
};
exports.viewSchoolComplains = viewSchoolComplains;
const viewTeacherComplains = async (req, res) => {
    try {
        const { teacherID } = req.params;
        const complain = await staffModel_1.default.findById(teacherID).populate({
            path: "complain",
            options: {
                sort: {
                    createdAt: -1,
                },
            },
        });
        return res.status(201).json({
            message: "view complain successfully",
            data: complain,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school session",
            data: error.message,
            status: 404,
        });
    }
};
exports.viewTeacherComplains = viewTeacherComplains;
const viewStudentComplains = async (req, res) => {
    try {
        const { studentID } = req.params;
        const complain = await studentModel_1.default.findById(studentID).populate({
            path: "complain",
            options: {
                sort: {
                    createdAt: -1,
                },
            },
        });
        return res.status(201).json({
            message: "view complain successfully",
            data: complain,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school session",
            data: error.message,
            status: 404,
        });
    }
};
exports.viewStudentComplains = viewStudentComplains;
