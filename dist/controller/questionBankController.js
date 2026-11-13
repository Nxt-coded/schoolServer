"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rescheduleAssessment = exports.createAssessmentFromBank = exports.readQuestionBank = exports.saveQuestionsToBank = void 0;
const mongoose_1 = require("mongoose");
const examinationModel_1 = __importDefault(require("../model/examinationModel"));
const midTestModel_1 = __importDefault(require("../model/midTestModel"));
const questionBankModel_1 = __importDefault(require("../model/questionBankModel"));
const subjectModel_1 = __importDefault(require("../model/subjectModel"));
const classroomModel_1 = __importDefault(require("../model/classroomModel"));
const assessmentAccess_1 = require("../utils/assessmentAccess");
const isAssessmentType = (value) => value === "examination" || value === "midTest";
const saveQuestionsToBank = async (schoolID, subjectID, sourceAssessmentID, createdBy, assessmentType, questions, theory = "") => {
    const entries = questions.map((question, sourceQuestionIndex) => ({
        question,
        sourceQuestionIndex,
        questionKind: "objective",
    }));
    const normalizedTheory = String(theory || "").trim();
    const theoryText = normalizedTheory
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/gi, " ")
        .trim();
    if (theoryText || /<img\b/i.test(normalizedTheory)) {
        entries.push({
            question: { question: normalizedTheory },
            sourceQuestionIndex: entries.length,
            questionKind: "theory",
        });
    }
    if (!entries.length)
        return;
    await questionBankModel_1.default.insertMany(entries.map(({ question, sourceQuestionIndex, questionKind }) => ({
        schoolID: new mongoose_1.Types.ObjectId(schoolID),
        subjectID,
        sourceAssessmentID,
        sourceQuestionIndex,
        createdBy: new mongoose_1.Types.ObjectId(createdBy),
        assessmentType,
        questionKind,
        question,
    })), { ordered: false });
};
exports.saveQuestionsToBank = saveQuestionsToBank;
const readQuestionBank = async (req, res) => {
    try {
        const { subjectID } = req.params;
        const context = await (0, assessmentAccess_1.getAssessmentContext)(req, subjectID);
        if (!context) {
            return res.status(403).json({ message: "Not authorized for this subject" });
        }
        const type = req.query.assessmentType;
        if (type !== undefined && !isAssessmentType(type)) {
            return res.status(400).json({ message: "Invalid assessment type" });
        }
        const filter = {
            schoolID: context.schoolID,
        };
        if (type)
            filter.assessmentType = type;
        const schoolClassrooms = await classroomModel_1.default
            .find({
            $or: [
                { schoolIDs: context.schoolID },
                { school: context.schoolID },
            ],
        })
            .select("_id");
        const classroomIDs = schoolClassrooms.map((classroom) => classroom._id);
        const classroomIDStrings = classroomIDs.map((id) => id.toString());
        const schoolSubjects = await subjectModel_1.default
            .find({
            $or: [
                { _id: context.subject._id },
                { school: context.schoolID },
                { subjectClassID: { $in: classroomIDStrings } },
                { subjectClassIDs: { $in: classroomIDStrings } },
                { classID: { $in: classroomIDStrings } },
                { "classDetails._id": { $in: classroomIDs } },
            ],
        })
            .select("_id");
        const subjectIDs = schoolSubjects.map((subject) => subject._id);
        if (subjectIDs.length) {
            const sourceAssessments = type === "midTest"
                ? await midTestModel_1.default.find({
                    $or: [
                        { subject: { $in: subjectIDs } },
                        { subjectID: { $in: subjectIDs.map((id) => id.toString()) } },
                    ],
                })
                : type === "examination"
                    ? await examinationModel_1.default.find({
                        $or: [
                            { subject: { $in: subjectIDs } },
                            { subjectID: { $in: subjectIDs.map((id) => id.toString()) } },
                        ],
                    })
                    : [
                        ...(await examinationModel_1.default.find({
                            $or: [
                                { subject: { $in: subjectIDs } },
                                { subjectID: { $in: subjectIDs.map((id) => id.toString()) } },
                            ],
                        })),
                        ...(await midTestModel_1.default.find({
                            $or: [
                                { subject: { $in: subjectIDs } },
                                { subjectID: { $in: subjectIDs.map((id) => id.toString()) } },
                            ],
                        })),
                    ];
            const knownSourceIDs = new Set((await questionBankModel_1.default.distinct("sourceAssessmentID", {
                schoolID: context.schoolID,
            })).map((id) => id.toString()));
            for (const assessment of sourceAssessments) {
                const sourceID = assessment._id.toString();
                if (knownSourceIDs.has(sourceID))
                    continue;
                const assessmentType = assessment.status === "midTest" ? "midTest" : "examination";
                const sourceSubjectID = assessment.subjectID || context.subject._id;
                await (0, exports.saveQuestionsToBank)(context.schoolID, new mongoose_1.Types.ObjectId(String(sourceSubjectID)), assessment._id, context.actorID, assessmentType, assessment.quiz?.question || [], assessment.quiz?.theory || "");
                knownSourceIDs.add(sourceID);
            }
        }
        const questions = await questionBankModel_1.default
            .find(filter)
            .sort({ createdAt: -1, sourceQuestionIndex: 1 })
            .lean();
        return res.status(200).json({ data: questions, status: 200 });
    }
    catch (error) {
        console.error("Unable to read the question bank:", error);
        return res.status(500).json({ message: "Unable to read question bank" });
    }
};
exports.readQuestionBank = readQuestionBank;
const createAssessmentFromBank = async (req, res) => {
    try {
        const { classID, subjectID } = req.params;
        const { assessmentType, questionBankIDs, instruction, opensAt, closesAt, } = req.body;
        const context = await (0, assessmentAccess_1.getAssessmentContext)(req, subjectID);
        if (!context || context.classroom._id.toString() !== classID) {
            return res.status(403).json({ message: "Not authorized for this class" });
        }
        if (!isAssessmentType(assessmentType)) {
            return res.status(400).json({ message: "Invalid assessment type" });
        }
        if (!Array.isArray(questionBankIDs) || questionBankIDs.length === 0) {
            return res.status(400).json({ message: "Select at least one bank question" });
        }
        if (!opensAt ||
            !closesAt ||
            !Number.isFinite(Date.parse(opensAt)) ||
            !Number.isFinite(Date.parse(closesAt)) ||
            Date.parse(opensAt) >= Date.parse(closesAt)) {
            return res.status(400).json({
                message: "A valid opening and closing time are required",
            });
        }
        const validIDs = questionBankIDs.filter((id) => typeof id === "string" && mongoose_1.Types.ObjectId.isValid(id));
        if (validIDs.length !== questionBankIDs.length) {
            return res.status(400).json({ message: "Invalid question selection" });
        }
        const uniqueIDs = [...new Set(validIDs)];
        const bankItems = await questionBankModel_1.default.find({
            _id: { $in: validIDs },
            schoolID: context.schoolID,
            assessmentType,
        });
        if (bankItems.length !== uniqueIDs.length) {
            return res.status(400).json({
                message: "Some selected questions are unavailable for this assessment",
            });
        }
        const bankItemsByID = new Map(bankItems.map((item) => [item._id.toString(), item]));
        const selectedBankItems = uniqueIDs
            .map((id) => bankItemsByID.get(id))
            .filter((item) => item !== undefined);
        if (selectedBankItems.length !== uniqueIDs.length) {
            return res.status(400).json({
                message: "Some selected questions are unavailable for this assessment",
            });
        }
        const questions = selectedBankItems
            .filter((item) => item.questionKind !== "theory")
            .map((item) => item.question);
        const theory = selectedBankItems
            .filter((item) => item.questionKind === "theory")
            .map((item) => String(item.question?.question || ""))
            .join("<hr />");
        const common = {
            subjectTitle: context.subject.subjectTitle,
            subjectID: context.subject._id,
            subject: context.subject._id,
            session: context.classroom.presentSession || "",
            term: context.classroom.presentTerm || "",
            quiz: {
                instruction: instruction || {},
                question: questions,
                theory,
            },
            totalQuestions: questions.length,
            status: assessmentType,
            currentRound: 1,
            opensAt: new Date(opensAt),
            closesAt: new Date(closesAt),
            ...(assessmentType === "examination" ? { startExam: true } : { startMidTest: true }),
        };
        if (assessmentType === "examination") {
            const assessment = await examinationModel_1.default.create(common);
            const assessmentID = new mongoose_1.Types.ObjectId(assessment._id);
            await context.subject.updateOne({ $addToSet: { examination: assessmentID } });
            return res.status(201).json({
                message: "Assessment created from question bank",
                data: assessment,
                status: 201,
            });
        }
        else {
            const assessment = await midTestModel_1.default.create(common);
            const assessmentID = new mongoose_1.Types.ObjectId(assessment._id);
            await context.subject.updateOne({ $addToSet: { midTest: assessmentID } });
            return res.status(201).json({
                message: "Assessment created from question bank",
                data: assessment,
                status: 201,
            });
        }
    }
    catch (error) {
        console.error("Unable to create assessment from question bank:", error);
        return res.status(500).json({
            message: "Unable to create assessment from question bank",
        });
    }
};
exports.createAssessmentFromBank = createAssessmentFromBank;
const rescheduleAssessment = async (req, res) => {
    try {
        const { assessmentType, assessmentID } = req.params;
        const { opensAt, closesAt } = req.body;
        if (!isAssessmentType(assessmentType) || !mongoose_1.Types.ObjectId.isValid(assessmentID)) {
            return res.status(400).json({ message: "Invalid assessment" });
        }
        if (!opensAt ||
            !closesAt ||
            !Number.isFinite(Date.parse(opensAt)) ||
            !Number.isFinite(Date.parse(closesAt)) ||
            Date.parse(opensAt) >= Date.parse(closesAt)) {
            return res.status(400).json({
                message: "A valid opening and closing time are required",
            });
        }
        let assessment;
        if (assessmentType === "examination") {
            assessment = await examinationModel_1.default.findById(assessmentID);
        }
        else {
            assessment = await midTestModel_1.default.findById(assessmentID);
        }
        if (!assessment) {
            return res.status(404).json({ message: "Assessment not found" });
        }
        const context = await (0, assessmentAccess_1.getAssessmentContext)(req, assessment.subjectID);
        if (!context) {
            return res.status(403).json({ message: "Not authorized for this assessment" });
        }
        assessment.currentRound = Math.max(1, Number(assessment.currentRound) || 1) + 1;
        assessment.opensAt = new Date(opensAt);
        assessment.closesAt = new Date(closesAt);
        if (assessmentType === "examination")
            assessment.startExam = true;
        else
            assessment.startMidTest = true;
        await assessment.save();
        return res.status(200).json({
            message: "Assessment rescheduled for a new student attempt",
            data: assessment,
            status: 200,
        });
    }
    catch (error) {
        console.error("Unable to reschedule assessment:", error);
        return res.status(500).json({ message: "Unable to reschedule assessment" });
    }
};
exports.rescheduleAssessment = rescheduleAssessment;
