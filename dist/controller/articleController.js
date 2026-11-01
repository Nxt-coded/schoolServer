"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOneArticle = exports.viewArticle = exports.likeArticle = exports.readOneArticle = exports.readAllArticles = exports.createTeacherArticle = exports.createArticle = void 0;
const schoolModel_1 = __importDefault(require("../model/schoolModel"));
const mongoose_1 = require("mongoose");
const articleModel_1 = __importDefault(require("../model/articleModel"));
const studentModel_1 = __importDefault(require("../model/studentModel"));
const streamifier_1 = require("../utils/streamifier");
const staffModel_1 = __importDefault(require("../model/staffModel"));
const createArticle = async (req, res) => {
    try {
        const { schoolID, studentID } = req.params;
        const { title, content, desc } = req.body;
        const school = await schoolModel_1.default.findById(schoolID);
        const student = await studentModel_1.default.findById(studentID);
        if (school && student) {
            const { secure_url } = await (0, streamifier_1.streamUpload)(req);
            const article = await articleModel_1.default.create({
                coverImage: secure_url,
                schoolID,
                studentID,
                title,
                content,
                desc,
                student: `${student.studentFirstName} ${student.studentLastName}`,
                avatar: student.avatar,
            });
            school.articles.push(new mongoose_1.Types.ObjectId(article?._id));
            school?.save();
            student.articles.push(new mongoose_1.Types.ObjectId(article?._id));
            student?.save();
            return res.status(201).json({
                message: "Article created successfully",
                data: article,
                status: 201,
            });
        }
        else {
            return res.status(404).json({
                message: "Error creating article",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating class subject quiz",
            status: 404,
        });
    }
};
exports.createArticle = createArticle;
const createTeacherArticle = async (req, res) => {
    try {
        const { schoolID, teacherID } = req.params;
        const { title, content, desc } = req.body;
        const school = await schoolModel_1.default.findById(schoolID);
        const student = await staffModel_1.default.findById(teacherID);
        if (school && student) {
            const { secure_url } = await (0, streamifier_1.streamUpload)(req);
            const article = await articleModel_1.default.create({
                coverImage: secure_url,
                schoolID,
                studentID: teacherID,
                title,
                content,
                desc,
                student: `${student.staffName} `,
                avatar: student.avatar,
            });
            school.articles.push(new mongoose_1.Types.ObjectId(article?._id));
            school?.save();
            student.articles.push(new mongoose_1.Types.ObjectId(article?._id));
            student?.save();
            return res.status(201).json({
                message: "Article created successfully",
                data: article,
                status: 201,
            });
        }
        else {
            return res.status(404).json({
                message: "Error creating article",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating class subject quiz",
            status: 404,
        });
    }
};
exports.createTeacherArticle = createTeacherArticle;
const readAllArticles = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const school = await schoolModel_1.default
            .findById(schoolID)
            .populate({ path: "articles", options: { sort: { createdAt: -1 } } });
        if (school) {
            return res.status(201).json({
                message: "Article created successfully",
                data: school.articles,
                status: 201,
            });
        }
        else {
            return res.status(404).json({
                message: "Error reading article",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating class subject quiz",
            status: 404,
        });
    }
};
exports.readAllArticles = readAllArticles;
const readOneArticle = async (req, res) => {
    try {
        const { articleID } = req.params;
        const article = await articleModel_1.default.findById(articleID);
        return res.status(200).json({
            message: "Reading one article",
            data: article,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating class subject quiz",
            status: 404,
        });
    }
};
exports.readOneArticle = readOneArticle;
const likeArticle = async (req, res) => {
    try {
        const { articleID, readerID } = req.params;
        const article = await articleModel_1.default.findById(articleID);
        const check = article?.like?.some((el) => {
            return el === readerID;
        });
        if (!check) {
            await articleModel_1.default.findByIdAndUpdate(articleID, {
                like: [...article?.like, readerID],
            }, { new: true });
            return res.status(200).json({
                message: "Reading one article",
                data: article,
                status: 201,
            });
        }
        else {
            return res.status(404).json({
                message: "can't like again",
                status: 201,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating class subject quiz",
            status: 404,
        });
    }
};
exports.likeArticle = likeArticle;
const viewArticle = async (req, res) => {
    try {
        const { articleID, readerID } = req.params;
        const article = await articleModel_1.default.findById(articleID);
        const check = article?.view?.some((el) => {
            return el === readerID;
        });
        if (!check) {
            await articleModel_1.default.findByIdAndUpdate(articleID, {
                view: [...article?.view, readerID],
            }, { new: true });
            return res.status(200).json({
                message: "Reading one article",
                data: article,
                status: 201,
            });
        }
        else {
            return res.status(200).json({
                message: "can't reAdd",
                status: 201,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating class subject quiz",
            status: 404,
        });
    }
};
exports.viewArticle = viewArticle;
const deleteOneArticle = async (req, res) => {
    try {
        const { schoolID, articleID, studentName } = req.params;
        const school = await schoolModel_1.default.findById(schoolID);
        const student = await studentModel_1.default.findOne({
            studentFirstName: `${studentName.split(" ")[0]}`,
        });
        if (school && student) {
            const article = await articleModel_1.default.findByIdAndDelete(articleID);
            school.articles.pull(new mongoose_1.Types.ObjectId(articleID));
            school?.save();
            student.articles.pull(new mongoose_1.Types.ObjectId(articleID));
            student?.save();
            return res.status(200).json({
                message: "Reading one article",
                data: article,
                status: 201,
            });
        }
        else {
            return res.status(404).json({
                message: "Error deleting article",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating class subject quiz",
            status: 404,
        });
    }
};
exports.deleteOneArticle = deleteOneArticle;
