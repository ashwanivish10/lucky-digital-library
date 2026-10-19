import React, { useEffect, useState } from 'react';
import {
  Building,
  Clock,
  Sparkles,
  Scroll,
  Image as ImageIcon,
  MessageSquare,
  Save,
  Plus,
  Trash2,
  Upload,
  Eye,
  EyeOff,
  RefreshCw,
  Star,
  ExternalLink,
  BookOpen,
  Megaphone,
  ArrowRight,
} from 'lucide-react';
import { settingsApi } from '../../lib/api';
import toast from 'react-hot-toast';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'notice' | 'hours' | 'facilities' | 'rules' | 'gallery' | 'testimonials' | 'content'>('general');
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // New item inputs
  const [newRule, setNewRule] = useState('');
  const [newFacility, setNewFacility] = useState({ icon: 'book-open', title: '', description: '', isVisible: true, order: 1 });
  const [newTestimonial, setNewTestimonial] = useState({ name: '', text: '', rating: 5, isVisible: true });
  const [isUploading, setIsUploading] = useState(false);
  const [isSyncingGoogle, setIsSyncingGoogle] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await settingsApi.get();
      setSettings(res.data?.data);
    } catch {
      toast.error('Could not load site configuration.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await settingsApi.update(settings);
      toast.success('Configuration saved successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  // Facility handlers
  const handleAddFacility = () => {
    if (!newFacility.title.trim()) return;
    const facilities = [...(settings.facilities || []), { ...newFacility, order: (settings.facilities?.length || 0) + 1 }];
    setSettings({ ...settings, facilities });
    setNewFacility({ icon: 'book-open', title: '', description: '', isVisible: true, order: 1 });
  };

  const handleRemoveFacility = (index: number) => {
    const facilities = settings.facilities.filter((_: any, i: number) => i !== index);
    setSettings({ ...settings, facilities });
  };

  // Rule handlers
  const handleAddRule = () => {
    if (!newRule.trim()) return;
    const rules = [...(settings.rules || []), newRule.trim()];
    setSettings({ ...settings, rules });
    setNewRule('');
  };

  const handleRemoveRule = (index: number) => {
    const rules = settings.rules.filter((_: any, i: number) => i !== index);
    setSettings({ ...settings, rules });
  };

  // Testimonial handlers
  const handleAddTestimonial = () => {
    if (!newTestimonial.name.trim() || !newTestimonial.text.trim()) return;
    const testimonials = [...(settings.testimonials || []), newTestimonial];
    setSettings({ ...settings, testimonials });
    setNewTestimonial({ name: '', text: '', rating: 5, isVisible: true });
  };

  const handleRemoveTestimonial = (index: number) => {
    const testimonials = settings.testimonials.filter((_: any, i: number) => i !== index);
    setSettings({ ...settings, testimonials });
  };

  const handleToggleReviewVisibility = (index: number) => {
    const testimonials = [...(settings.testimonials || [])];
    testimonials[index] = {
      ...testimonials[index],
      isVisible: !testimonials[index].isVisible,
    };
    setSettings({ ...settings, testimonials });
  };

  const handleSyncGoogleReviews = async () => {
    setIsSyncingGoogle(true);
    try {
      const res = await settingsApi.syncGoogleReviews();
      toast.success(res.data?.message || 'Google Reviews synced successfully!');
      await fetchSettings();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to sync Google reviews');
    } finally {
      setIsSyncingGoogle(false);
    }
  };

  // Image Upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await settingsApi.upload(file);
      const url = res.data?.url;
      const galleryImages = [...(settings.galleryImages || []), { url, caption: file.name, order: (settings.galleryImages?.length || 0) + 1 }];
      setSettings({ ...settings, galleryImages });
      toast.success('Photo uploaded to local storage');
    } catch {
      toast.error('Image upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveGalleryImage = (index: number) => {
    const galleryImages = settings.galleryImages.filter((_: any, i: number) => i !== index);
    setSettings({ ...settings, galleryImages });
  };

  if (loading || !settings) {
    return (
      <div className="p-12 text-center text-sm text-[#8a7a60]">
        <div className="w-8 h-8 border-2 border-[#c2a66e] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        Loading library configurations...
      </div>
    );
  }

  const tabs = [
    { id: 'general', label: 'Library Info', icon: Building },
    { id: 'notice', label: 'Notice Bar', icon: Megaphone },
    { id: 'hours', label: 'Hours', icon: Clock },
    { id: 'facilities', label: 'Facilities', icon: Sparkles },
    { id: 'rules', label: 'Rules & Policies', icon: Scroll },
    { id: 'gallery', label: 'Gallery', icon: ImageIcon },
    { id: 'testimonials', label: 'Testimonials', icon: MessageSquare },
    { id: 'content', label: 'About & Ethos', icon: BookOpen },
  ] as const;

  return (
    <div className="space-y-6 animate-fade-in pb-12 font-sans">
      {/* Header */}
      <div className="page-header flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="section-eyebrow">Institutional Configuration</span>
          <h1 className="page-title text-2xl md:text-3xl font-[family-name:var(--font-ui)] font-bold text-[#2c1f0e]">
            Library Settings & Content
          </h1>
          <p className="text-sm text-[#8a7a60] mt-0.5">
            Manage public portal metadata, operating schedules, amenities catalog, and Google reputation.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="btn btn-primary px-5 py-2.5 inline-flex items-center gap-2 shadow-sm"
        >
          <Save size={16} />
          <span>{isSaving ? 'Saving Changes...' : 'Save Configuration'}</span>
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-[#e8dcc8] overflow-x-auto gap-1 bg-white p-1 rounded-t-lg shadow-xs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              type="button"
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-eyebrow font-semibold uppercase tracking-wider whitespace-nowrap transition-all rounded-md ${
                isActive
                  ? 'bg-[#2c1f0e] text-[#c2a66e] shadow-xs'
                  : 'text-[#8a7a60] hover:text-[#2c1f0e] hover:bg-[#faf6f0]'
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="bg-white rounded-b-lg rounded-tr-lg p-6 md:p-8 border border-[#e8dcc8] shadow-sm">
        {/* General Tab */}
        {activeTab === 'general' && (
          <div className="space-y-6 max-w-3xl">
            <div className="pb-3 border-b border-[#e8dcc8]">
              <h3 className="text-xl font-[family-name:var(--font-ui)] font-bold text-[#2c1f0e]">
                Identity & Contact Information
              </h3>
              <p className="text-xs text-[#8a7a60] mt-0.5">
                Primary library profile rendered in header, footer, and tax invoices.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-eyebrow font-bold uppercase tracking-wider text-[#2c1f0e] mb-1.5">
                  Library Name
                </label>
                <input
                  type="text"
                  value={settings.libraryName || ''}
                  onChange={(e) => setSettings({ ...settings, libraryName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-md border border-[#e8dcc8] bg-[#faf6f0] text-sm text-[#2c1f0e] focus:bg-white focus:outline-none focus:border-[#c2a66e]"
                />
              </div>

              <div>
                <label className="block text-xs font-eyebrow font-bold uppercase tracking-wider text-[#2c1f0e] mb-1.5">
                  Tagline
                </label>
                <input
                  type="text"
                  value={settings.tagline || ''}
                  onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-md border border-[#e8dcc8] bg-[#faf6f0] text-sm text-[#2c1f0e] focus:bg-white focus:outline-none focus:border-[#c2a66e]"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-eyebrow font-bold uppercase tracking-wider text-[#2c1f0e] mb-1.5">
                  Phone
                </label>
                <input
                  type="text"
                  value={settings.phone || ''}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-md border border-[#e8dcc8] bg-[#faf6f0] text-sm text-[#2c1f0e] focus:bg-white focus:outline-none focus:border-[#c2a66e]"
                />
              </div>

              <div>
                <label className="block text-xs font-eyebrow font-bold uppercase tracking-wider text-[#2c1f0e] mb-1.5">
                  WhatsApp Contact
                </label>
                <input
                  type="text"
                  value={settings.whatsapp || ''}
                  onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-md border border-[#e8dcc8] bg-[#faf6f0] text-sm text-[#2c1f0e] focus:bg-white focus:outline-none focus:border-[#c2a66e]"
                />
              </div>

              <div>
                <label className="block text-xs font-eyebrow font-bold uppercase tracking-wider text-[#2c1f0e] mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={settings.email || ''}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-md border border-[#e8dcc8] bg-[#faf6f0] text-sm text-[#2c1f0e] focus:bg-white focus:outline-none focus:border-[#c2a66e]"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-eyebrow font-bold uppercase tracking-wider text-[#2c1f0e] mb-1.5">
                  Physical Address
                </label>
                <input
                  type="text"
                  value={settings.address || ''}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  placeholder="Lucky Digital Library, Devrakh Road, Near Kashi Chat Bhandar, Naini, Prayagraj, UP - 211008"
                  className="w-full px-3.5 py-2.5 rounded-md border border-[#e8dcc8] bg-[#faf6f0] text-sm text-[#2c1f0e] focus:bg-white focus:outline-none focus:border-[#c2a66e]"
                />
              </div>

              <div>
                <label className="block text-xs font-eyebrow font-bold uppercase tracking-wider text-[#2c1f0e] mb-1.5">
                  Google Maps & Review Link
                </label>
                <input
                  type="text"
                  value={settings.mapLink || ''}
                  onChange={(e) => setSettings({ ...settings, mapLink: e.target.value })}
                  placeholder="https://maps.app.goo.gl/AaCd93WYde8cYnx79"
                  className="w-full px-3.5 py-2.5 rounded-md border border-[#e8dcc8] bg-[#faf6f0] text-xs font-mono text-[#2c1f0e] focus:bg-white focus:outline-none focus:border-[#c2a66e]"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-5 pt-4 border-t border-[#e8dcc8]">
              <div>
                <label className="block text-xs font-eyebrow font-bold uppercase tracking-wider text-[#2c1f0e] mb-1.5">
                  Receipt Prefix
                </label>
                <input
                  type="text"
                  value={settings.receiptPrefix || 'LDL'}
                  onChange={(e) => setSettings({ ...settings, receiptPrefix: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-md border border-[#e8dcc8] bg-[#faf6f0] text-sm font-mono text-[#2c1f0e] focus:bg-white focus:outline-none focus:border-[#c2a66e]"
                />
              </div>

              <div>
                <label className="block text-xs font-eyebrow font-bold uppercase tracking-wider text-[#2c1f0e] mb-1.5">
                  Expiry Warning (Days)
                </label>
                <input
                  type="number"
                  value={settings.expiryWarningDays || 7}
                  onChange={(e) => setSettings({ ...settings, expiryWarningDays: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-md border border-[#e8dcc8] bg-[#faf6f0] text-sm text-[#2c1f0e] focus:bg-white focus:outline-none focus:border-[#c2a66e]"
                />
              </div>

              <div>
                <label className="block text-xs font-eyebrow font-bold uppercase tracking-wider text-[#2c1f0e] mb-1.5">
                  Currency Symbol
                </label>
                <input
                  type="text"
                  value={settings.currencySymbol || '₹'}
                  onChange={(e) => setSettings({ ...settings, currencySymbol: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-md border border-[#e8dcc8] bg-[#faf6f0] text-sm text-[#2c1f0e] focus:bg-white focus:outline-none focus:border-[#c2a66e]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Notice Bar Tab */}
        {activeTab === 'notice' && (
          <div className="space-y-6 max-w-4xl">
            <div className="pb-3 border-b border-[#e8dcc8]">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h3 className="text-xl font-[family-name:var(--font-ui)] font-bold text-[#2c1f0e] flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-[#c2a66e]" />
                    Top Sticky Notice Bar
                  </h3>
                  <p className="text-xs text-[#8a7a60] mt-0.5">
                    Display a continuous running text ticker at the very top of the public website for announcements, batches, or emergency alerts.
                  </p>
                </div>

                {/* Enable / Disable toggle */}
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={!!settings.noticeEnabled}
                    onChange={(e) => setSettings({ ...settings, noticeEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#c2a66e]" />
                  <span className="ml-3 text-xs font-bold uppercase tracking-wider text-[#2c1f0e]">
                    {settings.noticeEnabled ? (
                      <span className="text-[#1A5C3B] font-extrabold flex items-center gap-1">
                        ● Active on Website
                      </span>
                    ) : (
                      <span className="text-slate-400">Disabled (Hidden)</span>
                    )}
                  </span>
                </label>
              </div>
            </div>

            {/* Live Interactive Preview Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-eyebrow font-bold uppercase tracking-wider text-[#2c1f0e] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#c2a66e]" />
                  Live Preview (Simulated Running Marquee)
                </span>
                <span className="text-[11px] text-[#8a7a60]">
                  {settings.noticeEnabled ? 'Currently Active' : 'Previewing (Disabled)'}
                </span>
              </div>

              {/* Preview Bar */}
              <div className="rounded-xl border border-[#e8dcc8] overflow-hidden shadow-sm bg-[#060A14] py-2.5 px-4 text-white">
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#c2a66e]/20 border border-[#c2a66e]/40 text-[#e8d5a8] text-[10px] font-extrabold uppercase tracking-widest shrink-0">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e8d5a8] opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#c2a66e]" />
                    </span>
                    <span>{settings.noticeBadge || 'ANNOUNCEMENT'}</span>
                  </span>

                  <div
                    className="flex-1 overflow-hidden relative mx-3"
                    style={{
                      maskImage: 'linear-gradient(90deg, transparent 0%, black 4%, black 96%, transparent 100%)',
                      WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, black 4%, black 96%, transparent 100%)',
                    }}
                  >
                    <div className="flex w-max animate-marquee-left py-0.5" style={{ animationDuration: '32s' }}>
                      <div className="flex items-center gap-8 pr-8">
                        <span className="text-xs font-medium tracking-wide text-white/95">
                          {settings.noticeText || 'Your running announcement text will scroll here once configured...'}
                        </span>
                        <span className="text-[#c2a66e] text-xs">✦</span>
                        <span className="text-xs font-medium tracking-wide text-white/95">
                          {settings.noticeText || 'Your running announcement text will scroll here once configured...'}
                        </span>
                        <span className="text-[#c2a66e] text-xs">✦</span>
                      </div>
                      <div className="flex items-center gap-8 pr-8" aria-hidden="true">
                        <span className="text-xs font-medium tracking-wide text-white/95">
                          {settings.noticeText || 'Your running announcement text will scroll here once configured...'}
                        </span>
                        <span className="text-[#c2a66e] text-xs">✦</span>
                        <span className="text-xs font-medium tracking-wide text-white/95">
                          {settings.noticeText || 'Your running announcement text will scroll here once configured...'}
                        </span>
                        <span className="text-[#c2a66e] text-xs">✦</span>
                      </div>
                    </div>
                  </div>

                  {settings.noticeLink && (
                    <span className="px-2.5 py-1 rounded bg-[#c2a66e] text-[#060A14] text-[10px] font-bold shrink-0 flex items-center gap-1">
                      {settings.noticeLinkText || 'View Details'}
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid md:grid-cols-2 gap-5 pt-2">
              {/* Badge Label */}
              <div>
                <label className="block text-xs font-eyebrow font-bold uppercase tracking-wider text-[#2c1f0e] mb-1.5">
                  Badge Tag / Category
                </label>
                <input
                  type="text"
                  value={settings.noticeBadge ?? 'ANNOUNCEMENT'}
                  onChange={(e) => setSettings({ ...settings, noticeBadge: e.target.value })}
                  placeholder="e.g. ANNOUNCEMENT, NOTICE, ADMISSIONS OPEN, HOLIDAY"
                  className="w-full px-3.5 py-2.5 rounded-md border border-[#e8dcc8] bg-[#faf6f0] text-sm text-[#2c1f0e] focus:bg-white focus:outline-none focus:border-[#c2a66e]"
                />
                <p className="text-[11px] text-[#8a7a60] mt-1">
                  Tag label displayed inside the glowing badge on the left side of the notice bar.
                </p>
              </div>

              {/* Action Link & Text */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-eyebrow font-bold uppercase tracking-wider text-[#2c1f0e] mb-1.5">
                      Button Link (Optional)
                    </label>
                    <input
                      type="text"
                      value={settings.noticeLink || ''}
                      onChange={(e) => setSettings({ ...settings, noticeLink: e.target.value })}
                      placeholder="e.g. /register or /membership"
                      className="w-full px-3.5 py-2.5 rounded-md border border-[#e8dcc8] bg-[#faf6f0] text-sm text-[#2c1f0e] focus:bg-white focus:outline-none focus:border-[#c2a66e]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-eyebrow font-bold uppercase tracking-wider text-[#2c1f0e] mb-1.5">
                      Button Label
                    </label>
                    <input
                      type="text"
                      value={settings.noticeLinkText || ''}
                      onChange={(e) => setSettings({ ...settings, noticeLinkText: e.target.value })}
                      placeholder="e.g. Register Now"
                      className="w-full px-3.5 py-2.5 rounded-md border border-[#e8dcc8] bg-[#faf6f0] text-sm text-[#2c1f0e] focus:bg-white focus:outline-none focus:border-[#c2a66e]"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-[#8a7a60]">
                  Leave empty if you only want scrolling text without an action button.
                </p>
              </div>
            </div>

            {/* Notice Running Text */}
            <div>
              <label className="block text-xs font-eyebrow font-bold uppercase tracking-wider text-[#2c1f0e] mb-1.5">
                Running Notice Message (Continuous Ticker Text)
              </label>
              <textarea
                rows={3}
                value={settings.noticeText || ''}
                onChange={(e) => setSettings({ ...settings, noticeText: e.target.value })}
                placeholder="e.g. 🎉 Admissions open for Morning & Evening Study Batches • 24/7 Power Backup, High-Speed Wi-Fi & AC Comfort • Visit library or register online to reserve your seat!"
                className="w-full px-3.5 py-2.5 rounded-md border border-[#e8dcc8] bg-[#faf6f0] text-sm text-[#2c1f0e] focus:bg-white focus:outline-none focus:border-[#c2a66e] font-medium"
              />
              <p className="text-[11px] text-[#8a7a60] mt-1">
                This text will run continuously across the top of all public pages. Visitors can pause scrolling by hovering over the text.
              </p>
            </div>

            {/* Presets suggestions */}
            <div className="p-4 rounded-xl bg-[#faf6f0] border border-[#e8dcc8] space-y-2">
              <span className="text-xs font-bold text-[#2c1f0e] uppercase tracking-wider block">
                Quick Template Presets (Click to autofill)
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSettings({
                    ...settings,
                    noticeBadge: 'ADMISSIONS OPEN',
                    noticeText: '🎉 Admissions open for Morning & Evening batches! Reserved workstations with high-speed fiber Wi-Fi & 24/7 power backup. Apply online now.',
                    noticeLink: '/register',
                    noticeLinkText: 'Join Library',
                    noticeEnabled: true,
                  })}
                  className="px-2.5 py-1 rounded bg-white border border-[#e8dcc8] hover:border-[#c2a66e] text-xs font-medium text-[#2c1f0e] transition-colors"
                >
                  Admissions Open Template
                </button>
                <button
                  type="button"
                  onClick={() => setSettings({
                    ...settings,
                    noticeBadge: 'SCHEDULE UPDATE',
                    noticeText: '📚 Extended Study Hours active: The library study hall remains open from 06:00 AM to 10:00 PM all 7 days of the week.',
                    noticeLink: '/membership',
                    noticeLinkText: 'View Shifts',
                    noticeEnabled: true,
                  })}
                  className="px-2.5 py-1 rounded bg-white border border-[#e8dcc8] hover:border-[#c2a66e] text-xs font-medium text-[#2c1f0e] transition-colors"
                >
                  Extended Hours Template
                </button>
                <button
                  type="button"
                  onClick={() => setSettings({
                    ...settings,
                    noticeBadge: 'EXAM ALERT',
                    noticeText: '⚡ Special silent revision shifts for UPSC, UPPSC & NEET aspirants. Limited cubicles remaining. Contact reception to lock your slot.',
                    noticeLink: '/contact',
                    noticeLinkText: 'Contact Desk',
                    noticeEnabled: true,
                  })}
                  className="px-2.5 py-1 rounded bg-white border border-[#e8dcc8] hover:border-[#c2a66e] text-xs font-medium text-[#2c1f0e] transition-colors"
                >
                  Exam Batch Template
                </button>
              </div>
            </div>

            {/* Direct Save Button */}
            <div className="pt-4 border-t border-[#e8dcc8] flex items-center justify-between flex-wrap gap-3">
              <p className="text-xs text-[#8a7a60]">
                Clicking save publishes this notice immediately to the top of all public pages.
              </p>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="btn btn-primary px-6 py-2.5 inline-flex items-center gap-2 shadow-sm font-bold"
              >
                <Save size={16} />
                <span>{isSaving ? 'Saving Changes...' : 'Save & Publish Notice'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Hours Tab */}
        {activeTab === 'hours' && (
          <div className="space-y-6 max-w-2xl">
            <div className="pb-3 border-b border-[#e8dcc8] flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-xl font-[family-name:var(--font-ui)] font-bold text-[#2c1f0e]">
                  Weekly Operating Schedule (24×7 Access)
                </h3>
                <p className="text-xs text-[#8a7a60] mt-0.5">
                  Operating shift timings displayed across all public pages.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const openingHours = (settings.openingHours || []).map((h: any) => ({
                    ...h,
                    open: '00:00',
                    close: '23:59',
                    isClosed: false,
                  }));
                  setSettings({ ...settings, openingHours });
                }}
                className="btn btn-secondary text-xs px-3 py-1.5 rounded-lg border-[#c2a66e] text-[#a38b52] hover:bg-[#f5ead4]"
              >
                Set All Days 24×7 (00:00 – 23:59)
              </button>
            </div>

            <div className="space-y-3">
              {(settings.openingHours || []).map((h: any, i: number) => (
                <div key={i} className="p-3.5 bg-[#faf6f0] rounded-md border border-[#e8dcc8] flex items-center justify-between gap-4">
                  <span className="font-semibold text-xs font-eyebrow tracking-wider text-[#2c1f0e] w-28 uppercase">
                    {h.day}
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={h.open}
                      disabled={h.isClosed}
                      onChange={(e) => {
                        const openingHours = [...settings.openingHours];
                        openingHours[i].open = e.target.value;
                        setSettings({ ...settings, openingHours });
                      }}
                      className="px-2.5 py-1.5 rounded border border-[#e8dcc8] bg-white text-xs text-[#2c1f0e]"
                    />
                    <span className="text-xs text-[#8a7a60]">to</span>
                    <input
                      type="time"
                      value={h.close}
                      disabled={h.isClosed}
                      onChange={(e) => {
                        const openingHours = [...settings.openingHours];
                        openingHours[i].close = e.target.value;
                        setSettings({ ...settings, openingHours });
                      }}
                      className="px-2.5 py-1.5 rounded border border-[#e8dcc8] bg-white text-xs text-[#2c1f0e]"
                    />
                  </div>
                  <label className="flex items-center gap-1.5 text-xs text-[#8B1A1A] font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={h.isClosed || false}
                      onChange={(e) => {
                        const openingHours = [...settings.openingHours];
                        openingHours[i].isClosed = e.target.checked;
                        setSettings({ ...settings, openingHours });
                      }}
                      className="rounded border-[#e8dcc8]"
                    />
                    Closed
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Facilities Tab */}
        {activeTab === 'facilities' && (
          <div className="space-y-6">
            <div className="pb-3 border-b border-[#e8dcc8]">
              <h3 className="text-xl font-[family-name:var(--font-ui)] font-bold text-[#2c1f0e]">
                Manage Amenities & Features
              </h3>
              <p className="text-xs text-[#8a7a60] mt-0.5">
                Features showcased on the landing page facilities grid.
              </p>
            </div>

            {/* Add Facility */}
            <div className="p-4 bg-[#faf6f0] rounded-lg border border-[#e8dcc8] space-y-3">
              <div className="text-xs font-eyebrow font-bold uppercase tracking-wider text-[#2c1f0e]">
                Add New Facility
              </div>
              <div className="grid md:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Facility Title (e.g. Ergonomic Chairs)"
                  value={newFacility.title}
                  onChange={(e) => setNewFacility({ ...newFacility, title: e.target.value })}
                  className="px-3 py-2 rounded-md border border-[#e8dcc8] bg-white text-xs text-[#2c1f0e]"
                />
                <input
                  type="text"
                  placeholder="Icon Name (wifi, plug, lamp, book-open, etc.)"
                  value={newFacility.icon}
                  onChange={(e) => setNewFacility({ ...newFacility, icon: e.target.value })}
                  className="px-3 py-2 rounded-md border border-[#e8dcc8] bg-white text-xs font-mono text-[#2c1f0e]"
                />
                <button type="button" onClick={handleAddFacility} className="btn btn-primary text-xs justify-center py-2">
                  <Plus size={14} /> Add Facility
                </button>
              </div>
              <input
                type="text"
                placeholder="Brief description of the amenity..."
                value={newFacility.description}
                onChange={(e) => setNewFacility({ ...newFacility, description: e.target.value })}
                className="w-full px-3 py-2 rounded-md border border-[#e8dcc8] bg-white text-xs text-[#2c1f0e]"
              />
            </div>

            {/* Existing Facilities List */}
            <div className="space-y-2">
              {(settings.facilities || []).map((f: any, i: number) => (
                <div key={i} className="p-3.5 bg-white rounded-lg border border-[#e8dcc8] flex items-center justify-between gap-4 hover:border-[#c2a66e] transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs px-2.5 py-1 rounded bg-[#faf6f0] text-[#2c1f0e] border border-[#e8dcc8]">
                      {f.icon}
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-[#2c1f0e]">{f.title}</div>
                      <div className="text-xs text-[#8a7a60]">{f.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const facilities = [...settings.facilities];
                        facilities[i].isVisible = !facilities[i].isVisible;
                        setSettings({ ...settings, facilities });
                      }}
                      className="p-1.5 text-[#8a7a60] hover:text-[#2c1f0e]"
                      title="Toggle visibility"
                    >
                      {f.isVisible ? <Eye size={16} className="text-[#1A5C3B]" /> : <EyeOff size={16} className="text-[#8B1A1A]" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveFacility(i)}
                      className="p-1.5 text-[#8B1A1A] hover:bg-rose-50 rounded"
                      title="Remove"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rules Tab */}
        {activeTab === 'rules' && (
          <div className="space-y-6 max-w-3xl">
            <div className="pb-3 border-b border-[#e8dcc8]">
              <h3 className="text-xl font-[family-name:var(--font-ui)] font-bold text-[#2c1f0e]">
                Library Regulations & Discipline Code
              </h3>
              <p className="text-xs text-[#8a7a60] mt-0.5">
                Official rules presented to students on the public site and enrollment agreements.
              </p>
            </div>

            <div className="flex gap-2.5">
              <input
                type="text"
                placeholder="Enter new rule or policy guideline..."
                value={newRule}
                onChange={(e) => setNewRule(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddRule(); } }}
                className="flex-1 px-3.5 py-2.5 rounded-md border border-[#e8dcc8] bg-[#faf6f0] text-sm text-[#2c1f0e] focus:bg-white focus:outline-none focus:border-[#c2a66e]"
              />
              <button type="button" onClick={handleAddRule} className="btn btn-primary text-xs py-2 px-4">
                <Plus size={15} /> Add Rule
              </button>
            </div>

            <div className="space-y-2.5">
              {(settings.rules || []).map((rule: string, i: number) => (
                <div key={i} className="p-3 bg-[#faf6f0] rounded-md border border-[#e8dcc8] flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-md bg-[#2c1f0e] text-[#c2a66e] font-mono text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">
                      {i + 1}
                    </span>
                    <span className="text-xs text-[#2c1f0e] leading-relaxed pt-0.5">{rule}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveRule(i)}
                    className="text-[#8B1A1A] hover:bg-rose-50 p-1.5 rounded transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gallery Tab */}
        {activeTab === 'gallery' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#e8dcc8]">
              <div>
                <h3 className="text-xl font-[family-name:var(--font-ui)] font-bold text-[#2c1f0e]">
                  Library Photo Gallery
                </h3>
                <p className="text-xs text-[#8a7a60]">
                  Stored locally on server storage (`/server/uploads`).
                </p>
              </div>

              <label className="btn btn-primary text-xs py-2 px-4 cursor-pointer inline-flex items-center gap-2">
                <Upload size={14} />
                <span>{isUploading ? 'Uploading...' : 'Upload New Photo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
            </div>

            {(settings.galleryImages || []).length === 0 ? (
              <div className="text-center py-12 bg-[#faf6f0] rounded-lg border border-dashed border-[#e8dcc8]">
                <ImageIcon size={36} className="text-[#8a7a60] mx-auto mb-2 opacity-60" />
                <p className="text-xs text-[#8a7a60]">No gallery photos uploaded yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {settings.galleryImages.map((img: any, i: number) => (
                  <div key={i} className="relative group rounded-lg overflow-hidden border border-[#e8dcc8] bg-[#2c1f0e] shadow-sm">
                    <img
                      src={img.url.startsWith('http') ? img.url : `http://localhost:5000${img.url}`}
                      alt={img.caption || `Library photo ${i + 1}`}
                      className="w-full h-36 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveGalleryImage(i)}
                      className="absolute top-2 right-2 p-1.5 bg-[#8B1A1A] text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete Photo"
                    >
                      <Trash2 size={14} />
                    </button>
                    {img.caption && (
                      <div className="p-2 text-[10px] text-white truncate bg-[#2c1f0e]/80">
                        {img.caption}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Testimonials & Google Reviews Tab */}
        {activeTab === 'testimonials' && (
          <div className="space-y-6 max-w-3xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#e8dcc8]">
              <div>
                <h3 className="text-xl font-[family-name:var(--font-ui)] font-bold text-[#2c1f0e]">
                  Google Reviews & Scholar Testimonials
                </h3>
                <p className="text-xs text-[#8a7a60]">
                  Live reviews synced from Google Maps and authentic student ratings displayed on the public landing page.
                </p>
              </div>

              <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer shrink-0 text-[#2c1f0e]">
                <input
                  type="checkbox"
                  checked={settings.testimonialsEnabled !== false}
                  onChange={(e) => setSettings({ ...settings, testimonialsEnabled: e.target.checked })}
                  className="rounded text-[#c2a66e] focus:ring-[#c2a66e] border-[#e8dcc8]"
                />
                Show on Public Website
              </label>
            </div>

            {/* Google Maps Live Sync Box */}
            <div className="p-5 rounded-lg bg-[#2c1f0e] border border-[#c2a66e]/40 text-[#faf6f0] flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-md">
              <div>
                <div className="flex items-center gap-2.5 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded bg-[#c2a66e]/20 border border-[#c2a66e]/40 text-[#a38b52] text-[10px] font-eyebrow font-bold uppercase tracking-wider">
                    Google Maps Integration
                  </span>
                  <div className="flex items-center text-[#c2a66e] text-xs">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={13} className="fill-current text-[#c2a66e]" />
                    ))}
                    <span className="font-bold text-white ml-1.5 text-xs">
                      {settings.googleRating || 4.9} / 5.0
                    </span>
                  </div>
                </div>
                <h4 className="font-[family-name:var(--font-ui)] font-bold text-base text-[#faf6f0]">
                  Lucky Digital Library (Naini, Prayagraj)
                </h4>
                <p className="text-[11px] text-[#faf6f0]/70 mt-0.5">
                  Place ID: <span className="font-mono text-[#a38b52]">{settings.googlePlaceId || 'ChIJkxWiLQC5mjkRhcsTeQFjjFM'}</span>
                  {settings.lastGoogleSync && (
                    <span className="ml-3">• Last Synced: {new Date(settings.lastGoogleSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}</span>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={handleSyncGoogleReviews}
                  disabled={isSyncingGoogle}
                  className="btn btn-primary text-xs font-bold py-2.5 px-4 shadow-md flex items-center gap-2"
                >
                  <RefreshCw size={14} className={isSyncingGoogle ? 'animate-spin' : ''} />
                  <span>{isSyncingGoogle ? 'Syncing...' : 'Sync Google Reviews'}</span>
                </button>
                <a
                  href={settings.mapLink || 'https://maps.app.goo.gl/AaCd93WYde8cYnx79'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title="Open on Google Maps"
                >
                  <ExternalLink size={16} />
                </a>
              </div>
            </div>

            {/* Add New Review Box */}
            <div className="p-5 bg-[#faf6f0] rounded-lg border border-[#e8dcc8] space-y-3">
              <div className="text-xs font-eyebrow font-bold uppercase tracking-wider text-[#2c1f0e]">
                Add Review / Scholar Testimonial
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Scholar Full Name (e.g. Priya Sharma)"
                  value={newTestimonial.name}
                  onChange={(e) => setNewTestimonial({ ...newTestimonial, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border border-[#e8dcc8] text-xs bg-white text-[#2c1f0e]"
                />
                <input
                  type="text"
                  placeholder="Exam or Focus (e.g. UPSC CSE / CA Final)"
                  value={(newTestimonial as any).role || ''}
                  onChange={(e) => setNewTestimonial({ ...newTestimonial, role: e.target.value } as any)}
                  className="w-full px-3 py-2 rounded-md border border-[#e8dcc8] text-xs bg-white text-[#2c1f0e]"
                />
              </div>
              <textarea
                placeholder="Review quote text describing focus, facilities, and study experience..."
                rows={2}
                value={newTestimonial.text}
                onChange={(e) => setNewTestimonial({ ...newTestimonial, text: e.target.value })}
                className="w-full px-3 py-2 rounded-md border border-[#e8dcc8] text-xs bg-white text-[#2c1f0e]"
              />
              <button type="button" onClick={handleAddTestimonial} className="btn btn-primary text-xs py-2 px-3">
                <Plus size={14} /> Add Scholar Review
              </button>
            </div>

            {/* Synced Reviews List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-eyebrow font-bold uppercase tracking-wider text-[#8a7a60] px-1">
                <span>Published Reviews ({(settings.testimonials || []).length})</span>
                <span>Actions</span>
              </div>

              {(settings.testimonials || []).length === 0 ? (
                <div className="p-8 text-center bg-white rounded-lg border border-[#e8dcc8]">
                  <p className="text-xs text-[#8a7a60]">No reviews loaded yet. Click "Sync Google Reviews" above to populate live reviews.</p>
                </div>
              ) : (
                settings.testimonials.map((t: any, i: number) => (
                  <div
                    key={i}
                    className={`p-4 rounded-lg border transition-all flex justify-between items-start gap-4 ${
                      t.isVisible !== false
                        ? 'bg-white border-[#e8dcc8]'
                        : 'bg-gray-50 border-gray-200 opacity-60'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#2c1f0e]">{t.name}</span>
                        {t.role && (
                          <span className="text-[10px] text-[#d4b87a] bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-medium">
                            {t.role}
                          </span>
                        )}
                        <span className="text-[10px] text-[#1A5C3B] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-semibold">
                          Google Verified
                        </span>
                        <div className="flex text-[#c2a66e] text-[10px]">
                          {'★'.repeat(t.rating || 5)}
                        </div>
                      </div>
                      <p className="text-xs text-[#8a7a60] italic leading-relaxed">"{t.text}"</p>
                      {t.relativeTime && (
                        <span className="text-[10px] text-[#8a7a60] block">{t.relativeTime}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 pt-1">
                      <button
                        type="button"
                        onClick={() => handleToggleReviewVisibility(i)}
                        className={`p-1.5 rounded border text-xs transition-colors ${
                          t.isVisible !== false
                            ? 'bg-[#1A5C3B]/10 text-[#1A5C3B] border-[#1A5C3B]/20'
                            : 'bg-gray-100 text-gray-500 border-gray-200'
                        }`}
                        title={t.isVisible !== false ? 'Visible on site (click to hide)' : 'Hidden (click to show)'}
                      >
                        {t.isVisible !== false ? <Eye size={15} /> : <EyeOff size={15} />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveTestimonial(i)}
                        className="p-1.5 rounded border border-red-200 bg-red-50 text-[#8B1A1A] hover:bg-red-100 transition-colors"
                        title="Delete review"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Content Tab */}
        {activeTab === 'content' && (
          <div className="space-y-6 max-w-3xl">
            <div className="pb-3 border-b border-[#e8dcc8]">
              <h3 className="text-xl font-[family-name:var(--font-ui)] font-bold text-[#2c1f0e]">
                About Page Content & Mission
              </h3>
              <p className="text-xs text-[#8a7a60] mt-0.5">
                Narrative statements featured on the About section of the library website.
              </p>
            </div>

            <div>
              <label className="block text-xs font-eyebrow font-bold uppercase tracking-wider text-[#2c1f0e] mb-1.5">
                About Introduction
              </label>
              <textarea
                rows={4}
                value={settings.aboutText || ''}
                onChange={(e) => setSettings({ ...settings, aboutText: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-md border border-[#e8dcc8] bg-[#faf6f0] text-sm text-[#2c1f0e] focus:bg-white focus:outline-none focus:border-[#c2a66e]"
              />
            </div>

            <div>
              <label className="block text-xs font-eyebrow font-bold uppercase tracking-wider text-[#2c1f0e] mb-1.5">
                Mission Statement
              </label>
              <textarea
                rows={3}
                value={settings.missionText || ''}
                onChange={(e) => setSettings({ ...settings, missionText: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-md border border-[#e8dcc8] bg-[#faf6f0] text-sm text-[#2c1f0e] focus:bg-white focus:outline-none focus:border-[#c2a66e]"
              />
            </div>

            <div>
              <label className="block text-xs font-eyebrow font-bold uppercase tracking-wider text-[#2c1f0e] mb-1.5">
                Vision Statement
              </label>
              <textarea
                rows={3}
                value={settings.visionText || ''}
                onChange={(e) => setSettings({ ...settings, visionText: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-md border border-[#e8dcc8] bg-[#faf6f0] text-sm text-[#2c1f0e] focus:bg-white focus:outline-none focus:border-[#c2a66e]"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
