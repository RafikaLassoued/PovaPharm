import { PrismaClient } from '@prisma/client';

const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@lavapharm.dz';
  const plainPassword = 'Admin2026';

  // 🔐 Hash password
  const hashedPassword = await bcrypt.hash(plainPassword, 12);

  // ✨ Create admin if not exists (safe)
  const admin = await prisma.admin.upsert({
    where: { email },
    update: {}, // لا نحدّث أي شيء حتى لا نحذف شيئًا بالغلط
    create: {
      email,
      passwordHash: hashedPassword,
      name: 'Admin',
      role: 'admin',
    },
  });

  console.log('-------------------------------------------');
  console.log('✅ Admin account is ready');
  console.log('Email:', admin.email);
  console.log('Password:', plainPassword);
  console.log('-------------------------------------------');
}

main()
  .catch((e) => console.error('❌ Error:', e))
  .finally(() => prisma.$disconnect());