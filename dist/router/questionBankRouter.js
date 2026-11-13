"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const questionBankController_1 = require("../controller/questionBankController");
const router = (0, express_1.Router)();
router.route("/question-bank/:subjectID").get(questionBankController_1.readQuestionBank);
router
    .route("/assessment-from-bank/:classID/:subjectID")
    .post(questionBankController_1.createAssessmentFromBank);
router
    .route("/reschedule-assessment/:assessmentType/:assessmentID")
    .patch(questionBankController_1.rescheduleAssessment);
exports.default = router;
