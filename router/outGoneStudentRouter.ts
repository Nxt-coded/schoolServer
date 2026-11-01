import { Router } from "express";
import {
  createSchoolOutGoneStudent,
  findSchoolOutGoneStudents,
  viewSchoolOutGoneStudents,
} from "../controller/outGoneController";

const router: Router = Router();

router
  .route("/create-out-gone-student/:schoolID/:studentID")
  .post(createSchoolOutGoneStudent);

router.route("/view-out-gone-student/:schoolID").get(viewSchoolOutGoneStudents);

router.route("/find-out-gone-student/:schoolID").get(findSchoolOutGoneStudents);

export default router;
