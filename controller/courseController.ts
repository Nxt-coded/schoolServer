import { NextFunction, Request, Response } from "express";
import courseModel from "../model/courseModel";
import { handleError } from "../error/handleError";
import { mainError } from "../error/mianError";

// Create a new course
export const createCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const course = await courseModel.create(req.body);
    return res.status(201).json({
      message: "Course created successfully",
      data: course,
    });
  } catch (error:any) {
    return handleError(error, req, res, next);
  }
};

// Get all courses
export const getAllCourses = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const courses = await courseModel.find();
    return res.status(200).json({
      message: "Courses retrieved successfully",
      data: courses,
    });
  } catch (error:any) {
    return handleError(error, req, res, next);
  }
};

// Get a single course
export const getCourse = async (req: Request, res: Response) => {
  try {
    const course = await courseModel.findOne({ id: req.params.id });
    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }
    return res.status(200).json({
      message: "Course retrieved successfully",
      data: course,
    });
  } catch (error: any) {
    return handleError(error, req, res);
  }
};

// Update a course
export const updateCourse = async (req: Request, res: Response) => {
  try {
    const course = await courseModel.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }
    return res.status(200).json({
      message: "Course updated successfully",
      data: course,
    });
  } catch (error: any) {
    return handleError(error, req, res);
  }
};

// Delete a course
export const deleteCourse = async (req: Request, res: Response) => {
  try {
    const course = await courseModel.findOneAndDelete({ id: req.params.id });
    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }
    return res.status(200).json({
      message: "Course deleted successfully",
    });
  } catch (error: any) {
    return handleError(error, req, res);
  }
};

// Update topic completion status
export const updateTopicStatus = async (req: Request, res: Response) => {
  try {
    const { courseId, topicId } = req.params;
    const course = await courseModel.findOne({ id: courseId });

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    const topic = course.topics.find((t) => t.id === topicId);
    if (!topic) {
      return res.status(404).json({
        message: "Topic not found",
      });
    }

    topic.completed = !topic.completed;
    course.completedLessons = course.topics.filter((t) => t.completed).length;

    await course.save();

    return res.status(200).json({
      message: "Topic status updated successfully",
      data: course,
    });
  } catch (error: any) {
    return handleError(error, req, res);
  }
};
