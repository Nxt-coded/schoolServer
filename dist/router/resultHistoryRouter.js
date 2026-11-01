"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const historicalResultController_1 = require("../controller/historicalResultController");
const router = (0, express_1.Router)();
router
    .route("/create-result-history/:schoolID/:studentID")
    .post(historicalResultController_1.createResultHistory);
router.route("/view-student-result-history/:studentID").get(historicalResultController_1.viewResultHistory);
router
    .route("/delete-student-result-history/:studentID/:resultID")
    .delete(historicalResultController_1.deleteResultHistory);
exports.default = router;
