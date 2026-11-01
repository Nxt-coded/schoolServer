"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const assignmentController_1 = require("../controller/assignmentController");
const router = (0, express_1.Router)();
router
    .route("/create-subject-assignment/:classID/:subjectID")
    .post(assignmentController_1.createSubjectAssignment);
router.route("/view-subject-assignment/:subjectID").get(assignmentController_1.readSubjectAssignment);
router
    .route("/view-teacher-assignment/:teacherID")
    .get(assignmentController_1.readTeacherSubjectAssignment);
router.route("/view-class-assignment/:classID").get(assignmentController_1.readClassSubjectAssignment);
router.route("/view-assignment/:assignmentID").get(assignmentController_1.readAssignment);
// resolve
router
    .route("/create-subject-assingment-performance/:studentID/:assignmentID")
    .post(assignmentController_1.createAssignmentPerformance);
router
    .route("/view-subject-assignment-performance/:subjectID")
    .get(assignmentController_1.readSubjectAssignmentResult);
router
    .route("/view-student-assignment-performance/:studentID")
    .get(assignmentController_1.readStudentAssignmentResult);
router
    .route("/view-assignment-performance/:resolveID")
    .get(assignmentController_1.readAssignmentResult);
exports.default = router;
