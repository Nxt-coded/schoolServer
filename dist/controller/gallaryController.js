"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSchoolGallary = exports.viewSchoolGallary = exports.createRestrictedSchoolGallary = exports.createSchoolGallary = void 0;
const schoolModel_1 = __importDefault(require("../model/schoolModel"));
const mongoose_1 = require("mongoose");
const streamifier_1 = require("../utils/streamifier");
const cloudinary_1 = __importDefault(require("../utils/cloudinary"));
const gallaryModel_1 = __importDefault(require("../model/gallaryModel"));
const createSchoolGallary = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const { title, description } = req.body;
        const school = await schoolModel_1.default.findById(schoolID);
        const { secure_url, public_id } = await (0, streamifier_1.streamUpload)(req);
        if (school) {
            const store = await gallaryModel_1.default.create({
                title,
                description,
                avatar: secure_url,
                avatarID: public_id,
            });
            school?.gallaries.push(new mongoose_1.Types.ObjectId(store._id));
            school.save();
            return res.status(201).json({
                message: "image uploaded gallary successfully",
                data: store,
                status: 201,
            });
        }
        else {
            return res.status(404).json({
                message: "unable to read school",
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school session",
            data: error.message,
        });
    }
};
exports.createSchoolGallary = createSchoolGallary;
const createRestrictedSchoolGallary = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const { title, description } = req.body;
        const school = await schoolModel_1.default.findById(schoolID).populate({
            path: "gallaries",
            options: {
                sort: {
                    createdAt: -1,
                },
            },
        });
        if (school) {
            if (school?.gallaries?.length > 10) {
                return res.status(404).json({
                    message: "Please upgrade your account to upload more images",
                    status: 404,
                });
            }
            else {
                const { secure_url, public_id } = await (0, streamifier_1.streamUpload)(req);
                const gallary = await gallaryModel_1.default.create({
                    title,
                    description,
                    avatar: secure_url,
                    avatarID: public_id,
                });
                school?.gallaries.push(new mongoose_1.Types.ObjectId(gallary._id));
                school.save();
                return res.status(201).json({
                    message: "image uploaded gallary successfully",
                    data: gallary,
                    status: 201,
                });
            }
        }
        else {
            return res.status(404).json({
                message: "unable to read school",
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school session",
            data: error.message,
        });
    }
};
exports.createRestrictedSchoolGallary = createRestrictedSchoolGallary;
const viewSchoolGallary = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const gallary = await schoolModel_1.default.findById(schoolID).populate({
            path: "gallaries",
        });
        return res.status(200).json({
            message: "viewing school gallaries",
            data: gallary?.gallaries,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error viewing school session",
        });
    }
};
exports.viewSchoolGallary = viewSchoolGallary;
const deleteSchoolGallary = async (req, res) => {
    try {
        const { schoolID, galleryID } = req.params;
        if (!schoolID || !galleryID) {
            return res.status(400).json({
                message: "schoolID and galleryID are required",
                status: 400,
            });
        }
        const school = await schoolModel_1.default
            .findById(schoolID)
            .populate({ path: "gallaries" });
        if (!school) {
            return res.status(404).json({ message: "School not found", status: 404 });
        }
        const gallery = await gallaryModel_1.default.findById(galleryID);
        if (!gallery) {
            return res
                .status(404)
                .json({ message: "Gallery item not found", status: 404 });
        }
        // ensure the gallery belongs to this school (either via gallery.school or school's gallaries array)
        const belongsToSchool = (gallery.school && gallery.school.toString() === schoolID) ||
            (Array.isArray(school.gallaries) &&
                school.gallaries.some((g) => g && g._id
                    ? g._id.toString() === galleryID
                    : g.toString() === galleryID));
        if (!belongsToSchool) {
            return res.status(400).json({
                message: "Gallery does not belong to the specified school",
                status: 400,
            });
        }
        // attempt to delete cloud asset if present, but don't fail the whole operation on cloud errors
        const publicId = gallery.avatarID ||
            gallery.public_id ||
            gallery.imageID;
        if (publicId) {
            try {
                await cloudinary_1.default.uploader.destroy(publicId);
            }
            catch (err) {
                console.error("Failed to destroy cloud asset", publicId, err?.message || err);
                // continue — asset deletion failure shouldn't block DB cleanup
            }
        }
        // delete the gallery document and remove reference from school.gallaries
        const deleted = await gallaryModel_1.default.findByIdAndDelete(galleryID).lean();
        // remove reference safely using $pull (works even if school's gallaries contains null)
        await schoolModel_1.default.findByIdAndUpdate(schoolID, {
            $pull: { gallaries: galleryID },
        });
        return res.status(200).json({
            message: "Gallery deleted successfully",
            data: deleted,
            status: 200,
        });
    }
    catch (error) {
        console.error("Error deleting school gallery:", error);
        return res.status(500).json({
            message: "Error deleting school gallery",
            error: error?.message,
            status: 500,
        });
    }
};
exports.deleteSchoolGallary = deleteSchoolGallary;
