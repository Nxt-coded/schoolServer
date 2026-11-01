"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.viewSchoolStore = exports.createStore = void 0;
const schoolModel_1 = __importDefault(require("../model/schoolModel"));
const mongoose_1 = require("mongoose");
const storeModel_1 = __importDefault(require("../model/storeModel"));
const streamifier_1 = require("../utils/streamifier");
const createStore = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const { title, description, cost } = req.body;
        const school = await schoolModel_1.default.findById(schoolID);
        const { secure_url, public_id } = await (0, streamifier_1.streamUpload)(req);
        if (school) {
            const store = await storeModel_1.default.create({
                title,
                description,
                cost: parseInt(cost),
                avatar: secure_url,
                avatarID: public_id,
            });
            school?.store.push(new mongoose_1.Types.ObjectId(store._id));
            school.save();
            return res.status(201).json({
                message: "remark created successfully",
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
            message: "Error creating school's store item",
            data: error.message,
        });
    }
};
exports.createStore = createStore;
const viewSchoolStore = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const student = await schoolModel_1.default.findById(schoolID).populate({
            path: "store",
            options: {
                sort: {
                    createdAt: -1,
                },
            },
        });
        return res.status(200).json({
            message: "viewing school store",
            data: student?.store,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error viewing school session",
        });
    }
};
exports.viewSchoolStore = viewSchoolStore;
