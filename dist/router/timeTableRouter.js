"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const timeTableController_1 = require("../controller/timeTableController");
const router = (0, express_1.Router)();
router
    .route("/create-time-table/:schoolID/:classID")
    .post(timeTableController_1.createClassTimeTable);
router.route("/view-time-table/:classID").get(timeTableController_1.readClassTimeTable);
router.route("/view-teacher-schedule/:teacherID").get(timeTableController_1.readTeacherSchedule);
router
    .route("/update-time-table/:schoolID/:classID/:tableID/")
    .patch(timeTableController_1.readTeacherAndTimeTableSubject);
router
    .route("/delete-time-table/:schoolID/:tableID/")
    .delete(timeTableController_1.deleteTeacherAndTimeTableSubject);
exports.default = router;
