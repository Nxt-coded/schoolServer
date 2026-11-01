import { Buffer } from "node:buffer";

const legacyBuffer = require("buffer") as typeof import("buffer") & {
  SlowBuffer?: typeof Buffer;
};

legacyBuffer.SlowBuffer ??= Buffer;