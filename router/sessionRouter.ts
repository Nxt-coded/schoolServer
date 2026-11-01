import { Router } from "express";
import {
  createNewSchoolSession,
  createSchoolSession,
  createSessionHistory,
  getAllClassSessionResults,
  getAllSession,
  migrateStudentsFromSSS1Holders,
  studentsPerSession,
  termPerSession,
  updateTermPay,
  viewSchoolPresentSession,
  viewSchoolPresentSessionTerm,
  viewSchoolSession,
  viewTerm,
} from "../controller/sessionController";
import { createSchoolPaynemtReceipt } from "../controller/announcementController";
// viewSchoolPresentSessionTerm;

const router: Router = Router();
router
  .route("/migrate-sss1holders/:schoolID")
  .patch(migrateStudentsFromSSS1Holders);


router.route("/create-school-session").post(createSchoolSession);
router
  .route("/create-new-school-session/:schoolID")
  .post(createNewSchoolSession);

router.route("/view-school-session/:schoolID").get(viewSchoolSession);
router.route("/update-students").patch(studentsPerSession);

router.route("/create-school-term/:sessionID").post(termPerSession);

router.route("/school-term-payment-updated/:termID").patch(updateTermPay);

router
  .route("/view-school-term/:termID")
  .get(viewSchoolPresentSessionTerm);

router.route("/view-school-term-detail/:termID").get(viewTerm);

router.route("/payment-receipt/:schoolID").post(createSchoolPaynemtReceipt);

router
  .route("/view-present-school-session/:sessionID")
  .get(viewSchoolPresentSession);
router.route("/view-term-by-id/:termID").get(viewSchoolPresentSessionTerm);

router.route("/view-all-session").get(getAllSession);

router
  .route("/view-class-result-history/:classID")
  .get(getAllClassSessionResults);

router.route("/create-history-session/:classID").post(createSessionHistory);

// router
//   .route("/create-school-history-session/:schoolID")
//   .post(createSessionHistory);

// router.route("/create-school-term-history/:session").post(createSessionHistory);
export default router;
// create-new-school-session
