"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sessionController_1 = require("../controller/sessionController");
const announcementController_1 = require("../controller/announcementController");
// viewSchoolPresentSessionTerm;
const router = (0, express_1.Router)();
router
    .route("/migrate-sss1holders/:schoolID")
    .patch(sessionController_1.migrateStudentsFromSSS1Holders);
router.route("/create-school-session").post(sessionController_1.createSchoolSession);
router
    .route("/create-new-school-session/:schoolID")
    .post(sessionController_1.createNewSchoolSession);
router.route("/view-school-session/:schoolID").get(sessionController_1.viewSchoolSession);
router.route("/update-students").patch(sessionController_1.studentsPerSession);
router.route("/create-school-term/:sessionID").post(sessionController_1.termPerSession);
router.route("/school-term-payment-updated/:termID").patch(sessionController_1.updateTermPay);
router
    .route("/view-school-term/:termID")
    .get(sessionController_1.viewSchoolPresentSessionTerm);
router.route("/view-school-term-detail/:termID").get(sessionController_1.viewTerm);
router.route("/payment-receipt/:schoolID").post(announcementController_1.createSchoolPaynemtReceipt);
router
    .route("/view-present-school-session/:sessionID")
    .get(sessionController_1.viewSchoolPresentSession);
router.route("/view-term-by-id/:termID").get(sessionController_1.viewSchoolPresentSessionTerm);
router.route("/view-all-session").get(sessionController_1.getAllSession);
router
    .route("/view-class-result-history/:classID")
    .get(sessionController_1.getAllClassSessionResults);
router.route("/create-history-session/:classID").post(sessionController_1.createSessionHistory);
// router
//   .route("/create-school-history-session/:schoolID")
//   .post(createSessionHistory);
// router.route("/create-school-term-history/:session").post(createSessionHistory);
exports.default = router;
// create-new-school-session
