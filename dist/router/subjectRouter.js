"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const subjectController_1 = require("../controller/subjectController");
const multer_1 = require("../utils/multer");
const router = (0, express_1.Router)();
router.route("/create-subject/:schoolID").post(subjectController_1.createSchoolSubject);
router
    .route("/create-bulk-subject/:schoolID")
    .post(multer_1.fileUpload, subjectController_1.createBulkClassSubjects);
router.route("/view-subjects/:schoolID").get(subjectController_1.viewSchoolSubjects);
router.route("/view-subjects-info/:subjectID").get(subjectController_1.viewSubjectDetail);
router
    .route("/update-subject-teacher/:schoolID/:subjectID")
    .patch(subjectController_1.updateSchoolSubjectTeacher);
router
    .route("/remove-teacher-subject/:schoolID/:teacherID/:subjectID")
    .patch(subjectController_1.removeSubjectFromTeacher);
router
    .route("/delete-subject/:schoolID/:subjectID")
    .delete(subjectController_1.deleteSchoolSubject);
exports.default = router;
