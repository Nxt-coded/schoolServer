"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const schoolController_1 = require("../controller/schoolController");
const multer_1 = __importDefault(require("multer"));
const upload = (0, multer_1.default)({
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" ||
            file.mimetype == "image/jpg" ||
            file.mimetype == "image/jpeg") {
            cb(null, true);
        }
        else {
            cb(null, false);
            return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
        }
    },
}).single("avatar");
const router = (0, express_1.Router)();
router
    .route("/approved-school-registration/:schoolID")
    .patch(schoolController_1.approveRegistration);
router.route("/school-request-registration").post(schoolController_1.updateRegisterationStatus);
router.route("/view-school-top-student/:schoolID").get(schoolController_1.viewSchoolTopStudent);
router.route("/register-school/").post(schoolController_1.createSchool);
router.route("/login-school/").post(schoolController_1.loginSchool);
router.route("/get-school-by-name/:schoolName").get(schoolController_1.viewSchoolStatusByName);
router.route("/verify-school/:schoolID").get(schoolController_1.verifySchool);
router.route("/view-school/:schoolID").get(schoolController_1.viewSchoolStatus);
router.route("/view-all-school").get(schoolController_1.viewAllSchools);
router.route("/logout-school").delete(schoolController_1.logoutSchool);
router.route("/get-school").get(schoolController_1.getSchoolRegistered);
router.route("/read-school-cookie").get(schoolController_1.readSchoolCookie);
// Admin-only export (downloads a JSON attachment)
router.route("/export-school/:schoolID").get(schoolController_1.exportSchoolDataFile);
router.route("/change-school-name/:schoolID").patch(schoolController_1.changeSchoolName);
router.route("/change-school-location/:schoolID").patch(schoolController_1.changeSchoolAddress);
router.route("/update-account-info/:schoolID").patch(schoolController_1.updateSchoolAccountDetail);
router
    .route("/upload-school-avatar/:schoolID")
    .patch(upload, schoolController_1.updateSchoolAvatar);
router
    .route("/upload-school-signature/:schoolID")
    .patch(upload, schoolController_1.updateSchoolSignature);
router.route("/upload-school-stamp/:schoolID").patch(upload, schoolController_1.updateSchoolStamp);
router.route("/change-school-phone/:schoolID").patch(schoolController_1.changeSchoolPhoneNumber);
router
    .route("/change-school-personal-name/:schoolID")
    .patch(schoolController_1.changeSchoolPersonalName);
router.route("/change-school-tag/:schoolID").patch(schoolController_1.changeSchoolTag);
router.route("/change-school-name/:schoolID").patch(schoolController_1.updateSchoolName);
router
    .route("/change-school-started/:schoolID")
    .patch(schoolController_1.updateSchoolStartPossition);
router.route("/change-school-team-info/:schoolID").patch(schoolController_1.updateSchoolTeamData);
router
    .route("/create-school-time-table/:schoolID")
    .patch(schoolController_1.createSchoolTimetableRecord);
router
    .route("/add-more-payment-option/:schoolID")
    .patch(schoolController_1.updateSchoolPaymentOptions);
router
    .route("/remove-payment-option/:schoolID/:refID")
    .patch(schoolController_1.RemoveSchoolPaymentOptions);
router.route("/update-school-admin-code/:schoolID").patch(schoolController_1.updateAdminCode);
router.route("/export-data/:schoolID").get(schoolController_1.exportSchoolData);
router.route("/export-data-file/:schoolID").get(schoolController_1.exportSchoolDataFile);
router.route("/import-data").patch(schoolController_1.importSchoolData);
router.route("/delete-school/:schoolID").delete(schoolController_1.deleteSchool);
router.route("/update-school-sms/:schoolID").patch(schoolController_1.updateSchoolSMS);
router
    .route("/update-class-teacher-grading/:schoolID")
    .patch(schoolController_1.updateClassTeacherGrading);
router
    .route("/change-enrollment-id/:schoolID")
    .patch(schoolController_1.changeSchoolEnrollmentID);
exports.default = router;
