"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const staffController_1 = require("../controller/staffController");
const multer_1 = require("../utils/multer");
const multer_2 = __importDefault(require("multer"));
const upload = (0, multer_2.default)({
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
router.route("/create-school-teacher/:schoolID").post(staffController_1.createSchoolTeacher);
router
    .route("/create-school-teacher-bulk/:schoolID")
    .post(multer_1.fileUpload, staffController_1.createBulkTeachers);
router.route("/view-school-teacher/:schoolID").get(staffController_1.readSchooTeacher);
router.route("/login-teacher").post(staffController_1.loginTeacher);
router.route("/login-teacher-token").post(staffController_1.loginStaffWithToken);
router.route("/read-teacher-cookie").get(staffController_1.readTeacherCookie);
router.route("/view-teacher-detail/:staffID").get(staffController_1.readTeacherDetail);
router.route("/update-teacher-salery/:staffID").patch(staffController_1.updateTeacherSalary);
router.route("/update-staff-bulk-info/:staffID").patch(staffController_1.updateStaffBulkInfo);
router
    .route("/update-staffAddress/:schoolID/:stafffID")
    .patch(staffController_1.updateStaffAdress);
// others
router.route("/create-school-principal/:schoolID").post(staffController_1.createSchoolPrincipal);
router
    .route("/create-school-vice-principal/:schoolID")
    .post(staffController_1.createSchoolVicePrincipal);
router
    .route("/create-school-teacher-admin/:schoolID")
    .post(staffController_1.createSchoolTeacherByAdmin);
router
    .route("/create-school-teacher-prinicipal/:schoolID")
    .post(staffController_1.createSchoolTeacherByPrincipal);
router
    .route("/create-school-teacher-vice-prinicipal/:schoolID")
    .post(staffController_1.createSchoolTeacherByVicePrincipal);
router.route("/update-staffName/:schoolID/:staffID").patch(staffController_1.updateStaffName);
router.route("/update-phoneNumber/:schoolID/:staffID").patch(staffController_1.updatePhoneNumber);
router.route("/update-staffgender/:schoolID/:staffID").patch(staffController_1.updateStaffGender);
router
    .route("/update-staff-facebook/:schoolID/:staffID")
    .patch(staffController_1.updateFacebookAccount);
router.route("/update-staff-x/:schoolID/:staffID").patch(staffController_1.updateStaffXAcct);
router
    .route("/update-staff-address/:schoolID/:staffID")
    .patch(staffController_1.updateStaffAdress);
router
    .route("/update-staff-linkedin/:schoolID/:staffID")
    .patch(staffController_1.updateStaffLinkedinAcct);
router
    .route("/update-staff-instagram/:schoolID/:staffID")
    .patch(staffController_1.updateStaffInstagramAcct);
router.route("/upload-staff-avatar/:staffID").patch(upload, staffController_1.updateStaffAvatar);
router
    .route("/upload-staff-signature/:staffID")
    .patch(upload, staffController_1.updateStaffSignature);
router.route("/staff-active/:studentID").patch(staffController_1.updateStaffActiveness);
router.route("/delete-staff/:schoolID/:staffID").delete(staffController_1.deleteStaff);
exports.default = router;
