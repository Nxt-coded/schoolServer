import { Router } from "express";
import { createStore, viewSchoolStore } from "../controller/storeController";
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

router.route("/create-store/:schoolID").post(upload, createStore);
router.route("/view-store/:schoolID").get(viewSchoolStore);

export default router;
