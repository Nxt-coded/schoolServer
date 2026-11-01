"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.repairDocx = void 0;
const docxUtils_1 = require("../utils/docxUtils");
const quizParsingUtils_1 = require("../utils/quizParsingUtils");
const docxGenerator_1 = require("../utils/docxGenerator");
const fs = __importStar(require("fs"));
const repairDocx = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        const uploadedPath = req.file.path;
        // 1. Extract raw text with high-fidelity (math/chem support)
        const rawText = await (0, docxUtils_1.extractRawTextFromDocx)(uploadedPath);
        // 2. Apply virtual splitting to handle merged lines
        const splitText = (0, quizParsingUtils_1.virtualSplit)(rawText);
        // 3. Parse into structured JSON
        const questions = (0, quizParsingUtils_1.parseQuizText)(splitText);
        if (questions.length === 0) {
            return res.status(400).json({
                message: "Could not find any questions in the document. Please check the format.",
                debugRawText: rawText.slice(0, 500)
            });
        }
        // 4. Generate a clean DOCX
        const buffer = (0, docxGenerator_1.generateDocxBuffer)(questions);
        // 5. Cleanup uploaded file
        try {
            fs.unlinkSync(uploadedPath);
        }
        catch (e) {
            console.warn("Failed to delete temp file:", uploadedPath);
        }
        // 6. Return the file
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        res.setHeader("Content-Disposition", `attachment; filename=Repaired_Quiz_${Date.now()}.docx`);
        return res.status(200).send(buffer);
    }
    catch (error) {
        console.error("DOCX Repair Error:", error);
        return res.status(500).json({
            message: "Internal server error during DOCX repair",
            error: error.message
        });
    }
};
exports.repairDocx = repairDocx;
