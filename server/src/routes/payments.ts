import { Router } from 'express';
import {
  listPayments,
  recordPayment,
  getReceipt,
  createAdjustment,
  getFeeReport,
} from '../controllers/paymentController';
import { requireAdmin, requireAuth } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, listPayments);
router.post('/', requireAdmin, recordPayment);
router.get('/report', requireAdmin, getFeeReport);
router.get('/:id/receipt', requireAuth, getReceipt);
router.post('/:id/adjustments', requireAdmin, createAdjustment);

export default router;
