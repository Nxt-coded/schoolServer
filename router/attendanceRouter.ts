import {
  createAttendancePresent,
  createAttendanceAbsent,
  viewStudentAttendanceByTeacher,
  viewStudentAttendance,
  viewClassStudentAttendance,
} from "../controller/attendanceController";

import { Router } from "express";

const router = Router();

router.route("/present/:teacherID/:studentID").post(createAttendancePresent);

router.route("/absent/:teacherID/:studentID").post(createAttendanceAbsent);

router
  .route("/teacher-viewing-student-attendance/:teacherID")
  .get(viewStudentAttendanceByTeacher);

router
  .route("/viewing-student-attendance/:studentID")
  .get(viewStudentAttendance);

router
  .route("/viewing-class-attendance/:classID")
  .get(viewClassStudentAttendance);

export default router;
