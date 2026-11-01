import { Router } from "express";
import {
  assignClassMonitor,
  changeStudentClass,
  createBulkSchoolStudent,
  createSchoolFeePayment,
  createSchoolStudent,
  createStorePurchased,
  createStorePurchasedTeacher,
  deleteAllStudents,
  deleteStudent,
  loginStudent,
  loginStudentWithToken,
  readSchoolStudents,
  readStudentCookie,
  readStudentDetail,
  updateInstagramAccout,
  updatePurchaseRecord,
  updateSchoolSchoolFee,
  updateSchoolStorePurchased,
  updateStudent1stFees,
  updateStudent2ndFees,
  updateStudent3rdFees,
  updateStudentAddress,
  updateStudentAvatar,
  updateStudentFacebookAcct,
  updateStudentFirstName,
  updateStudentGender,
  updateStudentLastName,
  updateStudentLinkedinAccount,
  updateStudentParentEmail,
  updateStudentParentNumber,
  updateStudentPhone,
  updateXAcctount,
  viewSchoolFeeRecord,
  viewSchoolSchoolFeeRecord,
  viewSchoolStorePurchased,
  viewStorePurchased,
  viewStorePurchasedTeacher,
  updateStudentBulkInfo,
  clockinAccount,
  clockOutAccount,
  findStudenWithEnrollmentID,
  readStudentByEnrollmentID,
  updateStudentViewReportCard,
  updateStudentInfo,
  updateMainStudentBulkInfo,
  qrScanClockInOut,
  qrStaffLogin,
  testSMS,
} from "../controller/studentController";
import multer from "multer";
import { fileUpload } from "../utils/multer";

const upload = multer({
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
    }
  },
}).single("avatar");

const router: Router = Router();

// student clocked data
router.route("/find-student").post(findStudenWithEnrollmentID);
router.route("/student-clock-in/:schoolID/:studentID").patch(clockinAccount);
router.route("/student-clock-out/:schoolID/:studentID").patch(clockOutAccount);

router.route("/student-clock-in-with-id/:schoolID").patch(clockinAccount);
router.route("/student-clock-out-with-id/:schoolID").patch(clockOutAccount);

// QR Code scan → auto clock-in/out (returns HTML page for phone browser)
router.route("/qr-scan/:schoolID/:studentID").get(qrScanClockInOut);
router.route("/qr-staff-login").post(qrStaffLogin);

// student bulk info
router
  .route("/update-student-bulk-info/:studentID")
  .patch(updateStudentBulkInfo);
router
  .route("/update-main-student-bulk-info/:studentID")
  .patch(updateMainStudentBulkInfo);

router
  .route("/update-student-fees-1st/:schoolID/:studentID")
  .patch(updateStudent1stFees);

router
  .route("/update-student-fees-2nd/:schoolID/:studentID")
  .patch(updateStudent2ndFees);
router
  .route("/update-student-fees-3rd/:schoolID/:studentID")
  .patch(updateStudent3rdFees);

router.route("/create-student/:schoolID").post(createSchoolStudent);
router
  .route("/create-bulk-student/:schoolID/")
  .post(fileUpload, createBulkSchoolStudent);

router.route("/read-student/:schoolID").get(readSchoolStudents);

router.route("/read-student-info/:studentID").get(readStudentDetail);

router
  .route("/upload-student-avatar/:studentID")
  .patch(upload, updateStudentAvatar);

router.route("/login-student-token").post(loginStudentWithToken);
router.route("/login-student").post(loginStudent);

router.route("/read-student-cookie").get(readStudentCookie);
router
  .route("/update-parent-email/:schoolID/:studentID")
  .patch(updateStudentParentEmail);

router.route("/purchase/:studentID").post(createStorePurchased);

router.route("/pay-student-schoolfee/:studentID").post(createSchoolFeePayment);

router
  .route("/view-student-schoolfee-detail/:studentID")
  .get(viewSchoolFeeRecord);

router
  .route("/view-school-schoolfee-detail/:schoolID")
  .get(viewSchoolSchoolFeeRecord);

router.route("/view-purchase/:studentID").get(viewStorePurchased);

router
  .route("/update-school-school-fee/:schoolFeeID")
  .post(updateSchoolSchoolFee);

router.route("/view-school-purchase/:schoolID").get(viewSchoolStorePurchased);
router
  .route("/update-school-purchase/:schoolID")
  .patch(updateSchoolStorePurchased);

router.route("/teacher-purchase/:staffID").post(createStorePurchasedTeacher);

router.route("/view-teacher-purchase/:staffID").get(viewStorePurchasedTeacher);

router
  .route("/assign-class-monitor/:teacherID/:studentID")
  .patch(assignClassMonitor);

router.route("/change-student-class/:studentID").patch(changeStudentClass);

router.route("/delete-student/:schoolID/:studentID").delete(deleteStudent);

router
  .route("/update-student-firstname/:schoolID/:studentID")
  .patch(updateStudentFirstName);

router.route("/update-student-info/:studentID").patch(updateStudentInfo);

router
  .route("/read-by-enrollment-id/:enrollmentID")
  .get(readStudentByEnrollmentID);

router
  .route("/update-student-lastname/:schoolID/:studentID")
  .patch(updateStudentLastName);

router
  .route("/update-student-address/:schoolID/:studentID")
  .patch(updateStudentAddress);

router
  .route("/update-parent-number/:schoolID/:studentID")
  .patch(updateStudentParentNumber);

router
  .route("/restrict-view/:schoolID/:studentID")
  .patch(updateStudentViewReportCard);

router
  .route("/update-student-gender/:schoolID/:studentID")
  .patch(updateStudentGender);

router
  .route("/update-student-phone/:schoolID/:studentID")
  .patch(updateStudentPhone);

router.route("/delete-all-students/:schoolID").delete(deleteAllStudents);
//Socials Route
router
  .route("/update-student-facebook/:schoolID/:studentID")
  .patch(updateStudentFacebookAcct);

router
  .route("/update-student-linkedin/:schoolID/:studentID")
  .patch(updateStudentLinkedinAccount);
router
  .route("/update-student-xAccount/:schoolID/:studentID")
  .patch(updateXAcctount);
router
  .route("/update-student-instagram/:schoolID/:studentID")
  .patch(updateInstagramAccout);

//Socials Route Ends Here!

router.route("/test-sms/:phone").get(testSMS);

export default router;