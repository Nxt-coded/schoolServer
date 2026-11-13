"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAssessmentContext = void 0;
const mongoose_1 = require("mongoose");
const classroomModel_1 = __importDefault(require("../model/classroomModel"));
const schoolModel_1 = __importDefault(require("../model/schoolModel"));
const staffModel_1 = __importDefault(require("../model/staffModel"));
const subjectModel_1 = __importDefault(require("../model/subjectModel"));
const referenceID = (value) => {
    if (!value)
        return "";
    if (typeof value === "string")
        return value;
    if (value instanceof mongoose_1.Types.ObjectId)
        return value.toString();
    return String(value._id || value.id || "");
};
const getAssessmentContext = async (req, subjectID) => {
    const session = req.session;
    const deny = (reason) => {
        console.warn("[assessment-access] denied", {
            reason,
            actorID: referenceID(session?.isSchoolID),
            subjectID,
            path: req.path,
        });
        return null;
    };
    if (!session?.isAuth || !session?.isSchoolID)
        return deny("missing-session");
    const actorID = referenceID(session.isSchoolID);
    if (!mongoose_1.Types.ObjectId.isValid(actorID) || !mongoose_1.Types.ObjectId.isValid(subjectID)) {
        return deny("invalid-id");
    }
    const [schoolAdmin, staff, subject] = await Promise.all([
        schoolModel_1.default.findById(actorID),
        staffModel_1.default.findById(actorID),
        subjectModel_1.default.findById(subjectID),
    ]);
    if (!subject)
        return deny("subject-not-found");
    const isSchoolAdmin = Boolean(schoolAdmin?.schoolName) && schoolAdmin?.status === "school-admin";
    const schoolID = isSchoolAdmin
        ? actorID
        : referenceID(staff?.schoolIDs || staff?.school);
    if (!schoolID)
        return deny("school-not-resolved");
    const school = isSchoolAdmin
        ? schoolAdmin
        : await schoolModel_1.default.findById(schoolID);
    if (!school || school.status !== "school-admin" || !school.schoolName) {
        return deny("school-not-found");
    }
    const schoolSubjectIDs = (school.subjects || [])
        .map(referenceID)
        .filter(Boolean);
    const subjectOwnedBySchool = schoolSubjectIDs.includes(subjectID) ||
        referenceID(subject.school) === schoolID;
    const schoolClassroomIDs = (school.classRooms || [])
        .map(referenceID)
        .filter(Boolean);
    const classrooms = await classroomModel_1.default.find({
        $or: [
            { schoolIDs: schoolID },
            { school: schoolID },
            { _id: { $in: schoolClassroomIDs } },
        ],
    });
    const subjectClassIDs = [
        subject.subjectClassID,
        subject.subjectClassIDs,
        subject.classID,
        subject.class,
        subject.classDetails?._id,
    ]
        .map(referenceID)
        .filter(Boolean);
    const subjectClassroom = classrooms.find((candidate) => {
        const classroomID = referenceID(candidate._id);
        return (subjectClassIDs.includes(classroomID) ||
            (candidate.classSubjects || []).some((classSubject) => referenceID(classSubject) === subjectID));
    });
    const classDetails = subject.classDetails;
    const designatedClassName = subject.designated || classDetails?.className;
    const designatedClassroom = subjectOwnedBySchool && !subjectClassroom && designatedClassName
        ? classrooms.find((candidate) => candidate.className === designatedClassName)
        : undefined;
    const authorizedClassroom = subjectClassroom || designatedClassroom;
    if (!subjectOwnedBySchool && !authorizedClassroom) {
        return deny("subject-not-linked-to-school");
    }
    if (!authorizedClassroom)
        return deny("class-not-linked-to-subject");
    if (!isSchoolAdmin) {
        if (!staff ||
            referenceID(staff.schoolIDs || staff.school) !== schoolID) {
            return deny("staff-school-mismatch");
        }
        const assignedClass = referenceID(authorizedClassroom.teacherID) === actorID ||
            (staff.classesAssigned || []).some((assignment) => referenceID(assignment?.classID) === referenceID(authorizedClassroom._id) ||
                assignment?.className === authorizedClassroom.className);
        const assignedSubject = referenceID(subject.teacherID) === actorID ||
            (staff.subjectAssigned || []).some((assignment) => referenceID(assignment?.id || assignment?._id) === referenceID(subject._id));
        if (!assignedClass && !assignedSubject)
            return deny("staff-not-assigned");
    }
    return { actorID, schoolID, classroom: authorizedClassroom, subject };
};
exports.getAssessmentContext = getAssessmentContext;
