"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const studentController_1 = require("../controller/studentController");
const multer_1 = __importDefault(require("multer"));
const multer_2 = require("../utils/multer");
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
// student clocked data
router.route("/find-student").post(studentController_1.findStudenWithEnrollmentID);
router.route("/student-clock-in/:schoolID/:studentID").patch(studentController_1.clockinAccount);
router.route("/student-clock-out/:schoolID/:studentID").patch(studentController_1.clockOutAccount);
router.route("/student-clock-in-with-id/:schoolID").patch(studentController_1.clockinAccount);
router.route("/student-clock-out-with-id/:schoolID").patch(studentController_1.clockOutAccount);
// QR Code scan → auto clock-in/out (returns HTML page for phone browser)
router.route("/qr-scan/:schoolID/:studentID").get(studentController_1.qrScanClockInOut);
router.route("/qr-staff-login").post(studentController_1.qrStaffLogin);
// student bulk info
router
    .route("/update-student-bulk-info/:studentID")
    .patch(studentController_1.updateStudentBulkInfo);
router
    .route("/update-main-student-bulk-info/:studentID")
    .patch(studentController_1.updateMainStudentBulkInfo);
router
    .route("/update-student-fees-1st/:schoolID/:studentID")
    .patch(studentController_1.updateStudent1stFees);
router
    .route("/update-student-fees-2nd/:schoolID/:studentID")
    .patch(studentController_1.updateStudent2ndFees);
router
    .route("/update-student-fees-3rd/:schoolID/:studentID")
    .patch(studentController_1.updateStudent3rdFees);
router.route("/create-student/:schoolID").post(studentController_1.createSchoolStudent);
router
    .route("/create-bulk-student/:schoolID/")
    .post(multer_2.fileUpload, studentController_1.createBulkSchoolStudent);
router.route("/read-student/:schoolID").get(studentController_1.readSchoolStudents);
router.route("/read-student-info/:studentID").get(studentController_1.readStudentDetail);
router
    .route("/upload-student-avatar/:studentID")
    .patch(upload, studentController_1.updateStudentAvatar);
router.route("/login-student-token").post(studentController_1.loginStudentWithToken);
router.route("/login-student").post(studentController_1.loginStudent);
router.route("/read-student-cookie").get(studentController_1.readStudentCookie);
router
    .route("/update-parent-email/:schoolID/:studentID")
    .patch(studentController_1.updateStudentParentEmail);
router.route("/purchase/:studentID").post(studentController_1.createStorePurchased);
router.route("/pay-student-schoolfee/:studentID").post(studentController_1.createSchoolFeePayment);
router
    .route("/view-student-schoolfee-detail/:studentID")
    .get(studentController_1.viewSchoolFeeRecord);
router
    .route("/view-school-schoolfee-detail/:schoolID")
    .get(studentController_1.viewSchoolSchoolFeeRecord);
router.route("/view-purchase/:studentID").get(studentController_1.viewStorePurchased);
router
    .route("/update-school-school-fee/:schoolFeeID")
    .post(studentController_1.updateSchoolSchoolFee);
router.route("/view-school-purchase/:schoolID").get(studentController_1.viewSchoolStorePurchased);
router
    .route("/update-school-purchase/:schoolID")
    .patch(studentController_1.updateSchoolStorePurchased);
router.route("/teacher-purchase/:staffID").post(studentController_1.createStorePurchasedTeacher);
router.route("/view-teacher-purchase/:staffID").get(studentController_1.viewStorePurchasedTeacher);
router
    .route("/assign-class-monitor/:teacherID/:studentID")
    .patch(studentController_1.assignClassMonitor);
router.route("/change-student-class/:studentID").patch(studentController_1.changeStudentClass);
router.route("/delete-student/:schoolID/:studentID").delete(studentController_1.deleteStudent);
router
    .route("/update-student-firstname/:schoolID/:studentID")
    .patch(studentController_1.updateStudentFirstName);
router.route("/update-student-info/:studentID").patch(studentController_1.updateStudentInfo);
router
    .route("/read-by-enrollment-id/:enrollmentID")
    .get(studentController_1.readStudentByEnrollmentID);
router
    .route("/update-student-lastname/:schoolID/:studentID")
    .patch(studentController_1.updateStudentLastName);
router
    .route("/update-student-address/:schoolID/:studentID")
    .patch(studentController_1.updateStudentAddress);
router
    .route("/update-parent-number/:schoolID/:studentID")
    .patch(studentController_1.updateStudentParentNumber);
router
    .route("/restrict-view/:schoolID/:studentID")
    .patch(studentController_1.updateStudentViewReportCard);
router
    .route("/update-student-gender/:schoolID/:studentID")
    .patch(studentController_1.updateStudentGender);
router
    .route("/update-student-phone/:schoolID/:studentID")
    .patch(studentController_1.updateStudentPhone);
router.route("/delete-all-students/:schoolID").delete(studentController_1.deleteAllStudents);
//Socials Route
router
    .route("/update-student-facebook/:schoolID/:studentID")
    .patch(studentController_1.updateStudentFacebookAcct);
router
    .route("/update-student-linkedin/:schoolID/:studentID")
    .patch(studentController_1.updateStudentLinkedinAccount);
router
    .route("/update-student-xAccount/:schoolID/:studentID")
    .patch(studentController_1.updateXAcctount);
router
    .route("/update-student-instagram/:schoolID/:studentID")
    .patch(studentController_1.updateInstagramAccout);
//Socials Route Ends Here!
router.route("/test-sms/:phone").get(studentController_1.testSMS);
exports.default = router;
