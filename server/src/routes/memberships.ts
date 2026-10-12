import { Router } from 'express';
import {
  listMemberships,
  createMembership,
  renewMembership,
  updateMembership,
  refreshMembershipStatuses,
} from '../controllers/membershipController';
import { requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', requireAdmin, listMemberships);
router.post('/', requireAdmin, createMembership);
router.post('/refresh-statuses', requireAdmin, refreshMembershipStatuses);
router.patch('/:id', requireAdmin, updateMembership);
router.post('/:id/renew', requireAdmin, renewMembership);

export default router;
