"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pastQuestionController_1 = require("../controller/pastQuestionController");
const router = (0, express_1.Router)();
router
    .route("/create-question-history/:studentID")
    .post(pastQuestionController_1.createPastQuestionHistory);
router.route("/view-question-history/:studentID").get(pastQuestionController_1.getOneStudentHistory);
router.route("/get-one-history/:historyID").get(pastQuestionController_1.getOneHistory);
exports.default = router;
