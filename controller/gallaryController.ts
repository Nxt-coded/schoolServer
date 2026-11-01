import { Request, Response } from "express";
import schoolModel from "../model/schoolModel";
import { Types } from "mongoose";
import { streamUpload } from "../utils/streamifier";
import cloudinary from "../utils/cloudinary";
import gallaryModel from "../model/gallaryModel";

export const createSchoolGallary = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;
    const { title, description } = req.body;

    const school = await schoolModel.findById(schoolID);

    const { secure_url, public_id }: any = await streamUpload(req);

    if (school) {
      const store = await gallaryModel.create({
        title,
        description,
        avatar: secure_url,
        avatarID: public_id,
      });

      school?.gallaries.push(new Types.ObjectId(store._id));
      school.save();

      return res.status(201).json({
        message: "image uploaded gallary successfully",
        data: store,
        status: 201,
      });
    } else {
      return res.status(404).json({
        message: "unable to read school",
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating school session",
      data: error.message,
    });
  }
};

export const createRestrictedSchoolGallary = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;
    const { title, description } = req.body;

    const school = await schoolModel.findById(schoolID).populate({
      path: "gallaries",
      options: {
        sort: {
          createdAt: -1,
        },
      },
    });

    if (school) {
      if (school?.gallaries?.length! > 10) {
        return res.status(404).json({
          message: "Please upgrade your account to upload more images",
          status: 404,
        });
      } else {
        const { secure_url, public_id }: any = await streamUpload(req);

        const gallary = await gallaryModel.create({
          title,
          description,
          avatar: secure_url,
          avatarID: public_id,
        });

        school?.gallaries.push(new Types.ObjectId(gallary._id));
        school.save();

        return res.status(201).json({
          message: "image uploaded gallary successfully",
          data: gallary,
          status: 201,
        });
      }
    } else {
      return res.status(404).json({
        message: "unable to read school",
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating school session",
      data: error.message,
    });
  }
};

export const viewSchoolGallary = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;
    const gallary = await schoolModel.findById(schoolID).populate({
      path: "gallaries",
    });

    return res.status(200).json({
      message: "viewing school gallaries",
      data: gallary?.gallaries,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error viewing school session",
    });
  }
};

export const deleteSchoolGallary = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID, galleryID } = req.params;

    if (!schoolID || !galleryID) {
      return res.status(400).json({
        message: "schoolID and galleryID are required",
        status: 400,
      });
    }

    const school: any = await schoolModel
      .findById(schoolID)
      .populate({ path: "gallaries" });
    if (!school) {
      return res.status(404).json({ message: "School not found", status: 404 });
    }

    const gallery = await gallaryModel.findById(galleryID);
    if (!gallery) {
      return res
        .status(404)
        .json({ message: "Gallery item not found", status: 404 });
    }

    // ensure the gallery belongs to this school (either via gallery.school or school's gallaries array)
    const belongsToSchool =
      (gallery.school && gallery.school.toString() === schoolID) ||
      (Array.isArray(school.gallaries) &&
        school.gallaries.some((g: any) =>
          g && g._id
            ? g._id.toString() === galleryID
            : g.toString() === galleryID
        ));

    if (!belongsToSchool) {
      return res.status(400).json({
        message: "Gallery does not belong to the specified school",
        status: 400,
      });
    }

    // attempt to delete cloud asset if present, but don't fail the whole operation on cloud errors
    const publicId =
      (gallery as any).avatarID ||
      (gallery as any).public_id ||
      (gallery as any).imageID;
    if (publicId) {
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (err: any) {
        console.error(
          "Failed to destroy cloud asset",
          publicId,
          err?.message || err
        );
        // continue — asset deletion failure shouldn't block DB cleanup
      }
    }

    // delete the gallery document and remove reference from school.gallaries
    const deleted = await gallaryModel.findByIdAndDelete(galleryID).lean();

    // remove reference safely using $pull (works even if school's gallaries contains null)
    await schoolModel.findByIdAndUpdate(schoolID, {
      $pull: { gallaries: galleryID },
    });

    return res.status(200).json({
      message: "Gallery deleted successfully",
      data: deleted,
      status: 200,
    });
  } catch (error: any) {
    console.error("Error deleting school gallery:", error);
    return res.status(500).json({
      message: "Error deleting school gallery",
      error: error?.message,
      status: 500,
    });
  }
};
