import { Request, Response } from "express";
import schoolModel from "../model/schoolModel";
import { Types } from "mongoose";
import articleModel from "../model/articleModel";
import studentModel from "../model/studentModel";
import { viewStudentAttendance } from "./attendanceController";
import { streamUpload } from "../utils/streamifier";
import staffModel from "../model/staffModel";

export const createArticle = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID, studentID } = req.params;
    const { title, content, desc } = req.body;

    const school = await schoolModel.findById(schoolID);
    const student = await studentModel.findById(studentID);

    if (school && student) {
      const { secure_url }: any = await streamUpload(req);
      const article = await articleModel.create({
        coverImage: secure_url,
        schoolID,
        studentID,
        title,
        content,
        desc,
        student: `${student.studentFirstName} ${student.studentLastName}`,
        avatar: student.avatar,
      });

      school.articles.push(new Types.ObjectId(article?._id));
      school?.save();
      student.articles.push(new Types.ObjectId(article?._id));
      student?.save();

      return res.status(201).json({
        message: "Article created successfully",
        data: article,
        status: 201,
      });
    } else {
      return res.status(404).json({
        message: "Error creating article",
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

export const createTeacherArticle = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID, teacherID } = req.params;
    const { title, content, desc } = req.body;

    const school = await schoolModel.findById(schoolID);
    const student = await staffModel.findById(teacherID);

    if (school && student) {
      const { secure_url }: any = await streamUpload(req);
      const article = await articleModel.create({
        coverImage: secure_url,
        schoolID,
        studentID: teacherID,
        title,
        content,
        desc,
        student: `${student.staffName} `,
        avatar: student.avatar,
      });

      school.articles.push(new Types.ObjectId(article?._id));
      school?.save();
      student.articles.push(new Types.ObjectId(article?._id));
      student?.save();

      return res.status(201).json({
        message: "Article created successfully",
        data: article,
        status: 201,
      });
    } else {
      return res.status(404).json({
        message: "Error creating article",
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

export const readAllArticles = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;

    const school = await schoolModel
      .findById(schoolID)
      .populate({ path: "articles", options: { sort: { createdAt: -1 } } });

    if (school) {
      return res.status(201).json({
        message: "Article created successfully",
        data: school.articles,
        status: 201,
      });
    } else {
      return res.status(404).json({
        message: "Error reading article",
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

export const readOneArticle = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { articleID } = req.params;

    const article = await articleModel.findById(articleID);

    return res.status(200).json({
      message: "Reading one article",
      data: article,
      status: 201,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error creating class subject quiz",
      status: 404,
    });
  }
};

export const likeArticle = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { articleID, readerID } = req.params;
    const article = await articleModel.findById(articleID);

    const check = article?.like?.some((el: any) => {
      return el === readerID;
    });

    if (!check) {
      await articleModel.findByIdAndUpdate(
        articleID,
        {
          like: [...article?.like!, readerID!],
        },
        { new: true }
      );

      return res.status(200).json({
        message: "Reading one article",
        data: article,
        status: 201,
      });
    } else {
      return res.status(404).json({
        message: "can't like again",
        status: 201,
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error creating class subject quiz",
      status: 404,
    });
  }
};

export const viewArticle = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { articleID, readerID } = req.params;
    const article = await articleModel.findById(articleID);

    const check = article?.view?.some((el: any) => {
      return el === readerID;
    });

    if (!check) {
      await articleModel.findByIdAndUpdate(
        articleID,
        {
          view: [...article?.view!, readerID!],
        },
        { new: true }
      );

      return res.status(200).json({
        message: "Reading one article",
        data: article,
        status: 201,
      });
    } else {
      return res.status(200).json({
        message: "can't reAdd",
        status: 201,
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error creating class subject quiz",
      status: 404,
    });
  }
};

export const deleteOneArticle = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID, articleID, studentName } = req.params;

    const school: any = await schoolModel.findById(schoolID);
    const student: any = await studentModel.findOne({
      studentFirstName: `${studentName.split(" ")[0]}`,
    });

    if (school && student) {
      const article = await articleModel.findByIdAndDelete(articleID);
      school.articles.pull(new Types.ObjectId(articleID));
      school?.save();
      student.articles.pull(new Types.ObjectId(articleID));
      student?.save();

      return res.status(200).json({
        message: "Reading one article",
        data: article,
        status: 201,
      });
    } else {
      return res.status(404).json({
        message: "Error deleting article",
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
