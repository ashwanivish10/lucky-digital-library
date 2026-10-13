const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function clean() {
  console.log('Connecting to database...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB Atlas');

  // 1. Delete all students
  const delStudents = await mongoose.connection.db.collection('students').deleteMany({});
  console.log('Deleted students:', delStudents.deletedCount);

  // 2. Delete all non-admin users
  const delUsers = await mongoose.connection.db.collection('users').deleteMany({ role: { $ne: 'admin' } });
  console.log('Deleted student users:', delUsers.deletedCount);

  // 3. Delete all memberships
  const delMemberships = await mongoose.connection.db.collection('memberships').deleteMany({});
  console.log('Deleted memberships:', delMemberships.deletedCount);

  // 4. Delete all payments
  const delPayments = await mongoose.connection.db.collection('payments').deleteMany({});
  console.log('Deleted payments:', delPayments.deletedCount);

  // 5. Delete all financial adjustments
  const delAdj = await mongoose.connection.db.collection('financialadjustments').deleteMany({});
  console.log('Deleted financial adjustments:', delAdj.deletedCount);

  // 6. Delete all audit logs
  const delLogs = await mongoose.connection.db.collection('auditlogs').deleteMany({});
  console.log('Deleted audit logs:', delLogs.deletedCount);

  // 7. Delete all contact messages
  const delMsg = await mongoose.connection.db.collection('contactmessages').deleteMany({});
  console.log('Deleted contact messages:', delMsg.deletedCount);

  // 8. Update sitesettings if 64 is in testimonials
  const settings = await mongoose.connection.db.collection('sitesettings').findOne({});
  if (settings && settings.testimonials) {
    const updatedTestimonials = settings.testimonials.map(t => ({
      ...t,
      text: t.text ? t.text.replace(/64/g, '58') : t.text,
    }));
    await mongoose.connection.db.collection('sitesettings').updateOne(
      { _id: settings._id },
      { $set: { testimonials: updatedTestimonials } }
    );
    console.log('Updated sitesettings testimonials: replaced 64 with 58');
  }

  // 9. Verify current collections state
  console.log('\n--- Final Database Status ---');
  const collections = await mongoose.connection.db.listCollections().toArray();
  for (const c of collections) {
    const count = await mongoose.connection.db.collection(c.name).countDocuments();
    console.log(`  ${c.name}: ${count}`);
  }

  const remainingUsers = await mongoose.connection.db.collection('users').find({}).toArray();
  console.log('\nActive Admin Users preserved:');
  for (const u of remainingUsers) {
    console.log(`  - ${u.name} (${u.email}) [role: ${u.role}, status: ${u.status}]`);
  }

  await mongoose.disconnect();
  console.log('\nDatabase cleanup complete! Fresh clean state ready for launch.');
}

clean().catch((err) => {
  console.error('Error during database cleanup:', err);
  process.exit(1);
});
