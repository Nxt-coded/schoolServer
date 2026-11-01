"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_buffer_1 = require("node:buffer");
const legacyBuffer = require("buffer");
legacyBuffer.SlowBuffer ?? (legacyBuffer.SlowBuffer = node_buffer_1.Buffer);
