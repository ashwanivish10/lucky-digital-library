import { Router } from 'express';
import {
  submitContactMessage,
  listMessages,
  getUnreadCount,
  getMessageById,
  updateMessage,
  deleteMessage,
} from '../controllers/messageController';
import { requireAdmin } from '../middleware/auth';

const router = Router();

// Public: Submit message
router.post('/', submitContactMessage);

// Admin: Message management
router.get('/', requireAdmin, listMessages);
router.get('/unread-count', requireAdmin, getUnreadCount);
router.get('/:id', requireAdmin, getMessageById);
router.patch('/:id', requireAdmin, updateMessage);
router.delete('/:id', requireAdmin, deleteMessage);

export default router;
