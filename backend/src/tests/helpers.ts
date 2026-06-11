import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import config from '../config';

export interface TestUser {
  id: number;
  username: string;
  password: string;
  roleType: string;
  token: string;
}

export const createTestUser = async (
  username: string,
  roleType: 'USER' | 'ADMIN' | 'SUPER_ADMIN' = 'USER'
): Promise<TestUser> => {
  const password = 'testpass123';
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      username,
      passwordHash,
      roleType,
    },
  });

  const token = jwt.sign(
    { userId: user.id, username: user.username, roleType: user.roleType },
    config.JWT_SECRET,
    { expiresIn: '1h' }
  );

  return {
    id: user.id,
    username: user.username,
    password,
    roleType: user.roleType,
    token,
  };
};

export const createTestWork = async (
  overrides: Partial<{
    title: string;
    description: string;
    category: string;
    tags: string;
    mediaUrl: string;
    status: 'DRAFT' | 'PUBLISHED';
  }> = {}
) => {
  return prisma.work.create({
    data: {
      title: overrides.title || 'Test Work',
      description: overrides.description || 'Test description',
      category: overrides.category || 'Test Category',
      tags: overrides.tags || '["test"]',
      mediaUrl: overrides.mediaUrl || '/uploads/test.png',
      status: overrides.status || 'PUBLISHED',
    },
  });
};

export const createInteraction = async (
  userId: number,
  workId: number,
  type: 'LIKE' | 'FAVORITE'
) => {
  return prisma.interaction.create({
    data: {
      userId,
      workId,
      interactionType: type,
    },
  });
};

export const authHeader = (token: string) => ({
  Authorization: `Bearer ${token}`,
});
