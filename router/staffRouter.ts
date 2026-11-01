import { Router } from "express";
import {
  createBulkTeachers,
  createSchoolPrincipal,
  createSchoolTeacher,
  createSchoolTeacherByAdmin,
  createSchoolTeacherByPrincipal,
  createSchoolTeacherByVicePrincipal,
  createSchoolVicePrincipal,
  deleteStaff,
  loginStaffWithToken,
  loginTeacher,
  readSchooTeacher,
  readTeacherCookie,
  readTeacherDetail,
  updateFacebookAccount,
  updatePhoneNumber,
  updateStaffActiveness,
  updateStaffAdress,
  updateStaffAvatar,
  updateStaffBulkInfo,
  updateStaffGender,
  updateStaffInstagramAcct,
  updateStaffLinkedinAcct,
  updateStaffName,
  updateStaffSignature,
  updateStaffXAcct,
  updateTeacherSalary,
} from "../controller/staffController";
import { fileUpload } from "../utils/multer";
import multer from "multer";
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

router.route("/create-school-teacher/:schoolID").post(createSchoolTeacher);
router
  .route("/create-school-teacher-bulk/:schoolID")
  .post(fileUpload, createBulkTeachers);


router.route("/view-school-teacher/:schoolID").get(readSchooTeacher);

router.route("/login-teacher").post(loginTeacher);
router.route("/login-teacher-token").post(loginStaffWithToken);
router.route("/read-teacher-cookie").get(readTeacherCookie);

router.route("/view-teacher-detail/:staffID").get(readTeacherDetail);
router.route("/update-teacher-salery/:staffID").patch(updateTeacherSalary);
router.route("/update-staff-bulk-info/:staffID").patch(updateStaffBulkInfo);
router
  .route("/update-staffAddress/:schoolID/:stafffID")
  .patch(updateStaffAdress);

// others

router.route("/create-school-principal/:schoolID").post(createSchoolPrincipal);

router
  .route("/create-school-vice-principal/:schoolID")
  .post(createSchoolVicePrincipal);
router
  .route("/create-school-teacher-admin/:schoolID")
  .post(createSchoolTeacherByAdmin);
router
  .route("/create-school-teacher-prinicipal/:schoolID")
  .post(createSchoolTeacherByPrincipal);
router
  .route("/create-school-teacher-vice-prinicipal/:schoolID")
  .post(createSchoolTeacherByVicePrincipal);

router.route("/update-staffName/:schoolID/:staffID").patch(updateStaffName);
router.route("/update-phoneNumber/:schoolID/:staffID").patch(updatePhoneNumber);
router.route("/update-staffgender/:schoolID/:staffID").patch(updateStaffGender);
router
  .route("/update-staff-facebook/:schoolID/:staffID")
  .patch(updateFacebookAccount);
router.route("/update-staff-x/:schoolID/:staffID").patch(updateStaffXAcct);
router
  .route("/update-staff-address/:schoolID/:staffID")
  .patch(updateStaffAdress);

router
  .route("/update-staff-linkedin/:schoolID/:staffID")
  .patch(updateStaffLinkedinAcct);
router
  .route("/update-staff-instagram/:schoolID/:staffID")
  .patch(updateStaffInstagramAcct);

router.route("/upload-staff-avatar/:staffID").patch(upload, updateStaffAvatar);

router
  .route("/upload-staff-signature/:staffID")
  .patch(upload, updateStaffSignature);

router.route("/staff-active/:studentID").patch(updateStaffActiveness);

router.route("/delete-staff/:schoolID/:staffID").delete(deleteStaff);

export default router;
