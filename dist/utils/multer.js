"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileUploads = exports.fileUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const node_os_1 = __importDefault(require("node:os"));
let filePath = node_path_1.default.join(node_os_1.default.tmpdir(), "examination");
if (!node_fs_1.default.existsSync(filePath)) {
    try {
        node_fs_1.default.mkdirSync(filePath, { recursive: true });
        console.log("folder created in tmp");
    }
    catch (err) {
        console.error("Error creating tmp folder:", err);
        // fallback to os.tmpdir() directly if subdirectory creation fails
        filePath = node_os_1.default.tmpdir();
    }
}
else {
    console.log("folder exist in tmp...");
}
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, filePath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "-" + uniqueSuffix);
    },
});
exports.fileUpload = (0, multer_1.default)({ storage: storage }).single("file");
exports.fileUploads = (0, multer_1.default)({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        file.mimetype === "application/json";
        cb(null, true);
    },
}).single("file");
