"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const remarkController_1 = require("../controller/remarkController");
const router = (0, express_1.Router)();
router.route("/create-remark/:teacherID/:studentID").post(remarkController_1.createRemark);
router.route("/view-remark/:studentID").get(remarkController_1.viewStudentRemark);
exports.default = router;
