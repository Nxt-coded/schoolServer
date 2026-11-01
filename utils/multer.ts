import { Request } from "express";
import multer from "multer";
import fs from "node:fs";
import path from "node:path";

import os from "node:os";

let filePath = path.join(os.tmpdir(), "examination");

if (!fs.existsSync(filePath)) {
  try {
    fs.mkdirSync(filePath, { recursive: true });
    console.log("folder created in tmp");
  } catch (err) {
    console.error("Error creating tmp folder:", err);
    // fallback to os.tmpdir() directly if subdirectory creation fails
    filePath = os.tmpdir();
  }
} else {
  console.log("folder exist in tmp...");
}

const storage = multer.diskStorage({
  destination: function (req: Request, file: any, cb: any) {
    cb(null, filePath);
  },
  filename: function (req: any, file: any, cb: any) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

export const fileUpload = multer({ storage: storage }).single("file");

export const fileUploads = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    file.mimetype === "application/json";
    cb(null, true);
  },
}).single("file");
