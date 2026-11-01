"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const gallaryController_1 = require("../controller/gallaryController");
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
router.route("/create-gallary/:schoolID").post(upload, gallaryController_1.createSchoolGallary);
router
    .route("/delete-gallary/:schoolID/:gallaryID")
    .delete(gallaryController_1.deleteSchoolGallary);
router
    .route("/create-restrict-gallary/:schoolID")
    .post(upload, gallaryController_1.createRestrictedSchoolGallary);
router.route("/view-gallary/:schoolID").get(gallaryController_1.viewSchoolGallary);
exports.default = router;
