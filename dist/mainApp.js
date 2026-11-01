"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainApp = void 0;
const schoolRouter_1 = __importDefault(require("./router/schoolRouter"));
const sessionRouter_1 = __importDefault(require("./router/sessionRouter"));
const staffRouter_1 = __importDefault(require("./router/staffRouter"));
const paymentRouter_1 = __importDefault(require("./router/paymentRouter"));
const classRouter_1 = __importDefault(require("./router/classRouter"));
const subjectRouter_1 = __importDefault(require("./router/subjectRouter"));
const anouncementRouter_1 = __importDefault(require("./router/anouncementRouter"));
const performanceRouter_1 = __importDefault(require("./router/performanceRouter"));
const articleRouter_1 = __importDefault(require("./router/articleRouter"));
const studentRouter_1 = __importDefault(require("./router/studentRouter"));
const timeTableRouter_1 = __importDefault(require("./router/timeTableRouter"));
const attendanceRouter_1 = __importDefault(require("./router/attendanceRouter"));
const quizRouter_1 = __importDefault(require("./router/quizRouter"));
const lessonNoteRouter_1 = __importDefault(require("./router/lessonNoteRouter"));
const assignmentResolveRouter_1 = __importDefault(require("./router/assignmentResolveRouter"));
const remarkRouter_1 = __importDefault(require("./router/remarkRouter"));
const storeRouter_1 = __importDefault(require("./router/storeRouter"));
const gallaryRouter_1 = __importDefault(require("./router/gallaryRouter"));
const complainRouter_1 = __importDefault(require("./router/complainRouter"));
const reportCardRouter_1 = __importDefault(require("./router/reportCardRouter"));
const pastQuestionRouter_1 = __importDefault(require("./router/pastQuestionRouter"));
const expenseRouter_1 = __importDefault(require("./router/expenseRouter"));
const recordPaymentRouter_1 = __importDefault(require("./router/recordPaymentRouter"));
const passportRoute_1 = __importDefault(require("./router/passportRoute"));
const schemeOfWorkRouter_1 = __importDefault(require("./router/schemeOfWorkRouter"));
const exanimationRouter_1 = __importDefault(require("./router/exanimationRouter"));
const midTestRouter_1 = __importDefault(require("./router/midTestRouter"));
const outGoneStudentRouter_1 = __importDefault(require("./router/outGoneStudentRouter"));
const resultHistoryRouter_1 = __importDefault(require("./router/resultHistoryRouter"));
const courseRouter_1 = __importDefault(require("./router/courseRouter"));
const teachSubjectRouter_1 = __importDefault(require("./router/teachSubjectRouter"));
const teachSubjectTopicRouter_1 = __importDefault(require("./router/teachSubjectTopicRouter"));
const docxRepairRouter_1 = __importDefault(require("./router/docxRepairRouter"));
const teachTopicQuiz_1 = __importDefault(require("./router/teachTopicQuiz"));
const enums_1 = require("./utils/enums");
const mianError_1 = require("./error/mianError");
const handleError_1 = require("./error/handleError");
const mainApp = (app) => {
    try {
        app.use("/api", docxRepairRouter_1.default); // Register the docx repair endpoint
        app.use("/api", teachTopicQuiz_1.default);
        app.use("/api", teachSubjectTopicRouter_1.default);
        app.use("/api", teachSubjectRouter_1.default);
        app.use("/api", paymentRouter_1.default); // Moved up
        app.use("/api", schoolRouter_1.default);
        app.use("/api", exanimationRouter_1.default);
        app.use("/api", schemeOfWorkRouter_1.default);
        app.use("/api", sessionRouter_1.default);
        app.use("/api", staffRouter_1.default);
        app.use("/api", classRouter_1.default);
        app.use("/api", subjectRouter_1.default);
        app.use("/api", outGoneStudentRouter_1.default);
        app.use("/api", courseRouter_1.default);
        app.use("/api", anouncementRouter_1.default);
        app.use("/api", midTestRouter_1.default);
        app.use("/api", attendanceRouter_1.default);
        app.use("/api", quizRouter_1.default);
        app.use("/api", lessonNoteRouter_1.default);
        app.use("/api", performanceRouter_1.default);
        app.use("/api", remarkRouter_1.default);
        app.use("/api", storeRouter_1.default);
        app.use("/api", articleRouter_1.default);
        app.use("/api", reportCardRouter_1.default);
        app.use("/api", pastQuestionRouter_1.default);
        app.use("/api", expenseRouter_1.default);
        app.use("/api", recordPaymentRouter_1.default);
        app.use("/api", passportRoute_1.default);
        app.use("/api", studentRouter_1.default);
        app.use("/api", timeTableRouter_1.default);
        app.use("/api", assignmentResolveRouter_1.default);
        app.use("/api", gallaryRouter_1.default);
        app.use("/api", complainRouter_1.default);
        app.use("/api", resultHistoryRouter_1.default);
        app.get("/", (req, res) => {
            try {
                return res.status(200).json({
                    message: "School API",
                });
            }
            catch (error) {
                return res.status(404).json({
                    message: "Error loading",
                });
            }
        });
        app.get("/.well-known/pki-validation/34E413B6620F83D024BFEC2183C0C835.txt", (req, res) => {
            // return res.status(200).json({ message: "Awesome" });
            return res.sendFile(" http://51.21.84.107/.well-known/pki-validation/34E413B6620F83D024BFEC2183C0C835.txt");
        });
        app.all("*", (req, res, next) => {
            next(new mianError_1.mainError({
                name: `Route Error`,
                message: `Route Error: because the page, ${req.originalUrl} doesn't exist`,
                status: enums_1.HTTP.BAD_REQUEST,
                success: false,
            }));
        });
        app.use(handleError_1.handleError);
    }
    catch (error) {
        return error;
    }
};
exports.mainApp = mainApp;
