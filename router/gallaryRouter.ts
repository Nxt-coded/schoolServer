import { Router } from "express";
import { createStore, viewSchoolStore } from "../controller/storeController";
import multer from "multer";
import {
  createRestrictedSchoolGallary,
  createSchoolGallary,
  deleteSchoolGallary,
  viewSchoolGallary,
} from "../controller/gallaryController";
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

router.route("/create-gallary/:schoolID").post(upload, createSchoolGallary);
router
  .route("/delete-gallary/:schoolID/:gallaryID")
  .delete(deleteSchoolGallary);
router
  .route("/create-restrict-gallary/:schoolID")
  .post(upload, createRestrictedSchoolGallary);
router.route("/view-gallary/:schoolID").get(viewSchoolGallary);

export default router;
