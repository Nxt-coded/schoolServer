import { Router } from "express";
import {
  createPastQuestionHistory,
  getOneHistory,
  getOneStudentHistory,
} from "../controller/pastQuestionController";

const router: Router = Router();

router
  .route("/create-question-history/:studentID")
  .post(createPastQuestionHistory);
router.route("/view-question-history/:studentID").get(getOneStudentHistory);
router.route("/get-one-history/:historyID").get(getOneHistory);

export default router;
