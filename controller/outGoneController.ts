import { Request, Response } from "express";
import schoolModel from "../model/schoolModel";
import studentModel from "../model/studentModel";
import outGoneStudentModel from "../model/outGoneStudentModel";
import classroomModel from "../model/classroomModel";
import { Types } from "mongoose";

export const createSchoolOutGoneStudent = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID, studentID } = req.params;

    const school = await schoolModel.findById(schoolID);
    const student: any = await studentModel.findById(studentID);

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
        status: 404,
      });
    }

    if (school && school.schoolName && school.status === "school-admin") {
      const checkFirst = (school?.students as Types.ObjectId[]).some(
        (el: any) => el.toString() === `${studentID}`
      );

      if (checkFirst) {
        // Create outgone student record
        const outGoneRecord = await outGoneStudentModel.create({
          studentName: `${student?.studentFirstName} ${student?.studentLastName}`,
          student: studentID,
          schoolInfo: schoolID,
          classAssigned: student?.classAssigned,
        });

        // Remove from current class if they're in one
        if (student.presentClassID) {
          await classroomModel.findByIdAndUpdate(student.presentClassID, {
            $pull: { students: new Types.ObjectId(studentID) },
          });
        }

        // Remove from school's student list
        await schoolModel.findByIdAndUpdate(schoolID, {
          $pull: { students: new Types.ObjectId(studentID) },
          $push: { outGoneStudents: new Types.ObjectId(outGoneRecord._id) },
        });

        return res.status(201).json({
          message:
            "Student successfully moved to outgone list and removed from class",
          data: outGoneRecord,
          status: 201,
        });
      } else {
        return res.status(404).json({
          message: "Student not found in school records",
          status: 404,
        });
      }
    } else {
      return res.status(404).json({
        message: "School not found or unauthorized",
        status: 404,
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating outgone student record",
      status: 404,
      data: error.message,
    });
  }
};

export const viewSchoolOutGoneStudents = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;

    const announcement = await schoolModel.findById(schoolID).populate({
      path: "outGoneStudents",
      options: {
        sort: {
          createdAt: -1,
        },
      },
    });

    return res.status(201).json({
      message: "announcement read successfully",
      data: announcement,
      status: 201,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error creating school announcement",
      status: 404,
    });
  }
};

export const findSchoolOutGoneStudents = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;
    const { studentName } = req.body;

    const announcement = await schoolModel
      .findById(schoolID)
      .populate({
        path: "outGoneStudents",
        options: {
          sort: {
            createdAt: -1,
          },
        },
      })
      .find({ studentName });

    return res.status(201).json({
      message: "announcement read successfully",
      data: announcement,
      status: 201,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error creating school announcement",
      status: 404,
    });
  }
};
