"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const messageController_1 = require("../controllers/messageController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public: Submit message
router.post('/', messageController_1.submitContactMessage);
// Admin: Message management
router.get('/', auth_1.requireAdmin, messageController_1.listMessages);
router.get('/unread-count', auth_1.requireAdmin, messageController_1.getUnreadCount);
router.get('/:id', auth_1.requireAdmin, messageController_1.getMessageById);
router.patch('/:id', auth_1.requireAdmin, messageController_1.updateMessage);
router.delete('/:id', auth_1.requireAdmin, messageController_1.deleteMessage);
exports.default = router;
//# sourceMappingURL=messages.js.map