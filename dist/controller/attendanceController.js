"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.viewClassStudentAttendance = exports.viewStudentAttendance = exports.viewStudentAttendanceByTeacher = exports.createAttendanceAbsentMark = exports.createAttendanceAbsent = exports.createAttendancePresent = void 0;
const mongoose_1 = require("mongoose");
const crypto_1 = __importDefault(require("crypto"));
const studentModel_1 = __importDefault(require("../model/studentModel"));
const attendanceModel_1 = __importDefault(require("../model/attendanceModel"));
const moment_1 = __importDefault(require("moment"));
const staffModel_1 = __importDefault(require("../model/staffModel"));
const classroomModel_1 = __importDefault(require("../model/classroomModel"));
const createAttendancePresent = async (req, res) => {
    try {
        // SECURITY: Verify that a staff member is logged in and matches the teacherID
        if (!req.session.isAuth || req.session.isSchoolID !== req.params.teacherID) {
            return res.status(401).json({
                message: "Unauthorized: You must be logged in as the correct staff member",
                status: 401,
            });
        }
        const getTeacher = await staffModel_1.default.findById(req.params.teacherID);
        const getStudent = await studentModel_1.default.findById(req.params.studentID);
        const getClass = await classroomModel_1.default.findById(getStudent?.presentClassID);
        if (getTeacher && getStudent) {
            const code = crypto_1.default.randomBytes(2).toString("hex");
            const dater = Date.now();
            const getDateTime = await attendanceModel_1.default.find();
            const checkDate = getDateTime.find((el) => {
                return (el.dateTime ===
                    `${(0, moment_1.default)(dater).format("dddd")}, ${(0, moment_1.default)(dater).format("MMMM Do YYYY")}` &&
                    el.studentFirstName === getStudent.studentFirstName &&
                    el.studentLastName === getStudent.studentLastName);
            });
            if (checkDate) {
                if (!checkDate?.present) {
                    await attendanceModel_1.default.findByIdAndUpdate(checkDate?._id, {
                        present: true,
                        absent: false,
                    }, { new: true });
                }
                else {
                    await attendanceModel_1.default.findByIdAndUpdate(checkDate?._id, {
                        present: false,
                        absent: true,
                    }, { new: true });
                }
                return res.status(201).json({
                    message: "student has been Attendance has been updated successfully",
                    data: checkDate,
                });
            }
            else {
                const attendance = await attendanceModel_1.default.create({
                    className: getStudent.classAssigned,
                    classToken: code,
                    present: true,
                    absent: null,
                    studentFirstName: getStudent.studentFirstName,
                    studentLastName: getStudent.studentLastName,
                    classTeacher: getTeacher.staffName,
                    dateTime: `${(0, moment_1.default)(dater).format("dddd")}, ${(0, moment_1.default)(dater).format("MMMM Do YYYY")}`,
                    date: `${(0, moment_1.default)(dater).format("dddd")}`,
                });
                getTeacher.attendance.push(new mongoose_1.Types.ObjectId(attendance._id));
                getTeacher?.save();
                getClass.attendance.push(new mongoose_1.Types.ObjectId(attendance._id));
                getClass?.save();
                getStudent.attendance.push(new mongoose_1.Types.ObjectId(attendance._id));
                getStudent?.save();
                return res.status(201).json({
                    message: "student attendance has been marked for today",
                    data: attendance,
                });
            }
        }
        else {
            return res.status(404).json({ message: "student can't be found" });
        }
    }
    catch (error) {
        return res.status(404).json({ message: `Error: ${error}` });
    }
};
exports.createAttendancePresent = createAttendancePresent;
const createAttendanceAbsent = async (req, res) => {
    try {
        // SECURITY: Verify that a staff member is logged in and matches the teacherID
        if (!req.session.isAuth || req.session.isSchoolID !== req.params.teacherID) {
            return res.status(401).json({
                message: "Unauthorized: You must be logged in as the correct staff member",
                status: 401,
            });
        }
        const getTeacher = await staffModel_1.default.findById(req.params.teacherID);
        const getStudent = await studentModel_1.default.findById(req.params.studentID);
        const getClass = await classroomModel_1.default.findById(getStudent?.presentClassID);
        if (getTeacher && getStudent) {
            const code = crypto_1.default.randomBytes(2).toString("hex");
            const dater = Date.now();
            const getDateTime = await attendanceModel_1.default.find();
            const checkDate = getDateTime.find((el) => {
                return (el.dateTime ===
                    `${(0, moment_1.default)(dater).format("dddd")}, ${(0, moment_1.default)(dater).format("MMMM Do YYYY")}` &&
                    el.studentFirstName === getStudent.studentFirstName &&
                    el.studentLastName === getStudent.studentLastName);
            });
            if (checkDate) {
                if (!checkDate?.present) {
                    await attendanceModel_1.default.findByIdAndUpdate(checkDate?._id, {
                        present: true,
                        absent: false,
                    }, { new: true });
                }
                else {
                    await attendanceModel_1.default.findByIdAndUpdate(checkDate?._id, {
                        present: false,
                        absent: true,
                    }, { new: true });
                }
                return res.status(201).json({
                    message: "student has been Attendance has been updated successfully",
                    data: checkDate,
                });
            }
            else {
                const attendance = await attendanceModel_1.default.create({
                    className: getStudent.classAssigned,
                    classToken: code,
                    present: false,
                    absent: true,
                    studentFirstName: getStudent.studentFirstName,
                    studentLastName: getStudent.studentLastName,
                    classTeacher: getTeacher.staffName,
                    dateTime: `${(0, moment_1.default)(dater).format("dddd")}, ${(0, moment_1.default)(dater).format("MMMM Do YYYY")}`,
                    date: `${(0, moment_1.default)(dater).format("dddd")}`,
                });
                getTeacher.attendance.push(new mongoose_1.Types.ObjectId(attendance._id));
                getTeacher?.save();
                getClass.attendance.push(new mongoose_1.Types.ObjectId(attendance._id));
                getClass?.save();
                getStudent.attendance.push(new mongoose_1.Types.ObjectId(attendance._id));
                getStudent?.save();
                return res.status(201).json({
                    message: "student attendance has been marked Absent for today",
                    data: attendance,
                });
            }
        }
        else {
            return res.status(404).json({ message: "student can't be found" });
        }
    }
    catch (error) {
        return res.status(404).json({ message: `Error: ${error}` });
    }
};
exports.createAttendanceAbsent = createAttendanceAbsent;
const createAttendanceAbsentMark = async (req, res) => {
    try {
        const getTeacher = await staffModel_1.default.findById(req.params.teacherID);
        const getStudent = await studentModel_1.default.findById(req.params.studentID);
        const getClass = await classroomModel_1.default.findById(getStudent?.presentClassID);
        if (getTeacher && getStudent) {
            const code = crypto_1.default.randomBytes(2).toString("hex");
            const dater = Date.now();
            const attendance = await attendanceModel_1.default.create({
                className: getStudent.classAssigned,
                classToken: code,
                present: null,
                absent: true,
                studentFirstName: getStudent.studentFirstName,
                studentLastName: getStudent.studentLastName,
                classTeacher: getTeacher.staffName,
                dateTime: `${(0, moment_1.default)(dater).format("dddd")}, ${(0, moment_1.default)(dater).format("MMMM Do YYYY")}`,
                date: `${(0, moment_1.default)(dater).format("dddd")}`,
            });
            getTeacher.attendance.push(new mongoose_1.Types.ObjectId(attendance._id));
            getTeacher?.save();
            getClass.attendance.push(new mongoose_1.Types.ObjectId(attendance._id));
            getClass?.save();
            getStudent.attendance.push(new mongoose_1.Types.ObjectId(attendance._id));
            getStudent?.save();
            return res.status(201).json({
                message: "student has been marked Present for today",
                data: attendance,
            });
        }
        else {
            return res.status(404).json({ message: "student can't be found" });
        }
    }
    catch (error) {
        return res.status(404).json({ message: `Error: ${error}` });
    }
};
exports.createAttendanceAbsentMark = createAttendanceAbsentMark;
const viewStudentAttendanceByTeacher = async (req, res) => {
    try {
        const attendance = await classroomModel_1.default
            .findById(req.params.teacherID)
            .populate({
            path: "attendance",
            options: { sort: { createdAt: -1 } },
        });
        return res.status(200).json({
            message: `Viewing attendance attendance detail...!`,
            data: attendance,
        });
    }
    catch (error) {
        return res.status(404).json({ message: `Error: ${error}` });
    }
};
exports.viewStudentAttendanceByTeacher = viewStudentAttendanceByTeacher;
const viewStudentAttendance = async (req, res) => {
    try {
        const student = await studentModel_1.default.findById(req.params.studentID).populate({
            path: "attendance",
            options: { sort: { createdAt: -1 } },
        });
        return res.status(200).json({
            message: `Viewing student attendance detail...!`,
            data: student,
        });
    }
    catch (error) {
        return res.status(404).json({ message: `Error: ${error}` });
    }
};
exports.viewStudentAttendance = viewStudentAttendance;
const viewClassStudentAttendance = async (req, res) => {
    try {
        const student = await classroomModel_1.default.findById(req.params.classID).populate({
            path: "attendance",
            options: { sort: { createdAt: -1 } },
        });
        return res.status(200).json({
            message: `Viewing student attendance detail...!`,
            data: student,
        });
    }
    catch (error) {
        return res.status(404).json({ message: `Error: ${error}` });
    }
};
exports.viewClassStudentAttendance = viewClassStudentAttendance;
