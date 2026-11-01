"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const articleController_1 = require("../controller/articleController");
const multer_1 = __importDefault(require("multer"));
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
router
    .route("/create-article/:schoolID/:studentID")
    .post(upload, articleController_1.createArticle);
router
    .route("/create-article/:schoolID/:teacherID")
    .post(upload, articleController_1.createTeacherArticle);
router.route("/view-article/:articleID").get(articleController_1.readOneArticle);
router.route("/view-school-article/:schoolID").get(articleController_1.readAllArticles);
router.route("/like-article/:articleID/:readerID").patch(articleController_1.likeArticle);
router.route("/view-article/:articleID/:readerID").patch(articleController_1.viewArticle);
router
    .route("/delete-school-article/:schoolID/:studentName/:articleID")
    .delete(articleController_1.deleteOneArticle);
exports.default = router;
