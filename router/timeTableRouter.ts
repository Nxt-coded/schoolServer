import { Router } from "express";
import {
  createClassTimeTable,
  deleteTeacherAndTimeTableSubject,
  readClassTimeTable,
  readTeacherAndTimeTableSubject,
  readTeacherSchedule,
} from "../controller/timeTableController";

const router: Router = Router();

router
  .route("/create-time-table/:schoolID/:classID")
  .post(createClassTimeTable);
router.route("/view-time-table/:classID").get(readClassTimeTable);
router.route("/view-teacher-schedule/:teacherID").get(readTeacherSchedule);

router
  .route("/update-time-table/:schoolID/:classID/:tableID/")
  .patch(readTeacherAndTimeTableSubject);

router
  .route("/delete-time-table/:schoolID/:tableID/")
  .delete(deleteTeacherAndTimeTableSubject);
export default router;
