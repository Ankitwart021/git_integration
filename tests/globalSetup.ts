
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

const prisma = new PrismaClient();

const userAId = 'cd1a7716-9522-4abf-ac5a-1cb5fbf09583';
const userBId = 'fd3ee4f4-4fde-4093-b1fe-b6802735655e';

export default async () => {
  await prisma.userApplicationMap.deleteMany({});
  await prisma.applicationEnum.deleteMany({});
  await prisma.page.deleteMany({});
  await prisma.resource.deleteMany({});
  await prisma.customComponent.deleteMany({});
  await prisma.application.deleteMany({});
  await prisma.user.deleteMany({});

  await prisma.user.createMany({
    data: [
      { id: userAId, username: 'new', email: 'new@gmail.com' },
      { id: userBId, username: 'newuser1', email: 'newuser1@gmail.com' },
    ],
  });

  await prisma.$disconnect();
};
