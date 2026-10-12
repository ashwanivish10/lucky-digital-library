"use strict";
/**
 * DEV SEEDER — Lucky Digital Library
 * =====================================
 * Generates sample students, memberships, and payment ledger records
 * for development, testing, and UI preview.
 *
 * Usage: npm run seed:dev
 * WARNING: Run only in local / development environments.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongoose_1 = __importDefault(require("mongoose"));
const argon2_1 = __importDefault(require("argon2"));
const date_fns_1 = require("date-fns");
const config_1 = require("../config");
const User_1 = require("../models/User");
const Student_1 = require("../models/Student");
const MembershipPlan_1 = require("../models/MembershipPlan");
const Membership_1 = require("../models/Membership");
const Payment_1 = require("../models/Payment");
const SiteSettings_1 = require("../models/SiteSettings");
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
    await mongoose_1.default.connect(config_1.config.mongoUri);
    // 1. Ensure Admin exists
    let admin = await User_1.User.findOne({ role: 'admin' });
    if (!admin) {
        const passwordHash = await argon2_1.default.hash(config_1.config.seed.adminPassword);
        admin = await User_1.User.create({
            name: config_1.config.seed.adminName,
            email: config_1.config.seed.adminEmail,
            passwordHash,
            role: 'admin',
            status: 'active',
        });
        console.log(`✅ Admin created: ${admin.email}`);
    }
    // 2. Fetch plans
    const plans = await MembershipPlan_1.MembershipPlan.find({ isActive: true });
    if (plans.length === 0) {
        console.error('❌ Please run "npm run seed" first to create membership plans.');
        process.exit(1);
    }
    // 3. Clear existing dev students/memberships/payments if needed
    console.log('Clearing past sample student data...');
    await Promise.all([
        Student_1.Student.deleteMany({}),
        Membership_1.Membership.deleteMany({}),
        Payment_1.Payment.deleteMany({}),
        User_1.User.deleteMany({ role: 'student' }),
    ]);
    const defaultPasswordHash = await argon2_1.default.hash('Student@1234');
    const now = new Date();
    console.log(`Creating ${SAMPLE_STUDENTS.length} sample students with realistic records...`);
    for (let i = 0; i < SAMPLE_STUDENTS.length; i++) {
        const s = SAMPLE_STUDENTS[i];
        const studentCode = `LDL26${(i + 1).toString().padStart(3, '0')}`;
        // Vary joining dates over the past 6 months
        const joiningMonthsAgo = (i % 6);
        const joiningDate = (0, date_fns_1.subMonths)(now, joiningMonthsAgo);
        // Create student document
        const student = await Student_1.Student.create({
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
        await User_1.User.create({
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
            let startDate;
            let endDate;
            let status = 'active';
            if (i < 4) {
                // Expiring soon (within next 5 days)
                startDate = (0, date_fns_1.subDays)(now, 25);
                endDate = (0, date_fns_1.addDays)(now, 4);
                status = 'expiring_soon';
            }
            else if (i < 7) {
                // Expired (expired 10 days ago)
                startDate = (0, date_fns_1.subMonths)(now, 2);
                endDate = (0, date_fns_1.subDays)(now, 10);
                status = 'expired';
            }
            else {
                // Active (freshly started or midway)
                startDate = (0, date_fns_1.subDays)(now, 10);
                endDate = (0, date_fns_1.addDays)(now, 20);
                status = 'active';
            }
            const membership = await Membership_1.Membership.create({
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
            await Payment_1.Payment.create({
                receiptNumber,
                studentId: student._id,
                membershipId: membership._id,
                amountReceived: amountPaid,
                paymentMethod: ['cash', 'upi', 'bank_transfer', 'card'][i % 4],
                paymentDate: startDate,
                feeCategory: 'Membership Fee',
                periodLabel: (0, date_fns_1.format)(startDate, 'MMMM yyyy'),
                transactionReference: (i % 2 === 0) ? `UPI${Date.now().toString().slice(-8)}${i}` : undefined,
                recordedBy: admin._id,
                status: 'completed',
                notes: i === 2 ? 'First installment paid; balance due in 10 days' : 'Paid in full',
            });
        }
    }
    // Update site settings receipt counter
    await SiteSettings_1.SiteSettings.findOneAndUpdate({}, { receiptCounter: 1000 + SAMPLE_STUDENTS.length });
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
//# sourceMappingURL=devSeed.js.map