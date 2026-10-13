import { Router } from 'express';
import {
  listStudents,
  getStudent,
  createStudent,
  updateStudent,
  updateStudentStatus,
  approveRegistration,
  publicRegister,
  getSeatMap,
  customEnroll,
} from '../controllers/studentController';
import { requireAdmin, requireAuth } from '../middleware/auth';

const router = Router();

// Public / Authenticated Seats Map (anyone can view availability, logged in sees their seat)
router.get('/seats/map', getSeatMap);
router.post('/register', publicRegister);

// Admin
router.get('/', requireAdmin, listStudents);
router.post('/', requireAdmin, createStudent);
router.post('/custom-enroll', requireAdmin, customEnroll);

// Admin or own student
router.get('/:id', requireAuth, getStudent);
router.patch('/:id', requireAdmin, updateStudent);
router.patch('/:id/status', requireAdmin, updateStudentStatus);
router.post('/:id/approve', requireAdmin, approveRegistration);

export default router;
