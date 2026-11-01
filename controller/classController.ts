import { Request, Response } from "express";
import schoolModel from "../model/schoolModel";
import subjectModel from "../model/subjectModel";
import { Types } from "mongoose";
import classroomModel from "../model/classroomModel";
import staffModel from "../model/staffModel";
import lodash from "lodash";
import studentModel from "../model/studentModel";
import cardReportModel from "../model/cardReportModel";
import { log } from "console";

import csv from "csvtojson";
import moment from "moment";
import fs from "node:fs";
import path from "node:path";
import crypto from "crypto";

export const createSchoolClasses = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;
    const {
      classTeacherName,
      className,
      class2ndFee,
      class3rdFee,
      class1stFee,
    } = req.body;

    const school = await schoolModel.findById(schoolID).populate({
      path: "classRooms",
    });

    const checkClass = school?.classRooms.some((el: any) => {
      return el.className === className;
    });

    if (school && school.status === "school-admin") {
      if (!checkClass) {
        const classes = await classroomModel.create({
          schoolName: school.schoolName,
          classTeacherName,
          className,
          class2ndFee,
          class3rdFee,
          class1stFee,
          schoolIDs: schoolID,
          presentTerm: school?.presentTerm,
        });

        school.historys.push(new Types.ObjectId(classes._id));
        school.classRooms.push(new Types.ObjectId(classes._id));

        school.save();

        return res.status(201).json({
          message: "classes created successfully",
          data: classes,
          status: 201,
        });
      } else {
        return res.status(404).json({
          message: "duplicated class name",
          status: 404,
        });
      }
    } else {
      return res.status(404).json({
        message: "unable to read school",
        status: 404,
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating school session",
      status: 404,
      error,
    });
  }
};

export const createBulkSchoolClassroom = async (
  req: Request | any,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;

    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
        status: 400,
      });
    }

    const school = await schoolModel.findById(schoolID).populate({
      path: "classRooms",
    });

    if (!school || school.status !== "school-admin") {
      // clean up file if school not found or unauthorized
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(404).json({
        message: "Unable to read school or unauthorized",
        status: 404,
      });
    }

    const csvData = await csv().fromFile(req.file.path);
    const existingClassNames = new Set(
      school.classRooms.map((cl: any) => cl.className)
    );

    const newClassroomIds: Types.ObjectId[] = [];
    const createdClasses: any[] = [];
    let skipCount = 0;

    for (let i of csvData) {
      const className = i?.className?.trim();
      if (!className) continue;

      if (existingClassNames.has(className)) {
        skipCount++;
        continue;
      }

      // Safe number parsing
      const parseFee = (val: any) => {
        if (!val) return 0;
        const cleaned = String(val).replace(/,/g, "");
        const parsed = parseInt(cleaned);
        return isNaN(parsed) ? 0 : parsed;
      };

      const classes = await classroomModel.create({
        schoolName: school.schoolName,
        classTeacherName: i?.classTeacherName || "",
        className: className,
        class2ndFee: parseFee(i?.class2ndFee),
        class3rdFee: parseFee(i?.class3rdFee),
        class1stFee: parseFee(i?.class1stFee),
        schoolIDs: schoolID,
        presentTerm: school?.presentTerm,
      });

      newClassroomIds.push(new Types.ObjectId(classes._id));
      createdClasses.push(classes);
      existingClassNames.add(className); // Prevent duplicates within the same CSV
    }

    // Update school document once
    if (newClassroomIds.length > 0) {
      await schoolModel.findByIdAndUpdate(schoolID, {
        $push: {
          classRooms: { $each: newClassroomIds },
          historys: { $each: newClassroomIds },
        },
      });
    }

    // Clean up the uploaded file safely
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(201).json({
      message: `Process complete. Created: ${createdClasses.length}, Skipped: ${skipCount}`,
      data: createdClasses,
      status: 201,
    });
  } catch (error: any) {
    // Attempt clean up on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({
      message: "Error processing bulk classroom upload",
      data: error.message,
      status: 500,
    });
  }
};

export const updateSchoolClassesPerformance = async (
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

export const viewClassesByTimeTable = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { classID } = req.params;

    const schoolClasses = await classroomModel.findById(classID).populate({
      path: "timeTable",
      options: {
        sort: {
          createdAt: -1,
        },
      },
    });

    return res.status(200).json({
      message: "finding classes by TimeTable",
      status: 200,
      data: schoolClasses,
    });
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating school class",
      status: 404,
      data: error.message,
    });
  }
};

export const viewClassesByStudent = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { classID } = req.params;

    const schoolClasses = await classroomModel.findById(classID).populate({
      path: "students",
      options: {
        sort: {
          createdAt: -1,
        },
      },
    });

    return res.status(200).json({
      message: "finding class students",
      status: 200,
      data: schoolClasses,
    });
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating school class",
      status: 404,
      data: error.message,
    });
  }
};

export const viewClassesBySubject = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { classID } = req.params;

    const schoolClasses: any = await classroomModel.findById(classID).populate({
      path: "classSubjects",
      options: {
        sort: {
          createdAt: -1,
        },
      },
      populate: [
        {
          path: "examination",
        },
        {
          path: "midTest",
        },
      ],
    });

    if (!schoolClasses) {
      return res.status(404).json({
        message: "School class not found",
        status: 404,
      });
    }

    const linkedSubjects: any[] = await subjectModel
      .find({
        $or: [
          { subjectClassID: classID },
          { subjectClassIDs: classID },
          { classID },
          { class: classID },
          { "classDetails._id": classID },
        ],
      })
      .populate("examination")
      .populate("midTest")
      .sort({ createdAt: -1 });

    const subjectsByID = new Map<string, any>();
    for (const subject of [
      ...(schoolClasses.classSubjects || []),
      ...linkedSubjects,
    ]) {
      subjectsByID.set(subject._id.toString(), subject);
    }
    schoolClasses.classSubjects = [...subjectsByID.values()];

    return res.status(200).json({
      message: "finding classes by Name",
      status: 200,
      data: schoolClasses,
    });
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating school class",
      status: 404,
      data: error.message,
    });
  }
};

export const viewSchoolClassesByName = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { className } = req.body;

    const schoolClasses = await classroomModel.findOne({ className }).populate({
      path: "classSubjects",
    });

    return res.status(200).json({
      message: "finding classes by Name",
      status: 200,
      data: schoolClasses,
    });
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating school class",
      status: 404,
      data: error.message,
    });
  }
};

export const viewSchoolClasses = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;

    const schoolClasses: any = await schoolModel.findById(schoolID).populate({
      path: "classRooms",
      options: {
        sort: {
          createdAt: -1,
        },
      },
      populate: {
        path: "classSubjects",
      },
    });

    if (!schoolClasses) {
      return res.status(404).json({
        message: "School not found",
        status: 404,
      });
    }

    const classrooms: any[] = schoolClasses.classRooms || [];
    const classroomIDs = classrooms.map((classroom) =>
      classroom._id.toString()
    );
    const referencedSubjectIDs = classrooms.flatMap((classroom) =>
      (classroom.classSubjects || []).map((subject: any) =>
        (subject._id || subject).toString()
      )
    );

    const linkedSubjects = await subjectModel.find({
      $or: [
        { subjectClassID: { $in: classroomIDs } },
        { subjectClassIDs: { $in: classroomIDs } },
        { classID: { $in: classroomIDs } },
        { class: { $in: classroomIDs } },
        { "classDetails._id": { $in: classroomIDs } },
        { _id: { $in: referencedSubjectIDs } },
      ],
    });

    for (const classroom of classrooms) {
      const classroomID = classroom._id.toString();
      const subjectMap = new Map<string, any>();

      for (const subject of classroom.classSubjects || []) {
        subjectMap.set(subject._id.toString(), subject);
      }

      for (const subject of linkedSubjects) {
        const classDetails = subject.classDetails as
          | { _id?: Types.ObjectId | string }
          | undefined;
        const linkedClassIDs = [
          subject.subjectClassID?.toString(),
          subject.subjectClassIDs?.toString(),
          subject.classID?.toString(),
          subject.class?.toString(),
          classDetails?._id?.toString(),
        ];

        if (
          linkedClassIDs.includes(classroomID) ||
          referencedSubjectIDs.includes(subject._id.toString()) &&
            (classroom.classSubjects || []).some(
              (classSubject: any) =>
                (classSubject._id || classSubject).toString() ===
                subject._id.toString()
            )
        ) {
          subjectMap.set(subject._id.toString(), subject);
        }
      }

      classroom.classSubjects = [...subjectMap.values()];
    }

    return res.status(200).json({
      message: "School classes found",
      status: 200,
      data: schoolClasses,
    });
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating school class",
      status: 404,
      data: error.message,
    });
  }
};

export const viewOneClassRM = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { classID } = req.params;

    const schoolClasses = await classroomModel.findById(classID);

    return res.status(200).json({
      message: "School's class info found",
      status: 200,
      data: schoolClasses,
    });
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating school class info",
      status: 404,
      data: error.message,
    });
  }
};

export const viewClassRM = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { classID } = req.params;

    const schoolClasses: any = await classroomModel.findById(classID).populate({
      path: "classSubjects",
      populate: [
        {
          path: "examination",
        },
        {
          path: "midTest",
        },
      ],
    });

    if (!schoolClasses) {
      return res.status(404).json({
        message: "School class not found",
        status: 404,
      });
    }

    const linkedSubjects: any[] = await subjectModel
      .find({
        $or: [
          { subjectClassID: classID },
          { subjectClassIDs: classID },
          { classID },
          { class: classID },
          { "classDetails._id": classID },
        ],
      })
      .populate("examination")
      .populate("midTest")
      .sort({ createdAt: -1 });

    const subjectsByID = new Map<string, any>();
    for (const subject of [
      ...(schoolClasses.classSubjects || []),
      ...linkedSubjects,
    ]) {
      subjectsByID.set(subject._id.toString(), subject);
    }

    schoolClasses.classSubjects = [...subjectsByID.values()];

    return res.status(200).json({
      message: "School classes info found",
      status: 200,
      data: schoolClasses,
    });
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating school class info",
      status: 404,
      data: error.message,
    });
  }
};

export const updateSchoolClassName = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID, classID } = req.params;
    const { className } = req.body;

    const school = await schoolModel.findById(schoolID);

    if (school && school.schoolName && school.status === "school-admin") {
      const subjects = await classroomModel.findByIdAndUpdate(
        classID,
        {
          className,
        },
        { new: true }
      );

      for (let i of school.students) {
        let student = await studentModel.findById(i);
        if (student?.presentClassID === classID) {
          await studentModel.findByIdAndUpdate(
            i,
            { classAssigned: className },
            { new: true }
          );
        }
      }

      for (let i of school.staff) {
        let staff = await staffModel.findById(i);

        if (staff?.presentClassID === classID) {
          let myClass: any = staff?.classesAssigned.find((el: any) => {
            return el.classID === classID;
          });

          myClass = { className, classID };

          let xx = staff?.classesAssigned.filter((el: any) => {
            return el.classID !== classID;
          });

          let subj = staff?.subjectAssigned.find((el: any) => {
            return el.classID === classID;
          });

          subj = { ...subj, classMeant: className };

          let yy = staff?.subjectAssigned.filter((el: any) => {
            return el.classID !== classID;
          });

          await staffModel.findByIdAndUpdate(
            i,
            {
              classesAssigned: [...xx, myClass],
              subjectAssigned: [
                ...staff?.subjectAssigned.filter((el: any) => {
                  return el.classID !== classID;
                }),
                subj,
              ],
            },
            { new: true }
          );
        }
      }

      for (let i of school.subjects) {
        let subject: any = await subjectModel.findById(i);

        if (subject?.subjectClassID === classID) {
          await subjectModel.findByIdAndUpdate(
            i,
            { designated: className! },
            { new: true }
          );
        }
      }

      return res.status(201).json({
        message: "class name updated successfully",
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
      message: "Error creating updating class name",
      status: 404,
    });
  }
};

export const updateSchoolClassTeacher = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID, classID } = req.params;
    const classTeacherName =
      typeof req.body.classTeacherName === "string"
        ? req.body.classTeacherName.trim()
        : "";

    const school = await schoolModel.findById(schoolID);
    const classroom = await classroomModel.findOne({
      _id: classID,
      schoolIDs: schoolID,
    });

    if (school && school.schoolName && school.status === "school-admin") {
      if (!classroom) {
        return res.status(404).json({
          message: "unable to find classroom",
          status: 404,
        });
      }

      const currentTeacher = classroom.teacherID
        ? await staffModel.findOne({
            _id: classroom.teacherID,
            schoolIDs: schoolID,
          })
        : classroom.classTeacherName
          ? await staffModel.findOne({
              staffName: classroom.classTeacherName,
              schoolIDs: schoolID,
            })
          : null;

      const nextTeacher = classTeacherName
        ? await staffModel.findOne({
            staffName: classTeacherName,
            schoolIDs: schoolID,
          })
        : null;

      if (classTeacherName && !nextTeacher) {
        return res.status(404).json({
          message: "unable to find school Teacher",
          status: 404,
        });
      }

      if (currentTeacher) {
        const remainingClasses = (currentTeacher.classesAssigned || []).filter(
          (assignedClass: any) =>
            String(assignedClass?.classID) !== String(classID)
        );
        const currentTeacherSet: Record<string, unknown> = {
          classesAssigned: remainingClasses,
        };
        const currentTeacherUpdate: Record<string, unknown> = {
          $set: currentTeacherSet,
        };

        if (String(currentTeacher.presentClassID) === String(classID)) {
          if (remainingClasses.length > 0) {
            currentTeacherSet.presentClassID = remainingClasses[0].classID;
          } else {
            currentTeacherUpdate.$unset = { presentClassID: 1 };
          }
        }

        await staffModel.findByIdAndUpdate(currentTeacher._id, currentTeacherUpdate);
      }

      const updatedClassroom = await classroomModel.findByIdAndUpdate(
        classID,
        {
          classTeacherName: nextTeacher ? classTeacherName : "",
          teacherID: nextTeacher ? String(nextTeacher._id) : "",
        },
        { new: true }
      );

      if (nextTeacher) {
        const assignedClasses = (nextTeacher.classesAssigned || []).filter(
          (assignedClass: any) =>
            String(assignedClass?.classID) !== String(classID)
        );
        assignedClasses.push({
          className: classroom.className,
          classID: String(classID),
        });

        await staffModel.findByIdAndUpdate(
          nextTeacher._id,
          {
            classesAssigned: assignedClasses,
            presentClassID: String(classID),
          },
          { new: true }
        );
      }

      return res.status(201).json({
        message: nextTeacher
          ? "class teacher updated successfully"
          : "class teacher removed successfully",
        data: updatedClassroom,
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

export const updateSchoolClass1stFee = async (req: Request, res: Response) => {
  try {
    const { schoolID, classID } = req.params;
    const { class1stFee, class2ndFee, class3rdFee } = req.body;

    const school = await schoolModel.findById(schoolID);
    const getClass = await classroomModel.findById(classID);

    if (school && school.schoolName && school.status === "school-admin") {
      if (getClass) {
        const update = await classroomModel.findByIdAndUpdate(
          getClass._id,
          {
            class1stFee,
            class2ndFee,
            class3rdFee,
          },
          { new: true }
        );

        // After updating class fees, reflect the change on students in this class.
        // Determine which term is active on the class and set students' classTermFee accordingly.
        try {
          const term = update?.presentTerm;
          const feeForTerm =
            term === "1st Term"
              ? update?.class1stFee
              : term === "2nd Term"
              ? update?.class2ndFee
              : term === "3rd Term"
              ? update?.class3rdFee
              : null;

          if (feeForTerm !== null && feeForTerm !== undefined) {
            await studentModel.updateMany(
              { presentClassID: classID },
              { $set: { classTermFee: feeForTerm } }
            );
          }
        } catch (err: any) {
          // Log but don't fail the entire request — the class fees were updated.
          console.error(
            "Failed to update students' classTermFee:",
            err?.message || err
          );
        }

        return res.status(201).json({
          message: "class term fee updated successfully",
          data: update,
          status: 201,
        });
      } else {
        return res.status(404).json({
          message: "unable to find class",
          status: 404,
        });
      }
    } else {
      return res.status(404).json({
        message: "unable to read school",
        status: 404,
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating school session",
      status: 404,
      data: error.message,
    });
  }
};

export const deleteSchoolClass = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID, classID } = req.params;

    const school: any = await schoolModel.findById(schoolID);

    if (school && school.schoolName && school.status === "school-admin") {
      const subjects = await classroomModel.findByIdAndDelete(classID);

      school.classRooms.pull(new Types.ObjectId(subjects?._id!));
      school.save();

      return res.status(201).json({
        message: "class deleted successfully",
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

export const viewClassTopStudent = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { classID } = req.params;

    const schoolClasses = await classroomModel.findById(classID).populate({
      path: "students",
      options: {
        sort: {
          createdAt: -1,
        },
      },
    });

    const rate = lodash.orderBy(
      schoolClasses?.students,
      ["totalPerformance"],
      ["desc"]
    );

    return res.status(200).json({
      message: "finding class students top performance!",
      status: 200,
      data: rate,
    });
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating school class",
      status: 404,
      data: error.message,
    });
  }
};

export const studentOfWeek = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { teacherID } = req.params;
    const { studentName, remark } = req.body;

    const teacher = await staffModel.findById(teacherID);

    const classRM = await classroomModel
      .findById(teacher?.presentClassID)
      .populate({
        path: "students",
      });

    const getStudent: any = classRM?.students.find((el: any) => {
      return (
        `${el.studentFirstName}` === studentName.trim().split(" ")[0] &&
        `${el.studentLastName}` === studentName.trim().split(" ")[1]
      );
    });

    const studentData = await studentModel.findById(getStudent?._id);

    if (teacher?.status === "school-teacher" && classRM && studentData) {
      const week = await classroomModel.findByIdAndUpdate(
        classRM?._id,
        {
          weekStudent: {
            student: studentData,
            remark,
          },
        },
        { new: true }
      );

      return res.status(201).json({
        message: "student of the week awarded",
        status: 201,
        data: week,
      });
    } else {
      return res.status(404).json({
        message: "student 2nd fees not found",
        status: 404,
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error creating school students",
      status: 404,
    });
  }
};

export const setTopStudents = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { teacherID } = req.params;
    const { topStudents } = req.body;

    const teacher = await staffModel.findById(teacherID);

    const classRM = await classroomModel.findById(teacher?.presentClassID);

    if (teacher?.status === "school-teacher" && classRM) {
      const updatedClass = await classroomModel.findByIdAndUpdate(
        classRM?._id,
        {
          topStudents,
        },
        { new: true }
      );

      return res.status(201).json({
        message: "top students set successfully",
        status: 201,
        data: updatedClass,
      });
    } else {
      return res.status(404).json({
        message: "teacher or class not found",
        status: 404,
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error setting top students",
      status: 404,
    });
  }
};

/**
 * GET /view-class-positions/:classID?source=historical|report|mid&term=&session=
 * source defaults to 'historical'.
 * Computes positions for students in a class based on chosen source's total points.
 */
export const viewClassPositions = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { classID } = req.params;
    // Always use report card (cardReportModel) for ranking.
    const { term, session } = req.query as any;

    // populate students and their reportCard entries so we can inspect per-student reports
    const classDoc = await classroomModel.findById(classID).populate({
      path: "students",
      populate: { path: "reportCard" },
    });

    if (!classDoc) {
      return res.status(404).json({ message: "Class not found", status: 404 });
    }

    const students: any[] = classDoc.students || [];

    // Helper to get numeric score for a student using report cards only.
    const getScoreForStudent = async (student: any): Promise<number> => {
      try {
        // Prefer using populated student.reportCard if available
        const reports = Array.isArray(student?.reportCard)
          ? student.reportCard
          : [];

        // filter candidate reports by class, term (classInfo), and session when provided
        const candidates = reports.filter((r: any) => {
          if (!r) return false;
          // r may be an ObjectId if not populated
          if (typeof r === "string" || r instanceof Types.ObjectId)
            return false;
          if (classID && r.classes && `${r.classes}` !== `${classID}`)
            return false;
          if (term && r.classInfo && `${r.classInfo}` !== `${term}`)
            return false;
          if (session && r.session && `${r.session}` !== `${session}`)
            return false;
          return true;
        });

        // choose most recent candidate if any
        let chosen: any = null;
        if (candidates.length > 0) {
          chosen = candidates.sort((a: any, b: any) => {
            const ta = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
            const tb = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
            return tb - ta;
          })[0];
        } else {
          // fallback to querying report collection directly (in case student's reportCard wasn't populated)
          const q: any = { student: student._id };
          if (classID) q.classes = classID;
          if (term) q.classInfo = term;
          if (session) q.session = session;
          chosen = await cardReportModel.findOne(q).sort({ createdAt: -1 });
        }

        if (!chosen) return 0;

        // If points already set on the report, use it
        if (typeof chosen.points === "number" && chosen.points > 0) {
          return chosen.points;
        }

        // Otherwise try to compute from result array (per-subject points)
        if (Array.isArray(chosen.result) && chosen.result.length > 0) {
          const total = chosen.result.reduce(
            (sum: number, r: any) => sum + (r.points || 0),
            0
          );
          const avg = total / chosen.result.length;
          return Number.isFinite(avg) ? parseFloat(avg.toFixed(2)) : 0;
        }

        // last fallback
        return 0;
      } catch (e) {
        return 0;
      }
    };

    // Build array of { student, score }
    const scored: Array<{ student: any; score: number }> = [];

    console.log("ed: ", students);

    for (const s of students) {
      // if historical/report/mid not present, fallback to student's totalPerformance
      const scoreFromModel = await getScoreForStudent(s);
      const fallback =
        typeof s.totalPerformance === "number" ? s.totalPerformance : 0;
      const score = scoreFromModel || fallback;
      scored.push({ student: s, score });
    }

    // Sort descending by score
    scored.sort((a, b) => b.score - a.score);

    // Assign positions, handling ties (same score -> same position)
    const ranked = scored.map((entry, idx) => ({
      position: 0,
      score: entry.score,
      student: entry.student,
    }));

    let currentPos = 1;
    for (let i = 0; i < ranked.length; i++) {
      if (i === 0) {
        ranked[i].position = currentPos;
      } else {
        if (ranked[i].score === ranked[i - 1].score) {
          ranked[i].position = ranked[i - 1].position;
        } else {
          ranked[i].position = i + 1;
        }
      }
    }

    const best = ranked.length ? ranked[0] : null;
    const worst = ranked.length ? ranked[ranked.length - 1] : null;

    return res.status(200).json({
      message: "Class positions computed",
      status: 200,
      data: { ranked, best, worst },
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Error computing positions",
      error: error.message,
      status: 500,
    });
  }
};
