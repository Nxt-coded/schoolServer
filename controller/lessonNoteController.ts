import lodash from "lodash";
import { string } from "joi";
import { Request, Response } from "express";
import schoolModel from "../model/schoolModel";
import staffModel from "../model/staffModel";
import { Types } from "mongoose";
import lessonNoteModel from "../model/lessonNoteModel";
import classroomModel from "../model/classroomModel";
import studentModel from "../model/studentModel";

export const createClasslessonNote = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID, staffID } = req.params;

    const {
      week,
      endingAt,
      createDate,
      classes,
      subTopic,
      period,
      duration,
      instructionalMaterial,
      referenceMaterial,
      previousKnowledge,
      specificObjectives,
      content,
      evaluation,
      summary,
      presentation,
      assignment,
      topic,
      subject,
    } = req.body;

    const school = await schoolModel.findById(schoolID);
    const staff = await staffModel.findById(staffID);

    const classData = await classroomModel.findById(staff?.presentClassID);

    if (school && school.schoolName && staff) {
      const note = await lessonNoteModel.create({
        teacher: staff?.staffName,
        // teacherClass: staff?.classesAssigned,
        profilePic: staff?.avatar,
        teacherID: staff?._id,

        week,
        endingAt,
        createDate,
        classes,
        subTopic,
        period,
        duration,
        instructionalMaterial,
        referenceMaterial,
        previousKnowledge,
        specificObjectives,
        content,
        evaluation,
        summary,
        presentation,
        assignment,
        topic,
        subject,
        adminSignation: false,
      });

      school?.lessonNotes.push(new Types.ObjectId(note?._id));
      school?.save();

      staff?.lessonNotes.push(new Types.ObjectId(note?._id));
      staff?.save();

      classData?.lessonNotes.push(new Types.ObjectId(note?._id));
      classData?.save();

      return res.status(201).json({
        message: "lesson note created",
        data: note,
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
      message: "Error creating lesson Note",
      status: 404,
      data: error.message,
    });
  }
};

export const editClasslessonNote = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { staffID, lessonNodeID } = req.params;

    const {
      week,
      endingAt,
      createDate,
      classes,
      subTopic,
      period,
      duration,
      instructionalMaterial,
      referenceMaterial,
      previousKnowledge,
      specificObjectives,
      content,
      evaluation,
      summary,
      presentation,
      assignment,
      topic,
      subject,
    } = req.body;

    const staff = await staffModel.findById(staffID);

    if (staff) {
      const note = await lessonNoteModel.findByIdAndUpdate(
        lessonNodeID,
        {
          teacher: staff?.staffName,
          teacherClass: staff?.classesAssigned,
          teacherID: staff?._id,

          subject,
          topic,
          week,
          endingAt,
          createDate,
          classes,
          subTopic,
          period,
          duration,
          instructionalMaterial,
          referenceMaterial,
          previousKnowledge,
          specificObjectives,
          content,
          evaluation,
          summary,
          presentation,
          assignment,
          adminSignation: false,
        },
        { new: true }
      );

      return res.status(201).json({
        message: "lesson note updated successfully",
        data: note,
        status: 201,
      });
    } else {
      return res.status(404).json({
        message: "staff not found",
        status: 404,
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating lesson Note",
      status: 404,
      data: error.message,
    });
  }
};

export const createAdminLessonNoteReply = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;
    const { lessonNotedID } = req.params;

    const { responseDetail, deadline } = req.body;

    const school = await schoolModel.findById(schoolID);

    if (school && school.schoolName) {
      const note = await lessonNoteModel.findByIdAndUpdate(
        lessonNotedID,
        {
          responseDetail,
          deadline,
          messageSent: true,
        },
        { new: true }
      );

      return res.status(201).json({
        message: "Lesson Note Response Updated",
        data: note,
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
      message: "Error creating lesson Note",
      status: 404,
      data: error.message,
    });
  }
};

export const readAdminLessonNote = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;

    const school = await schoolModel.findById(schoolID);

    if (school && school.schoolName && school.status === "school-admin") {
      const note = await schoolModel
        .findById(schoolID)
        .populate({ path: "lessonNotes" });

      return res.status(200).json({
        message: "Reading admin's lesson note",
        data: note,
        status: 200,
      });
    } else {
      return res.status(404).json({
        message: "school not found",
        status: 404,
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error creating lesson Note",
      status: 404,
    });
  }
};

export const readTeacherLessonNote = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID, staffID } = req.params;

    const school = await schoolModel.findById(schoolID);
    const staff: any = await staffModel.findById(staffID);

    if (school && school.schoolName && staff.status === "school-teacher") {
      const note = await staffModel
        .findById(staffID)
        ?.populate({ path: "lessonNotes" });

      return res.status(200).json({
        message: "Reading teacher's lesson note",
        data: note,
        status: 200,
      });
    } else {
      return res.status(404).json({
        message: "school not found",
        status: 404,
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error creating lesson Note",
      status: 404,
    });
  }
};

export const readTeacherClassLessonNote = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { classID } = req.params;

    const note = await classroomModel
      .findById(classID)
      ?.populate({ path: "lessonNotes" });

    return res.status(200).json({
      message: "Reading teacher's lesson note",
      data: note,
      status: 200,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error creating lesson Note",
      status: 404,
    });
  }
};

export const approveTeacherLessonNote = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID, lessonID } = req.params;

    const school = await schoolModel.findById(schoolID);
    const lessonNote = await lessonNoteModel.findById(lessonID);

    if (
      school &&
      school.schoolName &&
      school.status === "school-admin" &&
      lessonNote
    ) {
      const note = await lessonNoteModel.findByIdAndUpdate(
        lessonNote?._id,
        { adminSignation: true },
        { new: true }
      );

      return res.status(200).json({
        message: "lesson note approved",
        data: note,
        status: 200,
      });
    } else {
      return res.status(404).json({
        message: "school not found",
        status: 404,
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error creating lesson Note",
      status: 404,
    });
  }
};

export const readLessonNote = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { lessonID } = req.params;

    const lessonNote = await lessonNoteModel.findById(lessonID);

    return res.status(200).json({
      message: "lesson note ",
      data: lessonNote,
      status: 200,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error creating lesson Note",
      status: 404,
    });
  }
};

export const readTeacherLessonNotesRate = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { teacherID } = req.params;

    const lessonNote = await staffModel.findById(teacherID).populate({
      path: "lessonNotes",
    });

    return res.status(200).json({
      message: "lesson note ",
      data: lessonNote,
      status: 200,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error creating lesson Note",
      status: 404,
    });
  }
};

export const rateLessonNote = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { lessonID, studentID } = req.params;
    const { rate } = req.body;
    const student = await studentModel.findById(studentID);
    const lessonNote: any = await lessonNoteModel.findById(lessonID);

    const teacher = await staffModel
      .findById(lessonNote.teacherID)
      .populate({ path: "lessonNotes" });

    const check = lessonNote?.rateData.some((el: any) => {
      return el.id === studentID;
    });
    if (student && lessonNote) {
      // if (!check) {
      // let dataNote = [...lessonNote?.rateData, { id: studentID, rate }];

      const lessonNoteData = await lessonNoteModel.findByIdAndUpdate(
        lessonNote?._id,
        {
          rateData: [...lessonNote?.rateData, { id: studentID, rate }],
        },
        { new: true }
      );

      const lessonNoteDate = await lessonNoteModel.findByIdAndUpdate(
        lessonNoteData?._id,
        {
          rate:
            lessonNote.rateData
              .map((el: any) => {
                if (el.rate === undefined) {
                  return (el.rate = 0);
                } else {
                  return parseInt(el.rate);
                }
              })
              .reduce((a: number, b: number) => a + b) /
            lessonNote.rateData.length,
        },
        { new: true }
      );

      const lesson = await lessonNoteModel.findById(lessonNoteDate?._id);

      await staffModel.findByIdAndUpdate(
        teacher?._id,
        {
          staffRating:
            teacher?.lessonNotes
              .map((el: any) => {
                if (el.rate === undefined) {
                  return (el.rate = 0);
                } else {
                  return el.rate;
                }
              })
              .reduce((a: number, b: number) => {
                return a + b;
              }) / teacher?.lessonNotes.length!,
        },
        { new: true }
      );

      return res.status(200).json({
        message: "lesson note rated",
        data: lesson,
        status: 200,
      });
      // }
      // else {
      //   return res.status(404).json({
      //     message: "Already rated",
      //     status: 404,
      //   });
      // }
    } else {
      return res.status(404).json({
        message: "Student can't be fine",
        status: 404,
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating lesson Note",
      status: 404,
      data: error.message,
    });
  }
};
