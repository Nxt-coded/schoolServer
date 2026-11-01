import { Router } from "express";
import { repairDocx } from "../controller/docxRepairController";
import { fileUploads } from "../utils/multer";

const router: Router = Router();

// Endpoint to repair malformed quiz DOCX files
router.route("/repair-docx").post(fileUploads, repairDocx);

export default router;
