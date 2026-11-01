import { Request, Response } from "express";
import cardReportModel from "../model/cardReportModel";
import studentModel from "../model/studentModel";
import schoolModel from "../model/schoolModel";

export const removeSubjectFromResult = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { studentID } = req.params;
    const { subject } = req.body;

    // Find the student with their report card
    const student: any = await studentModel.findById(studentID).populate({
      path: "reportCard",
    });

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
        status: 404,
      });
    }

    // Get the current session's report card
    const school: any = await schoolModel.findById(student?.schoolIDs);
    const currentClassInfo = `${student?.classAssigned} session: ${school?.presentSession!}(${school?.presentTerm!})`;
    
    const reportCard = student.reportCard.find((card: any) => 
      card.classInfo === currentClassInfo
    );

    if (!reportCard) {
      return res.status(404).json({
        message: "Report card not found for current session",
        status: 404,
      });
    }

    // Filter out the subject from results
    const updatedResults = reportCard.result.filter((result: any) => 
      result.subject !== subject
    );

    if (updatedResults.length === reportCard.result.length) {
      return res.status(404).json({
        message: "Subject not found in report card",
        status: 404,
      });
    }

    // Update report card with filtered results
    const updatedReport = await cardReportModel.findByIdAndUpdate(
      reportCard._id,
      {
        result: updatedResults,
        // Recalculate total points and grade based on remaining subjects
        points: parseFloat(
          (updatedResults
            .map((el: any) => el.points)
            .reduce((a: number, b: number) => a + b, 0) / updatedResults.length
          ).toFixed(2)
        )
      },
      { new: true }
    );

    return res.status(200).json({
      message: "Subject removed from report card successfully",
      data: updatedReport,
      status: 200,
    });

  } catch (error: any) {
    return res.status(500).json({
      message: "Error removing subject from report card",
      data: error.message,
      status: 500,
    });
  }
};