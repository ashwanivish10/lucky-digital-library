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
          <h1 className="page-title text-2xl md:text-3xl font-[family-name:var(--font-ui)] font-bold text-[#2c1f0e]">
            Membership Plans Management
          </h1>
          <p className="text-sm text-[#8a7a60] mt-0.5">
            Configure admissions tiers, pricing, and perks published on the public landing page.
          </p>
        </div>

        <button onClick={openCreateModal} className="btn btn-primary inline-flex items-center gap-2 text-sm shadow-sm">
          <Plus size={16} />
          <span>Create New Plan</span>
        </button>
      </div>

      {/* Financial Snapshot Safety Banner */}
      <div className="p-4 rounded-lg bg-white border border-[#e8dcc8] flex items-start gap-3.5 text-xs text-[#2c1f0e] shadow-sm">
        <div className="w-8 h-8 rounded-md bg-[#c2a66e]/15 flex items-center justify-center flex-shrink-0 text-[#c2a66e] mt-0.5">
          <ShieldAlert size={18} />
        </div>
        <div className="leading-relaxed">
          <strong className="text-[#2c1f0e] font-semibold">Financial Snapshot Integrity:</strong> Modifying fee structures here applies strictly to future admissions and renewals. Historical student memberships and past payment receipts permanently preserve the original fee agreed upon at enrollment.
        </div>
      </div>

      {/* Plans Grid */}
      {loading ? (
        <div className="grid md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card bg-white p-6 rounded-lg border border-[#e8dcc8] shadow-sm h-80 animate-pulse" />
          ))}
        </div>
      ) : plans.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-lg border border-[#e8dcc8] shadow-sm">
          <div className="w-14 h-14 rounded-full bg-[#c2a66e]/10 flex items-center justify-center text-[#c2a66e] mx-auto mb-3">
            <Layers size={28} />
          </div>
          <h3 className="text-lg font-[family-name:var(--font-ui)] font-bold text-[#2c1f0e]">No Plans Created</h3>
          <p className="text-xs text-[#8a7a60] mb-4">Set up your first membership duration and pricing plan.</p>
          <button onClick={openCreateModal} className="btn btn-primary text-xs py-2 px-4">
            Create Plan
          </button>
        </div>
      ) : (
        <div className="grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">
          {plans.map((plan) => (
            <motion.article
              key={plan._id}
              whileHover={{ y: -2 }}
              className={`flex h-full flex-col rounded-2xl border bg-white p-5 shadow-sm ${
                plan.isActive ? 'border-[#e8dcc8]' : 'border-[#e4ebf1] opacity-80'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <span className={`badge ${plan.isActive ? 'badge-active' : 'badge-inactive'} text-[10px]`}>
                  {plan.isActive ? 'Live on Website' : 'Draft / Inactive'}
                </span>
                <button
                  type="button"
                  onClick={() => openEditModal(plan)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#e8dcc8] text-[#294055] hover:border-[#8ed8e4] hover:bg-[#f2fcff]"
                  title="Edit Plan"
                >
                  <Edit2 size={14} />
                </button>
              </div>

              <h3 className="mt-4 text-xl font-[family-name:var(--font-ui)] font-bold text-[#2c1f0e]">
                {plan.name}
              </h3>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-[#8a7a60]">
                {plan.durationValue} {plan.durationValue === 1 ? plan.durationUnit.replace(/s$/, '') : plan.durationUnit}
              </p>

              <div className="mt-4 rounded-xl border border-[#d7eef3] bg-[#f4fbfd] px-4 py-3">
                <div className="text-3xl font-[family-name:var(--font-ui)] font-bold tracking-tight text-[#2c1f0e]">
                  {formatINR(plan.baseFee)}
                </div>
                <p className="mt-1 text-xs font-medium text-[#5c7286]">
                  {plan.registrationFee > 0
                    ? `+ ${formatINR(plan.registrationFee)} registration fee`
                    : 'No registration fee'}
                </p>
              </div>

              <div className="mt-4 flex-1">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#5c7286]">
                  Included benefits
                </p>
                {plan.benefits.length === 0 ? (
                  <p className="text-xs text-[#8a7a60]">No benefits listed.</p>
                ) : (
                  <ul className="space-y-2">
                    {plan.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm leading-5 text-[#294055]">
                        <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-[#1A5C3B]" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {plan.terms && (
                <p className="mt-4 border-t border-[#e6eef3] pt-3 text-xs leading-5 text-[#5c7286]">
                  {plan.terms}
                </p>
              )}

              <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#e6eef3] pt-4">
                <span className="text-xs font-medium text-[#8a7a60]">
                  Display order #{plan.displayOrder || 1}
                </span>
                <button
                  type="button"
                  onClick={() => handleToggleActive(plan)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                    plan.isActive
                      ? 'bg-rose-50 text-[#b42336] hover:bg-rose-100'
                      : 'bg-emerald-50 text-[#1B5E3C] hover:bg-emerald-100'
                  }`}
                >
                  {plan.isActive ? 'Deactivate' : 'Publish Live'}
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#060A14]/70 backdrop-blur-xs overflow-y-auto">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 md:p-8 max-w-xl w-full border border-[#e8dcc8] shadow-2xl relative my-8"
          >
            <div className="flex justify-between items-start mb-6 pb-4 border-b border-[#e8dcc8]">
              <div>
                <span className="text-[10px] font-eyebrow font-bold uppercase tracking-widest text-[#c2a66e]">
                  {editingPlan ? 'Modify Plan Details' : 'New Subscription Plan'}
                </span>
                <h3 className="text-2xl font-[family-name:var(--font-ui)] font-bold text-[#2c1f0e] mt-0.5">
                  {editingPlan ? editingPlan.name : 'Configure Plan Details'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-[#8a7a60] hover:text-[#2c1f0e] p-1 rounded"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-eyebrow font-bold uppercase tracking-wider text-[#2c1f0e] mb-1.5">
                  Plan Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Standard Full-Day Plan"
                  className="w-full px-3.5 py-2.5 rounded-md border border-[#e8dcc8] bg-[#faf6f0] text-sm text-[#2c1f0e] focus:outline-none focus:border-[#c2a66e]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-eyebrow font-bold uppercase tracking-wider text-[#2c1f0e] mb-1.5">
                    Duration Value *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={form.durationValue}
                    onChange={(e) => setForm({ ...form, durationValue: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-md border border-[#e8dcc8] bg-[#faf6f0] text-sm text-[#2c1f0e] focus:outline-none focus:border-[#c2a66e]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-eyebrow font-bold uppercase tracking-wider text-[#2c1f0e] mb-1.5">
                    Duration Unit *
                  </label>
                  <select
                    value={form.durationUnit}
                    onChange={(e) => setForm({ ...form, durationUnit: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-md border border-[#e8dcc8] bg-[#faf6f0] text-sm text-[#2c1f0e] focus:outline-none focus:border-[#c2a66e] cursor-pointer"
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
                  <label className="block text-xs font-eyebrow font-bold uppercase tracking-wider text-[#2c1f0e] mb-1.5">
                    Base Fee in INR (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={form.baseFeeINR}
                    onChange={(e) => setForm({ ...form, baseFeeINR: e.target.value })}
                    placeholder="1200"
                    className="w-full px-3.5 py-2.5 rounded-md border border-[#e8dcc8] bg-[#faf6f0] text-sm text-[#2c1f0e] focus:outline-none focus:border-[#c2a66e]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-eyebrow font-bold uppercase tracking-wider text-[#2c1f0e] mb-1.5">
                    One-time Registration Fee (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.registrationFeeINR}
                    onChange={(e) => setForm({ ...form, registrationFeeINR: e.target.value })}
                    placeholder="200"
                    className="w-full px-3.5 py-2.5 rounded-md border border-[#e8dcc8] bg-[#faf6f0] text-sm text-[#2c1f0e] focus:outline-none focus:border-[#c2a66e]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-eyebrow font-bold uppercase tracking-wider text-[#2c1f0e] mb-1.5">
                  Plan Benefits List
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newBenefit}
                    onChange={(e) => setNewBenefit(e.target.value)}
                    placeholder="Add benefit (e.g. Reserved locker space)..."
                    className="flex-1 px-3.5 py-2 rounded-md border border-[#e8dcc8] bg-[#faf6f0] text-xs text-[#2c1f0e] focus:outline-none focus:border-[#c2a66e]"
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddBenefit(); } }}
                  />
                  <button type="button" onClick={handleAddBenefit} className="btn btn-secondary text-xs py-2 px-3">
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2.5 bg-[#faf6f0] rounded-md border border-[#e8dcc8]">
                  {form.benefits.map((b, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white border border-[#e8dcc8] text-xs text-[#2c1f0e]">
                      {b}
                      <button type="button" onClick={() => handleRemoveBenefit(i)} className="text-[#8B1A1A] hover:opacity-75 font-bold">
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-eyebrow font-bold uppercase tracking-wider text-[#2c1f0e] mb-1.5">
                  Special Terms or Notes (Optional)
                </label>
                <input
                  type="text"
                  value={form.terms}
                  onChange={(e) => setForm({ ...form, terms: e.target.value })}
                  placeholder="e.g. Non-transferable; valid for morning shift only"
                  className="w-full px-3.5 py-2.5 rounded-md border border-[#e8dcc8] bg-[#faf6f0] text-sm text-[#2c1f0e] focus:outline-none focus:border-[#c2a66e]"
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-[#2c1f0e] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="rounded border-[#e8dcc8] text-[#c2a66e] focus:ring-[#c2a66e]"
                  />
                  Publish Plan on Public Website
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#8a7a60]">Display Order:</span>
                  <input
                    type="number"
                    value={form.displayOrder}
                    onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })}
                    className="w-16 px-2 py-1 rounded border border-[#e8dcc8] bg-[#faf6f0] text-xs text-center text-[#2c1f0e]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-5 border-t border-[#e8dcc8]">
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
