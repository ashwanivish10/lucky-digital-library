"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const membershipController_1 = require("../controllers/membershipController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.requireAdmin, membershipController_1.listMemberships);
router.post('/', auth_1.requireAdmin, membershipController_1.createMembership);
router.post('/refresh-statuses', auth_1.requireAdmin, membershipController_1.refreshMembershipStatuses);
router.patch('/:id', auth_1.requireAdmin, membershipController_1.updateMembership);
router.post('/:id/renew', auth_1.requireAdmin, membershipController_1.renewMembership);
exports.default = router;
//# sourceMappingURL=memberships.js.map