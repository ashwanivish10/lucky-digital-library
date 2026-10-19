/** Membership amounts are stored in paise. */
export function membershipAmountDue(membership: {
  baseFeeSnapshot: number;
  registrationFeeSnapshot?: number;
  discountAmount?: number;
  additionalCharges?: number;
}): number {
  return (
    membership.baseFeeSnapshot +
    (membership.registrationFeeSnapshot || 0) -
    (membership.discountAmount || 0) +
    (membership.additionalCharges || 0)
  );
}
