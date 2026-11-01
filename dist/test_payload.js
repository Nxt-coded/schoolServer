"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sms_1 = require("./utils/sms");
async function run() {
    const customMessage = `Hello Mr/Mrs Eduvas, \nThis is to inform you that your child John has arrived at school now at 08:00am. \nPowered by NEXT`;
    await (0, sms_1.sendTestSMS)("08137204472", "dnd", customMessage);
    console.log("Done testing exact payload.");
}
run();
