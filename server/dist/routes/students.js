"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const studentController_1 = require("../controllers/studentController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public / Authenticated Seats Map (anyone can view availability, logged in sees their seat)
router.get('/seats/map', studentController_1.getSeatMap);
router.post('/register', studentController_1.publicRegister);
// Admin
router.get('/', auth_1.requireAdmin, studentController_1.listStudents);
router.post('/', auth_1.requireAdmin, studentController_1.createStudent);
// Admin or own student
router.get('/:id', auth_1.requireAuth, studentController_1.getStudent);
router.patch('/:id', auth_1.requireAdmin, studentController_1.updateStudent);
router.patch('/:id/status', auth_1.requireAdmin, studentController_1.updateStudentStatus);
router.post('/:id/approve', auth_1.requireAdmin, studentController_1.approveRegistration);
exports.default = router;
//# sourceMappingURL=students.js.map