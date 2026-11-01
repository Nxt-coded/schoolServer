"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const classController_1 = require("../controller/classController");
const multer_1 = require("../utils/multer");
const router = (0, express_1.Router)();
router.route("/create-classroom/:schoolID").post(classController_1.createSchoolClasses);
router
    .route("/create-bulk-classroom/:schoolID")
    .post(multer_1.fileUpload, classController_1.createBulkSchoolClassroom);
router
    .route("/update-classname/:schoolID/:classID")
    .patch(classController_1.updateSchoolClassName);
router.route("/view-classrooms/:schoolID").get(classController_1.viewSchoolClasses);
router.route("/view-classroom-info/:classID").get(classController_1.viewClassRM);
router.route("/view-one-classroom-info/:classID").get(classController_1.viewOneClassRM);
router
    .route("/view-classroom-info-timetable/:classID")
    .get(classController_1.viewClassesByTimeTable);
router.route("/view-classroom-position/:classID").get(classController_1.viewClassPositions);
router.route("/view-classroom-info-subject/:classID").get(classController_1.viewClassesBySubject);
router.route("/view-classroom-info-student/:classID").get(classController_1.viewClassesByStudent);
router.route("/view-classroom-info-name/").post(classController_1.viewSchoolClassesByName);
router.route("/view-classroom-performance/:classID").get(classController_1.viewClassTopStudent);
router
    .route("/update-term-fees/:schoolID/:classID")
    .patch(classController_1.updateSchoolClass1stFee);
router
    .route("/update-classrooms-teacher/:schoolID/:classID")
    .patch(classController_1.updateSchoolClassTeacher);
router.route("/delete-classrooms/:schoolID/:classID").delete(classController_1.deleteSchoolClass);
router.route("/student-week/:teacherID").patch(classController_1.studentOfWeek);
router.route("/set-top-students/:teacherID").patch(classController_1.setTopStudents);
exports.default = router;
