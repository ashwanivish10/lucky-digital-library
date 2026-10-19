/**
 * DEV SEEDER — Lucky Digital Library
 * =====================================
 * Generates sample students, memberships, and payment ledger records
 * for development, testing, and UI preview.
 *
 * Usage: npm run seed:dev
 * WARNING: Run only in local / development environments.
 */

import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { hash } from '@node-rs/argon2';
import { addDays, subDays, subMonths, format } from 'date-fns';
import { config } from '../config';
import { User } from '../models/User';
import { Student } from '../models/Student';
import { MembershipPlan } from '../models/MembershipPlan';
import { Membership } from '../models/Membership';
import { Payment } from '../models/Payment';
import { SiteSettings } from '../models/SiteSettings';
import { AuditLog } from '../models/AuditLog';

const SAMPLE_STUDENTS = [
  { name: 'Aarav Patel', phone: '9823011223', email: 'aarav.patel@example.com', seat: 'Seat 14', notes: 'UPSC CSE 2026 Aspirant' },
  { name: 'Aditi Deshmukh', phone: '9845022334', email: 'aditi.d@example.com', seat: 'Seat 3', notes: 'MPSC Rajyaseva' },
  { name: 'Rohan Sharma', phone: '9764033445', email: 'rohan.sharma@example.com', seat: 'Seat 8', notes: 'Chartered Accountancy Final' },
  { name: 'Ananya Iyer', phone: '9921044556', email: 'ananya.iyer@example.com', seat: 'Seat 22', notes: 'NEET PG 2026' },
  { name: 'Vikram Joshi', phone: '9850055667', email: 'vikram.j@example.com', seat: 'Seat 35', notes: 'GATE CS' },
  { name: 'Pooja Kulkarni', phone: '9730066778', email: 'pooja.k@example.com', seat: 'Seat 40', notes: 'UPSC EPFO' },
  { name: 'Kunal Shinde', phone: '9970077889', email: 'kunal.shinde@example.com', seat: 'Seat 50', notes: 'Bank PO Exam' },
  { name: 'Sneha More', phone: '9881088990', email: 'sneha.more@example.com', seat: 'Seat 12', notes: 'State PSC' },
  { name: 'Siddharth Nair', phone: '9822099001', email: 'siddharth.n@example.com', seat: 'Seat 18', notes: 'UPSC CSE 2026' },
  { name: 'Tanvi Bhosale', phone: '9763012345', email: 'tanvi.b@example.com', seat: 'Seat 28', notes: 'NET / JRF Commerce' },
  { name: 'Nikhil Gaikwad', phone: '9890023456', email: 'nikhil.g@example.com', seat: 'Seat 33', notes: 'SSC CGL' },
  { name: 'Meera Chawla', phone: '9922034567', email: 'meera.c@example.com', seat: 'Seat 47', notes: 'CAT 2026 Preparation' },
  { name: 'Abhishek Pawar', phone: '9851045678', email: 'abhishek.p@example.com', seat: 'Seat 5', notes: 'Judiciary Services' },
  { name: 'Kavita Jadhav', phone: '9731056789', email: 'kavita.j@example.com', seat: 'Seat 60', notes: 'CDS / AFCAT' },
  { name: 'Harsh Vardhan', phone: '9971067890', email: 'harsh.v@example.com', seat: 'Seat 16', notes: 'UPSC CSE' },
  { name: 'Ritu Verma', phone: '9882078901', email: 'ritu.v@example.com', seat: 'Seat 25', notes: 'CA Intermediate' },
  { name: 'Omkar Salunkhe', phone: '9823089012', email: 'omkar.s@example.com', seat: 'Seat 38', notes: 'IIT JAM Physics' },
  { name: 'Deepa Menon', phone: '9765090123', email: 'deepa.m@example.com', seat: 'Seat 55', notes: 'UPSC Prelims' },
  { name: 'Gaurav Sawant', phone: '9891001234', email: 'gaurav.s@example.com', seat: 'Seat 64', notes: 'RBI Grade B' },
  { name: 'Ishita Roy', phone: '9923012345', email: 'ishita.r@example.com', seat: 'Seat 1', notes: 'GRE / TOEFL Aspirant' },
];

async function devSeed() {
  console.log('🌱 Running Dev Seeder for Lucky Digital Library...');
  await mongoose.connect(config.mongoUri);

  // 1. Ensure Admin exists
  let admin = await User.findOne({ role: 'admin' });
  if (!admin) {
    const passwordHash = await hash(config.seed.adminPassword);
    admin = await User.create({
      name: config.seed.adminName,
      email: config.seed.adminEmail,
      passwordHash,
      role: 'admin',
      status: 'active',
    });
    console.log(`✅ Admin created: ${admin.email}`);
  }

  // 2. Fetch plans
  const plans = await MembershipPlan.find({ isActive: true });
  if (plans.length === 0) {
    console.error('❌ Please run "npm run seed" first to create membership plans.');
    process.exit(1);
  }

  // 3. Clear existing dev students/memberships/payments if needed
  console.log('Clearing past sample student data...');
  await Promise.all([
    Student.deleteMany({}),
    Membership.deleteMany({}),
    Payment.deleteMany({}),
    User.deleteMany({ role: 'student' }),
  ]);

  const defaultPasswordHash = await hash('Student@1234');
  const now = new Date();

  console.log(`Creating ${SAMPLE_STUDENTS.length} sample students with realistic records...`);

  for (let i = 0; i < SAMPLE_STUDENTS.length; i++) {
    const s = SAMPLE_STUDENTS[i];
    const studentCode = `LDL26${(i + 1).toString().padStart(3, '0')}`;
    
    // Vary joining dates over the past 6 months
    const joiningMonthsAgo = (i % 6);
    const joiningDate = subMonths(now, joiningMonthsAgo);

    // Create student document
    const student = await Student.create({
      studentCode,
      name: s.name,
      phone: s.phone,
      email: s.email,
      address: 'Deccan Gymkhana / FC Road Area, Pune',
      joiningDate,
      seatNumber: s.seat,
      notes: s.notes,
      registrationStatus: i === 19 ? 'pending' : 'approved',
      status: i === 18 ? 'inactive' : 'active',
    });

    // Create student login user
    await User.create({
      name: s.name,
      email: s.email,
      passwordHash: defaultPasswordHash,
      role: 'student',
      status: i === 19 ? 'inactive' : 'active',
      studentId: student._id,
    });

    // Assign membership if approved
    if (student.registrationStatus === 'approved') {
      const plan = plans[i % plans.length];
      
      // Determine dates: mix of active, expiring soon, and expired
      let startDate: Date;
      let endDate: Date;
      let status: 'active' | 'expiring_soon' | 'expired' = 'active';

      if (i < 4) {
        // Expiring soon (within next 5 days)
        startDate = subDays(now, 25);
        endDate = addDays(now, 4);
        status = 'expiring_soon';
      } else if (i < 7) {
        // Expired (expired 10 days ago)
        startDate = subMonths(now, 2);
        endDate = subDays(now, 10);
        status = 'expired';
      } else {
        // Active (freshly started or midway)
        startDate = subDays(now, 10);
        endDate = addDays(now, 20);
        status = 'active';
      }

      const membership = await Membership.create({
        studentId: student._id,
        planId: plan._id,
        planNameSnapshot: plan.name,
        baseFeeSnapshot: plan.baseFee,
        registrationFeeSnapshot: i % 3 === 0 ? plan.registrationFee : 0,
        durationValueSnapshot: plan.durationValue,
        durationUnitSnapshot: plan.durationUnit,
        discountAmount: i === 3 ? 20000 : 0, // ₹200 discount for student 3
        additionalCharges: 0,
        startDate,
        endDate,
        status,
        isRenewal: i % 4 === 0,
        createdBy: admin._id,
      });

      // Record payments
      const receiptNumber = `LDL-${1000 + i}`;
      const amountPaid = i === 2 ? Math.round(plan.baseFee / 2) : plan.baseFee; // student 2 has partial payment

      await Payment.create({
        receiptNumber,
        studentId: student._id,
        membershipId: membership._id,
        amountReceived: amountPaid,
        paymentMethod: ['cash', 'upi', 'bank_transfer', 'card'][i % 4],
        paymentDate: startDate,
        feeCategory: 'Membership Fee',
        periodLabel: format(startDate, 'MMMM yyyy'),
        transactionReference: (i % 2 === 0) ? `UPI${Date.now().toString().slice(-8)}${i}` : undefined,
        recordedBy: admin._id,
        status: 'completed',
        notes: i === 2 ? 'First installment paid; balance due in 10 days' : 'Paid in full',
      });
    }
  }

  // Update site settings receipt counter
  await SiteSettings.findOneAndUpdate({}, { receiptCounter: 1000 + SAMPLE_STUDENTS.length });

  console.log('✅ Dev Seeder completed successfully!');
  console.log(`   Created ${SAMPLE_STUDENTS.length} students with realistic memberships & ledger records.`);
  console.log('   All sample students login password: Student@1234');
  console.log(`   Sample student email: ${SAMPLE_STUDENTS[0].email}`);
  process.exit(0);
}

devSeed().catch((err) => {
  console.error('❌ Dev seed failed:', err);
  process.exit(1);
});
