import { Request, Response } from "express";
import schoolModel from "../model/schoolModel";
import studentModel from "../model/studentModel";
import staffModel from "../model/staffModel";
import subjectModel from "../model/subjectModel";
import studentHistoricalResultModel from "../model/studentHistoricalResultModel";
import { Types } from "mongoose";

export const createResultHistory = async (req: Request, res: Response) => {
  try {
    const { studentID, schoolID, teacherID } = req.params;
    const {} = req.body;
    const school = await schoolModel.findById(schoolID);
    const student = await studentModel.findById(studentID).populate({
      path: "historicalResult",
    });
    const teacher = await staffModel.findById(teacherID);

    if (school) {
      const result = await studentHistoricalResultModel.create({
        ...req.body,
        school,
        student,
      });

      student?.historicalResult?.push(new Types.ObjectId(result._id));
      student?.save();

      return res.status(201).json({
        message: "done",
      });
    } else {
      return res.status(404).json({
        message: "Only school Admin can do this",
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error",
    });
  }
};

export const viewResultHistory = async (req: Request, res: Response) => {
  try {
    const { studentID, schoolID, teacherID } = req.params;
    const {} = req.body;
    const school = await schoolModel.findById(schoolID);
    const student = await studentModel.findById(studentID).populate({
      path: "historicalResult",
      options: {
        sort: {
          createdAt: -1,
        },
      },
    });
    const teacher = await staffModel.findById(teacherID);

    console.log("student", student?.historicalResult);

    return res.status(201).json({
      message: "done",
      data: student,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error",
    });
  }
};

export const deleteResultHistory = async (req: Request, res: Response) => {
  try {
    const { studentID, schoolID, teacherID, resultID } = req.params;

    const school = await schoolModel.findById(schoolID);
    const student: any = await studentModel.findById(studentID).populate({
      path: "historicalResult",
      options: {
        sort: {
          createdAt: -1,
        },
      },
    });

    await studentHistoricalResultModel?.findByIdAndDelete(resultID);

    await student?.historicalResult?.pull(new Types.ObjectId(resultID));
    student.save();

    return res.status(201).json({
      message: "done",
      data: student,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error",
    });
  }
};
