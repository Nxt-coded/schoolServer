import { Request, Response } from "express";
import schoolModel from "../model/schoolModel";
import { Types } from "mongoose";
import classroomModel from "../model/classroomModel";
import staffModel from "../model/staffModel";
import subjectModel from "../model/subjectModel";
import quizModel from "../model/quizModel";
import studentModel from "../model/studentModel";
import assignmentResolvedModel from "../model/assignmentResolvedModel";
import assignmentModel from "../model/assignmentModel";

export const createSubjectAssignment = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { classID, subjectID } = req.params;
    const { assignmentTopic, assignmentDetails, assignmentDeadline } = req.body;

    const classRoom = await classroomModel.findById(classID);

    const checkForSubject = await subjectModel.findById(subjectID);

    const findTeacher = await staffModel.findById(classRoom?.teacherID);

    if (checkForSubject) {
      const quizes = await assignmentModel.create({
        subjectTitle: checkForSubject?.subjectTitle,
        assignmentTopic,
        assignmentDetails,
        assignmentDeadline,
      });

      checkForSubject?.assignment.push(new Types.ObjectId(quizes._id));
      checkForSubject?.save();

      classRoom?.assignment.push(new Types.ObjectId(quizes._id));
      classRoom?.save();

      findTeacher?.assignment.push(new Types.ObjectId(quizes._id));
      findTeacher?.save();

      return res.status(201).json({
        message: "assignment resolve entry created successfully",
        data: quizes,
        status: 201,
      });
    } else {
      return res.status(404).json({
        message: "Subject doesn't exist for this class",
        status: 404,
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error creating class subject quiz",
      status: 404,
    });
  }
};

export const readSubjectAssignment = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { subjectID } = req.params;

    const subject = await subjectModel.findById(subjectID).populate({
      path: "assignment",
      options: {
        sort: {
          time: 1,
        },
      },
    });

    return res.status(201).json({
      message: "subject quiz read successfully",
      data: subject,
      status: 201,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error creating subject quiz",
      status: 404,
    });
  }
};

// export const readClassSubjectAssignment = async (
//   req: Request,
//   res: Response
// ): Promise<Response> => {
//   try {
//     const { classID } = req.params;

//     const quiz: any = await staffModel.findById(classID).populate({
//       path: "assignment",
//       options: {
//         sort: { createdAt: -1 },
//       },
//     });

//     return res.status(201).json({
//       message: "subject quiz read successfully",
//       data: quiz,
//       status: 201,
//     });
//   } catch (error: any) {
//     return res.status(404).json({
//       message: "Error creating subject quiz",
//       data: error.message,
//       status: 404,
//     });
//   }
// };

export const readClassSubjectAssignment = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { classID } = req.params;

    const quiz: any = await classroomModel.findById(classID).populate({
      path: "assignment",
      options: {
        sort: { createdAt: -1 },
      },
    });

    return res.status(201).json({
      message: "subject quiz read successfully",
      data: quiz,
      status: 201,
    });
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating subject quiz",
      data: error.message,
      status: 404,
    });
  }
};

export const readTeacherSubjectAssignment = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { teacherID } = req.params;

    const quiz: any = await staffModel.findById(teacherID).populate({
      path: "assignment",
      options: {
        sort: { createdAt: -1 },
      },
    });

    return res.status(201).json({
      message: "subject quiz read successfully",
      data: quiz,
      status: 201,
    });
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating subject quiz",
      data: error.message,
      status: 404,
    });
  }
};

export const readAssignment = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { assignmentID } = req.params;

    const quiz: any = await quizModel.findById(assignmentID);

    return res.status(201).json({
      message: "subject quiz read successfully",
      data: quiz,
      status: 201,
    });
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating subject quiz",
      data: error.message,
      status: 404,
    });
  }
};

// Assignment Resolve Session/EndPoints

export const createAssignmentPerformance = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { studentID, assignmentID } = req.params;
    const { studentScore, studentGrade, remark, assignmentResult } = req.body;

    const studentInfo: any = await studentModel
      .findById(studentID)
      .populate({ path: "assignment" });

    const quizData: any = await assignmentModel.findById(assignmentID);

    const findSubject = await subjectModel.findOne({
      subjectTitle: quizData?.subjectTitle,
    });

    if (quizData) {
      const quizes = await assignmentResolvedModel.create({
        assignmentResult,
        subjectTitle: quizData?.subjectTitle,
        // studentScore,
        // studentGrade,
        // subjectTeacher: findTeacher?.staffName,
        // performanceRating: parseInt(
        //   ((studentScore / quizData?.quiz[1]?.question.length) * 100).toFixed(2)
        // ),
        className: studentInfo?.classAssigned,
        assignmentID: assignmentID,
        studentName: `${studentInfo?.studentFirstName} ${studentInfo?.studentLastName}`,
      });

      quizData?.assignmentResult.push(new Types.ObjectId(quizes._id));
      quizData?.save();

      studentInfo?.performance.push(new Types.ObjectId(quizes._id));
      studentInfo?.save();

      findSubject?.performance.push(new Types.ObjectId(quizes._id));
      findSubject?.save();
      let view: number[] = [];
      let notView: number[] = [];

      const getStudent = await studentModel.findById(studentID).populate({
        path: "performance",
      });

      const record = await studentModel.findByIdAndUpdate(
        studentID,
        {
          totalPerformance:
            view.reduce((a: number, b: number) => {
              return a + b;
            }, 0) / studentInfo?.performance?.length,
        },
        { new: true }
      );

      return res.status(201).json({
        message: "quiz entry created successfully",
        data: { quizes, record },
        status: 201,
      });
    } else {
      return res.status(404).json({
        message: "Subject doesn't exist for this class",
        status: 404,
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error creating class subject quiz",
      status: 404,
    });
  }
};

export const readSubjectAssignmentResult = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { subjectID } = req.params;

    const subject = await subjectModel.findById(subjectID).populate({
      path: "assignmentResolve",
      options: {
        sort: {
          time: 1,
        },
      },
    });

    return res.status(201).json({
      message: "subject assignmentResolve performance read successfully",
      data: subject,
      status: 201,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error creating subject quiz",
      status: 404,
    });
  }
};

export const readStudentAssignmentResult = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { studentID } = req.params;

    const subject = await studentModel.findById(studentID).populate({
      path: "assignmentResolve",
      options: {
        sort: {
          time: 1,
        },
      },
    });

    return res.status(201).json({
      message: "subject quiz performance read successfully",
      data: subject,
      status: 201,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error creating subject quiz",
      status: 404,
    });
  }
};

export const readAssignmentResult = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { resolveID } = req.params;

    const subject = await assignmentResolvedModel.findById(resolveID).populate({
      path: "assignmentResolve",
      options: {
        sort: {
          time: 1,
        },
      },
    });

    return res.status(201).json({
      message: "subject quiz performance read successfully",
      data: subject,
      status: 201,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error creating subject quiz",
      status: 404,
    });
  }
};

// update to mark
