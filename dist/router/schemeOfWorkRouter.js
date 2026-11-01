"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = require("../utils/multer");
const SchemeController_1 = require("../controller/SchemeController");
const multer_2 = __importDefault(require("multer"));
const router = (0, express_1.Router)();
router.post("/upload-schemes", (req, res, next) => {
    (0, multer_1.fileUploads)(req, res, function (err) {
        if (err instanceof multer_2.default.MulterError) {
            return res.status(400).json({ message: err.message });
        }
        else if (err) {
            return res.status(400).json({ message: err.message });
        }
        (0, SchemeController_1.createScheme)(req, res);
    });
});
router.get("/schemes/:classType/:subject/:term", SchemeController_1.getSchemeByClassAndSubject);
router.route("/get-schemes").get(SchemeController_1.getSchemeOfWork);
router.route("/get-mark-schemes").get(SchemeController_1.getMarkedSchemes);
router.route("/delete-schemes/:schemeID").delete(SchemeController_1.deleteScheme);
exports.default = router;
