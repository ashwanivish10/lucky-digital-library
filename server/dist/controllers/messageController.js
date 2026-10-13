"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMessage = exports.updateMessage = exports.getMessageById = exports.getUnreadCount = exports.listMessages = exports.submitContactMessage = void 0;
const ContactMessage_1 = require("../models/ContactMessage");
// Public: Submit a contact message / enquiry
const submitContactMessage = async (req, res) => {
    try {
        const { name, phone, email, subject, message } = req.body;
        if (!name || !name.trim() || !message || !message.trim()) {
            res.status(400).json({ success: false, message: 'Name and message are required' });
            return;
        }
        const newMessage = await ContactMessage_1.ContactMessage.create({
            name: name.trim(),
            phone: phone ? phone.trim() : '',
            email: email ? email.trim() : '',
            subject: subject ? subject.trim() : '',
            message: message.trim(),
            status: 'unread',
        });
        res.status(201).json({
            success: true,
            message: 'Your message has been received. We will contact you soon!',
            data: newMessage,
        });
    }
    catch (error) {
        console.error('Error submitting contact message:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to submit message' });
    }
};
exports.submitContactMessage = submitContactMessage;
// Admin: List messages with filters, search, and pagination
const listMessages = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 20));
        const status = req.query.status;
        const search = req.query.search;
        const filter = {};
        if (status && status !== 'all') {
            filter.status = status;
        }
        if (search && search.trim()) {
            const regex = new RegExp(search.trim(), 'i');
            filter.$or = [
                { name: regex },
                { phone: regex },
                { email: regex },
                { subject: regex },
                { message: regex },
            ];
        }
        const [messages, total, unreadCount] = await Promise.all([
            ContactMessage_1.ContactMessage.find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            ContactMessage_1.ContactMessage.countDocuments(filter),
            ContactMessage_1.ContactMessage.countDocuments({ status: 'unread' }),
        ]);
        const totalPages = Math.ceil(total / limit) || 1;
        res.json({
            success: true,
            data: {
                messages,
                total,
                page,
                totalPages,
                unreadCount,
            },
        });
    }
    catch (error) {
        console.error('Error listing messages:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to list messages' });
    }
};
exports.listMessages = listMessages;
// Admin: Get unread count
const getUnreadCount = async (_req, res) => {
    try {
        const unreadCount = await ContactMessage_1.ContactMessage.countDocuments({ status: 'unread' });
        res.json({ success: true, count: unreadCount });
    }
    catch (error) {
        console.error('Error fetching unread count:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to fetch unread count' });
    }
};
exports.getUnreadCount = getUnreadCount;
// Admin: Get single message by ID
const getMessageById = async (req, res) => {
    try {
        const { id } = req.params;
        const message = await ContactMessage_1.ContactMessage.findById(id);
        if (!message) {
            res.status(404).json({ success: false, message: 'Message not found' });
            return;
        }
        res.json({ success: true, data: message });
    }
    catch (error) {
        console.error('Error fetching message:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to fetch message' });
    }
};
exports.getMessageById = getMessageById;
// Admin: Update message status or notes
const updateMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminNotes } = req.body;
        const updateData = {};
        if (status) {
            const validStatuses = ['unread', 'read', 'replied', 'archived'];
            if (!validStatuses.includes(status)) {
                res.status(400).json({ success: false, message: 'Invalid status' });
                return;
            }
            updateData.status = status;
            if (status === 'replied') {
                updateData.repliedAt = new Date();
            }
        }
        if (adminNotes !== undefined) {
            updateData.adminNotes = adminNotes;
        }
        const updated = await ContactMessage_1.ContactMessage.findByIdAndUpdate(id, updateData, { new: true });
        if (!updated) {
            res.status(404).json({ success: false, message: 'Message not found' });
            return;
        }
        res.json({ success: true, data: updated, message: 'Message updated' });
    }
    catch (error) {
        console.error('Error updating message:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to update message' });
    }
};
exports.updateMessage = updateMessage;
// Admin: Delete message
const deleteMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await ContactMessage_1.ContactMessage.findByIdAndDelete(id);
        if (!deleted) {
            res.status(404).json({ success: false, message: 'Message not found' });
            return;
        }
        res.json({ success: true, message: 'Message deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to delete message' });
    }
};
exports.deleteMessage = deleteMessage;
//# sourceMappingURL=messageController.js.map