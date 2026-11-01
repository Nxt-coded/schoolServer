import { Router } from "express";
import {
  createBulkSchoolClassroom,
  createSchoolClasses,
  deleteSchoolClass,
  studentOfWeek,
  setTopStudents,
  updateSchoolClass1stFee,
  updateSchoolClassName,
  updateSchoolClassTeacher,
  viewClassPositions,
  viewClassRM,
  viewClassTopStudent,
  viewClassesByStudent,
  viewClassesBySubject,
  viewClassesByTimeTable,
  viewOneClassRM,
  viewSchoolClasses,
  viewSchoolClassesByName,
} from "../controller/classController";

import { fileUpload } from "../utils/multer";
const router: Router = Router();

router.route("/create-classroom/:schoolID").post(createSchoolClasses);
router
  .route("/create-bulk-classroom/:schoolID")
  .post(fileUpload, createBulkSchoolClassroom);
router
  .route("/update-classname/:schoolID/:classID")
  .patch(updateSchoolClassName);

router.route("/view-classrooms/:schoolID").get(viewSchoolClasses);
router.route("/view-classroom-info/:classID").get(viewClassRM);
router.route("/view-one-classroom-info/:classID").get(viewOneClassRM);

router
  .route("/view-classroom-info-timetable/:classID")
  .get(viewClassesByTimeTable);

router.route("/view-classroom-position/:classID").get(viewClassPositions);

router.route("/view-classroom-info-subject/:classID").get(viewClassesBySubject);

router.route("/view-classroom-info-student/:classID").get(viewClassesByStudent);

router.route("/view-classroom-info-name/").post(viewSchoolClassesByName);
router.route("/view-classroom-performance/:classID").get(viewClassTopStudent);
router
  .route("/update-term-fees/:schoolID/:classID")
  .patch(updateSchoolClass1stFee);

router
  .route("/update-classrooms-teacher/:schoolID/:classID")
  .patch(updateSchoolClassTeacher);

router.route("/delete-classrooms/:schoolID/:classID").delete(deleteSchoolClass);

router.route("/student-week/:teacherID").patch(studentOfWeek);
router.route("/set-top-students/:teacherID").patch(setTopStudents);
export default router;
