"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const sessionHistroyModel = new mongoose_1.Schema({
    classHistory: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "classHistory",
        },
    ],
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("sessionHistroys", sessionHistroyModel);
