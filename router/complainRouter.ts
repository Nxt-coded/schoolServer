import { Router } from "express";
import {
  createStudentComplain,
  createTeacherComplain,
  markAsSeenComplain,
  markResolveComplain,
  viewSchoolComplains,
  viewStudentComplains,
  viewTeacherComplains,
} from "../controller/complainController";

const router: Router = Router();

router.route("/create-complain/:teacherID").post(createTeacherComplain);
router.route("/create-student-complain/:studentID").post(createStudentComplain);

router.route("/mark-seen/:schoolID/:complainID").patch(markAsSeenComplain);
router.route("/mark-resolve/:schoolID/:complainID").patch(markResolveComplain);

router.route("/view-school-complain/:schoolID").get(viewSchoolComplains);
router.route("/view-teacher-complain/:teacherID").get(viewTeacherComplains);
router.route("/view-student-complain/:studentID").get(viewStudentComplains);

export default router;
