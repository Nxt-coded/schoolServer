import {Request, Response} from "express"

import subjectTeachesModel from "../model/teachSubjectModel";


export const createTeachSubject = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {    
    
    const { title,
description,
totalLessons,
expectedOutcome,
instructor,
classCreatedFor,
credit,
relatedSubjectTags,
subjectImage, } = req.body;


const teachSubject = await subjectTeachesModel.create({
    title,
    description,
    totalLessons,
  expectedOutcome,
  instructor,
  classCreatedFor,
  credit,
  relatedSubjectTags,
  subjectImage,
});


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

export const updateTeachSubject = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {  
    const {teachSubjectID} = req.params
    const { title,
description,
totalLessons,
expectedOutcome,
instructor,
classCreatedFor,
credit,
relatedSubjectTags,
subjectImage, } = req.body;

    const teachSubject = await subjectTeachesModel.findByIdAndUpdate(teachSubjectID, {title,
      description,
      totalLessons,
      expectedOutcome,
      instructor,
      classCreatedFor,
      credit,
      relatedSubjectTags,
      subjectImage,
    },{new:true});

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

export const getOneTeachSubject = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {  
    const {teachSubjectID} = req.params
     const teachSubject = await subjectTeachesModel.findById(teachSubjectID);

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

export const deleteOneTeachSubject = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {  
    const {teachSubjectID} = req.params
     const teachSubject = await subjectTeachesModel.findByIdAndDelete(teachSubjectID);

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

export const getAllTeachSubject = async (
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