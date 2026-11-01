import { Router } from "express";
import {
  createAssignmentPerformance,
  createSubjectAssignment,
  readAssignment,
  readAssignmentResult,
  readClassSubjectAssignment,
  readStudentAssignmentResult,
  readSubjectAssignment,
  readSubjectAssignmentResult,
  readTeacherSubjectAssignment,
} from "../controller/assignmentController";

const router: Router = Router();

router
  .route("/create-subject-assignment/:classID/:subjectID")
  .post(createSubjectAssignment);

router.route("/view-subject-assignment/:subjectID").get(readSubjectAssignment);

router
  .route("/view-teacher-assignment/:teacherID")
  .get(readTeacherSubjectAssignment);

router.route("/view-class-assignment/:classID").get(readClassSubjectAssignment);

router.route("/view-assignment/:assignmentID").get(readAssignment);

// resolve

router
  .route("/create-subject-assingment-performance/:studentID/:assignmentID")
  .post(createAssignmentPerformance);

router
  .route("/view-subject-assignment-performance/:subjectID")
  .get(readSubjectAssignmentResult);

router
  .route("/view-student-assignment-performance/:studentID")
  .get(readStudentAssignmentResult);

router
  .route("/view-assignment-performance/:resolveID")
  .get(readAssignmentResult);

export default router;
