"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLessonNote = exports.readTeacherLessonNotesRate = exports.readLessonNote = exports.approveTeacherLessonNote = exports.readTeacherClassLessonNote = exports.readTeacherLessonNote = exports.readAdminLessonNote = exports.createAdminLessonNoteReply = exports.editClasslessonNote = exports.createClasslessonNote = void 0;
const schoolModel_1 = __importDefault(require("../model/schoolModel"));
const staffModel_1 = __importDefault(require("../model/staffModel"));
const mongoose_1 = require("mongoose");
const lessonNoteModel_1 = __importDefault(require("../model/lessonNoteModel"));
const classroomModel_1 = __importDefault(require("../model/classroomModel"));
const studentModel_1 = __importDefault(require("../model/studentModel"));
const createClasslessonNote = async (req, res) => {
    try {
        const { schoolID, staffID } = req.params;
        const { week, endingAt, createDate, classes, subTopic, period, duration, instructionalMaterial, referenceMaterial, previousKnowledge, specificObjectives, content, evaluation, summary, presentation, assignment, topic, subject, } = req.body;
        const school = await schoolModel_1.default.findById(schoolID);
        const staff = await staffModel_1.default.findById(staffID);
        const classData = await classroomModel_1.default.findById(staff?.presentClassID);
        if (school && school.schoolName && staff) {
            const note = await lessonNoteModel_1.default.create({
                teacher: staff?.staffName,
                // teacherClass: staff?.classesAssigned,
                profilePic: staff?.avatar,
                teacherID: staff?._id,
                week,
                endingAt,
                createDate,
                classes,
                subTopic,
                period,
                duration,
                instructionalMaterial,
                referenceMaterial,
                previousKnowledge,
                specificObjectives,
                content,
                evaluation,
                summary,
                presentation,
                assignment,
                topic,
                subject,
                adminSignation: false,
            });
            school?.lessonNotes.push(new mongoose_1.Types.ObjectId(note?._id));
            school?.save();
            staff?.lessonNotes.push(new mongoose_1.Types.ObjectId(note?._id));
            staff?.save();
            classData?.lessonNotes.push(new mongoose_1.Types.ObjectId(note?._id));
            classData?.save();
            return res.status(201).json({
                message: "lesson note created",
                data: note,
                status: 201,
            });
        }
        else {
            return res.status(404).json({
                message: "school not found",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating lesson Note",
            status: 404,
            data: error.message,
        });
    }
};
exports.createClasslessonNote = createClasslessonNote;
const editClasslessonNote = async (req, res) => {
    try {
        const { staffID, lessonNodeID } = req.params;
        const { week, endingAt, createDate, classes, subTopic, period, duration, instructionalMaterial, referenceMaterial, previousKnowledge, specificObjectives, content, evaluation, summary, presentation, assignment, topic, subject, } = req.body;
        const staff = await staffModel_1.default.findById(staffID);
        if (staff) {
            const note = await lessonNoteModel_1.default.findByIdAndUpdate(lessonNodeID, {
                teacher: staff?.staffName,
                teacherClass: staff?.classesAssigned,
                teacherID: staff?._id,
                subject,
                topic,
                week,
                endingAt,
                createDate,
                classes,
                subTopic,
                period,
                duration,
                instructionalMaterial,
                referenceMaterial,
                previousKnowledge,
                specificObjectives,
                content,
                evaluation,
                summary,
                presentation,
                assignment,
                adminSignation: false,
            }, { new: true });
            return res.status(201).json({
                message: "lesson note updated successfully",
                data: note,
                status: 201,
            });
        }
        else {
            return res.status(404).json({
                message: "staff not found",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating lesson Note",
            status: 404,
            data: error.message,
        });
    }
};
exports.editClasslessonNote = editClasslessonNote;
const createAdminLessonNoteReply = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const { lessonNotedID } = req.params;
        const { responseDetail, deadline } = req.body;
        const school = await schoolModel_1.default.findById(schoolID);
        if (school && school.schoolName) {
            const note = await lessonNoteModel_1.default.findByIdAndUpdate(lessonNotedID, {
                responseDetail,
                deadline,
                messageSent: true,
            }, { new: true });
            return res.status(201).json({
                message: "Lesson Note Response Updated",
                data: note,
                status: 201,
            });
        }
        else {
            return res.status(404).json({
                message: "school not found",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating lesson Note",
            status: 404,
            data: error.message,
        });
    }
};
exports.createAdminLessonNoteReply = createAdminLessonNoteReply;
const readAdminLessonNote = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const school = await schoolModel_1.default.findById(schoolID);
        if (school && school.schoolName && school.status === "school-admin") {
            const note = await schoolModel_1.default
                .findById(schoolID)
                .populate({ path: "lessonNotes" });
            return res.status(200).json({
                message: "Reading admin's lesson note",
                data: note,
                status: 200,
            });
        }
        else {
            return res.status(404).json({
                message: "school not found",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating lesson Note",
            status: 404,
        });
    }
};
exports.readAdminLessonNote = readAdminLessonNote;
const readTeacherLessonNote = async (req, res) => {
    try {
        const { schoolID, staffID } = req.params;
        const school = await schoolModel_1.default.findById(schoolID);
        const staff = await staffModel_1.default.findById(staffID);
        if (school && school.schoolName && staff.status === "school-teacher") {
            const note = await staffModel_1.default
                .findById(staffID)
                ?.populate({ path: "lessonNotes" });
            return res.status(200).json({
                message: "Reading teacher's lesson note",
                data: note,
                status: 200,
            });
        }
        else {
            return res.status(404).json({
                message: "school not found",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating lesson Note",
            status: 404,
        });
    }
};
exports.readTeacherLessonNote = readTeacherLessonNote;
const readTeacherClassLessonNote = async (req, res) => {
    try {
        const { classID } = req.params;
        const note = await classroomModel_1.default
            .findById(classID)
            ?.populate({ path: "lessonNotes" });
        return res.status(200).json({
            message: "Reading teacher's lesson note",
            data: note,
            status: 200,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating lesson Note",
            status: 404,
        });
    }
};
exports.readTeacherClassLessonNote = readTeacherClassLessonNote;
const approveTeacherLessonNote = async (req, res) => {
    try {
        const { schoolID, lessonID } = req.params;
        const school = await schoolModel_1.default.findById(schoolID);
        const lessonNote = await lessonNoteModel_1.default.findById(lessonID);
        if (school &&
            school.schoolName &&
            school.status === "school-admin" &&
            lessonNote) {
            const note = await lessonNoteModel_1.default.findByIdAndUpdate(lessonNote?._id, { adminSignation: true }, { new: true });
            return res.status(200).json({
                message: "lesson note approved",
                data: note,
                status: 200,
            });
        }
        else {
            return res.status(404).json({
                message: "school not found",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating lesson Note",
            status: 404,
        });
    }
};
exports.approveTeacherLessonNote = approveTeacherLessonNote;
const readLessonNote = async (req, res) => {
    try {
        const { lessonID } = req.params;
        const lessonNote = await lessonNoteModel_1.default.findById(lessonID);
        return res.status(200).json({
            message: "lesson note ",
            data: lessonNote,
            status: 200,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating lesson Note",
            status: 404,
        });
    }
};
exports.readLessonNote = readLessonNote;
const readTeacherLessonNotesRate = async (req, res) => {
    try {
        const { teacherID } = req.params;
        const lessonNote = await staffModel_1.default.findById(teacherID).populate({
            path: "lessonNotes",
        });
        return res.status(200).json({
            message: "lesson note ",
            data: lessonNote,
            status: 200,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating lesson Note",
            status: 404,
        });
    }
};
exports.readTeacherLessonNotesRate = readTeacherLessonNotesRate;
const rateLessonNote = async (req, res) => {
    try {
        const { lessonID, studentID } = req.params;
        const { rate } = req.body;
        const student = await studentModel_1.default.findById(studentID);
        const lessonNote = await lessonNoteModel_1.default.findById(lessonID);
        const teacher = await staffModel_1.default
            .findById(lessonNote.teacherID)
            .populate({ path: "lessonNotes" });
        const check = lessonNote?.rateData.some((el) => {
            return el.id === studentID;
        });
        if (student && lessonNote) {
            // if (!check) {
            // let dataNote = [...lessonNote?.rateData, { id: studentID, rate }];
            const lessonNoteData = await lessonNoteModel_1.default.findByIdAndUpdate(lessonNote?._id, {
                rateData: [...lessonNote?.rateData, { id: studentID, rate }],
            }, { new: true });
            const lessonNoteDate = await lessonNoteModel_1.default.findByIdAndUpdate(lessonNoteData?._id, {
                rate: lessonNote.rateData
                    .map((el) => {
                    if (el.rate === undefined) {
                        return (el.rate = 0);
                    }
                    else {
                        return parseInt(el.rate);
                    }
                })
                    .reduce((a, b) => a + b) /
                    lessonNote.rateData.length,
            }, { new: true });
            const lesson = await lessonNoteModel_1.default.findById(lessonNoteDate?._id);
            await staffModel_1.default.findByIdAndUpdate(teacher?._id, {
                staffRating: teacher?.lessonNotes
                    .map((el) => {
                    if (el.rate === undefined) {
                        return (el.rate = 0);
                    }
                    else {
                        return el.rate;
                    }
                })
                    .reduce((a, b) => {
                    return a + b;
                }) / teacher?.lessonNotes.length,
            }, { new: true });
            return res.status(200).json({
                message: "lesson note rated",
                data: lesson,
                status: 200,
            });
            // }
            // else {
            //   return res.status(404).json({
            //     message: "Already rated",
            //     status: 404,
            //   });
            // }
        }
        else {
            return res.status(404).json({
                message: "Student can't be fine",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating lesson Note",
            status: 404,
            data: error.message,
        });
    }
};
exports.rateLessonNote = rateLessonNote;
