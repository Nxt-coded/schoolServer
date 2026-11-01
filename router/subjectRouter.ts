import { Router } from "express";
import {
  createSchoolSubject,
  updateSchoolSubjectTeacher,
  viewSchoolSubjects,
  deleteSchoolSubject,
  viewSubjectDetail,
  removeSubjectFromTeacher,
  createBulkClassSubjects,
} from "../controller/subjectController";
import { fileUpload } from "../utils/multer";
const router: Router = Router();

router.route("/create-subject/:schoolID").post(createSchoolSubject);
router
  .route("/create-bulk-subject/:schoolID")
  .post(fileUpload, createBulkClassSubjects);

router.route("/view-subjects/:schoolID").get(viewSchoolSubjects);
router.route("/view-subjects-info/:subjectID").get(viewSubjectDetail);

router
  .route("/update-subject-teacher/:schoolID/:subjectID")
  .patch(updateSchoolSubjectTeacher);

router
  .route("/remove-teacher-subject/:schoolID/:teacherID/:subjectID")
  .patch(removeSubjectFromTeacher);

router
  .route("/delete-subject/:schoolID/:subjectID")
  .delete(deleteSchoolSubject);

export default router;
