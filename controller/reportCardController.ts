import { Request, Response } from "express";
import schoolModel from "../model/schoolModel";
import staffModel from "../model/staffModel";
import studentModel from "../model/studentModel";
import { Types } from "mongoose";
import classroomModel from "../model/classroomModel";
import reportcardModel from "../model/reportCardModel";
import midReportCardModel from "../model/midReportCardModel";

export const createStudentreportCard = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID, staffID, studentID } = req.params;

    const {
      newTermDate,
      date,
      principalRemark,
      teachersRemark,
      totalGrade,
      totalObtainableScore,
      toataTage,
      totalObtainedScore,
      classAVG,
      remarks,
      position,
      grade,
      totalScore,
      examScore,
      continuousAssesment,
      color,
      clubSociety,
      wt,
      ht,
      age,
      DOB,
    } = req.body;

    const school = await schoolModel.findById(schoolID);
    const staff = await staffModel.findById(staffID);
    const student: any = await studentModel.findById(studentID);

    // const hold = ;
    const classData = await classroomModel.findOne({
      className: staff?.classesAssigned,
    });

    console.log("started here!");

    if (school && school.schoolName && staff && classData) {
      const report = await reportcardModel.create({
        teacherName: staff?.staffName,
        classes: staff?.classesAssigned,
        // name: ,
        image: student?.avatar,
        classAVG,
        newTermDate,
        date,
        principalRemark,

        teachersRemark,
        totalGrade,
        totalObtainableScore,
        totalObtainedScore,

        remarks,
        position,
        grade,
        totalScore,
        examScore,
        continuousAssesment,
        color,
        clubSociety: "JET",
        wt: student?.weight,
        ht: student?.height,
        age: student?.age,
        DOB: student?.DoB,
        session: school?.session,
        toataTage,
      });

      school?.reportCard.push(new Types.ObjectId(report?._id));
      school?.save();

      staff?.reportCard.push(new Types.ObjectId(report?._id));
      staff?.save();

      student?.reportCard.push(new Types.ObjectId(report?._id));
      student?.save();

      return res.status(201).json({
        message: "lesson report created",
        data: report,
        status: 201,
      });
    } else {
      return res.status(404).json({
        message: "school not found",
        status: 404,
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating lesson report",
      status: 404,
      data: error.message,
    });
  }
};

export const createStudentMidReportCard = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID, staffID, studentID } = req.params;

    const {
      newTermDate,
      date,
      principalRemark,
      teachersRemark,
      totalGrade,
      totalObtainableScore,
      toataTage,
      totalObtainedScore,
      classAVG,
      remarks,
      position,
      grade,
      totalScore,
      examScore,
      continuousAssesment,
      color,
      clubSociety,
      wt,
      ht,
      age,
      DOB,
    } = req.body;

    const school = await schoolModel.findById(schoolID);
    const staff = await staffModel.findById(staffID);
    const student: any = await studentModel.findById(studentID);

    // const hold = ;
    const classData = await classroomModel.findOne({
      className: staff?.classesAssigned,
    });

    if (school && school.schoolName && staff && classData) {
      const report = await midReportCardModel.create({
        teacherName: staff?.staffName,
        classes: staff?.classesAssigned,
        // name: ,
        image: student?.avatar,
        classAVG,
        newTermDate,
        date,
        principalRemark,

        teachersRemark,
        totalGrade,
        totalObtainableScore,
        totalObtainedScore,

        remarks,
        position,
        grade,
        totalScore,
        examScore,
        continuousAssesment,
        color,
        clubSociety: "JET",
        wt: student?.weight,
        ht: student?.height,
        age: student?.age,
        DOB: student?.DoB,
        session: school?.session,
        toataTage,
      });

      school?.reportCard.push(new Types.ObjectId(report?._id));
      school?.save();

      staff?.reportCard.push(new Types.ObjectId(report?._id));
      staff?.save();

      student?.reportCard.push(new Types.ObjectId(report?._id));
      student?.save();

      return res.status(201).json({
        message: "mid report created",
        data: report,
        status: 201,
      });
    } else {
      return res.status(404).json({
        message: "school not found",
        status: 404,
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating lesson report",
      status: 404,
      data: error.message,
    });
  }
};
