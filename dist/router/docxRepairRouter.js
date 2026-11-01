"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const docxRepairController_1 = require("../controller/docxRepairController");
const multer_1 = require("../utils/multer");
const router = (0, express_1.Router)();
// Endpoint to repair malformed quiz DOCX files
router.route("/repair-docx").post(multer_1.fileUploads, docxRepairController_1.repairDocx);
exports.default = router;
