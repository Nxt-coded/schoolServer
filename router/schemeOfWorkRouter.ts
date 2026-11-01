import { Router } from "express";
import { fileUploads } from "../utils/multer";
import {
  createScheme,
  deleteScheme,
  getSchemeByClassAndSubject,
  getSchemeOfWork,
  getMarkedSchemes,
} from "../controller/SchemeController";
import multer from "multer";

const router: Router = Router();

router.post("/upload-schemes", (req, res, next) => {
  fileUploads(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: err.message });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }
    createScheme(req, res);
  });
});
router.get("/schemes/:classType/:subject/:term", getSchemeByClassAndSubject);
router.route("/get-schemes").get(getSchemeOfWork);
router.route("/get-mark-schemes").get(getMarkedSchemes);
router.route("/delete-schemes/:schemeID").delete(deleteScheme);

export default router;
