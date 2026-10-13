import React, { useEffect, useState, useCallback } from 'react';
import {
  Mail,
  Search,
  RefreshCw,
  Clock,
  CheckCircle2,
  Phone,
  MessageCircle,
  Trash2,
  ExternalLink,
  Edit3,
  X,
  Send,
  AlertCircle,
  Inbox,
  Filter,
} from 'lucide-react';
import { messagesApi } from '../../lib/api';
import { IContactMessage, MessageStatus } from '../../types/public';
import { formatDate } from '../../lib/utils';
import toast from 'react-hot-toast';

export const MessagesPage: React.FC = () => {
  const [messages, setMessages] = useState<IContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  // Modal states
  const [selectedMessage, setSelectedMessage] = useState<IContactMessage | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editStatus, setEditStatus] = useState<MessageStatus>('unread');
  const [savingNote, setSavingNote] = useState(false);
  const [deleteModalMessage, setDeleteModalMessage] = useState<IContactMessage | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch messages
  const fetchMessages = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const params: Record<string, unknown> = {
        page,
        limit: 25,
      };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await messagesApi.list(params);
      const data = res.data?.data;
      if (data) {
        setMessages(data.messages || []);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.total || 0);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err: any) {
      console.error('Error fetching messages:', err);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, statusFilter, searchTerm]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Handle Quick Status Change
  const handleQuickStatusChange = async (msg: IContactMessage, newStatus: MessageStatus) => {
    try {
      await messagesApi.update(msg._id, { status: newStatus });
      toast.success(`Message marked as ${newStatus}`);
      fetchMessages(true);
    } catch {
      toast.error('Failed to update status');
    }
  };

  // Open modal for details/notes
  const handleOpenDetailModal = (msg: IContactMessage) => {
    setSelectedMessage(msg);
    setEditNotes(msg.adminNotes || '');
    setEditStatus(msg.status);

    // If it was unread, auto-mark as read
    if (msg.status === 'unread') {
      messagesApi.update(msg._id, { status: 'read' }).then(() => {
        setEditStatus('read');
        fetchMessages(true);
      }).catch(() => {});
    }
  };

  // Save admin notes & status from modal
  const handleSaveModal = async () => {
    if (!selectedMessage) return;
    setSavingNote(true);
    try {
      await messagesApi.update(selectedMessage._id, {
        status: editStatus,
        adminNotes: editNotes.trim(),
      });
      toast.success('Message updated successfully');
      setSelectedMessage(null);
      fetchMessages(true);
    } catch {
      toast.error('Failed to update message');
    } finally {
      setSavingNote(false);
    }
  };

  // Handle Delete
  const handleDeleteConfirm = async () => {
    if (!deleteModalMessage) return;
    setDeleting(true);
    try {
      await messagesApi.delete(deleteModalMessage._id);
      toast.success('Message deleted successfully');
      setDeleteModalMessage(null);
      fetchMessages(true);
    } catch {
      toast.error('Failed to delete message');
    } finally {
      setDeleting(false);
    }
  };

  // Generate WhatsApp link
  const getWhatsAppLink = (phone?: string, name?: string, subject?: string) => {
    if (!phone) return null;
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const fullPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const greeting = encodeURIComponent(
      `Hello ${name || 'there'}! Thank you for contacting Lucky Digital Library${
        subject ? ` regarding "${subject}"` : ''
      }. How can we assist you today?`
    );
    return `https://wa.me/${fullPhone}?text=${greeting}`;
  };

  // Relative or clean formatted time
  const formatDateTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return formatDate(dateStr);
    }
  };

  const getStatusBadge = (status: MessageStatus) => {
    switch (status) {
      case 'unread':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#13b8c8]/15 text-[#075a70] border border-[#13b8c8]/30 font-bold text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#13b8c8] animate-pulse"></span>
            New Inquiry
          </span>
        );
      case 'replied':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[11px]">
            <CheckCircle2 size={12} className="text-emerald-600" />
            Replied
          </span>
        );
      case 'read':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-medium text-[11px]">
            Read
          </span>
        );
      case 'archived':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200 font-medium text-[11px]">
            Archived
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-[family-name:var(--font-ui)] font-black tracking-[-0.03em] text-[#0b1d2e]">
            Messages & Inquiries
          </h1>
          <p className="text-xs sm:text-sm text-[#65788c] mt-0.5">
            Review and respond to messages submitted via &quot;Send Us a Message&quot; on the website.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => fetchMessages(true)}
            disabled={refreshing}
            className="btn btn-secondary text-xs py-2 px-3.5 flex items-center gap-2"
            title="Refresh messages"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card bg-white p-4.5 rounded-2xl border border-[#dce8f0] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#65788c] font-[family-name:var(--font-ui)]">
              Total Messages
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#0b1d2e]/5 flex items-center justify-center text-[#0b1d2e]">
              <Mail size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold font-[family-name:var(--font-ui)] text-[#0b1d2e] mt-2">
            {totalCount}
          </div>
        </div>

        <div className="stat-card bg-white p-4.5 rounded-2xl border border-[#dce8f0] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#075a70] font-[family-name:var(--font-ui)]">
              Unread / New
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#13b8c8]/15 flex items-center justify-center text-[#13b8c8]">
              <Clock size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold font-[family-name:var(--font-ui)] text-[#087d99] mt-2 flex items-center gap-2">
            {unreadCount}
            {unreadCount > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 bg-[#13b8c8]/20 text-[#075a70] rounded-full">
                Action Needed
              </span>
            )}
          </div>
        </div>

        <div className="stat-card bg-white p-4.5 rounded-2xl border border-[#dce8f0] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#65788c] font-[family-name:var(--font-ui)]">
              Replied
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold font-[family-name:var(--font-ui)] text-emerald-700 mt-2">
            {messages.filter((m) => m.status === 'replied').length}
          </div>
        </div>

        <div className="stat-card bg-white p-4.5 rounded-2xl border border-[#dce8f0] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#65788c] font-[family-name:var(--font-ui)]">
              Contact Desk
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#7ef9ff]/20 flex items-center justify-center text-[#075a70]">
              <MessageCircle size={16} />
            </div>
          </div>
          <div className="text-xs text-[#65788c] mt-3 font-medium">
            24×7 Student Helpline &amp; WhatsApp Connected
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#dce8f0] shadow-xs flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'All Inquiries' },
            { id: 'unread', label: `Unread (${unreadCount})` },
            { id: 'read', label: 'Read' },
            { id: 'replied', label: 'Replied' },
            { id: 'archived', label: 'Archived' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setStatusFilter(tab.id);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap min-h-[44px] md:min-h-0 flex items-center justify-center ${
                statusFilter === tab.id
                  ? 'bg-[#0b1d2e] text-white shadow-xs'
                  : 'text-[#65788c] hover:bg-[#edf4f8] hover:text-[#0b1d2e]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[260px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#65788c]" />
          <input
            type="text"
            placeholder="Search sender, phone, message..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-8 py-2 rounded-xl text-base md:text-xs bg-[#f4f9fc] border border-[#dce8f0] focus:outline-none focus:border-[#13b8c8] focus:bg-white text-[#0b1d2e] placeholder-[#a0b3c6] transition-all"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setPage(1);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#65788c] hover:text-[#0b1d2e]"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-3.5">
        {loading ? (
          // Loading skeletons
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-5 border border-[#dce8f0] shadow-xs animate-pulse space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="h-5 w-48 bg-[#edf4f8] rounded"></div>
                <div className="h-5 w-20 bg-[#edf4f8] rounded-full"></div>
              </div>
              <div className="h-4 w-full bg-[#edf4f8] rounded"></div>
              <div className="h-4 w-2/3 bg-[#edf4f8] rounded"></div>
            </div>
          ))
        ) : messages.length === 0 ? (
          // Empty state
          <div className="bg-white rounded-2xl p-12 border border-[#dce8f0] text-center shadow-xs">
            <div className="w-14 h-14 rounded-full bg-[#13b8c8]/10 text-[#13b8c8] flex items-center justify-center mx-auto mb-3.5">
              <Inbox size={28} />
            </div>
            <h3 className="text-base font-bold text-[#0b1d2e] font-[family-name:var(--font-ui)]">
              No Messages Found
            </h3>
            <p className="text-xs text-[#65788c] max-w-sm mx-auto mt-1">
              {statusFilter !== 'all' || searchTerm
                ? 'Try clearing the search or switching the status filter.'
                : 'Whenever visitors submit the "Send Us a Message" contact form on your website, their inquiries will appear here.'}
            </p>
            {(statusFilter !== 'all' || searchTerm) && (
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('all');
                  setSearchTerm('');
                  setPage(1);
                }}
                className="btn btn-secondary text-xs py-1.5 px-3.5 mt-4"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          messages.map((msg) => {
            const waLink = getWhatsAppLink(msg.phone, msg.name, msg.subject);

            return (
              <div
                key={msg._id}
                className={`bg-white rounded-2xl p-5 border transition-all duration-200 shadow-xs hover:shadow-md ${
                  msg.status === 'unread'
                    ? 'border-[#13b8c8]/60 bg-gradient-to-r from-white via-white to-[#f0fcfe]'
                    : 'border-[#dce8f0]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-[#f0f5f9]">
                  {/* Sender Details */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#0b1d2e] text-[#7ef9ff] font-bold text-sm flex items-center justify-center flex-shrink-0 font-[family-name:var(--font-ui)]">
                      {msg.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-[#0b1d2e] text-sm">
                          {msg.name}
                        </span>
                        {getStatusBadge(msg.status)}
                      </div>
                      <div className="flex items-center gap-3 mt-1 flex-wrap text-xs text-[#65788c]">
                        {msg.phone && (
                          <a
                            href={`tel:${msg.phone}`}
                            className="inline-flex items-center gap-1 hover:text-[#13b8c8] font-mono transition-colors"
                          >
                            <Phone size={12} className="text-[#13b8c8]" />
                            {msg.phone}
                          </a>
                        )}
                        {msg.email && (
                          <a
                            href={`mailto:${msg.email}`}
                            className="inline-flex items-center gap-1 hover:text-[#13b8c8] transition-colors"
                          >
                            <Mail size={12} className="text-[#65788c]" />
                            {msg.email}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div className="text-right text-[11px] text-[#8fa0b2] flex-shrink-0">
                    {formatDateTime(msg.createdAt)}
                  </div>
                </div>

                {/* Subject & Message Content */}
                <div className="py-3.5 space-y-2">
                  {msg.subject && (
                    <div className="text-xs font-bold text-[#087d99] font-[family-name:var(--font-ui)]">
                      Subject: {msg.subject}
                    </div>
                  )}
                  <p className="text-xs sm:text-sm text-[#2c3e50] leading-relaxed whitespace-pre-wrap">
                    {msg.message}
                  </p>

                  {/* Admin Internal Notes (if present) */}
                  {msg.adminNotes && (
                    <div className="mt-2.5 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-xs text-amber-900 flex items-start gap-2">
                      <AlertCircle size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-semibold text-amber-800">Admin Note: </span>
                        {msg.adminNotes}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions Bar */}
                <div className="pt-3 border-t border-[#f0f5f9] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Quick WhatsApp Reply */}
                    {waLink && (
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 font-bold text-xs transition-colors min-h-[44px] md:min-h-0"
                        title="Chat on WhatsApp"
                      >
                        <MessageCircle size={14} className="text-[#25D366]" />
                        <span>Reply on WhatsApp</span>
                      </a>
                    )}

                    {/* Quick Call */}
                    {msg.phone && (
                      <a
                        href={`tel:${msg.phone}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#edf4f8] hover:bg-[#dce8f0] text-[#0b1d2e] font-semibold text-xs transition-colors min-h-[44px] md:min-h-0"
                      >
                        <Phone size={13} className="text-[#65788c]" />
                        <span>Call</span>
                      </a>
                    )}

                    {/* Quick Email */}
                    {msg.email && (
                      <a
                        href={`mailto:${msg.email}?subject=Regarding your message to Lucky Digital Library`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#edf4f8] hover:bg-[#dce8f0] text-[#0b1d2e] font-semibold text-xs transition-colors min-h-[44px] md:min-h-0"
                      >
                        <Mail size={13} className="text-[#65788c]" />
                        <span>Email</span>
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    {/* Status Toggle Buttons */}
                    {msg.status !== 'replied' && (
                      <button
                        type="button"
                        onClick={() => handleQuickStatusChange(msg, 'replied')}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-xs transition-colors min-h-[44px] md:min-h-0"
                        title="Mark as Replied"
                      >
                        <CheckCircle2 size={13} />
                        <span className="inline">Mark Replied</span>
                      </button>
                    )}

                    {msg.status === 'unread' ? (
                      <button
                        type="button"
                        onClick={() => handleQuickStatusChange(msg, 'read')}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold text-xs transition-colors min-h-[44px] md:min-h-0"
                        title="Mark as Read"
                      >
                        <span>Mark Read</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleQuickStatusChange(msg, 'unread')}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-cyan-50 text-cyan-800 hover:bg-cyan-100 font-semibold text-xs transition-colors min-h-[44px] md:min-h-0"
                        title="Mark as Unread"
                      >
                        <span>Mark Unread</span>
                      </button>
                    )}

                    {/* Details / Admin Notes */}
                    <button
                      type="button"
                      onClick={() => handleOpenDetailModal(msg)}
                      className="p-1.5 rounded-xl text-[#65788c] hover:text-[#0b1d2e] hover:bg-[#edf4f8] transition-colors min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 flex items-center justify-center"
                      title="Add Notes or Edit Status"
                    >
                      <Edit3 size={15} />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => setDeleteModalMessage(msg)}
                      className="p-1.5 rounded-xl text-[#65788c] hover:text-[#8B1A1A] hover:bg-rose-50 transition-colors min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 flex items-center justify-center"
                      title="Delete message"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 rounded-2xl border border-[#dce8f0] shadow-xs text-xs">
          <span className="text-[#65788c]">
            Page {page} of {totalPages} ({totalCount} total)
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn btn-secondary py-1 px-3 text-xs disabled:opacity-40 min-h-[44px] md:min-h-0 flex items-center justify-center"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn btn-secondary py-1 px-3 text-xs disabled:opacity-40 min-h-[44px] md:min-h-0 flex items-center justify-center"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Detail / Admin Notes Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#dce8f0] space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#f0f5f9] pb-3">
              <div>
                <h3 className="font-bold text-[#0b1d2e] text-base font-[family-name:var(--font-ui)]">
                  Inquiry Details
                </h3>
                <p className="text-xs text-[#65788c]">From {selectedMessage.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMessage(null)}
                className="p-1.5 text-[#65788c] hover:text-[#0b1d2e] rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Sender Summary */}
            <div className="bg-[#f8fbfd] p-3 rounded-xl border border-[#e2edf3] space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[#65788c]">Phone:</span>
                <span className="font-semibold text-[#0b1d2e]">
                  {selectedMessage.phone || '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#65788c]">Email:</span>
                <span className="font-semibold text-[#0b1d2e]">
                  {selectedMessage.email || '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#65788c]">Received:</span>
                <span className="text-[#0b1d2e]">
                  {formatDateTime(selectedMessage.createdAt)}
                </span>
              </div>
            </div>

            {/* Message Body */}
            <div>
              <label className="block text-xs font-semibold text-[#65788c] uppercase tracking-wider mb-1 font-[family-name:var(--font-ui)]">
                Message Content
              </label>
              <div className="p-3 bg-white rounded-xl border border-[#dce8f0] text-xs text-[#2c3e50] max-h-40 overflow-y-auto whitespace-pre-wrap">
                {selectedMessage.message}
              </div>
            </div>

            {/* Status Switcher */}
            <div>
              <label className="block text-xs font-semibold text-[#65788c] uppercase tracking-wider mb-1.5 font-[family-name:var(--font-ui)]">
                Status
              </label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as MessageStatus)}
                className="w-full p-2.5 rounded-xl border border-[#dce8f0] text-base md:text-xs text-[#0b1d2e] bg-[#f8fbfd] focus:bg-white focus:outline-none focus:border-[#13b8c8]"
              >
                <option value="unread">Unread / New</option>
                <option value="read">Read</option>
                <option value="replied">Replied</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Admin Internal Notes */}
            <div>
              <label className="block text-xs font-semibold text-[#65788c] uppercase tracking-wider mb-1.5 font-[family-name:var(--font-ui)]">
                Internal Admin Notes
              </label>
              <textarea
                rows={3}
                placeholder="E.g., Spoke on phone, invited for library trial on Saturday..."
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#dce8f0] text-base md:text-xs text-[#0b1d2e] bg-[#f8fbfd] focus:bg-white focus:outline-none focus:border-[#13b8c8] resize-none"
              />
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSelectedMessage(null)}
                className="btn btn-secondary text-xs py-2 px-4 min-h-[44px] md:min-h-0 flex items-center justify-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveModal}
                disabled={savingNote}
                className="btn btn-primary text-xs py-2 px-4 min-h-[44px] md:min-h-0 flex items-center justify-center"
              >
                {savingNote ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-[#dce8f0] space-y-4 animate-fade-in text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-[#8B1A1A] flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>
            <div>
              <h3 className="font-bold text-[#0b1d2e] text-base font-[family-name:var(--font-ui)]">
                Delete Message?
              </h3>
              <p className="text-xs text-[#65788c] mt-1">
                Are you sure you want to delete the message from{' '}
                <span className="font-semibold text-[#0b1d2e]">
                  {deleteModalMessage.name}
                </span>
                ? This cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalMessage(null)}
                disabled={deleting}
                className="btn btn-secondary text-xs py-2 px-4 min-h-[44px] md:min-h-0 flex items-center justify-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-[#8B1A1A] text-white hover:bg-rose-700 font-bold text-xs transition-colors min-h-[44px] md:min-h-0 flex items-center justify-center"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesPage;
