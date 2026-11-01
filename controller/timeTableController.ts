import { Request, Response } from "express";
import { Types } from "mongoose";
import schoolModel from "../model/schoolModel";
import classroomModel from "../model/classroomModel";
import timetableModel from "../model/timetableModel";
import staffModel from "../model/staffModel";

export const createClassTimeTable = async (req: Request, res: Response) => {
  try {
    const { schoolID, classID } = req.params;
    const { subject, day, time } = req.body;

    const school = await schoolModel.findById(schoolID);
    if (!school || school.status !== "school-admin") {
      return res.status(404).json({ message: "School not found", status: 404 });
    }

    const classRoom = await classroomModel.findById(classID).populate("classSubjects");
    if (!classRoom) {
      return res.status(404).json({ message: "Classroom not found", status: 404 });
    }

    const isSubjectValid = classRoom.classSubjects.some((el: any) => el.subjectTitle === subject);
    const findTeacher = await staffModel.findById(classRoom.teacherID);

    if (isSubjectValid || ["Assembly", "Short Break", "Long Break"].includes(subject)) {
      const newTimeTable = await timetableModel.create({
        subject,
        day,
        time,
        CR: classRoom.className,
        subjectTeacherID: isSubjectValid ? findTeacher?._id : undefined,
      });

      classRoom.timeTable.push(new Types.ObjectId(newTimeTable._id));
      await classRoom.save();

      if (isSubjectValid && findTeacher) {
        findTeacher.schedule.push(new Types.ObjectId(newTimeTable._id));
        await findTeacher.save();
      }

      return res.status(201).json({
        message: "Timetable entry created successfully",
        data: newTimeTable,
        status: 201,
      });
    }

    return res.status(404).json({
      message: "Subject doesn't exist for this class",
      status: 404,
    });
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating class timetable",
      status: 404,
      error: error.message,
    });
  }
};

export const readClassTimeTable = async (req: Request, res: Response) => {
  try {
    const { classID } = req.params;

    const timeTable = await classroomModel.findById(classID).populate({
      path: "timeTable",
      options: { sort: { time: 1 } },
    });

    if (!timeTable) {
      return res.status(404).json({ message: "Class not found", status: 404 });
    }

    return res.status(200).json({
      message: "Timetable retrieved successfully",
      data: timeTable,
      status: 200,
    });
  } catch (error: any) {
    return res.status(404).json({
      message: "Error fetching timetable",
      status: 404,
      error: error.message,
    });
  }
};

export const readTeacherSchedule = async (req: Request, res: Response) => {
  try {
    const { teacherID } = req.params;

    const teacher = await staffModel.findById(teacherID).populate("schedule");
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found", status: 404 });
    }

    return res.status(200).json({
      message: "Schedule retrieved successfully",
      data: teacher.schedule,
      status: 200,
    });
  } catch (error: any) {
    return res.status(404).json({
      message: "Error fetching schedule",
      status: 404,
      error: error.message,
    });
  }
};

export const readTeacherAndTimeTableSubject = async (req: Request, res: Response) => {
  try {
    const { tableID, schoolID, classID } = req.params;
    const { subject } = req.body;

    const [time, school, classRoom] = await Promise.all([
      timetableModel.findById(tableID),
      schoolModel.findById(schoolID),
      classroomModel.findById(classID).populate("classSubjects"),
    ]);

    if (!school) {
      return res.status(404).json({ message: "School not found", status: 404 });
    }
    if (!classRoom) {
      return res.status(404).json({ message: "Classroom not found", status: 404 });
    }

    const isSubjectValid = classRoom.classSubjects.some((el: any) => el.subjectTitle === subject);
    if (!isSubjectValid) {
      return res.status(404).json({
        message: "Subject doesn't exist for this class",
        status: 404,
      });
    }

    const oldTeacher: any = await staffModel.findById(time?.subjectTeacherID);
    const newTeacher = await staffModel.findById(classRoom.teacherID);

    const updateSubject = await timetableModel.findByIdAndUpdate(
      tableID,
      { subject, subjectTeacherID: newTeacher?._id },
      { new: true }
    );

    if (oldTeacher) {
      oldTeacher?.schedule?.pull(tableID);
      await oldTeacher.save();
    }

    if (newTeacher) {
      newTeacher.schedule.push(new Types.ObjectId(updateSubject?._id));
      await newTeacher.save();
    }

    return res.status(200).json({
      message: "Timetable subject entry updated successfully",
      data: updateSubject,
      status: 200,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Error updating timetable",
      status: 500,
      error: error.message,
    });
  }
};

export const deleteTeacherAndTimeTableSubject = async (req: Request, res: Response) => {
  try {
    const { tableID, schoolID } = req.params;

    const [time, school] = await Promise.all([
      timetableModel.findById(tableID),
      schoolModel.findById(schoolID),
    ]);

    if (!school) {
      return res.status(404).json({ message: "School not found", status: 404 });
    }
    if (!time) {
      return res.status(404).json({ message: "Timetable entry not found", status: 404 });
    }

    const teacher: any = await staffModel.findById(time.subjectTeacherID);
    if (teacher) {
      teacher.schedule.pull(tableID);
      await teacher.save();
    }

    const deletedEntry = await timetableModel.findByIdAndDelete(tableID);

    return res.status(200).json({
      message: "Timetable subject entry deleted successfully",
      data: deletedEntry,
      status: 200,
    });
  } catch (error: any) {
    return res.status(404).json({
      message: "Error deleting timetable",
      status: 404,
      error: error.message,
    });
  }
};
