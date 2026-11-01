import { Router } from "express";
import {
  createRemark,
  viewStudentRemark,
} from "../controller/remarkController";

const router: Router = Router();

router.route("/create-remark/:teacherID/:studentID").post(createRemark);
router.route("/view-remark/:studentID").get(viewStudentRemark);
export default router;
