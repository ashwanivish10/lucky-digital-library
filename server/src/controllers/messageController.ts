import { Request, Response } from 'express';
import { ContactMessage, MessageStatus } from '../models/ContactMessage';

// Public: Submit a contact message / enquiry
export const submitContactMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, phone, email, subject, message } = req.body;

    if (!name || !name.trim() || !message || !message.trim()) {
      res.status(400).json({ success: false, message: 'Name and message are required' });
      return;
    }

    const newMessage = await ContactMessage.create({
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
  } catch (error: any) {
    console.error('Error submitting contact message:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to submit message' });
  }
};

// Admin: List messages with filters, search, and pagination
export const listMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string, 10) || 20));
    const status = req.query.status as string;
    const search = req.query.search as string;

    const filter: Record<string, any> = {};

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
      ContactMessage.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      ContactMessage.countDocuments(filter),
      ContactMessage.countDocuments({ status: 'unread' }),
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
  } catch (error: any) {
    console.error('Error listing messages:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to list messages' });
  }
};

// Admin: Get unread count
export const getUnreadCount = async (_req: Request, res: Response): Promise<void> => {
  try {
    const unreadCount = await ContactMessage.countDocuments({ status: 'unread' });
    res.json({ success: true, count: unreadCount });
  } catch (error: any) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch unread count' });
  }
};

// Admin: Get single message by ID
export const getMessageById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const message = await ContactMessage.findById(id);

    if (!message) {
      res.status(404).json({ success: false, message: 'Message not found' });
      return;
    }

    res.json({ success: true, data: message });
  } catch (error: any) {
    console.error('Error fetching message:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch message' });
  }
};

// Admin: Update message status or notes
export const updateMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const updateData: Record<string, any> = {};

    if (status) {
      const validStatuses: MessageStatus[] = ['unread', 'read', 'replied', 'archived'];
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

    const updated = await ContactMessage.findByIdAndUpdate(id, updateData, { new: true });

    if (!updated) {
      res.status(404).json({ success: false, message: 'Message not found' });
      return;
    }

    res.json({ success: true, data: updated, message: 'Message updated' });
  } catch (error: any) {
    console.error('Error updating message:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to update message' });
  }
};

// Admin: Delete message
export const deleteMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await ContactMessage.findByIdAndDelete(id);

    if (!deleted) {
      res.status(404).json({ success: false, message: 'Message not found' });
      return;
    }

    res.json({ success: true, message: 'Message deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting message:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to delete message' });
  }
};
