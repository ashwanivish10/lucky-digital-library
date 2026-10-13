"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/login', authController_1.login);
router.post('/logout', authController_1.logout);
router.get('/me', auth_1.requireAuth, authController_1.me);
router.post('/change-password', auth_1.requireAuth, authController_1.changePassword);
router.post('/set-first-password', auth_1.requireAuth, authController_1.setFirstPassword);
exports.default = router;
//# sourceMappingURL=auth.js.map