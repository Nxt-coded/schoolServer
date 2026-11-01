"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const performanceController_1 = require("../controller/performanceController");
const router = (0, express_1.Router)();
router
    .route("/create-subject-quiz-performance/:studentID/:quizID/:subjectID")
    .post(performanceController_1.createQuizPerformance);
router
    .route("/view-subject-quiz-performance/:subjectID")
    .get(performanceController_1.readSubjectQuizResult);
router
    .route("/updated-subject-quiz-performance-record/:performanceID")
    .patch(performanceController_1.updateSubjectQuizResultRecorded);
router
    .route("/quit-subject-quiz-performance-record/:performanceID")
    .patch(performanceController_1.updateQuitSubjectQuizResultRecorded);
router
    .route("/view-onesubject-quiz-performance/:subjectID/:quizID")
    .get(performanceController_1.readOneSubjectQuizResult);
router
    .route("/view-student-quiz-performance/:studentID")
    .get(performanceController_1.readStudentQuizResult);
router.route("/view-quiz-performance/:quizID").get(performanceController_1.readQuizResult);
// Examination
router
    .route("/create-subject-exam-performance/:studentID/:quizID/:subjectID")
    .post(performanceController_1.createExamPerformance);
router
    .route("/view-subject-exam-performance/:subjectID")
    .get(performanceController_1.readSubjectExamResult);
router
    .route("/view-onesubject-exam-performance/:subjectID/:quizID")
    .get(performanceController_1.readOneSubjectExamResult);
router
    .route("/view-one-subject-mid-test-performance/:subjectID/:quizID")
    .get(performanceController_1.readOneSubjectMidTestResultPreformance);
router
    .route("/view-student-exam-performance/:studentID")
    .get(performanceController_1.readStudentExamResult);
router.route("/view-exam-performance/:quizID").get(performanceController_1.readExamResult);
// Mid Test
router
    .route("/create-subject-mid-test-performance/:studentID/:quizID/:subjectID")
    .post(performanceController_1.createMidTestPerformance);
router
    .route("/view-subject-mid-test-performance/:subjectID")
    .get(performanceController_1.readSubjectMidTestResult);
router
    .route("/view-onesubject-mid-test-performance/:subjectID/:quizID")
    .get(performanceController_1.readOneSubjectMidTestResult);
router
    .route("/view-student-mid-test-performance/:studentID")
    .get(performanceController_1.readStudentMidTestResult);
router.route("/view-mid-test-performance/:quizID").get(performanceController_1.readMidTestResult);
// delete performance
router.route("/delete-performance/:performanceID").delete(performanceController_1.deletePerformance);
// delete all performances for a quiz
router
    .route("/delete-all-performances/:quizID")
    .delete(performanceController_1.deleteAllPerformancesForQuiz);
// delete selected students' performances for a quiz (expects `studentIDs` array in body)
router
    .route("/delete-selected-students/:quizID")
    .delete(performanceController_1.deleteSelectedStudentsFromQuiz);
exports.default = router;
