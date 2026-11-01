import { Router } from "express";
import {
  createExamPerformance,
  createMidTestPerformance,
  createQuizPerformance,
  deletePerformance,
  readExamResult,
  readMidTestResult,
  readOneSubjectExamResult,
  readOneSubjectMidTestResult,
  readOneSubjectMidTestResultPreformance,
  readOneSubjectQuizResult,
  readQuizResult,
  readStudentExamResult,
  readStudentMidTestResult,
  readStudentQuizResult,
  readSubjectExamResult,
  readSubjectMidTestResult,
  readSubjectQuizResult,
  updateQuitSubjectQuizResultRecorded,
  updateSubjectQuizResultRecorded,
  deleteAllPerformancesForQuiz,
  deleteSelectedStudentsFromQuiz,
} from "../controller/performanceController";

const router: Router = Router();

router
  .route("/create-subject-quiz-performance/:studentID/:quizID/:subjectID")
  .post(createQuizPerformance);

router
  .route("/view-subject-quiz-performance/:subjectID")
  .get(readSubjectQuizResult);

router
  .route("/updated-subject-quiz-performance-record/:performanceID")
  .patch(updateSubjectQuizResultRecorded);

router
  .route("/quit-subject-quiz-performance-record/:performanceID")
  .patch(updateQuitSubjectQuizResultRecorded);

router
  .route("/view-onesubject-quiz-performance/:subjectID/:quizID")
  .get(readOneSubjectQuizResult);

router
  .route("/view-student-quiz-performance/:studentID")
  .get(readStudentQuizResult);

router.route("/view-quiz-performance/:quizID").get(readQuizResult);

// Examination

router
  .route("/create-subject-exam-performance/:studentID/:quizID/:subjectID")
  .post(createExamPerformance);

router
  .route("/view-subject-exam-performance/:subjectID")
  .get(readSubjectExamResult);

router
  .route("/view-onesubject-exam-performance/:subjectID/:quizID")
  .get(readOneSubjectExamResult);

router
  .route("/view-one-subject-mid-test-performance/:subjectID/:quizID")
  .get(readOneSubjectMidTestResultPreformance);

router
  .route("/view-student-exam-performance/:studentID")
  .get(readStudentExamResult);

router.route("/view-exam-performance/:quizID").get(readExamResult);

// Mid Test

router
  .route("/create-subject-mid-test-performance/:studentID/:quizID/:subjectID")
  .post(createMidTestPerformance);

router
  .route("/view-subject-mid-test-performance/:subjectID")
  .get(readSubjectMidTestResult);

router
  .route("/view-onesubject-mid-test-performance/:subjectID/:quizID")
  .get(readOneSubjectMidTestResult);

router
  .route("/view-student-mid-test-performance/:studentID")
  .get(readStudentMidTestResult);

router.route("/view-mid-test-performance/:quizID").get(readMidTestResult);

// delete performance
router.route("/delete-performance/:performanceID").delete(deletePerformance);

// delete all performances for a quiz
router
  .route("/delete-all-performances/:quizID")
  .delete(deleteAllPerformancesForQuiz);

// delete selected students' performances for a quiz (expects `studentIDs` array in body)
router
  .route("/delete-selected-students/:quizID")
  .delete(deleteSelectedStudentsFromQuiz);

export default router;
