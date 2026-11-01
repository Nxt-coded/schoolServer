"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const lessonNoteController_1 = require("../controller/lessonNoteController");
const router = (0, express_1.Router)();
router
    .route("/create-lesson-note/:schoolID/:staffID")
    .post(lessonNoteController_1.createClasslessonNote);
router
    .route("/update-lesson-note/:staffID/:lessonNodeID")
    .patch(lessonNoteController_1.editClasslessonNote);
router
    .route("/reply-lesson-note/:schoolID/:lessonNotedID")
    .patch(lessonNoteController_1.createAdminLessonNoteReply);
router.route("/admin-view-lesson-note/:schoolID/").get(lessonNoteController_1.readAdminLessonNote);
router.route("/view-lesson-note-detail/:lessonID/").get(lessonNoteController_1.readLessonNote);
router.route("/view-lesson-note/:schoolID/:staffID").get(lessonNoteController_1.readTeacherLessonNote);
router
    .route("/view-teacher-lesson-note/:teacherID")
    .get(lessonNoteController_1.readTeacherLessonNotesRate);
router
    .route("/view-class-lesson-note/:classID")
    .get(lessonNoteController_1.readTeacherClassLessonNote);
router
    .route("/approve-lesson-note/:schoolID/:lessonID")
    .patch(lessonNoteController_1.approveTeacherLessonNote);
router.route("/rate-lesson-note/:studentID/:lessonID").patch(lessonNoteController_1.rateLessonNote);
exports.default = router;
