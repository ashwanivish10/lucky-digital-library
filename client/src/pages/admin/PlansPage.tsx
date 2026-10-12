import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Layers, Plus, Edit2, ShieldAlert, CheckCircle2, X } from 'lucide-react';
import { plansApi } from '../../lib/api';
import { formatINR } from '../../lib/utils';
import { IMembershipPlan } from '../../types/public';
import toast from 'react-hot-toast';

export const PlansPage: React.FC = () => {
  const [plans, setPlans] = useState<IMembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<IMembershipPlan | null>(null);
  const [form, setForm] = useState({
    name: '',
    durationValue: 1,
    durationUnit: 'months',
    baseFeeINR: '',
    registrationFeeINR: '0',
    benefits: ['Dedicated study desk', 'WiFi access', 'Charging point'],
    terms: '',
    isActive: true,
    displayOrder: 1,
  });
  const [newBenefit, setNewBenefit] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await plansApi.list();
      setPlans(res.data?.data || []);
    } catch {
      toast.error('Failed to load membership plans.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const openCreateModal = () => {
    setEditingPlan(null);
    setForm({
      name: '',
      durationValue: 1,
      durationUnit: 'months',
      baseFeeINR: '',
      registrationFeeINR: '0',
      benefits: ['Dedicated study desk', 'WiFi access', 'Power charging at desk', 'Clean drinking water'],
      terms: '',
      isActive: true,
      displayOrder: (plans.length + 1),
    });
    setModalOpen(true);
  };

  const openEditModal = (plan: IMembershipPlan) => {
    setEditingPlan(plan);
    setForm({
      name: plan.name,
      durationValue: plan.durationValue,
      durationUnit: plan.durationUnit,
      baseFeeINR: (plan.baseFee / 100).toString(),
      registrationFeeINR: ((plan.registrationFee || 0) / 100).toString(),
      benefits: [...plan.benefits],
      terms: plan.terms || '',
      isActive: plan.isActive,
      displayOrder: plan.displayOrder || 1,
    });
    setModalOpen(true);
  };

  const handleAddBenefit = () => {
    if (!newBenefit.trim()) return;
    setForm({ ...form, benefits: [...form.benefits, newBenefit.trim()] });
    setNewBenefit('');
  };

  const handleRemoveBenefit = (index: number) => {
    setForm({ ...form, benefits: form.benefits.filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.baseFeeINR) {
      toast.error('Please enter plan name and base fee.');
      return;
    }

    setIsSaving(true);
    try {
      if (editingPlan) {
        await plansApi.update(editingPlan._id, form);
        toast.success(`Plan "${form.name}" updated successfully.`);
      } else {
        await plansApi.create(form);
        toast.success(`Plan "${form.name}" created successfully.`);
      }
      setModalOpen(false);
      fetchPlans();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to save plan';
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (plan: IMembershipPlan) => {
    try {
      await plansApi.update(plan._id, { isActive: !plan.isActive });
      toast.success(`Plan status updated`);
      fetchPlans();
    } catch {
      toast.error('Could not update status');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12 font-sans">
      {/* Page Header */}
      <div className="page-header flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="section-eyebrow">Subscription Catalog</span>
          <h1 className="page-title text-2xl md:text-3xl font-[family-name:var(--font-ui)] font-bold text-[#0b1d2e]">
            Membership Plans Management
          </h1>
          <p className="text-sm text-[#65788c] mt-0.5">
            Configure admissions tiers, pricing, and perks published on the public landing page.
          </p>
        </div>

        <button onClick={openCreateModal} className="btn btn-primary inline-flex items-center gap-2 text-sm shadow-sm">
          <Plus size={16} />
          <span>Create New Plan</span>
        </button>
      </div>

      {/* Financial Snapshot Safety Banner */}
      <div className="p-4 rounded-lg bg-white border border-[#dce8f0] flex items-start gap-3.5 text-xs text-[#0b1d2e] shadow-sm">
        <div className="w-8 h-8 rounded-md bg-[#13b8c8]/15 flex items-center justify-center flex-shrink-0 text-[#13b8c8] mt-0.5">
          <ShieldAlert size={18} />
        </div>
        <div className="leading-relaxed">
          <strong className="text-[#0b1d2e] font-semibold">Financial Snapshot Integrity:</strong> Modifying fee structures here applies strictly to future admissions and renewals. Historical student memberships and past payment receipts permanently preserve the original fee agreed upon at enrollment.
        </div>
      </div>

      {/* Plans Grid */}
      {loading ? (
        <div className="grid md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card bg-white p-6 rounded-lg border border-[#dce8f0] shadow-sm h-80 animate-pulse" />
          ))}
        </div>
      ) : plans.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-lg border border-[#dce8f0] shadow-sm">
          <div className="w-14 h-14 rounded-full bg-[#13b8c8]/10 flex items-center justify-center text-[#13b8c8] mx-auto mb-3">
            <Layers size={28} />
          </div>
          <h3 className="text-lg font-[family-name:var(--font-ui)] font-bold text-[#0b1d2e]">No Plans Created</h3>
          <p className="text-xs text-[#65788c] mb-4">Set up your first membership duration and pricing plan.</p>
          <button onClick={openCreateModal} className="btn btn-primary text-xs py-2 px-4">
            Create Plan
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <motion.div
              key={plan._id}
              whileHover={{ y: -3 }}
              className={`luxury-card bg-white rounded-lg p-6 border shadow-sm flex flex-col justify-between transition-all ${
                plan.isActive ? 'border-[#dce8f0] hover:border-[#13b8c8]' : 'border-gray-200 opacity-75'
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className={`badge ${plan.isActive ? 'badge-active' : 'badge-inactive'} text-[10px]`}>
                    {plan.isActive ? 'Live on Website' : 'Draft / Inactive'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(plan)}
                      className="p-1.5 rounded text-[#65788c] hover:text-[#0b1d2e] hover:bg-[#edf4f8] transition-colors"
                      title="Edit Plan"
                    >
                      <Edit2 size={15} />
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-[family-name:var(--font-ui)] font-bold text-[#0b1d2e] mb-1">{plan.name}</h3>
                <p className="text-xs text-[#65788c] font-eyebrow font-semibold uppercase tracking-wider mb-4">
                  Duration: {plan.durationValue} {plan.durationUnit}
                </p>

                {/* Price block */}
                <div className="p-4 bg-[#f4f9fc] rounded-md mb-5 border border-[#dce8f0]">
                  <div className="text-3xl font-[family-name:var(--font-ui)] font-bold text-[#0b1d2e]">
                    {formatINR(plan.baseFee)}
                  </div>
                  {plan.registrationFee > 0 && (
                    <div className="text-xs text-[#65788c] mt-1 font-medium">
                      + Registration Fee: {formatINR(plan.registrationFee)}
                    </div>
                  )}
                </div>

                {/* Benefits */}
                <div className="space-y-2 mb-6">
                  <div className="text-[11px] font-eyebrow font-bold uppercase tracking-wider text-[#0b1d2e] mb-2">
                    Included Benefits:
                  </div>
                  {plan.benefits.map((b, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-[#0b1d2e]">
                      <CheckCircle2 size={14} className="text-[#1A5C3B] shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>

                {plan.terms && (
                  <p className="text-[11px] text-[#65788c] italic pt-3 border-t border-[#dce8f0] mb-4">
                    * {plan.terms}
                  </p>
                )}
              </div>

              {/* Bottom footer */}
              <div className="pt-4 border-t border-[#dce8f0] flex items-center justify-between text-xs">
                <span className="text-[#65788c] font-mono text-[11px]">Display Order #{plan.displayOrder || 1}</span>
                <button
                  type="button"
                  onClick={() => handleToggleActive(plan)}
                  className={`font-semibold text-xs transition-colors ${plan.isActive ? 'text-[#8B1A1A] hover:underline' : 'text-[#1A5C3B] hover:underline'}`}
                >
                  {plan.isActive ? 'Deactivate' : 'Publish Live'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#060A14]/70 backdrop-blur-xs overflow-y-auto">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 md:p-8 max-w-xl w-full border border-[#dce8f0] shadow-2xl relative my-8"
          >
            <div className="flex justify-between items-start mb-6 pb-4 border-b border-[#dce8f0]">
              <div>
                <span className="text-[10px] font-eyebrow font-bold uppercase tracking-widest text-[#13b8c8]">
                  {editingPlan ? 'Modify Plan Details' : 'New Subscription Plan'}
                </span>
                <h3 className="text-2xl font-[family-name:var(--font-ui)] font-bold text-[#0b1d2e] mt-0.5">
                  {editingPlan ? editingPlan.name : 'Configure Plan Details'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-[#65788c] hover:text-[#0b1d2e] p-1 rounded"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-eyebrow font-bold uppercase tracking-wider text-[#0b1d2e] mb-1.5">
                  Plan Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Standard Full-Day Plan"
                  className="w-full px-3.5 py-2.5 rounded-md border border-[#dce8f0] bg-[#f4f9fc] text-sm text-[#0b1d2e] focus:outline-none focus:border-[#13b8c8]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-eyebrow font-bold uppercase tracking-wider text-[#0b1d2e] mb-1.5">
                    Duration Value *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={form.durationValue}
                    onChange={(e) => setForm({ ...form, durationValue: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-md border border-[#dce8f0] bg-[#f4f9fc] text-sm text-[#0b1d2e] focus:outline-none focus:border-[#13b8c8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-eyebrow font-bold uppercase tracking-wider text-[#0b1d2e] mb-1.5">
                    Duration Unit *
                  </label>
                  <select
                    value={form.durationUnit}
                    onChange={(e) => setForm({ ...form, durationUnit: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-md border border-[#dce8f0] bg-[#f4f9fc] text-sm text-[#0b1d2e] focus:outline-none focus:border-[#13b8c8] cursor-pointer"
                  >
                    <option value="months">Months</option>
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                    <option value="years">Years</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-eyebrow font-bold uppercase tracking-wider text-[#0b1d2e] mb-1.5">
                    Base Fee in INR (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={form.baseFeeINR}
                    onChange={(e) => setForm({ ...form, baseFeeINR: e.target.value })}
                    placeholder="1200"
                    className="w-full px-3.5 py-2.5 rounded-md border border-[#dce8f0] bg-[#f4f9fc] text-sm text-[#0b1d2e] focus:outline-none focus:border-[#13b8c8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-eyebrow font-bold uppercase tracking-wider text-[#0b1d2e] mb-1.5">
                    One-time Registration Fee (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.registrationFeeINR}
                    onChange={(e) => setForm({ ...form, registrationFeeINR: e.target.value })}
                    placeholder="200"
                    className="w-full px-3.5 py-2.5 rounded-md border border-[#dce8f0] bg-[#f4f9fc] text-sm text-[#0b1d2e] focus:outline-none focus:border-[#13b8c8]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-eyebrow font-bold uppercase tracking-wider text-[#0b1d2e] mb-1.5">
                  Plan Benefits List
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newBenefit}
                    onChange={(e) => setNewBenefit(e.target.value)}
                    placeholder="Add benefit (e.g. Reserved locker space)..."
                    className="flex-1 px-3.5 py-2 rounded-md border border-[#dce8f0] bg-[#f4f9fc] text-xs text-[#0b1d2e] focus:outline-none focus:border-[#13b8c8]"
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddBenefit(); } }}
                  />
                  <button type="button" onClick={handleAddBenefit} className="btn btn-secondary text-xs py-2 px-3">
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2.5 bg-[#f4f9fc] rounded-md border border-[#dce8f0]">
                  {form.benefits.map((b, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white border border-[#dce8f0] text-xs text-[#0b1d2e]">
                      {b}
                      <button type="button" onClick={() => handleRemoveBenefit(i)} className="text-[#8B1A1A] hover:opacity-75 font-bold">
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-eyebrow font-bold uppercase tracking-wider text-[#0b1d2e] mb-1.5">
                  Special Terms or Notes (Optional)
                </label>
                <input
                  type="text"
                  value={form.terms}
                  onChange={(e) => setForm({ ...form, terms: e.target.value })}
                  placeholder="e.g. Non-transferable; valid for morning shift only"
                  className="w-full px-3.5 py-2.5 rounded-md border border-[#dce8f0] bg-[#f4f9fc] text-sm text-[#0b1d2e] focus:outline-none focus:border-[#13b8c8]"
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-[#0b1d2e] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="rounded border-[#dce8f0] text-[#13b8c8] focus:ring-[#13b8c8]"
                  />
                  Publish Plan on Public Website
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#65788c]">Display Order:</span>
                  <input
                    type="number"
                    value={form.displayOrder}
                    onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })}
                    className="w-16 px-2 py-1 rounded border border-[#dce8f0] bg-[#f4f9fc] text-xs text-center text-[#0b1d2e]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-5 border-t border-[#dce8f0]">
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary text-xs py-2 px-4">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="btn btn-primary text-xs py-2 px-4 shadow-sm">
                  {isSaving ? 'Saving...' : editingPlan ? 'Save Changes' : 'Create Plan'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default PlansPage;
