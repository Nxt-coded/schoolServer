import cloudinary from "./cloudinary";
import streamifier from "streamifier";

export const streamUpload = async (req: any) => {
  return new Promise(async (resolve, reject) => {
    let stream = cloudinary.uploader.upload_stream(
      (error: Error, result: any) => {
        if (result) {
          return resolve(result);
        } else {
          return reject(error);
        }
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(stream);
  });
};

// Upload a Buffer to Cloudinary using an upload stream
export const uploadBuffer = async (buffer: Buffer, folder?: string) => {
  return new Promise<any>((resolve, reject) => {
    const options: any = {};
    if (folder) options.folder = folder;
    const stream = cloudinary.uploader.upload_stream(options, (err: any, result: any) => {
      if (err) return reject(err);
      return resolve(result);
    });
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// Upload a data URI (data:...;base64,...) by decoding to Buffer then uploading
export const uploadDataUri = async (dataUri: string, folder?: string) => {
  const match = dataUri.match(/^data:(.+);base64,(.*)$/);
  if (!match) {
    throw new Error("Invalid data URI");
  }
  const base64 = match[2];
  const buffer = Buffer.from(base64, "base64");
  return uploadBuffer(buffer, folder);
};
