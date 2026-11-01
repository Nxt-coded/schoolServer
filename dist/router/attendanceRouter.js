"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const attendanceController_1 = require("../controller/attendanceController");
const express_1 = require("express");
const router = (0, express_1.Router)();
router.route("/present/:teacherID/:studentID").post(attendanceController_1.createAttendancePresent);
router.route("/absent/:teacherID/:studentID").post(attendanceController_1.createAttendanceAbsent);
router
    .route("/teacher-viewing-student-attendance/:teacherID")
    .get(attendanceController_1.viewStudentAttendanceByTeacher);
router
    .route("/viewing-student-attendance/:studentID")
    .get(attendanceController_1.viewStudentAttendance);
router
    .route("/viewing-class-attendance/:classID")
    .get(attendanceController_1.viewClassStudentAttendance);
exports.default = router;
