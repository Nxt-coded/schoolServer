import {Request, Response} from "express"

import subjectTeachesModel from "../model/teachSubjectModel";
import subjectTopicsModel from "../model/teachSubjectTopics";
import subjectTopicQuizesModel from "../model/teachTopicQuizesModel";
import { Types } from "mongoose";


export const createTeachSubjectTopicQuiz = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { question, explanation, correctAnswer, options } = req.body;

    const { topicID } = req.params;

    const getSubject = await subjectTopicsModel.findById(topicID);

    const teachSubject = await subjectTopicQuizesModel.create({
      question,
      explanation,
      correctAnswer,
      options,
    });

    getSubject?.quizQuestions.push(new Types.ObjectId(teachSubject._id));
    await getSubject?.save();

    return res.status(201).json({
      message: "teach subject created successfully",
      data: { teachSubject, getSubject },
      status: 201,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error creating teach subject ",
      data: error,
    });
  }
};

export const updateTeachSubjectTopicQuiz = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { teachSubjectTopicQuizID } = req.params;
    const { question, explanation, correctAnswer, options } = req.body;


    const teachSubject = await subjectTopicQuizesModel.findByIdAndUpdate(
      teachSubjectTopicQuizID,
      {
        question,
        explanation,
        correctAnswer,
        options,
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

export const getOneTeachSubjectTopicQuiz = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {  
    const {teachSubjectTopicID} = req.params
     const teachSubject = await subjectTopicsModel
       .findById(teachSubjectTopicID).populate({path: "quizQuestions"});


      return res.status(201).json({
        message: "teach subject created successfully",
        data: teachSubject,
        status: 201,
      });
    
  } catch (error) {
    console.log("error", error)
    return res.status(404).json({
      message: "Error creating teach subject ",
    });
  }
};

export const deleteOneTeachSubjectTopicQuiz = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {  
    const {teachSubjectTopicQuizID, subjectTopicID} = req.params

    const getSubject: any = await subjectTopicsModel.findById(subjectTopicID); 

    // await subjectTopicsModel.findByIdAndDelete(teachSubjectTopicQuizID);

     const teachSubject = await subjectTopicQuizesModel.findByIdAndDelete(
       teachSubjectTopicQuizID
     );

     getSubject?.quizQuestions?.pull(teachSubjectTopicQuizID!);
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

interface QuizQuestion {
  question: string;
  explanation: string;
  correctAnswer: string;
  options: string[];
}

export const createBulkTeachSubjectTopicQuiz = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { questions } = req.body as { questions: QuizQuestion[] };
    const { topicID } = req.params;

    // Find the subject topic
    const getSubject = await subjectTopicsModel.findById(topicID);

    if (!getSubject) {
      return res.status(404).json({
        message: "Topic not found",
        status: 404,
      });
    }

    // Create all quiz questions in bulk

    console.log(questions);

    const createdQuizzes = await subjectTopicQuizesModel.create(questions);

    // If createdQuizzes is a single document, convert it to an array
    const quizArray = Array.isArray(createdQuizzes)
      ? createdQuizzes
      : [createdQuizzes];

    // Add all quiz IDs to the topic's quizQuestions array
    const quizIds = quizArray.map((quiz) => new Types.ObjectId(quiz._id));
    getSubject.quizQuestions.push(...quizIds);

    await getSubject.save();

    return res.status(201).json({
      message: "Bulk quiz questions created successfully",
      data: {
        quizzes: createdQuizzes,
        topic: getSubject,
      },
      status: 201,
    });
  } catch (error) {
    console.error("Error creating bulk quiz questions:", error);
    return res.status(500).json({
      message: "Error creating bulk quiz questions",
      error: error instanceof Error ? error.message : "Unknown error",
      status: 500,
    });
  }
};