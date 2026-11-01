import { Request, Response } from "express";
import schoolModel from "../model/schoolModel";
import complainModel from "../model/complainModel";
import { Types } from "mongoose";
import staffModel from "../model/staffModel";
import studentModel from "../model/studentModel";

export const createTeacherComplain = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { teacherID } = req.params;
    const { title, importance } = req.body;

    const teacher: any = await staffModel.findById(teacherID);
    const school = await schoolModel.findById(teacher?.schoolIDs!);

    if (teacher) {
      const complain = await complainModel.create({
        reporterID: teacherID,
        title,
        importance,
      });

      teacher?.complain.push(new Types.ObjectId(complain._id));
      teacher.save();

      school?.complain.push(new Types.ObjectId(complain._id));
      school?.save();

      return res.status(201).json({
        message: "teacher complain [posted] successfully",
        data: complain,
        status: 201,
      });
    } else {
      return res.status(404).json({
        message: "teacher must exist",
        status: 404,
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating school session",
      data: error.message,
      status: 404,
    });
  }
};

export const createStudentComplain = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { studentID } = req.params;
    const { title, importance } = req.body;

    const student: any = await studentModel.findById(studentID);
    const school = await schoolModel.findById(student?.schoolIDs!);

    if (student) {
      const complain = await complainModel.create({
        reporterID: studentID,
        title,
        importance,
      });

      student?.complain.push(new Types.ObjectId(complain._id));
      student.save();

      school?.complain.push(new Types.ObjectId(complain._id));
      school?.save();

      return res.status(201).json({
        message: "student complain posted successfully",
        data: complain,
        status: 201,
      });
    } else {
      return res.status(404).json({
        message: "student must exist",
        status: 404,
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating school session",
      data: error.message,
      status: 404,
    });
  }
};

export const markAsSeenComplain = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID, complainID } = req.params;

    const school = await schoolModel.findById(schoolID);

    if (school) {
      const complain = await complainModel.findByIdAndUpdate(
        complainID,
        { seen: true },
        { new: true }
      );

      return res.status(201).json({
        message: "mark complain seen successfully",
        data: complain,
        status: 201,
      });
    } else {
      return res.status(404).json({
        message: "school must exist",
        status: 404,
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating school session",
      data: error.message,
      status: 404,
    });
  }
};

export const markResolveComplain = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID, complainID } = req.params;

    const school = await schoolModel.findById(schoolID);

    if (school) {
      const complain = await complainModel.findByIdAndUpdate(
        complainID,
        { resolve: true },
        { new: true }
      );

      return res.status(201).json({
        message: "mark complain resolved successfully",
        data: complain,
        status: 201,
      });
    } else {
      return res.status(404).json({
        message: "school must exist",
        status: 404,
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating school session",
      data: error.message,
      status: 404,
    });
  }
};

export const viewSchoolComplains = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;

    const complain = await schoolModel.findById(schoolID).populate({
      path: "complain",
      options: {
        sort: {
          createdAt: -1,
        },
      },
    });

    return res.status(201).json({
      message: "view complain successfully",
      data: complain,
      status: 201,
    });
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating school session",
      data: error.message,
      status: 404,
    });
  }
};

export const viewTeacherComplains = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { teacherID } = req.params;

    const complain = await staffModel.findById(teacherID).populate({
      path: "complain",
      options: {
        sort: {
          createdAt: -1,
        },
      },
    });

    return res.status(201).json({
      message: "view complain successfully",
      data: complain,

      status: 201,
    });
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating school session",
      data: error.message,
      status: 404,
    });
  }
};

export const viewStudentComplains = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { studentID } = req.params;

    const complain = await studentModel.findById(studentID).populate({
      path: "complain",
      options: {
        sort: {
          createdAt: -1,
        },
      },
    });

    return res.status(201).json({
      message: "view complain successfully",
      data: complain,
      status: 201,
    });
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating school session",
      data: error.message,
      status: 404,
    });
  }
};
