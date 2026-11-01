"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadDataUri = exports.uploadBuffer = exports.streamUpload = void 0;
const cloudinary_1 = __importDefault(require("./cloudinary"));
const streamifier_1 = __importDefault(require("streamifier"));
const streamUpload = async (req) => {
    return new Promise(async (resolve, reject) => {
        let stream = cloudinary_1.default.uploader.upload_stream((error, result) => {
            if (result) {
                return resolve(result);
            }
            else {
                return reject(error);
            }
        });
        streamifier_1.default.createReadStream(req.file.buffer).pipe(stream);
    });
};
exports.streamUpload = streamUpload;
// Upload a Buffer to Cloudinary using an upload stream
const uploadBuffer = async (buffer, folder) => {
    return new Promise((resolve, reject) => {
        const options = {};
        if (folder)
            options.folder = folder;
        const stream = cloudinary_1.default.uploader.upload_stream(options, (err, result) => {
            if (err)
                return reject(err);
            return resolve(result);
        });
        streamifier_1.default.createReadStream(buffer).pipe(stream);
    });
};
exports.uploadBuffer = uploadBuffer;
// Upload a data URI (data:...;base64,...) by decoding to Buffer then uploading
const uploadDataUri = async (dataUri, folder) => {
    const match = dataUri.match(/^data:(.+);base64,(.*)$/);
    if (!match) {
        throw new Error("Invalid data URI");
    }
    const base64 = match[2];
    const buffer = Buffer.from(base64, "base64");
    return (0, exports.uploadBuffer)(buffer, folder);
};
exports.uploadDataUri = uploadDataUri;
