"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateStudentCode = generateStudentCode;
const Student_1 = require("../models/Student");
async function generateStudentCode() {
    const year = new Date().getFullYear().toString().slice(-2);
    const prefix = `LDL${year}`;
    // Find the latest student code with this prefix and increment
    const latest = await Student_1.Student.findOne({ studentCode: { $regex: `^${prefix}` } }, { studentCode: 1 }).sort({ studentCode: -1 });
    if (!latest)
        return `${prefix}001`;
    const lastNum = parseInt(latest.studentCode.replace(prefix, ''), 10);
    const nextNum = (lastNum + 1).toString().padStart(3, '0');
    return `${prefix}${nextNum}`;
}
//# sourceMappingURL=codeGenerator.js.map