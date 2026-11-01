import { Router } from "express";
import { createStudentreportCard } from "../controller/reportCardController";
import {
  adminReportRemark,
  classTeacherReportRemark,
  createReportCardEntry,
  studentReportRemark,
  classTeacherPhychoReportRemark,
  updateReportScores,
  createMidReportCardEntry,
  studentMidReportRemark,
  classTeacherMidReportRemark,
  adminMidReportRemark,
  removeSubjectFromResult,
  deleteReportCardEntry,
  getClassReportCards,
} from "../controller/cardReportController";

const router: Router = Router();

router
  .route("/create-report-card/:schoolID/:staffID/:studentID")
  .post(createStudentreportCard);

router.route("/create-report-card/:studentID").post(createReportCardEntry);

router
  .route("/create-mid-report-card/:studentID")
  .post(createMidReportCardEntry);

router
  .route("/update-report-card/:teacherID/:studentID")
  .patch(updateReportScores);

router
  .route("/update-psycho-report/:teacherID/:studentID")
  .patch(classTeacherPhychoReportRemark);

router
  .route("/admin-report-card/:schoolID/:studentID")
  .patch(adminReportRemark);

router
  .route("/teacher-report-card/:teacherID/:studentID")
  .patch(classTeacherReportRemark);

router
  .route("/admin-mid-report-card/:schoolID/:studentID")
  .patch(adminMidReportRemark);

router
  .route("/remove-mid-report-card/:studentID")
  .patch(removeSubjectFromResult);

router
  .route("/remove-report-card/:studentID")
  .patch(deleteReportCardEntry);

router
  .route("/teacher-mid-report-card/:teacherID/:studentID")
  .patch(classTeacherMidReportRemark);

router.route("/student-report-card/:studentID").get(studentReportRemark);

router.route("/student-mid-report-card/:studentID").get(studentMidReportRemark);

router.route("/class-report-cards/:classID").get(getClassReportCards);

export default router;
