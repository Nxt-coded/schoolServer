"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTeacherAndTimeTableSubject = exports.readTeacherAndTimeTableSubject = exports.readTeacherSchedule = exports.readClassTimeTable = exports.createClassTimeTable = void 0;
const mongoose_1 = require("mongoose");
const schoolModel_1 = __importDefault(require("../model/schoolModel"));
const classroomModel_1 = __importDefault(require("../model/classroomModel"));
const timetableModel_1 = __importDefault(require("../model/timetableModel"));
const staffModel_1 = __importDefault(require("../model/staffModel"));
const createClassTimeTable = async (req, res) => {
    try {
        const { schoolID, classID } = req.params;
        const { subject, day, time } = req.body;
        const school = await schoolModel_1.default.findById(schoolID);
        if (!school || school.status !== "school-admin") {
            return res.status(404).json({ message: "School not found", status: 404 });
        }
        const classRoom = await classroomModel_1.default.findById(classID).populate("classSubjects");
        if (!classRoom) {
            return res.status(404).json({ message: "Classroom not found", status: 404 });
        }
        const isSubjectValid = classRoom.classSubjects.some((el) => el.subjectTitle === subject);
        const findTeacher = await staffModel_1.default.findById(classRoom.teacherID);
        if (isSubjectValid || ["Assembly", "Short Break", "Long Break"].includes(subject)) {
            const newTimeTable = await timetableModel_1.default.create({
                subject,
                day,
                time,
                CR: classRoom.className,
                subjectTeacherID: isSubjectValid ? findTeacher?._id : undefined,
            });
            classRoom.timeTable.push(new mongoose_1.Types.ObjectId(newTimeTable._id));
            await classRoom.save();
            if (isSubjectValid && findTeacher) {
                findTeacher.schedule.push(new mongoose_1.Types.ObjectId(newTimeTable._id));
                await findTeacher.save();
            }
            return res.status(201).json({
                message: "Timetable entry created successfully",
                data: newTimeTable,
                status: 201,
            });
        }
        return res.status(404).json({
            message: "Subject doesn't exist for this class",
            status: 404,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating class timetable",
            status: 404,
            error: error.message,
        });
    }
};
exports.createClassTimeTable = createClassTimeTable;
const readClassTimeTable = async (req, res) => {
    try {
        const { classID } = req.params;
        const timeTable = await classroomModel_1.default.findById(classID).populate({
            path: "timeTable",
            options: { sort: { time: 1 } },
        });
        if (!timeTable) {
            return res.status(404).json({ message: "Class not found", status: 404 });
        }
        return res.status(200).json({
            message: "Timetable retrieved successfully",
            data: timeTable,
            status: 200,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error fetching timetable",
            status: 404,
            error: error.message,
        });
    }
};
exports.readClassTimeTable = readClassTimeTable;
const readTeacherSchedule = async (req, res) => {
    try {
        const { teacherID } = req.params;
        const teacher = await staffModel_1.default.findById(teacherID).populate("schedule");
        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found", status: 404 });
        }
        return res.status(200).json({
            message: "Schedule retrieved successfully",
            data: teacher.schedule,
            status: 200,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error fetching schedule",
            status: 404,
            error: error.message,
        });
    }
};
exports.readTeacherSchedule = readTeacherSchedule;
const readTeacherAndTimeTableSubject = async (req, res) => {
    try {
        const { tableID, schoolID, classID } = req.params;
        const { subject } = req.body;
        const [time, school, classRoom] = await Promise.all([
            timetableModel_1.default.findById(tableID),
            schoolModel_1.default.findById(schoolID),
            classroomModel_1.default.findById(classID).populate("classSubjects"),
        ]);
        if (!school) {
            return res.status(404).json({ message: "School not found", status: 404 });
        }
        if (!classRoom) {
            return res.status(404).json({ message: "Classroom not found", status: 404 });
        }
        const isSubjectValid = classRoom.classSubjects.some((el) => el.subjectTitle === subject);
        if (!isSubjectValid) {
            return res.status(404).json({
                message: "Subject doesn't exist for this class",
                status: 404,
            });
        }
        const oldTeacher = await staffModel_1.default.findById(time?.subjectTeacherID);
        const newTeacher = await staffModel_1.default.findById(classRoom.teacherID);
        const updateSubject = await timetableModel_1.default.findByIdAndUpdate(tableID, { subject, subjectTeacherID: newTeacher?._id }, { new: true });
        if (oldTeacher) {
            oldTeacher?.schedule?.pull(tableID);
            await oldTeacher.save();
        }
        if (newTeacher) {
            newTeacher.schedule.push(new mongoose_1.Types.ObjectId(updateSubject?._id));
            await newTeacher.save();
        }
        return res.status(200).json({
            message: "Timetable subject entry updated successfully",
            data: updateSubject,
            status: 200,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Error updating timetable",
            status: 500,
            error: error.message,
        });
    }
};
exports.readTeacherAndTimeTableSubject = readTeacherAndTimeTableSubject;
const deleteTeacherAndTimeTableSubject = async (req, res) => {
    try {
        const { tableID, schoolID } = req.params;
        const [time, school] = await Promise.all([
            timetableModel_1.default.findById(tableID),
            schoolModel_1.default.findById(schoolID),
        ]);
        if (!school) {
            return res.status(404).json({ message: "School not found", status: 404 });
        }
        if (!time) {
            return res.status(404).json({ message: "Timetable entry not found", status: 404 });
        }
        const teacher = await staffModel_1.default.findById(time.subjectTeacherID);
        if (teacher) {
            teacher.schedule.pull(tableID);
            await teacher.save();
        }
        const deletedEntry = await timetableModel_1.default.findByIdAndDelete(tableID);
        return res.status(200).json({
            message: "Timetable subject entry deleted successfully",
            data: deletedEntry,
            status: 200,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error deleting timetable",
            status: 404,
            error: error.message,
        });
    }
};
exports.deleteTeacherAndTimeTableSubject = deleteTeacherAndTimeTableSubject;
