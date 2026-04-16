import * as bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// const adapter = new PrismaMariaDb({
//   host: process.env.DB_HOST || 'localhost',
//   user: process.env.DB_USER || 'root',
//   password: process.env.DB_PASSWORD || '',
//   database: process.env.DB_NAME || 'ruscomiks',
//   connectionLimit: 5,
// });

// const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // Admin user
  const hashed = await bcrypt.hash('revolution@1914', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'supreme@ruscomiks.com' },
    update: {},
    create: {
      name: 'Ivan the Admin',
      email: 'supreme@ruscomiks.com',
      password: hashed,
      role: 'admin',
    },
  });
  console.log('✅ Admin created:', admin.email);

  // Default genres
  const genreNames = [
    'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy',
    'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life',
    'Sports', 'Supernatural', 'Thriller', 'Historical', 'Isekai',
    'Mecha', 'Psychological', 'Shounen', 'Shoujo', 'Seinen',
  ];

  for (const name of genreNames) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    await prisma.genre.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    });
  }
  console.log(`✅ ${genreNames.length} genres seeded`);

  // Sample carousel
  await prisma.carousel.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      title: 'Welcome to Ruscomiks',
      description: 'Discover manga and comics. Read, rate, and collect your favorites.',
      imageUrl: 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=1400',
      linkUrl: '/browse',
      sortOrder: 0,
      isActive: true,
    },
  });
  console.log('✅ Sample carousel seeded');

  console.log('\n🎉 Seed complete!');
  console.log('Ivan the Admin → supreme@ruscomiks.com / revolution@1914');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());