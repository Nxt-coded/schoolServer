"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateClassTeacherGrading = exports.updateSchoolSMS = exports.createSchoolTimetableRecord = exports.changeSchoolTag = exports.approveRegistration = exports.getSchoolRegistered = exports.updateRegisterationStatus = exports.updateSchoolName = exports.changeSchoolEnrollmentID = exports.updateAdminCode = exports.RemoveSchoolPaymentOptions = exports.updateSchoolPaymentOptions = exports.updateSchoolTeamData = exports.updateSchoolAccountDetail = exports.updateSchoolStartPossition = exports.updateSchoolSignature = exports.updateSchoolStamp = exports.updateSchoolAvatar = exports.changeSchoolPersonalName = exports.changeSchoolPhoneNumber = exports.changeSchoolAddress = exports.changeSchoolName = exports.importSchoolData = exports.exportSchoolDataFile = exports.exportSchoolData = exports.deleteSchool = exports.viewAllSchools = exports.readSchoolCookie = exports.logoutSchool = exports.viewSchoolStatusByName = exports.viewSchoolStatus = exports.verifySchool = exports.createSchool = exports.loginSchool = exports.viewSchoolTopStudent = void 0;
const schoolModel_1 = __importDefault(require("../model/schoolModel"));
const crypto_1 = __importDefault(require("crypto"));
const email_1 = require("../utils/email");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const streamifier_1 = require("../utils/streamifier");
const lodash_1 = __importDefault(require("lodash"));
const cron_1 = require("cron");
const sessionModel_1 = __importDefault(require("../model/sessionModel"));
const staffModel_1 = __importDefault(require("../model/staffModel"));
const cardReportModel_1 = __importDefault(require("../model/cardReportModel"));
const midReportCardModel_1 = __importDefault(require("../model/midReportCardModel"));
const outGoneStudentModel_1 = __importDefault(require("../model/outGoneStudentModel"));
const termModel_1 = __importDefault(require("../model/termModel"));
const subjectModel_1 = __importDefault(require("../model/subjectModel"));
const classroomModel_1 = __importDefault(require("../model/classroomModel"));
const studentModel_1 = __importDefault(require("../model/studentModel"));
const announcementModel_1 = __importDefault(require("../model/announcementModel"));
const articleModel_1 = __importDefault(require("../model/articleModel"));
const assignmentModel_1 = __importDefault(require("../model/assignmentModel"));
const assignmentResolvedModel_1 = __importDefault(require("../model/assignmentResolvedModel"));
const attendanceModel_1 = __importDefault(require("../model/attendanceModel"));
const examinationModel_1 = __importDefault(require("../model/examinationModel"));
const ExpenditureModel_1 = __importDefault(require("../model/ExpenditureModel"));
const expenseModel_1 = __importDefault(require("../model/expenseModel"));
const gallaryModel_1 = __importDefault(require("../model/gallaryModel"));
const historyModel_1 = __importDefault(require("../model/historyModel"));
const lessonNoteModel_1 = __importDefault(require("../model/lessonNoteModel"));
const midTestModel_1 = __importDefault(require("../model/midTestModel"));
const pastQuestionModel_1 = __importDefault(require("../model/pastQuestionModel"));
const paymentHistory_1 = __importDefault(require("../model/paymentHistory"));
const paymentModel_1 = __importDefault(require("../model/paymentModel"));
const performanceModel_1 = __importDefault(require("../model/performanceModel"));
const quizModel_1 = __importDefault(require("../model/quizModel"));
const recordPaymentModel_1 = __importDefault(require("../model/recordPaymentModel"));
const reportCardModel_1 = __importDefault(require("../model/reportCardModel"));
const scheduleModel_1 = __importDefault(require("../model/scheduleModel"));
const schemeOfWorkModel_1 = __importDefault(require("../model/schemeOfWorkModel"));
const schoolFeeHistory_1 = __importDefault(require("../model/schoolFeeHistory"));
const sessionHistoryModel_1 = __importDefault(require("../model/sessionHistoryModel"));
const storeModel_1 = __importDefault(require("../model/storeModel"));
const studentHistoricalResultModel_1 = __importDefault(require("../model/studentHistoricalResultModel"));
const studentRemark_1 = __importDefault(require("../model/studentRemark"));
const teachSubjectModel_1 = __importDefault(require("../model/teachSubjectModel"));
const teachSubjectTopics_1 = __importDefault(require("../model/teachSubjectTopics"));
const teachTopicQuizesModel_1 = __importDefault(require("../model/teachTopicQuizesModel"));
const timetableModel_1 = __importDefault(require("../model/timetableModel"));
const cloudinary_1 = __importDefault(require("../utils/cloudinary"));
const archiver = require("archiver");
const viewSchoolTopStudent = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const schoolClasses = await schoolModel_1.default.findById(schoolID).populate({
            path: "students",
            options: {
                sort: {
                    createdAt: -1,
                },
            },
        });
        const rate = lodash_1.default.orderBy(schoolClasses?.students, ["totalPerformance"], ["desc"]);
        return res.status(200).json({
            message: "finding class students top performance!",
            status: 200,
            data: rate,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school class",
            status: 404,
            data: error.message,
        });
    }
};
exports.viewSchoolTopStudent = viewSchoolTopStudent;
const loginSchool = async (req, res) => {
    try {
        const { email, enrollmentID } = req.body;
        const school = await schoolModel_1.default.findOne({
            email,
        });
        if (school) {
            if (school.enrollmentID === enrollmentID) {
                if (school.verify) {
                    const token = jsonwebtoken_1.default.sign({ status: school.status }, "school", {
                        expiresIn: "1d",
                    });
                    req.session.isAuth = true;
                    req.session.isSchoolID = school._id;
                    return res.status(201).json({
                        message: "welcome back",
                        data: token,
                        user: school?.status,
                        id: req.session.isSchoolID,
                        status: 201,
                    });
                }
                else {
                    return res.status(404).json({
                        message: "please check your email to verify your account",
                    });
                }
            }
            else {
                return res.status(404).json({
                    message: "Error reading your school enrollment ID",
                });
            }
        }
        else {
            return res.status(404).json({
                message: "Error finding school",
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school",
            data: error.message,
        });
    }
};
exports.loginSchool = loginSchool;
const createSchool = async (req, res) => {
    try {
        const { email } = req.body;
        const id = crypto_1.default.randomBytes(4).toString("hex");
        const adminCode = crypto_1.default.randomBytes(6).toString("hex");
        const school = await schoolModel_1.default.create({
            email,
            enrollmentID: id,
            adminCode,
            status: "school-admin",
        });
        // verifiedEmail(school);
        const job = new cron_1.CronJob(" * * * * 7", // cronTime
        async () => {
            const viewSchool = await schoolModel_1.default.findById(school._id);
            if (viewSchool?.staff?.length === 0 &&
                viewSchool?.students?.length === 0 &&
                viewSchool?.classRooms?.length === 0 &&
                viewSchool?.subjects?.length === 0 &&
                !viewSchool?.started &&
                !viewSchool?.verify) {
                await schoolModel_1.default.findByIdAndDelete(school._id);
            }
            job.stop();
        }, // onTick
        null, // onComplete
        true // start
        );
        return res.status(201).json({
            message: "creating school",
            data: school,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school",
            data: error.message,
            status: 404,
        });
    }
};
exports.createSchool = createSchool;
const verifySchool = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const school = await schoolModel_1.default.findById(schoolID);
        if (school) {
            const verified = await schoolModel_1.default.findByIdAndUpdate(schoolID, { verify: true }, { new: true });
            return res.status(201).json({
                message: "school verified successfully",
                data: verified,
            });
        }
        else {
            return res.status(404).json({
                message: "error finding school",
                data: school,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error verifying school",
        });
    }
};
exports.verifySchool = verifySchool;
const viewSchoolStatus = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const school = await schoolModel_1.default.findById(schoolID);
        return res.status(200).json({
            message: "viewing school record",
            data: school,
            status: 200,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error verifying school",
        });
    }
};
exports.viewSchoolStatus = viewSchoolStatus;
const viewSchoolStatusByName = async (req, res) => {
    try {
        const { schoolName } = req.params;
        const school = await schoolModel_1.default.findOne({ schoolName });
        return res.status(200).json({
            message: "viewing school record by her name",
            data: school,
            status: 200,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error verifying school",
        });
    }
};
exports.viewSchoolStatusByName = viewSchoolStatusByName;
const logoutSchool = async (req, res) => {
    try {
        req.session.destroy();
        return res.status(200).json({
            message: "GoodBye",
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error verifying school",
        });
    }
};
exports.logoutSchool = logoutSchool;
const readSchoolCookie = async (req, res) => {
    try {
        const readSchool = req.session.isSchoolID;
        return res.status(200).json({
            message: "GoodBye",
            data: readSchool,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error verifying school",
        });
    }
};
exports.readSchoolCookie = readSchoolCookie;
const viewAllSchools = async (req, res) => {
    try {
        const school = await schoolModel_1.default.find();
        return res.status(200).json({
            total: `Number of Schools: ${school.length} on our platform`,
            length: school.length,
            message: "viewing all school",
            data: school,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error verifying school",
        });
    }
};
exports.viewAllSchools = viewAllSchools;
const deleteSchool = async (req, res) => {
    try {
        const { schoolID } = req.params;
        let id = "678d4e5060a0cbcd2e27dc51";
        const getSchool = await schoolModel_1.default.findById(schoolID);
        if (!getSchool) {
            return res.status(404).json({ message: "School not found" });
        }
        const summary = { deleted: {}, errors: [] };
        // Helper to safely delete cloud assets by public_id
        const tryDestroy = async (publicId) => {
            if (!publicId)
                return;
            try {
                await cloudinary_1.default.uploader.destroy(publicId);
            }
            catch (err) {
                // don't fail entire operation on cloud delete errors
                summary.errors.push({
                    publicId,
                    error: err?.message || String(err),
                });
            }
        };
        // Delete sessions and their terms
        try {
            const sessionIds = (getSchool.session || []).map((s) => s.toString());
            for (const sid of sessionIds) {
                const sess = await sessionModel_1.default.findById(sid).lean();
                if (sess?.term && sess.term.length) {
                    await termModel_1.default.deleteMany({ _id: { $in: sess.term } });
                    summary.deleted.terms =
                        (summary.deleted.terms || 0) + sess.term.length;
                }
            }
            await sessionModel_1.default.deleteMany({ _id: { $in: sessionIds } });
            summary.deleted.sessions = sessionIds.length;
        }
        catch (err) {
            summary.errors.push({ area: "sessions", error: err.message });
        }
        // Models that store a reference to the school via `school` or `schoolInfo` field
        const schoolLinkedModels = [
            announcementModel_1.default,
            articleModel_1.default,
            assignmentModel_1.default,
            assignmentResolvedModel_1.default,
            attendanceModel_1.default,
            examinationModel_1.default,
            ExpenditureModel_1.default,
            expenseModel_1.default,
            gallaryModel_1.default,
            historyModel_1.default,
            lessonNoteModel_1.default,
            midTestModel_1.default,
            pastQuestionModel_1.default,
            paymentHistory_1.default,
            paymentModel_1.default,
            performanceModel_1.default,
            quizModel_1.default,
            recordPaymentModel_1.default,
            reportCardModel_1.default,
            scheduleModel_1.default,
            schemeOfWorkModel_1.default,
            schoolFeeHistory_1.default,
            sessionHistoryModel_1.default,
            storeModel_1.default,
            studentHistoricalResultModel_1.default,
            studentRemark_1.default,
            teachSubjectModel_1.default,
            teachSubjectTopics_1.default,
            teachTopicQuizesModel_1.default,
            timetableModel_1.default,
        ];
        for (const m of schoolLinkedModels) {
            try {
                const del = await m.deleteMany({ school: getSchool._id });
                summary.deleted[m.modelName || m.collection?.name || m.name] =
                    del?.deletedCount || del?.n || 0;
            }
            catch (err) {
                // some models may use 'schoolInfo' field
                try {
                    const del2 = await m.deleteMany({
                        schoolInfo: getSchool._id,
                    });
                    summary.deleted[m.modelName || m.collection?.name || m.name] =
                        (summary.deleted[m.modelName || m.collection?.name || m.name] ||
                            0) + (del2?.deletedCount || del2?.n || 0);
                }
                catch (err2) {
                    summary.errors.push({
                        model: m.modelName || m.name,
                        error: err2?.message || String(err2),
                    });
                }
            }
        }
        // Delete docs referenced directly in school arrays (classes, subjects, staff, students, etc.)
        const arrayRefs = [
            { key: "classRooms", model: classroomModel_1.default },
            { key: "subjects", model: subjectModel_1.default },
            { key: "staff", model: staffModel_1.default },
            { key: "students", model: studentModel_1.default },
            { key: "reportCard", model: reportCardModel_1.default },
            { key: "midReportCard", model: midReportCardModel_1.default },
            { key: "outGoneStudents", model: outGoneStudentModel_1.default },
            { key: "store", model: storeModel_1.default },
            { key: "announcements", model: announcementModel_1.default },
            { key: "articles", model: articleModel_1.default },
            { key: "gallaries", model: gallaryModel_1.default },
        ];
        for (const ref of arrayRefs) {
            try {
                const ids = (getSchool[ref.key] || []).map((x) => x.toString());
                if (ids.length) {
                    // attempt to delete cloud assets if present (gallary, staff avatars, students avatars, store images, articles)
                    if (ref.model === gallaryModel_1.default) {
                        const items = await gallaryModel_1.default
                            .find({ _id: { $in: ids } })
                            .lean();
                        for (const it of items) {
                            await tryDestroy(it?.avatarID || it?.public_id || it?.imageID);
                        }
                    }
                    if (ref.model === staffModel_1.default) {
                        const items = await staffModel_1.default
                            .find({ _id: { $in: ids } })
                            .lean();
                        for (const it of items) {
                            await tryDestroy(it?.avatarID || it?.staffAvatarID || it?.signatureID);
                        }
                    }
                    if (ref.model === studentModel_1.default) {
                        const items = await studentModel_1.default
                            .find({ _id: { $in: ids } })
                            .lean();
                        for (const it of items) {
                            await tryDestroy(it?.avatarID || it?.studentAvatarID || it?.studentAvatarID);
                        }
                    }
                    await ref.model.deleteMany({ _id: { $in: ids } });
                    summary.deleted[ref.key] = ids.length;
                }
            }
            catch (err) {
                summary.errors.push({
                    area: `arrayRef:${ref.key}`,
                    error: err.message,
                });
            }
        }
        // Fallback: delete any remaining documents that explicitly reference this school via school field
        try {
            const fallbackModels = [
                classroomModel_1.default,
                subjectModel_1.default,
                staffModel_1.default,
                studentModel_1.default,
                reportCardModel_1.default,
                midReportCardModel_1.default,
                outGoneStudentModel_1.default,
                gallaryModel_1.default,
                articleModel_1.default,
            ];
            for (const m of fallbackModels) {
                const del = await m.deleteMany({ school: getSchool._id });
                summary.deleted[m.modelName || m.name] =
                    (summary.deleted[m.modelName || m.name] || 0) +
                        (del?.deletedCount || del?.n || 0);
            }
        }
        catch (err) {
            summary.errors.push({
                area: "fallback",
                error: err?.message || String(err),
            });
        }
        // Finally remove the school document itself
        try {
            await schoolModel_1.default.findByIdAndDelete(getSchool._id);
            summary.deleted.school = 1;
        }
        catch (err) {
            summary.errors.push({ area: "schoolDelete", error: err.message });
        }
        return res
            .status(200)
            .json({ message: "school deleted successfully", summary });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error verifying school",
        });
    }
};
exports.deleteSchool = deleteSchool;
const exportSchoolData = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const school = await schoolModel_1.default.findById(schoolID).lean();
        if (!school) {
            return res.status(404).json({ message: "School not found" });
        }
        const [classRooms, staff, subjects, students, sessions, reportCards, midReportCards, outGoneStudents,] = await Promise.all([
            classroomModel_1.default.find({ _id: { $in: school.classRooms || [] } }).lean(),
            staffModel_1.default.find({ _id: { $in: school.staff || [] } }).lean(),
            subjectModel_1.default.find({ _id: { $in: school.subjects || [] } }).lean(),
            studentModel_1.default.find({ _id: { $in: school.students || [] } }).lean(),
            sessionModel_1.default.find({ _id: { $in: school.session || [] } }).lean(),
            cardReportModel_1.default
                .find({ _id: { $in: school.reportCard || [] } })
                .lean()
                .catch(() => []),
            midReportCardModel_1.default
                .find({ _id: { $in: school.midReportCard || [] } })
                .lean()
                .catch(() => []),
            outGoneStudentModel_1.default
                .find({ _id: { $in: school.outGoneStudents || [] } })
                .lean()
                .catch(() => []),
        ]);
        const exportPkg = {
            school,
            classRooms,
            staff,
            subjects,
            students,
            sessions,
            reportCards,
            midReportCards,
            outGoneStudents,
        };
        return res.status(200).json({ message: "export ready", data: exportPkg });
    }
    catch (error) {
        return res
            .status(500)
            .json({ message: "Error exporting school data", error: error.message });
    }
};
exports.exportSchoolData = exportSchoolData;
const exportSchoolDataFile = async (req, res) => {
    try {
        const { schoolID } = req.params;
        // Admin-only: simple guard - user must be logged in and match school admin session or school.status
        const sessionSchoolID = req.session?.isSchoolID;
        // if (
        //   !sessionSchoolID ||
        //   sessionSchoolID.toString() !== schoolID.toString()
        // ) {
        //   return res
        //     .status(403)
        //     .json({ message: "Forbidden, admin access required" });
        // }
        const school = await schoolModel_1.default.findById(schoolID).lean();
        if (!school)
            return res.status(404).json({ message: "School not found" });
        const [classRooms, staff, subjects, students, sessions, reportCards, midReportCards, outGoneStudents,] = await Promise.all([
            classroomModel_1.default.find({ _id: { $in: school.classRooms || [] } }).lean(),
            staffModel_1.default.find({ _id: { $in: school.staff || [] } }).lean(),
            subjectModel_1.default.find({ _id: { $in: school.subjects || [] } }).lean(),
            studentModel_1.default.find({ _id: { $in: school.students || [] } }).lean(),
            sessionModel_1.default.find({ _id: { $in: school.session || [] } }).lean(),
            cardReportModel_1.default
                .find({ _id: { $in: school.reportCard || [] } })
                .lean()
                .catch(() => []),
            midReportCardModel_1.default
                .find({ _id: { $in: school.midReportCard || [] } })
                .lean()
                .catch(() => []),
            outGoneStudentModel_1.default
                .find({ _id: { $in: school.outGoneStudents || [] } })
                .lean()
                .catch(() => []),
        ]);
        const exportPkg = {
            school,
            classRooms,
            staff,
            subjects,
            students,
            sessions,
            reportCards,
            midReportCards,
            outGoneStudents,
        };
        // Stream a zip containing the export JSON
        const baseName = (school.schoolName || "school").replace(/[^a-z0-9_-]/gi, "_");
        const zipName = `${baseName}-export-${Date.now()}.zip`;
        res.setHeader("Content-Type", "application/zip");
        res.setHeader("Content-Disposition", `attachment; filename="${zipName}"`);
        const archive = archiver("zip", { zlib: { level: 9 } });
        archive.on("error", (err) => {
            console.error("Archive error", err);
            try {
                res.status(500).end();
            }
            catch (e) { }
        });
        // Pipe archive data to the response
        archive.pipe(res);
        // Append export JSON as a file inside the zip
        archive.append(JSON.stringify(exportPkg, null, 2), {
            name: `${baseName}-export.json`,
        });
        // finalize the archive (this will end the response when done)
        await archive.finalize();
        // response is streamed; return a 200 OK handled by the stream
        return res;
    }
    catch (error) {
        return res
            .status(500)
            .json({ message: "Error exporting school data", error: error.message });
    }
};
exports.exportSchoolDataFile = exportSchoolDataFile;
const importSchoolData = async (req, res) => {
    try {
        const payload = req.body?.data || req.body;
        if (!payload || !payload.school) {
            return res.status(400).json({ message: "Invalid import payload" });
        }
        const exported = payload;
        // Prepare school data (avoid unique conflicts on email)
        const schoolData = { ...exported.school };
        delete schoolData._id;
        // ensure unique email to avoid duplicate key
        if (schoolData.email) {
            schoolData.email = `${schoolData.email}.import.${Date.now()}`;
        }
        // Create school record first
        const newSchool = await schoolModel_1.default.create(schoolData);
        // helper collections and mapping
        const collections = [
            {
                items: exported.classRooms || [],
                model: classroomModel_1.default,
                key: "classRooms",
            },
            { items: exported.subjects || [], model: subjectModel_1.default, key: "subjects" },
            { items: exported.staff || [], model: staffModel_1.default, key: "staff" },
            { items: exported.students || [], model: studentModel_1.default, key: "students" },
            { items: exported.sessions || [], model: sessionModel_1.default, key: "session" },
            {
                items: exported.reportCards || [],
                model: cardReportModel_1.default,
                key: "reportCard",
            },
            {
                items: exported.midReportCards || [],
                model: midReportCardModel_1.default,
                key: "midReportCard",
            },
            {
                items: exported.outGoneStudents || [],
                model: outGoneStudentModel_1.default,
                key: "outGoneStudents",
            },
        ];
        const idMap = {};
        // First pass: create documents without reference arrays
        for (const col of collections) {
            for (const item of col.items) {
                const oldId = item._id?.toString();
                const doc = { ...item };
                delete doc._id;
                // replace school references with new school id
                if (doc.school || doc.schoolInfo) {
                    doc.school = newSchool._id;
                    doc.schoolInfo = newSchool._id;
                }
                // Remove array refs - to be set in second pass
                for (const k of Object.keys(doc)) {
                    if (Array.isArray(doc[k])) {
                        // keep simple scalar arrays if they are primitives, else set to [] now
                        if (doc[k].length > 0 && typeof doc[k][0] === "object") {
                            doc[k] = [];
                        }
                    }
                }
                const created = await col.model.create(doc);
                if (oldId)
                    idMap[oldId] = created._id;
                // store mapping for school arrays
                newSchool[col.key] = newSchool[col.key] || [];
                newSchool[col.key].push(created._id);
            }
        }
        await newSchool.save();
        // Second pass: update created docs with remapped references
        for (const col of collections) {
            for (const item of col.items) {
                const oldId = item._id?.toString();
                const newId = idMap[oldId];
                if (!newId)
                    continue;
                const updates = {};
                for (const k of Object.keys(item)) {
                    const val = item[k];
                    if (Array.isArray(val) && val.length > 0) {
                        const mapped = val.map((v) => {
                            if (!v)
                                return v;
                            const s = v.toString ? v.toString() : v;
                            return idMap[s] || v;
                        });
                        updates[k] = mapped;
                    }
                    else if (val && typeof val === "string" && idMap[val]) {
                        updates[k] = idMap[val];
                    }
                }
                if (Object.keys(updates).length) {
                    await col.model.findByIdAndUpdate(newId, updates, { new: true });
                }
            }
        }
        // finally, save the updated school arrays
        await schoolModel_1.default.findByIdAndUpdate(newSchool._id, newSchool, {
            new: true,
        });
        return res
            .status(201)
            .json({ message: "Import completed", schoolID: newSchool._id });
    }
    catch (error) {
        console.error("Import error", error);
        return res
            .status(500)
            .json({ message: "Error importing school data", error: error.message });
    }
};
exports.importSchoolData = importSchoolData;
const changeSchoolName = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const { schoolName } = req.body;
        const school = await schoolModel_1.default.findById(schoolID);
        if (school) {
            const verified = await schoolModel_1.default.findByIdAndUpdate(schoolID, { schoolName }, { new: true });
            return res.status(201).json({
                message: "school verified successfully",
                data: verified,
            });
        }
        else {
            return res.status(404).json({
                message: "error finding school",
                data: school,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error verifying school",
        });
    }
};
exports.changeSchoolName = changeSchoolName;
const changeSchoolAddress = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const { address } = req.body;
        const school = await schoolModel_1.default.findById(schoolID);
        if (school) {
            const verified = await schoolModel_1.default.findByIdAndUpdate(schoolID, { address }, { new: true });
            return res.status(201).json({
                message: "school verified successfully",
                data: verified,
            });
        }
        else {
            return res.status(404).json({
                message: "error finding school",
                data: school,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error verifying school",
        });
    }
};
exports.changeSchoolAddress = changeSchoolAddress;
const changeSchoolPhoneNumber = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const { phone } = req.body;
        const school = await schoolModel_1.default.findById(schoolID);
        if (school) {
            const verified = await schoolModel_1.default.findByIdAndUpdate(schoolID, { phone }, { new: true });
            return res.status(201).json({
                message: "school phone number changes successfully",
                data: verified,
            });
        }
        else {
            return res.status(404).json({
                message: "error finding school",
                data: school,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error verifying school",
        });
    }
};
exports.changeSchoolPhoneNumber = changeSchoolPhoneNumber;
const changeSchoolPersonalName = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const { name, name2 } = req.body;
        const school = await schoolModel_1.default.findById(schoolID);
        if (school) {
            const verified = await schoolModel_1.default.findByIdAndUpdate(schoolID, { name, name2 }, { new: true });
            return res.status(201).json({
                message: "school name changes successfully",
                data: verified,
            });
        }
        else {
            return res.status(404).json({
                message: "error finding school",
                data: school,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error verifying school",
        });
    }
};
exports.changeSchoolPersonalName = changeSchoolPersonalName;
// school Image/Logo
const updateSchoolAvatar = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const school = await schoolModel_1.default.findById(schoolID);
        if (school) {
            const { secure_url, public_id } = await (0, streamifier_1.streamUpload)(req);
            const updatedSchool = await schoolModel_1.default.findByIdAndUpdate(schoolID, {
                avatar: secure_url,
                avatarID: public_id,
            }, { new: true });
            return res.status(200).json({
                message: "school avatar has been, added",
                data: updatedSchool,
                status: 201,
            });
        }
        else {
            return res.status(404).json({
                message: "Something went wrong",
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating user",
        });
    }
};
exports.updateSchoolAvatar = updateSchoolAvatar;
const updateSchoolStamp = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const school = await schoolModel_1.default.findById(schoolID);
        if (school) {
            const { secure_url, public_id } = await (0, streamifier_1.streamUpload)(req);
            const updatedSchool = await schoolModel_1.default.findByIdAndUpdate(schoolID, {
                stamp: secure_url,
                stampID: public_id,
            }, { new: true });
            return res.status(200).json({
                message: "school stamp has been, added",
                data: updatedSchool,
                status: 201,
            });
        }
        else {
            return res.status(404).json({
                message: "Something went wrong",
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating user",
        });
    }
};
exports.updateSchoolStamp = updateSchoolStamp;
// school shool has started
const updateSchoolSignature = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const school = await schoolModel_1.default.findById(schoolID);
        if (school) {
            const { secure_url, public_id } = await (0, streamifier_1.streamUpload)(req);
            const updatedSchool = await schoolModel_1.default.findByIdAndUpdate(schoolID, {
                signature: secure_url,
                signatureID: public_id,
            }, { new: true });
            return res.status(200).json({
                message: "school signature has been, added",
                data: updatedSchool,
                status: 201,
            });
        }
        else {
            return res.status(404).json({
                message: "Something went wrong",
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating user",
        });
    }
};
exports.updateSchoolSignature = updateSchoolSignature;
// school shool has started
const updateSchoolStartPossition = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const school = await schoolModel_1.default.findById(schoolID);
        if (school.schoolName) {
            const updatedSchool = await schoolModel_1.default.findByIdAndUpdate(schoolID, {
                started: true,
            }, { new: true });
            return res.status(200).json({
                message: "school has started, operation",
                data: updatedSchool,
            });
        }
        else {
            return res.status(404).json({
                message: "Something went wrong",
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating user",
        });
    }
};
exports.updateSchoolStartPossition = updateSchoolStartPossition;
// school school Account info
const updateSchoolAccountDetail = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const { bankDetails } = req.body;
        const school = await schoolModel_1.default.findById(schoolID);
        if (school.schoolName) {
            const updatedSchool = await schoolModel_1.default.findByIdAndUpdate(schoolID, {
                bankDetails,
            }, { new: true });
            return res.status(200).json({
                message: "school account detail updated successfully",
                data: updatedSchool,
            });
        }
        else {
            return res.status(404).json({
                message: "Something went wrong",
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error updating account details",
        });
    }
};
exports.updateSchoolAccountDetail = updateSchoolAccountDetail;
// school school Team/Resumption info
const updateSchoolTeamData = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const { SchoolTeamResumption, SchoolTeamCloses, NumberOfDays } = req.body;
        const school = await schoolModel_1.default.findById(schoolID);
        if (school.schoolName) {
            const updatedSchool = await schoolModel_1.default.findByIdAndUpdate(schoolID, {
                SchoolTeamResumption,
                SchoolTeamCloses,
                NumberOfDays,
            }, { new: true });
            return res.status(200).json({
                message: "school account detail updated successfully",
                data: updatedSchool,
            });
        }
        else {
            return res.status(404).json({
                message: "Something went wrong",
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error updating account details",
        });
    }
};
exports.updateSchoolTeamData = updateSchoolTeamData;
const updateSchoolPaymentOptions = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const { paymentDetails, paymentAmount } = req.body;
        let id = crypto_1.default.randomBytes(4).toString("hex");
        const school = await schoolModel_1.default.findById(schoolID);
        if (school.schoolName) {
            const updatedSchool = await schoolModel_1.default.findByIdAndUpdate(schoolID, {
                paymentOptions: [
                    ...school?.paymentOptions,
                    { id, paymentDetails, paymentAmount },
                ],
            }, { new: true });
            return res.status(201).json({
                message: "school account detail updated successfully",
                data: updatedSchool,
                status: 201,
            });
        }
        else {
            return res.status(404).json({
                message: "Something went wrong",
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error updating account details",
        });
    }
};
exports.updateSchoolPaymentOptions = updateSchoolPaymentOptions;
const RemoveSchoolPaymentOptions = async (req, res) => {
    try {
        const { schoolID, refID } = req.params;
        const { paymentDetails, paymentAmount } = req.body;
        let id = crypto_1.default.randomBytes(4).toString("hex");
        const school = await schoolModel_1.default.findById(schoolID);
        const mainOption = school?.paymentOptions.filter((el) => {
            return el?.id !== refID;
        });
        if (school.schoolName) {
            const updatedSchool = await schoolModel_1.default.findByIdAndUpdate(schoolID, {
                paymentOptions: mainOption,
            }, { new: true });
            return res.status(201).json({
                message: "school account detail updated successfully",
                data: updatedSchool,
                status: 201,
            });
        }
        else {
            return res.status(404).json({
                message: "Something went wrong",
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error updating account details",
        });
    }
};
exports.RemoveSchoolPaymentOptions = RemoveSchoolPaymentOptions;
const updateAdminCode = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const { adminCode } = req.body;
        const school = await schoolModel_1.default.findById(schoolID);
        // const adminCode = crypto.randomBytes(6).toString("hex");
        if (school.schoolName) {
            const updatedSchoolAdminCode = await schoolModel_1.default.findByIdAndUpdate(schoolID, {
                adminCode,
            }, { new: true });
            return res.status(200).json({
                message: "school admin code has been updated successfully",
                data: updatedSchoolAdminCode,
            });
        }
        else {
            return res.status(404).json({
                message: "Something went wrong",
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error updating admin code details",
        });
    }
};
exports.updateAdminCode = updateAdminCode;
const changeSchoolEnrollmentID = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const { currentEnrollmentID, newEnrollmentID } = req.body;
        if (!currentEnrollmentID || !newEnrollmentID) {
            return res.status(400).json({
                message: "Please provide both present and new Enrollment ID",
                status: 400,
            });
        }
        const school = await schoolModel_1.default.findById(schoolID);
        if (!school) {
            return res.status(404).json({
                message: "School not found",
                status: 404,
            });
        }
        if (school.enrollmentID !== currentEnrollmentID) {
            return res.status(400).json({
                message: "Present Enrollment ID is incorrect",
                status: 400,
            });
        }
        const updatedSchool = await schoolModel_1.default.findByIdAndUpdate(schoolID, {
            enrollmentID: newEnrollmentID,
        }, { new: true });
        return res.status(201).json({
            message: "Enrollment ID updated successfully",
            data: updatedSchool,
            status: 201,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Error updating enrollment ID",
            error: error?.message,
            status: 500,
        });
    }
};
exports.changeSchoolEnrollmentID = changeSchoolEnrollmentID;
const updateSchoolName = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const { schoolName } = req.body;
        const school = await schoolModel_1.default.findById(schoolID);
        if (school.schoolName) {
            const updatedSchool = await schoolModel_1.default.findByIdAndUpdate(schoolID, {
                schoolName,
            }, { new: true });
            return res.status(200).json({
                message: "school name has been updated successfully",
                data: updatedSchool,
            });
        }
        else {
            return res.status(404).json({
                message: "Something went wrong",
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error updating account details",
        });
    }
};
exports.updateSchoolName = updateSchoolName;
const updateRegisterationStatus = async (req, res) => {
    try {
        const { schoolName, email, schoolPhoneNumber, schoolCategory, schoolLocation, schoolOrganization, } = req.body;
        const school = await schoolModel_1.default.findOne({ email });
        // const id = crypto.randomBytes(4).toString("hex");
        // const adminCode = crypto.randomBytes(6).toString("hex");
        // if (school) {
        const updatedSchool = await schoolModel_1.default.findByIdAndUpdate(school?._id, {
            // adminCode,
            // enrollmentID: id,
            status: "school-admin",
            schoolName,
            email,
            phone: schoolPhoneNumber,
            categoryType: schoolCategory,
            address: schoolLocation,
            organizationType: schoolOrganization,
        }, { new: true });
        return res.status(201).json({
            message: "school detail has been updated successfully",
            data: updatedSchool,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error updating account details",
            error: error,
        });
    }
};
exports.updateRegisterationStatus = updateRegisterationStatus;
// export const approvedRegisteration = async (req: any, res: Response) => {
//   try {
//     const { email } = req.body;
//     const school: any = await schoolModel.findOne({ email });
//     if (school) {
//       const updatedSchool = await schoolModel.findByIdAndUpdate(
//         school?._id,
//         {
//           started: true,
//         },
//         { new: true }
//       );
//       verifiedEmail(school);
//       return res.status(200).json({
//         message: "school Has Approved",
//         data: updatedSchool,
//         status: 201,
//       });
//     } else {
//       return res.status(404).json({
//         message: "Something went wrong",
//       });
//     }
//   } catch (error) {
//     return res.status(404).json({
//       message: "Error updating account details",
//     });
//   }
// };
const getSchoolRegistered = async (req, res) => {
    try {
        const school = await schoolModel_1.default.find();
        return res.status(200).json({
            message: "school Has Approved",
            data: school,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error updating account details",
        });
    }
};
exports.getSchoolRegistered = getSchoolRegistered;
const approveRegistration = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const { email } = req.body;
        const school = await schoolModel_1.default.findById(schoolID);
        if (school) {
            const updatedSchool = await schoolModel_1.default.findByIdAndUpdate(school._id, {
                started: true,
                verify: true,
            }, { new: true });
            await (0, email_1.verifiedEmail)(school);
            return res.status(200).json({
                message: "School has been approved",
                data: updatedSchool,
                status: 200,
            });
        }
        else {
            return res.status(404).json({
                message: "School not found",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error approving registration",
            error: error.message,
        });
    }
};
exports.approveRegistration = approveRegistration;
const changeSchoolTag = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const { schoolTags } = req.body;
        const school = await schoolModel_1.default.findById(schoolID);
        if (school) {
            const verified = await schoolModel_1.default.findByIdAndUpdate(schoolID, { schoolTags }, { new: true });
            return res.status(201).json({
                message: "school verified successfully",
                data: verified,
            });
        }
        else {
            return res.status(404).json({
                message: "error finding school",
                data: school,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error verifying school",
        });
    }
};
exports.changeSchoolTag = changeSchoolTag;
const createSchoolTimetableRecord = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const { startBreak, startClass, endClass, endBreak, peroid } = req.body;
        const school = await schoolModel_1.default.findById(schoolID);
        const timeStructure = (startTime, endTime, interval) => {
            const timeSlots = [];
            let [startHour, startMinute] = startTime.split(":").map(Number);
            let [endHour, endMinute] = endTime.split(":").map(Number);
            // Convert everything to minutes
            let currentMinutes = startHour * 60 + startMinute;
            const endMinutes = endHour * 60 + endMinute;
            while (currentMinutes < endMinutes) {
                // Calculate start time
                let startHours = Math.floor(currentMinutes / 60);
                let startMinutes = currentMinutes % 60;
                // Increment current time by interval (40 minutes)
                currentMinutes += interval;
                // Calculate end time
                let endHours = Math.floor(currentMinutes / 60);
                let endMinutes = currentMinutes % 60;
                // Convert to 12-hour format with AM/PM for both start and end
                const startPeriod = startHours >= 12 ? "PM" : "AM";
                startHours = startHours % 12 || 12; // Handle 12-hour format
                const endPeriod = endHours >= 12 ? "PM" : "AM";
                endHours = endHours % 12 || 12;
                // Format the times and push to the result
                const startFormatted = `${startHours
                    .toString()
                    .padStart(2, "0")}:${startMinutes
                    .toString()
                    .padStart(2, "0")}${startPeriod}`;
                const endFormatted = `${endHours
                    .toString()
                    .padStart(2, "0")}:${endMinutes
                    .toString()
                    .padStart(2, "0")}${endPeriod}`;
                timeSlots.push(`${startFormatted} - ${endFormatted}`);
            }
            return timeSlots;
        };
        const startPeriod = parseInt(startBreak) >= 12 ? "PM" : "AM";
        const endPeriod = parseInt(endBreak) >= 12 ? "PM" : "AM";
        if (school) {
            const classStructure = await schoolModel_1.default.findByIdAndUpdate(schoolID, {
                startBreak,
                startClass,
                endClass,
                endBreak,
                peroid,
                timeTableStructure: timeStructure(startClass, startBreak, parseInt(peroid)).concat(`${startBreak}${startPeriod} - ${endBreak}${endPeriod}`, timeStructure(endBreak, endClass, parseInt(peroid))),
            }, { new: true });
            return res.status(201).json({
                message: "school time-table structure created successfully",
                data: classStructure,
                status: 201,
            });
        }
        else {
            return res.status(404).json({
                message: "error finding school",
                data: school,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school timetable",
        });
    }
};
exports.createSchoolTimetableRecord = createSchoolTimetableRecord;
const updateSchoolSMS = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const { sendSMS } = req.body;
        const school = await schoolModel_1.default.findByIdAndUpdate(schoolID, { sendSMS }, { new: true });
        return res.status(201).json({
            message: "School SMS Notification status updated",
            data: school,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error updating school SMS Notification status",
            data: error.message,
        });
    }
};
exports.updateSchoolSMS = updateSchoolSMS;
const updateClassTeacherGrading = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const { allowClassTeacherGrading } = req.body;
        const school = await schoolModel_1.default.findByIdAndUpdate(schoolID, { allowClassTeacherGrading }, { new: true });
        return res.status(201).json({
            message: "School Class Teacher Grading status updated",
            data: school,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error updating school Class Teacher Grading status",
            data: error.message,
        });
    }
};
exports.updateClassTeacherGrading = updateClassTeacherGrading;
