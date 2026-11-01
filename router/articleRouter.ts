import { Router } from "express";
import {
  createArticle,
  createTeacherArticle,
  deleteOneArticle,
  likeArticle,
  readAllArticles,
  readOneArticle,
  viewArticle,
} from "../controller/articleController";
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

router
  .route("/create-article/:schoolID/:studentID")
  .post(upload, createArticle);

router
  .route("/create-article/:schoolID/:teacherID")
  .post(upload, createTeacherArticle);

router.route("/view-article/:articleID").get(readOneArticle);
router.route("/view-school-article/:schoolID").get(readAllArticles);
router.route("/like-article/:articleID/:readerID").patch(likeArticle);
router.route("/view-article/:articleID/:readerID").patch(viewArticle);
router
  .route("/delete-school-article/:schoolID/:studentName/:articleID")
  .delete(deleteOneArticle);

export default router;
