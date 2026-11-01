import {Request, Response} from "express"

import subjectTeachesModel from "../model/teachSubjectModel";
import subjectTopicsModel from "../model/teachSubjectTopics";
import { Types } from "mongoose";


export const createTeachSubjectTopic = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {    
    

    
    const { 
title,
duration,
video,
description,

topicImage,


keyPoints,
// quizQuestions: Array<{}>;
// subjectTopic: {};
     } = req.body;

     const {subjectID} = req.params
const getSubject = await subjectTeachesModel.findById(subjectID);

const teachSubject = await subjectTopicsModel.create({
  title,
  duration,
  video,
  description,
  topicImage,
  keyPoints,
});

getSubject?.topics.push(new Types.ObjectId(teachSubject._id));
await getSubject?.save()

      return res.status(201).json({
        message: "teach subject created successfully",
        data: teachSubject,
        status: 201,
      });
    
  } catch (error) {
    
    return res.status(404).json({
      message: "Error creating teach subject ",
      data:error,
    });
  }
};

export const updateTeachSubjectTopic = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {  
    const {teachSubjectTopicID} = req.params
    const {
      title,
      duration,
      video,
      description,

      topicImage,

      keyPoints,
    } = req.body;

    const teachSubject = await subjectTopicsModel.findByIdAndUpdate(
      teachSubjectTopicID,
      {
        title,
        duration,
        video,
        description,

        topicImage,

        keyPoints,
      },
      { new: true }
    );

      return res.status(201).json({
        message: "teach subject updated successfully",
        data: teachSubject,
        status: 201,
      });
    
  } catch (error) {
    return res.status(404).json({
      message: "Error creating teach subject ",
    });
  }
};

export const getOneTeachSubjectTopic = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { teachSubjectTopicID } = req.params;
    const teachSubject = await subjectTeachesModel
      .findById(teachSubjectTopicID)
      .populate({ path: "topics" });

    return res.status(201).json({
      message: "teach subject created successfully",
      data: teachSubject,
      status: 201,
    });
  } catch (error) {
    console.log("error", error);
    return res.status(404).json({
      message: "Error creating teach subject ",
    });
  }
};

export const getOneTeachSubjectTopicNow = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { teachSubjectTopicID } = req.params;
    console.log("teachSubjectTopicID", teachSubjectTopicID);
    const teachSubject = await subjectTopicsModel.findById(teachSubjectTopicID);

    return res.status(201).json({
      message: "teach subject created successfully",
      data: teachSubject,
      status: 201,
    });
  } catch (error) {
    console.log("error", error);
    return res.status(404).json({
      message: "Error creating teach subject ",
    });
  }
};

export const deleteOneTeachSubjectTopic = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {  
    const {teachSubjectTopicID, subjectID} = req.params

    const getSubject:any = await subjectTeachesModel.findById(subjectID); 

    await subjectTopicsModel.findByIdAndDelete(
       teachSubjectTopicID
     );
     const teachSubject = await subjectTopicsModel.findByIdAndDelete(teachSubjectTopicID);

     getSubject?.topics?.pull(subjectID!);
     await getSubject?.save();

      return res.status(201).json({
        message: "teach subject deleted successfully",
        data: teachSubject,
        status: 201,
      });
    
  } catch (error) {
    return res.status(404).json({
      message: "Error deleting teach subject ",
    });
  }
};

export const getAllTeachSubjectTopic = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {    


    const teachSubject = await subjectTeachesModel.find();

      return res.status(201).json({
        message: "teach subject created successfully",
        data: teachSubject,
        status: 201,
      });
    
  } catch (error) {
    return res.status(404).json({
      message: "Error creating teach subject ",
    });
  }
};