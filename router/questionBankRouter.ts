import { Router } from "express";
import {
  createAssessmentFromBank,
  readQuestionBank,
  rescheduleAssessment,
} from "../controller/questionBankController";

const router: Router = Router();

router.route("/question-bank/:subjectID").get(readQuestionBank);
router
  .route("/assessment-from-bank/:classID/:subjectID")
  .post(createAssessmentFromBank);
router
  .route("/reschedule-assessment/:assessmentType/:assessmentID")
  .patch(rescheduleAssessment);

export default router;
