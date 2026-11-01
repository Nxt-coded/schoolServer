import { Request, Response } from "express";
import { Types } from "mongoose";
import studentModel from "../model/studentModel";
import quizModel from "../model/quizModel";
import subjectModel from "../model/subjectModel";
import performanceModel from "../model/performanceModel";
import examinationModel from "../model/examinationModel";
import midTestModel from "../model/midTestModel";

export const createQuizPerformance = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { studentID, quizID, subjectID } = req.params;
    const {
      studentScore,
      studentGrade,
      remark,
      totalQuestions,
      markPerQuestion,
      status,
    } = req.body;

    if (!studentID || !quizID || !subjectID) {
      return res.status(400).json({
        message: "studentID, quizID and subjectID are required",
        status: 400,
      });
    }

    const studentInfo: any = await studentModel.findById(studentID);
    if (!studentInfo) {
      return res
        .status(404)
        .json({ message: "Student not found", status: 404 });
    }

    const quizData: any = await quizModel.findById(quizID);

    if (!quizData) {
      return res.status(404).json({ message: "Exam not found", status: 404 });
    }

    const subject = await subjectModel.findById(subjectID);
    if (!subject) {
      return res
        .status(404)
        .json({ message: "Subject not found", status: 404 });
    }

    // compute performanceRating safely
    const questionCount = Array.isArray(quizData?.quiz?.question)
      ? quizData.quiz.question.length
      : typeof quizData?.quiz === "number"
      ? quizData.quiz
      : 0;

    const perfRating =
      questionCount > 0 && typeof studentScore === "number"
        ? Number(((studentScore / questionCount) * 100).toFixed(2))
        : 0;

    // count existing attempts for this student and this quiz
    const existingAttempts = await performanceModel.countDocuments({
      student: studentID,
      quizID,
    });
    const attemptNumber = existingAttempts + 1;

    // create performance document
    const performanceDoc: any = await performanceModel.create({
      remark,
      subjectTitle: quizData?.subjectTitle,
      studentScore,
      studentGrade,
      totalQuestions,
      markPerQuestion,
      quizDone: true,
      status,
      performanceRating: perfRating,
      attemptNumber,
      className: studentInfo?.classAssigned,
      quizID: quizID,
      studentName: `${studentInfo?.studentFirstName || ""} ${
        studentInfo?.studentLastName || ""
      }`.trim(),
      studentAvatar: studentInfo?.avatar,
      subjectID: subject._id,
      student: studentID,
    });

    // push performance id to examination, student and subject safely
    const perfId = new Types.ObjectId(performanceDoc._id);

    const ensureAndPush = async (Model: any, id: any) => {
      const doc: any = await Model.findById(id).select("performance");
      if (!doc) return;
      if (!Array.isArray(doc.performance)) {
        // initialize to empty array if null or not an array
        doc.performance = [];
      }
      doc.performance.push(perfId);
      await doc.save();
    };

    await Promise.all([
      ensureAndPush(examinationModel, quizID),
      ensureAndPush(studentModel, studentID),
      ensureAndPush(subjectModel, subjectID),
    ]);

    // Recalculate student's totalPerformance from performanceModel (source of truth)
    const performances = await performanceModel
      .find({ student: studentID })
      .select("performanceRating")
      .lean();

    const ratings: number[] = (performances || [])
      .map((p: any) =>
        typeof p.performanceRating === "number" && !isNaN(p.performanceRating)
          ? p.performanceRating
          : null
      )
      .filter((r: number | null): r is number => r !== null);

    const totalSum = ratings.reduce((a: number, b: number) => a + b, 0);
    const count = ratings.length;
    const avg = count > 0 ? totalSum / count : 0;

    await studentModel.findByIdAndUpdate(studentID, { totalPerformance: avg });

    return res.status(201).json({
      message: "exam performance created successfully",
      data: performanceDoc,
      status: 201,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Error creating exam performance",
      status: 500,
      data: error?.message,
    });
  }
};

export const readSubjectQuizResult = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { subjectID } = req.params;

    const subject = await subjectModel.findById(subjectID).populate({
      path: "performance",
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

export const updateSubjectQuizResultRecorded = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { performanceID } = req.params;

    const subject = await performanceModel.findByIdAndUpdate(
      performanceID,
      {
        quizRecorded: true,
      },
      { new: true }
    );

    return res.status(201).json({
      message: "subject quiz performance recorded successfully",
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

export const updateQuitSubjectQuizResultRecorded = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { performanceID } = req.params;

    const subject = await performanceModel.findByIdAndUpdate(
      performanceID,
      {
        quizRecorded: false,
      },
      { new: true }
    );

    return res.status(201).json({
      message: "subject quiz performance recorded successfully",
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

export const readOneSubjectQuizResult = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { subjectID, quizID } = req.params;
    const quiz = await quizModel.findById(quizID);
    const subject = await subjectModel.findById(subjectID).populate({
      path: "performance",
      options: { sort: { time: 1 } },
    });

    if (!quiz || !subject) {
      return res.status(404).json({
        message: "Subject or Quiz not found",
        status: 404,
      });
    }

    const idCompare = subject?.quiz?.some(
      (id: any) => id.toString() === quiz._id.toString()
    );

    if (idCompare) {
      const filteredPerformance = subject?.performance?.filter(
        (el: any) => el.quizID.toString() === quiz._id.toString()
      );

      return res.status(201).json({
        message: "Filtered quiz performance read successfully",
        data: filteredPerformance,
        status: 201,
      });
    } else {
      return res.status(404).json({
        message: "QuizID and Subject Quiz don't align",
        status: 404,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Error reading subject quiz performance",
      status: 500,
    });
  }
};

export const readStudentQuizResult = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { studentID } = req.params;

    const subject = await studentModel.findById(studentID).populate({
      path: "performance",
      options: {
        sort: {
          createdAt: -1,
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

export const readQuizResult = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { quizID } = req.params;

    const subject = await quizModel.findById(quizID).populate({
      path: "performance",
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

// Examination

export const createExamPerformance = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { studentID, quizID, subjectID } = req.params;
    const {
      studentScore,
      studentGrade,
      remark,
      totalQuestions,
      markPerQuestion,
      status,
    } = req.body;

    if (!studentID || !quizID || !subjectID) {
      return res.status(400).json({
        message: "studentID, quizID and subjectID are required",
        status: 400,
      });
    }

    const studentInfo: any = await studentModel.findById(studentID);
    if (!studentInfo) {
      return res.status(404).json({ message: "Student not found", status: 404 });
    }

    const quizData: any = await examinationModel.findById(quizID);
    if (!quizData) {
      return res.status(404).json({ message: "Examination not found", status: 404 });
    }

    const subject = await subjectModel.findById(subjectID);
    if (!subject) {
      return res.status(404).json({ message: "Subject not found", status: 404 });
    }

    const existingAttempts = await performanceModel.countDocuments({
      student: studentID,
      quizID,
    });
    const attemptNumber = existingAttempts + 1;

    const questionCount = quizData?.quiz?.question?.length || 1;
    const performanceRating = Number(((studentScore / questionCount) * 100).toFixed(2));

    const quizes = await performanceModel.create({
      remark,
      subjectTitle: quizData?.subjectTitle,
      studentScore,
      studentGrade,
      totalQuestions,
      markPerQuestion,
      quizDone: true,
      status,
      performanceRating,
      attemptNumber,
      className: studentInfo?.classAssigned,
      quizID: quizID,
      studentName: `${studentInfo?.studentFirstName || ""} ${studentInfo?.studentLastName || ""}`.trim(),
      studentAvatar: studentInfo?.avatar,
      subjectID: subject._id,
      student: studentID,
    });

    const perfId = new Types.ObjectId(quizes._id);

    const ensureAndPush = async (Model: any, id: any) => {
      const doc: any = await Model.findById(id).select("performance");
      if (!doc) return;
      if (!Array.isArray(doc.performance)) {
        doc.performance = [];
      }
      doc.performance.push(perfId);
      await doc.save();
    };

    await Promise.all([
      ensureAndPush(examinationModel, quizID),
      ensureAndPush(studentModel, studentID),
      ensureAndPush(subjectModel, subjectID),
    ]);

    // Recalculate student's totalPerformance
    const performances = await performanceModel
      .find({ student: studentID })
      .select("performanceRating")
      .lean();

    const ratings = (performances || [])
      .map((p: any) =>
        typeof p.performanceRating === "number" && !isNaN(p.performanceRating)
          ? p.performanceRating
          : null
      )
      .filter((r): r is number => r !== null);

    const totalSum = ratings.reduce((a, b) => a + b, 0);
    const avg = ratings.length > 0 ? totalSum / ratings.length : 0;

    await studentModel.findByIdAndUpdate(studentID, { totalPerformance: avg });

    return res.status(201).json({
      message: "quiz entry created successfully",
      data: quizes,
      status: 201,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Error creating class subject quiz",
      status: 500,
      data: error.message,
    });
  }
};

// Mid Test

// export const createMidTestPerformance = async (
//   req: Request,
//   res: Response
// ): Promise<Response> => {
//   try {
//     const { studentID, quizID, subjectID } = req.params;
//     const {
//       studentScore,
//       studentGrade,
//       remark,
//       totalQuestions,
//       markPerQuestion,
//       status,
//     } = req.body;

//     const studentInfo: any = await studentModel
//       .findById(studentID)
//       .populate({ path: "performance" });

//     const quizData: any = await midTestModel.findById(quizID);

//     const subject = await subjectModel.findById(subjectID);

//     if (quizData) {
//       const existingAttempts = await performanceModel.countDocuments({
//         student: studentID,
//         quizID,
//       });
//       const attemptNumber = existingAttempts + 1;

//       const quizes = await performanceModel.create({
//         remark,
//         subjectTitle: quizData?.subjectTitle,
//         studentScore,
//         studentGrade,
//         totalQuestions,
//         markPerQuestion,
//         quizDone: true,
//         status,
//         performanceRating: parseInt(
//           ((studentScore / quizData?.quiz?.question.length) * 100).toFixed(2)
//         ),
//         attemptNumber,
//         className: studentInfo?.classAssigned,
//         quizID: quizID,
//         studentID,
//         studentName: `${studentInfo?.studentFirstName} ${studentInfo?.studentLastName}`,
//         studentAvatar: studentInfo.avatar,
//         subjectID: subject?._id,
//         student: studentID,
//       });

//       quizData?.performance?.push(new Types.ObjectId(quizes._id));
//       await quizData?.save();

//       // studentInfo?.performance?.push(new Types.ObjectId(quizes._id));
//       // await studentInfo?.save();

//       await studentModel.findByIdAndUpdate(
//         studentID,
//         { $push: { performance: new Types.ObjectId(quizes._id) } },
//         { new: true }
//       );

//       subject?.performance?.push(new Types.ObjectId(quizes._id));
//       await subject?.save();

//       // Recalculate student's totalPerformance using only valid numeric ratings
//       const getStudent = await studentModel.findById(studentID).populate({
//         path: "performance",
//       });

//       const ratings: number[] = [];
//       getStudent?.performance?.forEach((el: any) => {
//         if (
//           typeof el.performanceRating === "number" &&
//           !isNaN(el.performanceRating)
//         ) {
//           ratings.push(el.performanceRating);
//         }
//       });

//       const totalSum = ratings.reduce((a: number, b: number) => a + b, 0);
//       const count = ratings.length;
//       const avg = count > 0 ? totalSum / count : 0;

//       await studentModel.findByIdAndUpdate(
//         studentID,
//         { totalPerformance: avg },
//         { new: true }
//       );

//       return res.status(201).json({
//         message: "quiz entry created successfully",
//         data: quizes,
//         status: 201,
//       });
//     } else {
//       return res.status(404).json({
//         message: "Subject doesn't exist for this class",
//         status: 404,
//       });
//     }
//   } catch (error: any) {
//     return res.status(404).json({
//       message: "Error creating class subject quiz",
//       status: 404,
//       data: error.message,
//     });
//   }
// };

export const createMidTestPerformance = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { studentID, quizID, subjectID } = req.params;
    const {
      studentScore,
      studentGrade,
      remark,
      totalQuestions,
      markPerQuestion,
      status,
    } = req.body;

    if (!studentID || !quizID || !subjectID) {
      return res.status(400).json({
        message: "studentID, quizID and subjectID are required",
        status: 400,
      });
    }

    const studentInfo: any = await studentModel.findById(studentID);
    if (!studentInfo) {
      return res.status(404).json({ message: "Student not found", status: 404 });
    }

    const quizData: any = await midTestModel.findById(quizID);
    if (!quizData) {
      return res.status(404).json({ message: "Mid test not found", status: 404 });
    }

    const subject = await subjectModel.findById(subjectID);
    if (!subject) {
      return res.status(404).json({ message: "Subject not found", status: 404 });
    }

    const existingAttempts = await performanceModel.countDocuments({
      student: studentID,
      quizID,
    });
    const attemptNumber = existingAttempts + 1;

    const questionCount = quizData?.quiz?.question?.length || 1;
    const performanceRating = Number(((studentScore / questionCount) * 100).toFixed(2));

    const quizes = await performanceModel.create({
      remark,
      subjectTitle: quizData?.subjectTitle,
      studentScore,
      studentGrade,
      totalQuestions,
      markPerQuestion,
      quizDone: true,
      status,
      performanceRating,
      attemptNumber,
      className: studentInfo?.classAssigned,
      quizID: quizID,
      studentName: `${studentInfo?.studentFirstName || ""} ${studentInfo?.studentLastName || ""}`.trim(),
      studentAvatar: studentInfo?.avatar,
      subjectID: subject._id,
      student: studentID,
    });

    const perfId = new Types.ObjectId(quizes._id);

    const ensureAndPush = async (Model: any, id: any) => {
      const doc: any = await Model.findById(id).select("performance");
      if (!doc) return;
      if (!Array.isArray(doc.performance)) {
        doc.performance = [];
      }
      doc.performance.push(perfId);
      await doc.save();
    };

    await Promise.all([
      ensureAndPush(midTestModel, quizID),
      ensureAndPush(studentModel, studentID),
      ensureAndPush(subjectModel, subjectID),
    ]);

    // Recalculate student's totalPerformance
    const performances = await performanceModel
      .find({ student: studentID })
      .select("performanceRating")
      .lean();

    const ratings = (performances || [])
      .map((p: any) =>
        typeof p.performanceRating === "number" && !isNaN(p.performanceRating)
          ? p.performanceRating
          : null
      )
      .filter((r): r is number => r !== null);

    const totalSum = ratings.reduce((a, b) => a + b, 0);
    const avg = ratings.length > 0 ? totalSum / ratings.length : 0;

    await studentModel.findByIdAndUpdate(studentID, { totalPerformance: avg });

    return res.status(201).json({
      message: "Mid test performance created successfully",
      data: quizes,
      status: 201,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Error creating mid test performance",
      status: 500,
      data: error.message,
    });
  }
};

export const readSubjectMidTestResult = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { subjectID } = req.params;

    const subject = await subjectModel.findById(subjectID).populate({
      path: "performance",
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

export const readSubjectExamResult = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { subjectID } = req.params;

    const subject = await subjectModel.findById(subjectID).populate({
      path: "performance",
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

export const readOneSubjectExamResult = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { subjectID, quizID } = req.params;
    const quiz = await examinationModel.findById(quizID);

    const subject = await subjectModel.findById(subjectID).populate({
      path: "performance",
      options: { sort: { time: 1 } },
    });

    if (!quiz || !subject) {
      return res.status(404).json({
        message: "Subject or Quiz not found",
        status: 404,
      });
    }

    const idCompare = subject?.examination?.some(
      (id: any) => id.toString() === quiz._id.toString()
    );

    if (idCompare) {
      const filteredPerformance = subject?.performance?.filter(
        (el: any) => el.quizID.toString() === quiz._id.toString()
      );

      return res.status(201).json({
        message: "Filtered quiz performance read successfully",
        data: filteredPerformance,
        status: 201,
      });
    } else {
      return res.status(404).json({
        message: "QuizID and Subject Quiz don't align",
        status: 404,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Error reading subject quiz performance",
      status: 500,
    });
  }
};

export const readStudentExamResult = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { studentID } = req.params;

    const subject = await studentModel.findById(studentID).populate({
      path: "performance",
      options: {
        sort: {
          createdAt: -1,
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

export const readExamResult = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { quizID } = req.params;

    const subject = await examinationModel.findById(quizID).populate({
      path: "performance",
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

export const readOneSubjectMidTestResult = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { subjectID, quizID } = req.params;
    const quiz = await midTestModel.findById(quizID);

    const subject = await subjectModel.findById(subjectID).populate({
      path: "performance",
      options: { sort: { time: 1 } },
    });

    if (!quiz || !subject) {
      return res.status(404).json({
        message: "Subject or Quiz not found",
        status: 404,
      });
    }

    const idCompare = subject?.examination?.some(
      (id: any) => id.toString() === quiz._id.toString()
    );

    if (idCompare) {
      const filteredPerformance = subject?.performance?.filter(
        (el: any) => el.quizID.toString() === quiz._id.toString()
      );

      return res.status(201).json({
        message: "Filtered quiz performance read successfully",
        data: filteredPerformance,
        status: 201,
      });
    } else {
      return res.status(404).json({
        message: "QuizID and Subject Quiz don't align",
        status: 404,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Error reading subject quiz performance",
      status: 500,
    });
  }
};

export const readStudentMidTestResult = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { studentID } = req.params;

    const subject = await studentModel.findById(studentID).populate({
      path: "performance",
      options: {
        sort: {
          createdAt: -1,
        },
      },
    });

    const x = subject?.performance?.filter(
      (el: any) => el.status === "midTest"
    );

    return res.status(201).json({
      message: "subject quiz performance read successfully",
      data: x,
      status: 201,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error creating subject quiz",
      status: 404,
    });
  }
};

export const readMidTestResult = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { quizID } = req.params;

    const subject = await midTestModel.findById(quizID).populate({
      path: "performance",
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

export const readOneSubjectMidTestResultPreformance = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { subjectID, quizID } = req.params;
    const quiz = await midTestModel.findById(quizID);

    const subject = await subjectModel.findById(subjectID).populate({
      path: "performance",
      options: { sort: { time: 1 } },
    });

    if (!quiz || !subject) {
      return res.status(404).json({
        message: "Subject or Quiz not found",
        status: 404,
      });
    }

    const idCompare = subject?.examination?.some(
      (id: any) => id.toString() === quiz._id.toString()
    );

    if (idCompare) {
      const filteredPerformance = subject?.performance?.filter(
        (el: any) => el.quizID.toString() === quiz._id.toString()
      );

      return res.status(201).json({
        message: "Filtered quiz performance read successfully",
        data: filteredPerformance,
        status: 201,
      });
    } else {
      return res.status(404).json({
        message: "QuizID and Subject Quiz don't align",
        status: 404,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Error reading subject quiz performance",
      status: 500,
    });
  }
};

export const deletePerformance = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { performanceID } = req.params;

    if (!performanceID) {
      return res
        .status(400)
        .json({ message: "performanceID is required", status: 400 });
    }

    const perf: any = await performanceModel.findById(performanceID);

    if (!perf) {
      return res
        .status(404)
        .json({ message: "Performance not found", status: 404 });
    }

    const studentID = perf.student;
    const quizID = perf.quizID;

    // Delete the performance document
    await performanceModel.findByIdAndDelete(performanceID);

    // Remove references from possible quiz/exam/midTest entries
    await quizModel.updateMany(
      { performance: performanceID },
      { $pull: { performance: performanceID } }
    );
    await examinationModel.updateMany(
      { performance: performanceID },
      { $pull: { performance: performanceID } }
    );
    await midTestModel.updateMany(
      { performance: performanceID },
      { $pull: { performance: performanceID } }
    );

    // Remove from subject and student
    await subjectModel.updateMany(
      { performance: performanceID },
      { $pull: { performance: performanceID } }
    );
    await studentModel.updateMany(
      { performance: performanceID },
      { $pull: { performance: performanceID } }
    );

    // Recalculate student's totalPerformance
    if (studentID) {
      const student = await studentModel
        .findById(studentID)
        .populate({ path: "performance" });
      if (student) {
        const ratings: number[] = [];
        student.performance?.forEach((el: any) => {
          if (
            typeof el.performanceRating === "number" &&
            !isNaN(el.performanceRating)
          ) {
            ratings.push(el.performanceRating);
          }
        });

        const totalSum = ratings.reduce((a: number, b: number) => a + b, 0);
        const count = ratings.length;
        const avg = count > 0 ? totalSum / count : 0;

        await studentModel.findByIdAndUpdate(
          studentID,
          { totalPerformance: avg },
          { new: true }
        );
      }
    }

    return res
      .status(200)
      .json({ message: "Performance deleted successfully", status: 200 });
  } catch (error: any) {
    return res
      .status(500)
      .json({
        message: "Error deleting performance",
        data: error.message,
        status: 500,
      });
  }
};

export const deleteAllPerformancesForQuiz = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { quizID } = req.params;

    if (!quizID) {
      return res
        .status(400)
        .json({ message: "quizID is required", status: 400 });
    }

    // Find all performances for this quizID
    const performances = await performanceModel.find({ quizID }).lean();

    if (!performances || performances.length === 0) {
      return res
        .status(404)
        .json({ message: "No performances found for this quiz", status: 404 });
    }

    const perfIds = performances.map((p: any) => p._id);
    const studentIds = Array.from(
      new Set(performances.map((p: any) => String(p.student)).filter(Boolean))
    );

    // Remove references from quizzes, examinations, midTests, subjects and students
    await Promise.all([
      quizModel.updateMany(
        { performance: { $in: perfIds } },
        { $pull: { performance: { $in: perfIds } } }
      ),
      examinationModel.updateMany(
        { performance: { $in: perfIds } },
        { $pull: { performance: { $in: perfIds } } }
      ),
      midTestModel.updateMany(
        { performance: { $in: perfIds } },
        { $pull: { performance: { $in: perfIds } } }
      ),
      subjectModel.updateMany(
        { performance: { $in: perfIds } },
        { $pull: { performance: { $in: perfIds } } }
      ),
      studentModel.updateMany(
        { performance: { $in: perfIds } },
        { $pull: { performance: { $in: perfIds } } }
      ),
    ]);

    // Delete the performance documents themselves
    await performanceModel.deleteMany({ _id: { $in: perfIds } });

    // Recalculate totalPerformance for affected students
    await Promise.all(
      studentIds.map(async (sid) => {
        if (!sid) return;
        const remaining = await performanceModel
          .find({ student: sid })
          .select("performanceRating")
          .lean();

        const ratings = (remaining || [])
          .map((p: any) =>
            typeof p.performanceRating === "number" &&
            !isNaN(p.performanceRating)
              ? p.performanceRating
              : null
          )
          .filter((r: number | null): r is number => r !== null);

        const avg =
          ratings.length > 0
            ? ratings.reduce((a, b) => a + b, 0) / ratings.length
            : 0;

        await studentModel.findByIdAndUpdate(
          sid,
          { totalPerformance: avg },
          { new: true }
        );
      })
    );

    return res.status(200).json({
      message: "All performances for quiz deleted successfully",
      status: 200,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Error deleting performances for quiz",
      data: error?.message,
      status: 500,
    });
  }
};

export const deleteSelectedStudentsFromQuiz = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { quizID } = req.params;
    const { studentIDs } = req.body; // expect array of student IDs

    if (!quizID) {
      return res
        .status(400)
        .json({ message: "quizID is required", status: 400 });
    }

    if (!Array.isArray(studentIDs) || studentIDs.length === 0) {
      return res
        .status(400)
        .json({ message: "studentIDs (array) is required", status: 400 });
    }

    // Find performances for this quiz and the selected students
    const performances = await performanceModel
      .find({ quizID, student: { $in: studentIDs } })
      .lean();

    if (!performances || performances.length === 0) {
      return res
        .status(404)
        .json({
          message: "No matching performances found for given students and quiz",
          status: 404,
        });
    }

    const perfIds = performances.map((p: any) => p._id);
    const affectedStudents = Array.from(
      new Set(performances.map((p: any) => String(p.student)).filter(Boolean))
    );

    // Remove references from quiz/exam/midTest/subject/student documents
    await Promise.all([
      quizModel.updateMany(
        { performance: { $in: perfIds } },
        { $pull: { performance: { $in: perfIds } } }
      ),
      examinationModel.updateMany(
        { performance: { $in: perfIds } },
        { $pull: { performance: { $in: perfIds } } }
      ),
      midTestModel.updateMany(
        { performance: { $in: perfIds } },
        { $pull: { performance: { $in: perfIds } } }
      ),
      subjectModel.updateMany(
        { performance: { $in: perfIds } },
        { $pull: { performance: { $in: perfIds } } }
      ),
      studentModel.updateMany(
        { performance: { $in: perfIds } },
        { $pull: { performance: { $in: perfIds } } }
      ),
    ]);

    // Delete the performance documents
    await performanceModel.deleteMany({ _id: { $in: perfIds } });

    // Recalculate totalPerformance for each affected student
    await Promise.all(
      affectedStudents.map(async (sid) => {
        if (!sid) return;
        const remaining = await performanceModel
          .find({ student: sid })
          .select("performanceRating")
          .lean();
        const ratings = (remaining || [])
          .map((p: any) =>
            typeof p.performanceRating === "number" &&
            !isNaN(p.performanceRating)
              ? p.performanceRating
              : null
          )
          .filter((r: number | null): r is number => r !== null);

        const avg =
          ratings.length > 0
            ? ratings.reduce((a, b) => a + b, 0) / ratings.length
            : 0;
        await studentModel.findByIdAndUpdate(
          sid,
          { totalPerformance: avg },
          { new: true }
        );
      })
    );

    return res
      .status(200)
      .json({
        message: "Selected students performances deleted successfully",
        status: 200,
      });
  } catch (error: any) {
    return res
      .status(500)
      .json({
        message: "Error deleting selected students performances",
        data: error?.message,
        status: 500,
      });
  }
};
