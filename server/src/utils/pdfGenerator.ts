import puppeteer from 'puppeteer';
import { format } from 'date-fns';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function generateReceiptPdf(payment: any, settings: any): Promise<Buffer> {
  const libraryName = settings?.libraryName || 'Lucky Digital Library';
  const address = settings?.address || '';
  const phone = settings?.phone || '';
  const currency = settings?.currencySymbol || '₹';

  const student = payment.studentId;
  const membership = payment.membershipId;
  const amountINR = payment.amountReceived / 100;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Receipt ${payment.receiptNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Arial', sans-serif; color: #1a1a2e; background: #fff; padding: 40px; }
    .receipt { max-width: 600px; margin: 0 auto; border: 2px solid #C9A84C; border-radius: 8px; overflow: hidden; }
    .header { background: #0F1B2D; color: #F8F4EC; padding: 28px 32px; text-align: center; }
    .header h1 { font-size: 22px; letter-spacing: 1px; margin-bottom: 4px; }
    .header p { font-size: 12px; color: #C9A84C; }
    .receipt-title { background: #C9A84C; color: #0F1B2D; text-align: center; padding: 10px; font-weight: bold; font-size: 16px; letter-spacing: 2px; }
    .body { padding: 28px 32px; }
    .receipt-no { display: flex; justify-content: space-between; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px dashed #e0d5b7; }
    .receipt-no span { font-size: 13px; color: #666; }
    .receipt-no strong { font-size: 16px; color: #C9A84C; }
    .section { margin-bottom: 20px; }
    .section-title { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #999; margin-bottom: 10px; }
    .row { display: flex; justify-content: space-between; margin-bottom: 6px; }
    .row .label { font-size: 13px; color: #555; }
    .row .value { font-size: 13px; font-weight: 600; color: #1a1a2e; }
    .amount-box { background: #f8f4ec; border: 1px solid #C9A84C; border-radius: 6px; padding: 16px 20px; margin: 20px 0; text-align: center; }
    .amount-box .label { font-size: 12px; color: #888; margin-bottom: 4px; }
    .amount-box .amount { font-size: 32px; font-weight: bold; color: #0F1B2D; }
    .footer { padding: 16px 32px; background: #f8f4ec; border-top: 1px solid #e0d5b7; text-align: center; font-size: 11px; color: #888; }
    .status-badge { display: inline-block; background: #2D6A4F; color: white; padding: 3px 12px; border-radius: 20px; font-size: 11px; font-weight: bold; letter-spacing: 1px; }
    .watermark { position: fixed; bottom: 40px; right: 40px; opacity: 0.05; font-size: 60px; font-weight: bold; transform: rotate(-20deg); color: #0F1B2D; }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <h1>${libraryName}</h1>
      <p>${address}</p>
      ${phone ? `<p>📞 ${phone}</p>` : ''}
    </div>
    <div class="receipt-title">PAYMENT RECEIPT</div>
    <div class="body">
      <div class="receipt-no">
        <div>
          <div style="font-size:11px;color:#999;margin-bottom:2px;">RECEIPT NO.</div>
          <strong>${payment.receiptNumber}</strong>
        </div>
        <div style="text-align:right;">
          <div style="font-size:11px;color:#999;margin-bottom:2px;">DATE</div>
          <strong>${format(new Date(payment.paymentDate), 'dd MMM yyyy')}</strong>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Student Details</div>
        <div class="row"><span class="label">Name</span><span class="value">${student?.name || '—'}</span></div>
        <div class="row"><span class="label">Student ID</span><span class="value">${student?.studentCode || '—'}</span></div>
        <div class="row"><span class="label">Phone</span><span class="value">${student?.phone || '—'}</span></div>
      </div>

      <div class="section">
        <div class="section-title">Membership Details</div>
        <div class="row"><span class="label">Plan</span><span class="value">${membership?.planNameSnapshot || '—'}</span></div>
        <div class="row"><span class="label">Period</span><span class="value">${payment.periodLabel || '—'}</span></div>
        <div class="row"><span class="label">Fee Category</span><span class="value">${payment.feeCategory || 'Membership Fee'}</span></div>
        ${membership?.startDate ? `<div class="row"><span class="label">Membership From</span><span class="value">${format(new Date(membership.startDate), 'dd MMM yyyy')}</span></div>` : ''}
        ${membership?.endDate ? `<div class="row"><span class="label">Membership Until</span><span class="value">${format(new Date(membership.endDate), 'dd MMM yyyy')}</span></div>` : ''}
      </div>

      <div class="amount-box">
        <div class="label">AMOUNT RECEIVED</div>
        <div class="amount">${currency}${amountINR.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
        <div style="margin-top:8px;"><span class="status-badge">✓ PAID</span></div>
      </div>

      <div class="section">
        <div class="section-title">Payment Details</div>
        <div class="row"><span class="label">Payment Method</span><span class="value">${payment.paymentMethod?.toUpperCase().replace('_', ' ')}</span></div>
        ${payment.transactionReference ? `<div class="row"><span class="label">Transaction Ref.</span><span class="value">${payment.transactionReference}</span></div>` : ''}
        <div class="row"><span class="label">Recorded By</span><span class="value">${(payment.recordedBy as { name: string })?.name || '—'}</span></div>
      </div>

      ${payment.notes ? `<div style="font-size:12px;color:#888;padding:8px 12px;background:#f5f5f5;border-radius:4px;margin-top:4px;">Note: ${payment.notes}</div>` : ''}
    </div>
    <div class="footer">
      This is a computer-generated receipt. No signature required.<br/>
      ${libraryName} &bull; Thank you for being a valued member.
    </div>
  </div>
</body>
</html>`;

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' },
    });
    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}
