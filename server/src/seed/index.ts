/**
 * SEED SCRIPT — Lucky Digital Library
 * =====================================
 * Creates initial admin account + default membership plans + default site settings.
 * Run once: npm run seed
 * NEVER runs automatically in production.
 */

import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import argon2 from 'argon2';
import { config } from '../config';
import { User } from '../models/User';
import { MembershipPlan } from '../models/MembershipPlan';
import { SiteSettings } from '../models/SiteSettings';

async function seed() {
  console.log('🌱 Starting seed...');
  await mongoose.connect(config.mongoUri);

  // --- Admin User ---
  const existing = await User.findOne({ email: config.seed.adminEmail });
  if (!existing) {
    const passwordHash = await argon2.hash(config.seed.adminPassword);
    await User.create({
      name: config.seed.adminName,
      email: config.seed.adminEmail,
      passwordHash,
      role: 'admin',
      status: 'active',
    });
    console.log(`✅ Admin created: ${config.seed.adminEmail} / ${config.seed.adminPassword}`);
  } else {
    console.log(`ℹ️  Admin already exists: ${config.seed.adminEmail}`);
  }

  // --- Membership Plans ---
  const planCount = await MembershipPlan.countDocuments();
  if (planCount === 0) {
    await MembershipPlan.insertMany([
      {
        name: 'Monthly Plan',
        durationValue: 1,
        durationUnit: 'months',
        baseFee: 120000, // ₹1200 in paise
        registrationFee: 20000, // ₹200
        benefits: [
          'Dedicated study seat',
          'High-speed internet access',
          'Clean & quiet environment',
          'Charging facilities',
          'Free drinking water',
        ],
        isActive: true,
        displayOrder: 1,
      },
      {
        name: 'Quarterly Plan',
        durationValue: 3,
        durationUnit: 'months',
        baseFee: 320000, // ₹3200 in paise
        registrationFee: 0,
        benefits: [
          'All Monthly Plan benefits',
          '10% discount on monthly rate',
          'Priority seat selection',
          'Free one-week extension on renewal',
        ],
        isActive: true,
        displayOrder: 2,
      },
      {
        name: 'Half-Yearly Plan',
        durationValue: 6,
        durationUnit: 'months',
        baseFee: 600000, // ₹6000 in paise
        registrationFee: 0,
        benefits: [
          'All Quarterly Plan benefits',
          '15% discount on monthly rate',
          'Locker facility (if available)',
          'Free two-week extension on renewal',
        ],
        isActive: true,
        displayOrder: 3,
      },
    ]);
    console.log('✅ Membership plans created');
  } else {
    console.log(`ℹ️  ${planCount} plans already exist`);
  }

  // --- Site Settings ---
  const settingsCount = await SiteSettings.countDocuments();
  if (settingsCount === 0) {
    await SiteSettings.create({
      libraryName: 'Lucky Digital Library',
      tagline: 'Your Space to Focus. Your Place to Grow.',
      description:
        'Lucky Digital Library is a premium study space designed for students who want a peaceful, focused environment to achieve their academic goals.',
      phone: '+91 98765 43210',
      whatsapp: '+91 98765 43210',
      address: 'Lucky Digital Library, Devrakh Road, Near Kashi Chat Bhandar, Naini, Prayagraj, Uttar Pradesh - 211008',
      mapLink: 'https://maps.app.goo.gl/AaCd93WYde8cYnx79',
      currency: 'INR',
      currencySymbol: '₹',
      expiryWarningDays: 7,
      receiptPrefix: 'LDL',
      receiptCounter: 1000,
      openingHours: [
        { day: 'Monday', open: '06:00', close: '22:00', isClosed: false },
        { day: 'Tuesday', open: '06:00', close: '22:00', isClosed: false },
        { day: 'Wednesday', open: '06:00', close: '22:00', isClosed: false },
        { day: 'Thursday', open: '06:00', close: '22:00', isClosed: false },
        { day: 'Friday', open: '06:00', close: '22:00', isClosed: false },
        { day: 'Saturday', open: '06:00', close: '20:00', isClosed: false },
        { day: 'Sunday', open: '08:00', close: '18:00', isClosed: false },
      ],
      facilities: [
        { icon: 'BookOpen', title: 'Peaceful Environment', description: 'A silent, distraction-free zone for deep focus and effective study.', isVisible: true, order: 1 },
        { icon: 'Armchair', title: 'Comfortable Seating', description: 'Ergonomic chairs and spacious desks for long study sessions.', isVisible: true, order: 2 },
        { icon: 'Zap', title: 'Power & Charging', description: 'Dedicated charging points at every seat. Never run out of battery.', isVisible: true, order: 3 },
        { icon: 'Wifi', title: 'High-Speed Internet', description: 'Reliable broadband internet to support your digital learning needs.', isVisible: true, order: 4 },
        { icon: 'Clock', title: 'Flexible Hours', description: 'Open early morning to late evening to match your study schedule.', isVisible: true, order: 5 },
        { icon: 'Sparkles', title: 'Clean & Hygienic', description: 'Maintained to the highest standards of cleanliness for a healthy environment.', isVisible: true, order: 6 },
      ],
      rules: [
        'Maintain silence in the study hall at all times.',
        'Mobile phones must be on silent mode. Use headphones only in designated areas.',
        'Your allocated seat is personal — do not occupy others\' seats.',
        'Keep the library clean. Use dustbins provided.',
        'Membership fees are due on or before your renewal date.',
        'Eating and drinking (except water) is not allowed inside the study hall.',
        'Entry after closing time is not permitted.',
        'Damage to library property will be charged to the member.',
        'The library reserves the right to suspend membership for violation of rules.',
      ],
      missionText:
        'To provide an affordable, premium-quality study environment that empowers every student to achieve their full academic potential.',
      visionText:
        'To be the most trusted and student-friendly digital library in the region, where knowledge and focus thrive.',
      aboutText:
        'Lucky Digital Library was established with a single goal — to give students a dedicated space free from distractions, equipped with the modern amenities they need to study effectively. We believe that the right environment is half the battle won.',
      testimonialsEnabled: false,
    });
    console.log('✅ Site settings created');
  } else {
    console.log('ℹ️  Site settings already exist');
  }

  console.log('\n🎉 Seed complete!');
  console.log(`   Admin login: ${config.seed.adminEmail}`);
  console.log(`   Password:    ${config.seed.adminPassword}`);
  console.log('\n⚠️  Change the admin password immediately after first login!\n');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
