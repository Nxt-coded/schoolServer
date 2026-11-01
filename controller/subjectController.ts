import { Request, Response } from "express";
import schoolModel from "../model/schoolModel";
import subjectModel from "../model/subjectModel";
import { Types } from "mongoose";
import staffModel from "../model/staffModel";
import classroomModel from "../model/classroomModel";

import csv from "csvtojson";
import fs from "node:fs";
import path from "node:path";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const getReferenceID = (value: unknown): string => {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  if (value instanceof Types.ObjectId) {
    return value.toString();
  }
  if (isRecord(value) && value._id) {
    return getReferenceID(value._id);
  }
  return "";
};

const getSubjectAssignmentID = (value: unknown): string => {
  if (isRecord(value)) {
    return getReferenceID(value.id || value._id);
  }
  return getReferenceID(value);
};

export const createSchoolSubject = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;
    const { classID, designated, subjectTeacherName } = req.body;
    const subjectTitle =
      typeof req.body.subjectTitle === "string"
        ? req.body.subjectTitle.trim()
        : "";

    if (!subjectTitle) {
      return res.status(400).json({
        message: "Subject title is required",
        status: 400,
      });
    }

    const school = await schoolModel.findById(schoolID);
    if (!school || !school.schoolName || school.status !== "school-admin") {
      return res.status(404).json({
        message: "unable to read school",
        status: 404,
      });
    }

    const classroom = classID
      ? await classroomModel.findOne({ _id: classID, schoolIDs: schoolID })
      : await classroomModel.findOne({
          schoolIDs: schoolID,
          className: designated,
        });

    if (!classroom) {
      return res.status(404).json({
        message: "Error finding school classroom",
        status: 404,
      });
    }

    const classroomID = classroom._id.toString();
    const linkedSubjects = await subjectModel
      .find({
        $or: [
          { subjectClassID: classroomID },
          { subjectClassIDs: classroomID },
          { _id: { $in: classroom.classSubjects } },
        ],
      })
      .select("subjectTitle");

    const isDuplicate = linkedSubjects.some(
      (subject) =>
        subject.subjectTitle?.trim().toLowerCase() ===
        subjectTitle.toLowerCase()
    );

    if (isDuplicate) {
      return res.status(409).json({
        message: "duplicate subject",
        status: 409,
      });
    }

    const subjects = await subjectModel.create({
      schoolName: school.schoolName,
      subjectTeacherName,
      subjectTitle,
      designated: classroom.className,
      classDetails: classroom,
      subjectClassID: classroom._id,
      subjectClassIDs: classroom._id,
    });

    school.subjects.push(new Types.ObjectId(subjects._id));
    classroom.classSubjects.push(new Types.ObjectId(subjects._id));
    await Promise.all([school.save(), classroom.save()]);

    return res.status(201).json({
      message: "subjects created successfully",
      data: subjects,
      status: 201,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error creating school session",
      status: 404,
    });
  }
};

export const createBulkClassSubjects = async (
  req: Request | any,
  res: Response
): Promise<Response> => {
  console.log("POST /api/create-bulk-subject hit", { schoolID: req.params.schoolID });
  try {
    const { schoolID } = req.params;

    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
        status: 400,
      });
    }

    const school = await schoolModel.findById(schoolID).populate("subjects");
    if (!school || school.status !== "school-admin") {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(404).json({
        message: "Unable to read school or unauthorized",
        status: 404,
      });
    }

    const classrooms = await classroomModel.find({ schoolIDs: schoolID });
    const classroomCache = new Map(
      classrooms.map((c) => [c.className?.trim(), c])
    );

    const data = await csv().fromFile(req.file.path);
    const existingSubjectKeys = new Set(
      school.subjects.map((s: any) => `${s.subjectTitle}-${s.designated}`)
    );

    let createdCount = 0;
    let skipCount = 0;
    const errors: string[] = [];
    const newSubjectIds: Types.ObjectId[] = [];
    const classSubjectUpdates = new Map<string, Types.ObjectId[]>();

    for (let i of data) {
      // Clean and normalize input
      const subjectTitle = i?.subjectTitle?.trim();
      let subjectTeacherName = (i?.subjectTeacherName || i?.subjectTeacher)?.trim() || "";
      let designated = i?.designated?.trim() || "";

      // Skip completely empty rows
      if (!subjectTitle && !subjectTeacherName && !designated) {
        continue;
      }

      if (!subjectTitle) {
        errors.push("Missing subjectTitle in row");
        continue;
      }

      // ROBUSTNESS: Handle case where user swapped columns B and C
      // designated should be the class name (exists in classroomCache)
      let targetClassroom = classroomCache.get(designated);

      // If designated is NOT a class, but subjectTeacherName IS a class, they are likely swapped
      if (!targetClassroom && classroomCache.has(subjectTeacherName)) {
        const temp = designated;
        designated = subjectTeacherName;
        subjectTeacherName = temp;
        targetClassroom = classroomCache.get(designated);
      }

      if (!targetClassroom) {
        errors.push(
          `Classroom not found for '${designated || "N/A"}' (row Subject: ${subjectTitle})`
        );
        continue;
      }

      const key = `${subjectTitle}-${designated}`;
      if (existingSubjectKeys.has(key)) {
        skipCount++;
        continue;
      }

      try {
        // Teacher lookup and assignment logic
        let teacherID = "";
        if (subjectTeacherName) {
          const teacher = await staffModel.findOne({
            staffName: subjectTeacherName,
            schoolIDs: schoolID,
          });
          if (teacher) {
            teacherID = teacher._id as string;
          } else {
            // Optional: log that teacher was not found, but proceed with creating subject
            // errors.push(`Teacher '${subjectTeacherName}' not found in this school list`);
          }
        }

        const subjects = await subjectModel.create({
          schoolName: school.schoolName,
          subjectTeacherName: subjectTeacherName,
          teacherID: teacherID, // Link teacher ID if found
          subjectTitle: subjectTitle,
          designated: designated,
          classDetails: targetClassroom,
          subjectClassID: targetClassroom._id,
          subjectClassIDs: targetClassroom._id,
        });

        // Update staff record if teacher was found
        if (teacherID) {
          await staffModel.findByIdAndUpdate(
            teacherID,
            {
              $push: {
                subjectAssigned: {
                  title: subjects.subjectTitle,
                  id: subjects._id,
                  classMeant: subjects.designated,
                  classID: targetClassroom._id, // linking to class ID
                },
              },
            },
            { new: true }
          );
        }

        const subId = new Types.ObjectId(subjects._id);
        newSubjectIds.push(subId);
        
        const classIdStr = targetClassroom._id.toString();
        if (!classSubjectUpdates.has(classIdStr)) {
          classSubjectUpdates.set(classIdStr, []);
        }
        classSubjectUpdates.get(classIdStr)!.push(subId);

        existingSubjectKeys.add(key);
        createdCount++;
      } catch (err: any) {
        errors.push(`Error creating subject '${subjectTitle}': ${err?.message || err}`);
      }
    }

    // Update school subjects
    if (newSubjectIds.length > 0) {
      await schoolModel.findByIdAndUpdate(schoolID, {
        $push: { subjects: { $each: newSubjectIds } },
      });

      // Update classrooms (batch by ID)
      for (const [classId, subIds] of classSubjectUpdates.entries()) {
        await classroomModel.findByIdAndUpdate(classId, {
          $push: { classSubjects: { $each: subIds } },
        });
      }
    }

    // Clean up file safely
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

    const resultMessage = `Process complete. Created: ${createdCount}, Skipped: ${skipCount}${errors.length > 0 ? `, Errors: ${errors.length}` : ""}`;

    return res.status(201).json({
      message: resultMessage,
      status: 201,
      summary: { created: createdCount, skipped: skipCount, errors },
    });
  } catch (error: any) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    return res.status(500).json({
      message: "Error processing bulk subject upload",
      data: error.message,
      status: 500,
    });
  }
};


export const updateSchoolSubjectTitle = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID, subjectID } = req.params;
    const { subjectTitle } = req.body;

    const school = await schoolModel.findById(schoolID);

    if (school && school.schoolName && school.status === "school-admin") {
      const subjects = await subjectModel.findByIdAndUpdate(
        subjectID,
        {
          subjectTitle,
        },
        { new: true }
      );

      return res.status(201).json({
        message: "subjects title updated successfully",
        data: subjects,
        status: 201,
      });
    } else {
      return res.status(404).json({
        message: "unable to read school",
        status: 404,
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error creating school session",
      status: 404,
    });
  }
};

export const updateSchoolSubjectTeacher = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID, subjectID } = req.params;
    const { subjectTeacherID, subjectTeacherName } = req.body;
    const school = await schoolModel.findById(schoolID);
    if (!school || !school.schoolName || school.status !== "school-admin") {
      return res.status(404).json({
        message: "unable to read school",
        status: 404,
      });
    }

    const isSchoolSubject = (school.subjects || []).some(
      (schoolSubject) => getReferenceID(schoolSubject) === subjectID
    );
    const subject = isSchoolSubject
      ? await subjectModel.findById(subjectID)
      : null;

    if (!subject) {
      return res.status(404).json({
        message: "Subject not found in this school",
        status: 404,
      });
    }

    const schoolStaffIDs = (school.staff || []).map(getReferenceID).filter(Boolean);
    const schoolClassroomIDs = (school.classRooms || [])
      .map(getReferenceID)
      .filter(Boolean);
    const schoolStaffFilter = {
      $or: [{ schoolIDs: schoolID }, { _id: { $in: schoolStaffIDs } }],
    };
    const schoolClassroomFilter = {
      $or: [
        { schoolIDs: schoolID },
        { _id: { $in: schoolClassroomIDs } },
      ],
    };
    const nextTeacher = subjectTeacherID
      ? await staffModel.findOne({ _id: subjectTeacherID, ...schoolStaffFilter })
      : subjectTeacherName
        ? await staffModel.findOne({
            staffName: subjectTeacherName,
            ...schoolStaffFilter,
          })
        : null;

    if (!nextTeacher) {
      return res.status(404).json({
        message: "Unable to find school teacher",
        status: 404,
      });
    }

    const classID =
      subject.subjectClassID ||
      subject.subjectClassIDs ||
      subject.classID ||
      getReferenceID(
        isRecord(subject.classDetails) ? subject.classDetails._id : undefined
      );
    const classroom =
      (classID
        ? await classroomModel.findOne({ _id: classID, ...schoolClassroomFilter })
        : null) ||
      (subject.designated
        ? await classroomModel.findOne({
            className: subject.designated,
            ...schoolClassroomFilter,
          })
        : null);

    if (!classroom) {
      return res.status(404).json({
        message: "Unable to find the subject's classroom",
        status: 404,
      });
    }

    const currentTeacherID = subject.teacherID?.toString();
    const currentTeacher = currentTeacherID
      ? await staffModel.findOne({ _id: currentTeacherID, ...schoolStaffFilter })
      : subject.subjectTeacherName
        ? await staffModel.findOne({
            staffName: subject.subjectTeacherName,
            ...schoolStaffFilter,
          })
        : null;

    const subjectAssignmentID = subject._id.toString();
    const nextAssignments = (nextTeacher.subjectAssigned || []).filter(
      (assignment) => getSubjectAssignmentID(assignment) !== subjectAssignmentID
    );
    nextAssignments.push({
      title: subject.subjectTitle,
      id: subjectAssignmentID,
      classMeant: classroom.className,
      classID: classroom._id.toString(),
    });

    if (currentTeacher && String(currentTeacher._id) !== String(nextTeacher._id)) {
      currentTeacher.subjectAssigned = (currentTeacher.subjectAssigned || []).filter(
        (assignment) => getSubjectAssignmentID(assignment) !== subjectAssignmentID
      );
      await currentTeacher.save();
    }

    const updatedSubject = await subjectModel.findByIdAndUpdate(
      subject._id,
      {
        subjectTeacherName: nextTeacher.staffName,
        teacherID: nextTeacher._id.toString(),
        subjectClassID: classroom._id.toString(),
        subjectClassIDs: classroom._id.toString(),
        classID: classroom._id.toString(),
        designated: classroom.className,
      },
      { new: true }
    );

    nextTeacher.subjectAssigned = nextAssignments;
    await nextTeacher.save();

    return res.status(201).json({
      message: "Subject teacher assigned successfully",
      data: updatedSubject,
      status: 201,
    });
  } catch (error) {
    console.error("Error updating school subject teacher:", error);
    return res.status(500).json({
      message: "Error updating school subject to Teacher",
      status: 500,
    });
  }
};

export const viewSchoolSubjects = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;

    const schoolSubject = await schoolModel.findById(schoolID).populate({
      path: "subjects",
      options: {
        sort: {
          createdAt: -1,
        },
      },
    });

    return res.status(200).json({
      message: "School Subject found",
      status: 200,
      data: schoolSubject,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error creating school session",
      status: 404,
    });
  }
};

export const deleteSchoolSubject = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID, subjectID } = req.params;
    const school = await schoolModel.findById(schoolID);

    if (school && school.schoolName && school.status === "school-admin") {
      const isSchoolSubject = (school.subjects || []).some(
        (schoolSubject: any) =>
          String(schoolSubject?._id || schoolSubject) === subjectID
      );
      const subject = isSchoolSubject
        ? await subjectModel.findById(subjectID)
        : null;

      if (!subject) {
        return res.status(404).json({
          message: "Subject not found in this school",
          status: 404,
        });
      }

      school.subjects = (school.subjects || []).filter(
        (schoolSubject: any) =>
          String(schoolSubject?._id || schoolSubject) !== subjectID
      );

      const teachers = await staffModel.find({ schoolIDs: schoolID });
      const teacherUpdates = teachers
        .filter((teacher) =>
          (teacher.subjectAssigned || []).some(
            (assignment: any) =>
              String(assignment?.id || assignment?._id) === subjectID
          )
        )
        .map((teacher) => {
          teacher.subjectAssigned = (teacher.subjectAssigned || []).filter(
            (assignment: any) =>
              String(assignment?.id || assignment?._id) !== subjectID
          );
          return teacher.save();
        });

      await Promise.all([
        school.save(),
        classroomModel.updateMany(
          { schoolIDs: schoolID },
          { $pull: { classSubjects: subject._id } }
        ),
        ...teacherUpdates,
      ]);

      await subjectModel.findByIdAndDelete(subject._id);

      return res.status(201).json({
        message: "Subject deleted successfully",
        data: subject,
        status: 201,
      });
    } else {
      return res.status(404).json({
        message: "unable to read school",
        status: 404,
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error cdeleting subject",
      status: 404,
    });
  }
};

export const viewSubjectDetail = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { subjectID } = req.params;

    const subject = await subjectModel.findById(subjectID);

    return res.status(200).json({
      message: "Subject found",
      status: 200,
      data: subject,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error creating subject session",
      status: 404,
    });
  }
};

export const removeSubjectFromTeacher = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID, teacherID, subjectID } = req.params;

    // Validate required params
    if (!schoolID || !teacherID || !subjectID) {
      return res.status(400).json({
        message: "schoolID, teacherID and subjectID are required",
        status: 400,
      });
    }

    // Find school and verify admin status
    const school = await schoolModel.findById(schoolID);
    if (!school || !school.schoolName || school.status !== "school-admin") {
      return res.status(404).json({
        message: "School not found or not authorized",
        status: 404,
      });
    }

    // Find teacher
    const teacher = await staffModel.findById(teacherID);
    if (!teacher) {
      return res.status(404).json({
        message: "Teacher not found",
        status: 404,
      });
    }

    // Find subject
    const subject = await subjectModel.findById(subjectID);
    if (!subject) {
      return res.status(404).json({
        message: "Subject not found",
        status: 404,
      });
    }

    // Verify the subject is actually assigned to this teacher
    const hasSubject = teacher.subjectAssigned?.some(
      (el: any) => el.id.toString() === subjectID
    );

    if (!hasSubject) {
      return res.status(400).json({
        message: "Subject is not assigned to this teacher",
        status: 400,
      });
    }

    // Remove subject from teacher's assignments
    const updatedAssignments = (teacher.subjectAssigned || []).filter(
      (el: any) => el.id.toString() !== subjectID
    );

    // Update both teacher and subject atomically
    const [updatedTeacher, updatedSubject] = await Promise.all([
      staffModel.findByIdAndUpdate(
        teacherID,
        {
          subjectAssigned: updatedAssignments,
        },
        { new: true }
      ),
      subjectModel.findByIdAndUpdate(
        subjectID,
        {
          subjectTeacherName: "",
          teacherID: null, // use null instead of empty string for ID field
        },
        { new: true }
      ),
    ]);

    if (!updatedTeacher || !updatedSubject) {
      return res.status(500).json({
        message: "Error updating records",
        status: 500,
      });
    }

    return res.status(200).json({
      message: "Subject removed from teacher successfully",
      data: {
        teacher: updatedTeacher,
        subject: updatedSubject,
      },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error removing subject from teacher:", error);
    return res.status(500).json({
      message: "Error removing subject from teacher",
      error: error.message,
      status: 500,
    });
  }
};
