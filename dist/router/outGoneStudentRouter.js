"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const outGoneController_1 = require("../controller/outGoneController");
const router = (0, express_1.Router)();
router
    .route("/create-out-gone-student/:schoolID/:studentID")
    .post(outGoneController_1.createSchoolOutGoneStudent);
router.route("/view-out-gone-student/:schoolID").get(outGoneController_1.viewSchoolOutGoneStudents);
router.route("/find-out-gone-student/:schoolID").get(outGoneController_1.findSchoolOutGoneStudents);
exports.default = router;
