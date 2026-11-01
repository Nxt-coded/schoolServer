import { Request, Response } from "express";
import { extractRawTextFromDocx } from "../utils/docxUtils";
import { virtualSplit, parseQuizText } from "../utils/quizParsingUtils";
import { generateDocxBuffer } from "../utils/docxGenerator";
import * as fs from "fs";

export const repairDocx = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const uploadedPath = req.file.path;
    
    // 1. Extract raw text with high-fidelity (math/chem support)
    const rawText = await extractRawTextFromDocx(uploadedPath);
    
    // 2. Apply virtual splitting to handle merged lines
    const splitText = virtualSplit(rawText);
    
    // 3. Parse into structured JSON
    const questions = parseQuizText(splitText);
    
    if (questions.length === 0) {
      return res.status(400).json({
        message: "Could not find any questions in the document. Please check the format.",
        debugRawText: rawText.slice(0, 500)
      });
    }

    // 4. Generate a clean DOCX
    const buffer = generateDocxBuffer(questions);
    
    // 5. Cleanup uploaded file
    try {
      fs.unlinkSync(uploadedPath);
    } catch (e) {
      console.warn("Failed to delete temp file:", uploadedPath);
    }

    // 6. Return the file
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.setHeader("Content-Disposition", `attachment; filename=Repaired_Quiz_${Date.now()}.docx`);
    
    return res.status(200).send(buffer);
    
  } catch (error: any) {
    console.error("DOCX Repair Error:", error);
    return res.status(500).json({
      message: "Internal server error during DOCX repair",
      error: error.message
    });
  }
};
