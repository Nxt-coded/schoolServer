"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = require("../utils/multer");
const midTestController_1 = require("../controller/midTestController");
const router = (0, express_1.Router)();
// examination
router
    .route("/create-subject-mid-test/:classID/:subjectID")
    .post(multer_1.fileUploads, midTestController_1.createSubjectMidTest);
router
    .route("/randomize-subject-mid-test/:midTestID/")
    .patch(midTestController_1.randomizeSubjectMidTest);
router.route("/start-subject-mid-test/:midTestID/").patch(midTestController_1.startSubjectMidTest);
router
    .route("/update-subject-mid-test/:midTestID/")
    .patch(midTestController_1.updateSubjectMidTest);
router.route("/view-subject-mid-test/:subjectID").get(midTestController_1.readSubjectMidTest);
router.route("/view-mid-test/:midTestID").get(midTestController_1.readMidTest);
router.route("/delete-mid/:subjectID/:midTestID").delete(midTestController_1.deleteMidTest);
exports.default = router;
