import { Request } from "express";
import { Types } from "mongoose";
import classroomModel from "../model/classroomModel";
import schoolModel from "../model/schoolModel";
import staffModel from "../model/staffModel";
import subjectModel from "../model/subjectModel";

export interface AssessmentContext {
  actorID: string;
  schoolID: string;
  classroom: any;
  subject: any;
}

const referenceID = (value: any): string => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (value instanceof Types.ObjectId) return value.toString();
  return String(value._id || value.id || "");
};

export const getAssessmentContext = async (
  req: Request,
  subjectID: string
): Promise<AssessmentContext | null> => {
  const session = (req as any).session;
  const deny = (reason: string): null => {
    console.warn("[assessment-access] denied", {
      reason,
      actorID: referenceID(session?.isSchoolID),
      subjectID,
      path: req.path,
    });
    return null;
  };
  if (!session?.isAuth || !session?.isSchoolID) return deny("missing-session");

  const actorID = referenceID(session.isSchoolID);
  if (!Types.ObjectId.isValid(actorID) || !Types.ObjectId.isValid(subjectID)) {
    return deny("invalid-id");
  }

  const [schoolAdmin, staff, subject] = await Promise.all([
    schoolModel.findById(actorID),
    staffModel.findById(actorID),
    subjectModel.findById(subjectID),
  ]);
  if (!subject) return deny("subject-not-found");

  const isSchoolAdmin =
    Boolean(schoolAdmin?.schoolName) && schoolAdmin?.status === "school-admin";
  const schoolID = isSchoolAdmin
    ? actorID
    : referenceID(staff?.schoolIDs || staff?.school);
  if (!schoolID) return deny("school-not-resolved");
  const school = isSchoolAdmin
    ? schoolAdmin
    : await schoolModel.findById(schoolID);
  if (!school || school.status !== "school-admin" || !school.schoolName) {
    return deny("school-not-found");
  }

  const schoolSubjectIDs = (school.subjects || [])
    .map(referenceID)
    .filter(Boolean);
  const subjectOwnedBySchool =
    schoolSubjectIDs.includes(subjectID) ||
    referenceID(subject.school) === schoolID;

  const schoolClassroomIDs = (school.classRooms || [])
    .map(referenceID)
    .filter(Boolean);
  const classrooms = await classroomModel.find({
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
    (subject.classDetails as { _id?: unknown } | undefined)?._id,
  ]
    .map(referenceID)
    .filter(Boolean);
  const subjectClassroom = classrooms.find((candidate) => {
    const classroomID = referenceID(candidate._id);
    return (
      subjectClassIDs.includes(classroomID) ||
      (candidate.classSubjects || []).some(
        (classSubject: any) => referenceID(classSubject) === subjectID
      )
    );
  });
  const classDetails = subject.classDetails as
    | { _id?: unknown; className?: string }
    | undefined;
  const designatedClassName = subject.designated || classDetails?.className;
  const designatedClassroom =
    subjectOwnedBySchool && !subjectClassroom && designatedClassName
      ? classrooms.find(
          (candidate) => candidate.className === designatedClassName
        )
      : undefined;
  const authorizedClassroom = subjectClassroom || designatedClassroom;

  if (!subjectOwnedBySchool && !authorizedClassroom) {
    return deny("subject-not-linked-to-school");
  }
  if (!authorizedClassroom) return deny("class-not-linked-to-subject");

  if (!isSchoolAdmin) {
    if (
      !staff ||
      referenceID(staff.schoolIDs || staff.school) !== schoolID
    ) {
      return deny("staff-school-mismatch");
    }

    const assignedClass = referenceID(authorizedClassroom.teacherID) === actorID ||
      (staff.classesAssigned || []).some((assignment: any) =>
        referenceID(assignment?.classID) === referenceID(authorizedClassroom._id) ||
        assignment?.className === authorizedClassroom.className
      );
    const assignedSubject = referenceID(subject.teacherID) === actorID ||
      (staff.subjectAssigned || []).some((assignment: any) =>
        referenceID(assignment?.id || assignment?._id) === referenceID(subject._id)
      );

    if (!assignedClass && !assignedSubject) return deny("staff-not-assigned");
  }

  return { actorID, schoolID, classroom: authorizedClassroom, subject };
};
