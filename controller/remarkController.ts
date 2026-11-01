import { Request, Response } from "express";
import schoolModel from "../model/schoolModel";
import sessionModel from "../model/sessionModel";
import { Types } from "mongoose";
import studentModel from "../model/studentModel";
import staffModel from "../model/staffModel";
import remarkModel from "../model/studentRemark";
import moment from "moment";
import { sendWeeklyReport } from "../utils/email";

export const createRemark = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { teacherID, studentID } = req.params;
    const {
      remark,
      weekPerformanceRatio,
      attendanceRatio,
      best,
      worst,
      classParticipation,
      sportParticipation,
      topicFocus,
      payment,
      announcement,
      generalPerformace,
    } = req.body;

    const teacher: any = await staffModel.findById(teacherID);

    console.log(teacher);

    const student: any = await studentModel.findById(studentID);
    const school: any = await schoolModel.findById(teacher?.schoolIDs);

    if (teacher && student) {
      const fridayDate = Date.now();
      const readDate = moment(fridayDate).days();

      if (readDate === 5 || readDate === 6 || readDate === 4) {
        const remarkData = await remarkModel.create({
          remark,
          weekPerformanceRatio,
          attendanceRatio,
          best,
          worst,
          classParticipation,
          sportParticipation,
          topicFocus,
          payment,
          announcement,
          generalPerformace,
        });

        sendWeeklyReport(student, school, remarkData);

        student.remark.push(new Types.ObjectId(remarkData._id));
        student?.save();

        teacher.remark.push(new Types.ObjectId(remarkData._id));
        teacher.save();

        return res.status(201).json({
          message: "remark created successfully",
          data: remarkData,
          status: 201,
        });
      } else {
        return res.status(404).json({
          message: "Report can only be done on FRIDAYS or SATURDAYS",
        });
      }
    } else {
      return res.status(404).json({
        message: "unable to read school",
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating remake for Student",
      data: error.message,
    });
  }
};

export const viewStudentRemark = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { studentID } = req.params;

    const student = await studentModel.findById(studentID).populate({
      path: "remark",
      options: {
        sort: {
          createdAt: -1,
        },
      },
    });

    return res.status(200).json({
      message: "viewing student weekly remark",
      data: student?.remark,
    });
  } catch (error: any) {
    return res.status(404).json({
      message: "Error viewing students remarks",
      data: error.message,
    });
  }
};

export const studentsPerSession = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { sessionID } = req.params;
    const { totalStudents } = req.body;
    const session = await sessionModel.findById(sessionID);

    if (session) {
      const students = await sessionModel.findByIdAndUpdate(
        sessionID,
        { totalStudents },
        { new: true }
      );
      return res.status(200).json({
        message: "viewing session session",
        data: students,
      });
    } else {
      return res.status(404).json({
        message: "Error finding school session",
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error viewing school session",
    });
  }
};

export const termPerSession = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { sessionID } = req.params;
    const { term } = req.body;
    const session = await sessionModel.findById(sessionID);

    if (session) {
      const students = await sessionModel.findByIdAndUpdate(
        sessionID,
        { term },
        { new: true }
      );
      return res.status(200).json({
        message: "viewing session session",
        data: students,
      });
    } else {
      return res.status(404).json({
        message: "Error finding school session",
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error viewing school session",
    });
  }
};
