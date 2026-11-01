import express, { Request, Response } from "express";
import fs from "fs";
import crypto from "crypto"
import schemeOfWorkModel from "../model/schemeOfWorkModel";
import schoolModel from "../model/schoolModel";

export const createScheme = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    let data: string;
    if (req.file.buffer) {
      data = req.file.buffer.toString("utf-8");
    } else if (req.file.path) {
      data = fs.readFileSync(req.file.path, "utf-8");
    } else {
      return res
        .status(500)
        .json({ message: "File storage method is unclear." });
    }

    let jsonData;
    try {
      jsonData = JSON.parse(data);
    } catch (parseError: any) {
      return res.status(400).json({
        message: "Invalid JSON format in the uploaded file",
        error: parseError.message,
      });
    }

    if (jsonData.schemes) {
      jsonData = jsonData.schemes;
    }

    if (!Array.isArray(jsonData)) {
      return res
        .status(400)
        .json({ message: "Uploaded file should contain an array of schemes." });
    }

    if (jsonData.length === 0) {
      return res.status(400).json({ message: "JSON array is empty." });
    }

    const schemesToInsert = jsonData.map((item: any, index: number) => {
      const requiredFields = ["weeks", "subject", "class", "term"];
      for (const field of requiredFields) {
        if (!(field in item)) {
          throw new Error(
            `Missing required field '${field}' in scheme at index ${index}.`
          );
        }
      }

      return {
        weeks: item.weeks,
        topics: item.topics || [],
        subject: item.subject,
        status: item.status,
        classType: item.class,
        term: item.term,
        learningObject: item.learningObjects || [],
        learningActivities: item.learningActivities || [],
        embeddedCoreSkills: item.embeddedCoreSkills || [],
        learningResource: item.learningResources || [],
        createdAt: new Date(),
        updatedAt: new Date(),
        marked: true,
      };
    });

    // Insert into the database
    const insertedSchemes = await schemeOfWorkModel.insertMany(schemesToInsert);

    return res.status(201).json({
      message: "Successfully processed and inserted schemes.",
      status: 201,
      data: insertedSchemes,
    });
  } catch (error: any) {
    console.error("Error while processing bulk upload:", error.message);
    return res.status(500).json({
      message: "An error occurred while processing the bulk upload.",
      error: error.message,
    });
  }
};
export const getSchemeByClassAndSubject = async (
  req: Request,
  res: Response
) => {
  try {
    const { classType, subject, term } = req.params;

    if (!classType || !subject || !term) {
      return res
        .status(400)
        .json({ message: "Class and subject are required." });
    }

    const schemes = await schemeOfWorkModel.find({ classType, subject, term });

    if (schemes.length === 0) {
      return res.status(404).json({
        message: "No schemes found for the specified class and subject.",
      });
    }

    return res.status(200).json({
      message: "Schemes retrieved successfully.",
      data: schemes,
    });
  } catch (error: any) {
    console.error("Error while fetching schemes:", error);
    return res.status(500).json({
      message: "An error occurred while fetching the schemes.",
      error: error.message,
    });
  }
};
export const getSchemeOfWork = async (req: Request, res: Response) => {
  try {
    const getScheme = await schemeOfWorkModel.find();
   
    return res.status(200).json({
      message: "Successfully getting scheme of work entry.",
      status: 201,
      data: getScheme
    });
  } catch (error) {
    return res.status(404).json({
      message: "error processed scheme of work entry.",
      status: 404,
    });
  }
};
export const deleteScheme = async (req: Request, res: Response) => {
  try {
    const { schemeID } = req.params;
    const deletes = await schemeOfWorkModel.findByIdAndDelete(schemeID);

    return res.status(200).json({
      message: "Successfully deleting scheme of work.",
      status: 201,
      data: deletes,
    });
  } catch (error) {
    return res.status(200).json({
      message: "error deleting scheme of work entry.",
      status: 201,
    });
  }
};
export const getMarkedSchemes = async (req: Request, res: Response) => {
  try {
   
    const markedSchemes = await schemeOfWorkModel.find({});
    if (markedSchemes.length === 0) {
      return res.status(404).json({
        message: "No marked schemes found.",
      });
    }

    return res.status(200).json({
      message: "Marked schemes retrieved successfully.",
      data: markedSchemes,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "An error occurred while fetching marked schemes.",
      error: error.message,
    });
  }
};
