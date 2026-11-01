"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSubjectExam = exports.deleteExamination = exports.readExamination = exports.startSubjectExamination = exports.randomizeSubjectExamination = exports.readSubjectExamination = exports.createSubjectExam = void 0;
const examinationModel_1 = __importDefault(require("../model/examinationModel"));
const lodash_1 = __importDefault(require("lodash"));
const classroomModel_1 = __importDefault(require("../model/classroomModel"));
const subjectModel_1 = __importDefault(require("../model/subjectModel"));
const staffModel_1 = __importDefault(require("../model/staffModel"));
const schoolModel_1 = __importDefault(require("../model/schoolModel"));
const csvtojson_1 = __importDefault(require("csvtojson"));
const mammoth_1 = __importDefault(require("mammoth"));
const cheerio_1 = __importDefault(require("cheerio"));
const node_path_1 = __importDefault(require("node:path"));
const node_fs_1 = __importDefault(require("node:fs"));
const streamifier_1 = require("../utils/streamifier");
const mongoose_1 = require("mongoose");
const normalize = (val) => (val || "").trim().toLowerCase();
const createSubjectExam = async (req, res) => {
    try {
        const { classID, subjectID } = req.params;
        const { theory, instruction, duration, mark, randomize } = req.body;
        let filePath = node_path_1.default.join(require("os").tmpdir(), "examination");
        const classRoom = await classroomModel_1.default.findById(classID);
        const checkForSubject = await subjectModel_1.default.findById(subjectID);
        // teacher assigned to the class
        const findTeacher = await staffModel_1.default.findById(classRoom?.teacherID);
        // teacher assigned specifically to the subject (teacherID stored on subject)
        const findSubjectTeacher = await staffModel_1.default.findById(checkForSubject?.teacherID);
        // Get school info for session/term
        const schoolId = classRoom?.school || classRoom?.schoolIDs || findTeacher?.schoolIDs;
        const school = await schoolModel_1.default.findById(schoolId);
        const presentTerm = classRoom?.presentTerm || school?.presentTerm;
        const presentSession = school?.presentSession;
        // const { secure_url, public_id }: any = await streamUpload(req);
        const uploadedPath = req?.file?.path;
        if (!uploadedPath) {
            return res.status(400).json({
                message: "No upload file provided",
                status: 400,
            });
        }
        const originalName = req?.file?.originalname || uploadedPath;
        const ext = node_path_1.default.extname(originalName).toLowerCase();
        let value = [];
        // helper to extract URLs from string
        const extractUrlsFromText = (text) => {
            // Match both http(s) and data URIs
            const urlRegex = /(https?:\/\/[^\s\)\]]+|data:[^\s\)\]]+)/g;
            const matches = Array.from((text || "").matchAll(urlRegex));
            return matches.map((m) => m[0]);
        };
        // Attempts to trim trailing garbage after common image extensions
        const sanitizeUrl = (url) => {
            if (!url || typeof url !== "string")
                return url;
            const extRegex = /(\.(?:png|jpe?g|gif|webp|svg|bmp|pdf|txt))(?:[?#][^\s\)\]]*)?/i;
            const match = url.match(extRegex);
            if (!match || match.index === undefined)
                return url;
            const endIndex = match.index + match[0].length;
            return url.slice(0, endIndex);
        };
        if (ext === ".doc" || ext === ".docx") {
            // Convert Word docx to HTML to preserve images and markup
            const result = await mammoth_1.default.convertToHtml({ path: uploadedPath }, { includeEmbeddedStyleMap: true });
            const html = result.value || "";
            const $ = cheerio_1.default.load(html);
            // split by paragraphs and headings to get question blocks
            const blocks = [];
            const elems = $("p, h1, h2, h3, li").toArray();
            for (const el of elems) {
                const text = $(el).text().trim();
                if (text) {
                    // Virtual Splitter for merged paragraphs
                    let splitText = text;
                    splitText = splitText.replace(/(\S)\s*([A-D][\.\)]\s+)/g, "$1\n$2");
                    splitText = splitText.replace(/(\S)\s*([A-D][\.\)]\s+)/g, "$1\n$2");
                    splitText = splitText.replace(/([a-zA-Z!?."'>\)])\s+(\b\d+[\.\)]\s+)/g, "$1\n$2");
                    splitText = splitText.replace(/(\S)\s*(Answer:\s*)/gi, "$1\n$2");
                    splitText = splitText.replace(/(\S)\s*(Explanation:\s*)/gi, "$1\n$2");
                    const subBlocks = splitText
                        .split("\n")
                        .map((b) => b.trim())
                        .filter(Boolean);
                    blocks.push(...subBlocks);
                }
            }
            // collect images mapped by their surrounding block index
            const imagesByIndex = {};
            const imgs = $("img").toArray();
            for (const imgEl of imgs) {
                const src = $(imgEl).attr("src");
                if (!src)
                    continue;
                const parent = $(imgEl).closest("p, li, h1, h2, h3")[0];
                let idx = -1;
                if (parent) {
                    const parentText = $(parent).text().trim();
                    idx = blocks.findIndex((b) => b.includes(parentText));
                }
                const key = idx >= 0 ? idx : blocks.length;
                imagesByIndex[key] = imagesByIndex[key] || [];
                imagesByIndex[key].push(src);
            }
            // If images are data URIs (embedded), upload them to Cloudinary so they
            // are visible and performant for students. Replace data URIs with hosted URLs.
            for (const k of Object.keys(imagesByIndex)) {
                const arr = imagesByIndex[Number(k)];
                const uploadedUrls = [];
                for (const src of arr) {
                    try {
                        if (typeof src === "string" && src.startsWith("data:")) {
                            const uploadRes = await (0, streamifier_1.uploadDataUri)(src, "exams");
                            if (uploadRes && uploadRes.secure_url) {
                                uploadedUrls.push(sanitizeUrl(uploadRes.secure_url));
                            }
                        }
                        else if (typeof src === "string") {
                            uploadedUrls.push(sanitizeUrl(src));
                        }
                    }
                    catch (err) {
                        uploadedUrls.push(sanitizeUrl(src));
                    }
                }
                imagesByIndex[Number(k)] = uploadedUrls;
            }
            let questionData = {};
            let options = [];
            const BRACKET_URL_REGEX = /\[(https?:\/\/[^\]]+|data:[^\]]+)\]/;
            for (let idx = 0; idx < blocks.length; idx++) {
                let line = blocks[idx];
                if (/^\d+[\.\)]/.test(line)) {
                    // Save previous question
                    if (Object.keys(questionData).length) {
                        questionData.options = options;
                        if (imagesByIndex[idx - 1])
                            questionData.images = imagesByIndex[idx - 1].map((u) => sanitizeUrl(String(u)));
                        value.push(questionData);
                        questionData = {};
                        options = [];
                    }
                    const match = line.match(BRACKET_URL_REGEX);
                    let url = match ? match[1].trim() : null;
                    if (!url) {
                        const extracted = extractUrlsFromText(line);
                        if (extracted.length)
                            url = sanitizeUrl(extracted[0]);
                    }
                    line = line.replace(BRACKET_URL_REGEX, "").trim();
                    questionData = { question: line };
                    if (url) {
                        url = sanitizeUrl(url);
                        questionData.images = [url];
                        questionData.url = url;
                    }
                }
                else if (/^[A-D][\.\)]/.test(line)) {
                    options.push(line.replace(/^[A-D][\.\)]/, "").trim());
                }
                else if (line.startsWith("Answer:")) {
                    questionData.answer = line.replace("Answer:", "").trim();
                }
                else if (line.startsWith("Explanation:")) {
                    questionData.explanation = line.replace("Explanation:", "").trim();
                }
                else {
                    // append to question if no options yet
                    if (questionData && !questionData.options) {
                        const match = line.match(BRACKET_URL_REGEX);
                        let url = match ? match[1].trim() : null;
                        if (!url) {
                            const extracted = extractUrlsFromText(line);
                            if (extracted.length)
                                url = sanitizeUrl(extracted[0]);
                        }
                        line = line.replace(BRACKET_URL_REGEX, "").trim();
                        questionData.question = `${questionData.question} ${line}`.trim();
                        if (url) {
                            url = sanitizeUrl(url);
                            if (!questionData.images)
                                questionData.images = [];
                            questionData.images.push(url);
                            if (!questionData.url)
                                questionData.url = url;
                        }
                    }
                }
            }
            if (Object.keys(questionData).length) {
                questionData.options = options;
                const lastIdx = blocks.length - 1;
                if (imagesByIndex[lastIdx])
                    questionData.images = imagesByIndex[lastIdx].map((u) => sanitizeUrl(String(u)));
                if (!questionData.url &&
                    Array.isArray(questionData.images) &&
                    questionData.images.length)
                    questionData.url = questionData.images[0];
                value.push(questionData);
            }
        }
        else {
            // treat as CSV
            const data = await (0, csvtojson_1.default)().fromFile(uploadedPath);
            for (const i of data) {
                const opts = i.options ? i.options.split(";;") : [];
                const possibleUrl = i.url || i.image || i.imageUrl || i.Image || i.URL || i.Url;
                let images = possibleUrl
                    ? typeof possibleUrl === "string"
                        ? [possibleUrl]
                        : possibleUrl
                    : [];
                images = images.map((u) => sanitizeUrl(String(u)));
                const read = {
                    question: i.Question ||
                        i.question ||
                        i.questionText ||
                        i.questionTitle ||
                        i.question,
                    images,
                    url: images && images.length ? images[0] : undefined,
                    options: opts,
                    answer: i.Answer || i.answer,
                    explanation: i.Explanation || i.explanation,
                };
                value.push(read);
            }
        }
        let term = lodash_1.default.find(value, { term: school?.presentTerm });
        let session = lodash_1.default.find(value, { session: school?.presentSession });
        const deleteFilesInFolder = (folderPath) => {
            if (node_fs_1.default.existsSync(folderPath)) {
                const files = node_fs_1.default.readdirSync(folderPath);
                files.forEach((file) => {
                    const filePath = node_path_1.default.join(folderPath, file);
                    node_fs_1.default.unlinkSync(filePath);
                });
                console.log(`All files in the folder '${folderPath}' have been deleted.`);
            }
            else {
                console.log(`The folder '${folderPath}' does not exist.`);
            }
        };
        // checkForSubject;
        if (checkForSubject) {
            // if (term && session) {
            //   const quizes = await quizModel.findByIdAndUpdate(
            //     term?._id,
            //     {
            //       quiz: {
            //         instruction: { duration, mark, instruction },
            //         question: value,
            //       },
            //       totalQuestions: value?.length,
            //       startExam: false,
            //     },
            //     { new: true }
            //   );
            //   let filePath = path.join(__dirname, "uploads");
            //   const deleteFilesInFolder = (folderPath: any) => {
            //     if (fs.existsSync(folderPath)) {
            //       const files = fs.readdirSync(folderPath);
            //       files.forEach((file) => {
            //         const filePath = path.join(folderPath, file);
            //         fs.unlinkSync(filePath);
            //       });
            //       console.log(
            //         `All files in the folder '${folderPath}' have been deleted.`
            //       );
            //     } else {
            //       console.log(`The folder '${folderPath}' does not exist.`);
            //     }
            //   };
            //   deleteFilesInFolder(filePath);
            //   return res.status(201).json({
            //     message: "update exam entry successfully",
            //     data: quizes,
            //     status: 201,
            //   });
            // } else {
            //   const quizes = await quizModel.create({
            //     subjectTitle: checkForSubject?.subjectTitle,
            //     subjectID: checkForSubject?._id,
            //     session: school?.presentSession,
            //     term: school?.presentTerm,
            //     quiz: {
            //       instruction: { duration, mark, instruction },
            //       question: value,
            //     },
            //     totalQuestions: value?.length,
            //     status: "examination",
            //     startExam: false,
            //   });
            //   checkForSubject?.quiz.push(new Types.ObjectId(quizes._id));
            //   checkForSubject?.performance?.push(new Types.ObjectId(quizes._id));
            //   checkForSubject?.save();
            //   findTeacher?.quiz.push(new Types.ObjectId(quizes._id));
            //   findTeacher?.save();
            //   findSubjectTeacher?.quiz.push(new Types.ObjectId(quizes._id));
            //   findSubjectTeacher?.save();
            //   let filePath = path.join(__dirname, "uploads");
            //   const deleteFilesInFolder = (folderPath: any) => {
            //     if (fs.existsSync(folderPath)) {
            //       const files = fs.readdirSync(folderPath);
            //       files.forEach((file) => {
            //         const filePath = path.join(folderPath, file);
            //         fs.unlinkSync(filePath);
            //       });
            //       console.log(
            //         `All files in the folder '${folderPath}' have been deleted.`
            //       );
            //     } else {
            //       console.log(`The folder '${folderPath}' does not exist.`);
            //     }
            //   };
            //   return res.status(201).json({
            //     message: "exam entry successfully",
            //     // data: quizes,
            //     status: 201,
            //   });
            // }
            // await examinationModel.deleteMany();
            const quizes = await examinationModel_1.default.create({
                subjectTitle: checkForSubject?.subjectTitle,
                subjectID: checkForSubject?._id,
                subject: checkForSubject?._id, // Set ObjectId ref
                session: presentSession,
                term: presentTerm,
                quiz: {
                    instruction: { duration, mark, instruction },
                    question: value,
                    theory,
                },
                totalQuestions: value?.length,
                status: "examination",
                startExam: false,
            });
            checkForSubject?.examination.push(new mongoose_1.Types.ObjectId(quizes._id));
            checkForSubject?.performance?.push(new mongoose_1.Types.ObjectId(quizes._id));
            checkForSubject?.save();
            findTeacher?.examination.push(new mongoose_1.Types.ObjectId(quizes._id));
            findTeacher?.save();
            findSubjectTeacher?.examination.push(new mongoose_1.Types.ObjectId(quizes._id));
            findSubjectTeacher?.save();
            const x = setTimeout(async () => {
                await deleteFilesInFolder(filePath);
                clearTimeout(x);
            }, 15000);
            return res.status(201).json({
                message: "exam entry successfully",
                data: quizes,
                exam: checkForSubject?.examination,
                status: 201,
            });
        }
        else {
            return res.status(404).json({
                message: "Subject doesn't exist for this class",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating class subject quiz",
            status: 404,
            error: error,
            data: error?.message,
        });
    }
};
exports.createSubjectExam = createSubjectExam;
const readSubjectExamination = async (req, res) => {
    try {
        const { subjectID } = req.params;
        const subject = await subjectModel_1.default.findById(subjectID).populate({
            path: "examination",
            options: {
                sort: {
                    createdAt: -1,
                },
            },
        });
        // Determine the current term and session for this subject's class
        let presentTerm = "";
        let presentSession = "";
        let classroom;
        const effectiveClassID = subject?.subjectClassID || subject?.subjectClassIDs || subject?.classID;
        if (effectiveClassID) {
            classroom = await classroomModel_1.default.findById(effectiveClassID);
        }
        if (!classroom && subject?.designated) {
            classroom = await classroomModel_1.default.findOne({
                className: subject.designated,
                ...(subject.school ? { school: subject.school } : {}),
            });
        }
        if (!classroom) {
            classroom = await classroomModel_1.default.findOne({ classSubjects: subjectID });
        }
        if (classroom) {
            presentTerm = normalize(classroom?.presentTerm || "");
            if (classroom?.school || classroom?.schoolIDs) {
                const school = await schoolModel_1.default.findById(classroom.school || classroom.schoolIDs);
                presentSession = normalize(school?.presentSession || "");
                if (!presentTerm) {
                    presentTerm = normalize(school?.presentTerm || "");
                }
            }
        }
        // If classroom lookup fails to provide term or session, check the school specifically
        if ((!presentTerm || !presentSession) && subject?.school) {
            const school = await schoolModel_1.default.findById(subject.school);
            if (!presentTerm)
                presentTerm = normalize(school?.presentTerm || "");
            if (!presentSession)
                presentSession = normalize(school?.presentSession || "");
        }
        // A student should only receive an exam for the school's exact current term
        // and session. Missing metadata must not make an old exam eligible.
        const allExams = lodash_1.default.filter(subject?.examination, {
            status: "examination",
        });
        const matchesCurrentTerm = (e) => !!presentTerm && normalize(e?.term || "") === presentTerm;
        const matchesCurrentSession = (e) => !!presentSession && normalize(e?.session || "") === presentSession;
        const exam = allExams.find((e) => matchesCurrentTerm(e) && matchesCurrentSession(e));
        return res.status(201).json({
            message: "subject exam read successfully",
            exam,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error reading subject exam",
            status: 404,
        });
    }
};
exports.readSubjectExamination = readSubjectExamination;
const randomizeSubjectExamination = async (req, res) => {
    try {
        const { examID } = req.params;
        const { started } = req.body;
        const subject = await examinationModel_1.default.findByIdAndUpdate(examID, {
            randomize: started,
        }, { new: true });
        return res.status(201).json({
            message: "start randomize subject exam read successfully",
            data: subject,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error reading subject exam",
            status: 404,
        });
    }
};
exports.randomizeSubjectExamination = randomizeSubjectExamination;
const startSubjectExamination = async (req, res) => {
    try {
        const { examID } = req.params;
        const { started } = req.body;
        const subject = await examinationModel_1.default.findByIdAndUpdate(examID, {
            startExam: started,
        }, { new: true });
        return res.status(201).json({
            message: "start subject exam read successfully",
            data: subject,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error reading subject exam",
            status: 404,
        });
    }
};
exports.startSubjectExamination = startSubjectExamination;
const readExamination = async (req, res) => {
    try {
        const { examID } = req.params;
        const quiz = await examinationModel_1.default.findById(examID);
        return res.status(201).json({
            message: "subject quiz read successfully",
            data: quiz,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating subject quiz",
            data: error.message,
            status: 404,
        });
    }
};
exports.readExamination = readExamination;
const deleteExamination = async (req, res) => {
    try {
        const { examID, subjectID } = req.params;
        const quizSubject = await subjectModel_1.default.findById(subjectID);
        const quizTeacher = await staffModel_1.default.findById(quizSubject?.teacherID);
        const quiz = await examinationModel_1.default.findByIdAndDelete(examID);
        quizSubject.pull(new mongoose_1.Types.ObjectId(examID));
        quizSubject.save();
        quizTeacher.pull(new mongoose_1.Types.ObjectId(examID));
        quizTeacher.save();
        return res.status(201).json({
            message: "subject mid Test read successfully",
            // data: quiz,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating subject mid Test",
            data: error.message,
            status: 404,
        });
    }
};
exports.deleteExamination = deleteExamination;
const updateSubjectExam = async (req, res) => {
    try {
        const { examID } = req.params;
        const { mark, duration, dept } = req.body;
        const midTest = await examinationModel_1.default.findByIdAndUpdate(examID);
        const subject = await examinationModel_1.default.findByIdAndUpdate(examID, {
            quiz: {
                instruction: { duration, mark, dept },
                question: midTest?.quiz?.question,
                theory: midTest?.quiz?.theory,
            },
        }, { new: true });
        return res.status(201).json({
            message: "start subject mid test read successfully",
            data: subject,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error reading subject mid test",
            status: 404,
        });
    }
};
exports.updateSubjectExam = updateSubjectExam;
