import { Student } from '../models/Student';

export async function generateStudentCode(): Promise<string> {
  const year = new Date().getFullYear().toString().slice(-2);
  const prefix = `LDL${year}`;

  // Find the latest student code with this prefix and increment
  const latest = await Student.findOne(
    { studentCode: { $regex: `^${prefix}` } },
    { studentCode: 1 }
  ).sort({ studentCode: -1 });

  if (!latest) return `${prefix}001`;

  const lastNum = parseInt(latest.studentCode.replace(prefix, ''), 10);
  const nextNum = (lastNum + 1).toString().padStart(3, '0');
  return `${prefix}${nextNum}`;
}
