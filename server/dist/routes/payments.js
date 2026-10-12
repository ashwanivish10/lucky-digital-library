"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const paymentController_1 = require("../controllers/paymentController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.requireAuth, paymentController_1.listPayments);
router.post('/', auth_1.requireAdmin, paymentController_1.recordPayment);
router.get('/report', auth_1.requireAdmin, paymentController_1.getFeeReport);
router.get('/:id/receipt', auth_1.requireAuth, paymentController_1.getReceipt);
router.post('/:id/adjustments', auth_1.requireAdmin, paymentController_1.createAdjustment);
exports.default = router;
//# sourceMappingURL=payments.js.map