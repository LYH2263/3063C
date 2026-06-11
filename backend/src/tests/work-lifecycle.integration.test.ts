import request from 'supertest';
import { createApp } from '../app';
import prisma from '../lib/prisma';
import {
  createTestUser,
  createTestWork,
  createInteraction,
  authHeader,
  TestUser,
} from './helpers';

const app = createApp();

describe('Work Lifecycle Integration Tests', () => {
  let admin: TestUser;
  let regularUser: TestUser;

  beforeAll(async () => {
    admin = await createTestUser('admin_user', 'ADMIN');
    regularUser = await createTestUser('regular_user', 'USER');
  });

  describe('1. Authentication & Authorization Protection', () => {
    it('should reject access to admin endpoints without token (401)', async () => {
      const res = await request(app).post('/api/works/admin').send({
        title: 'Test',
        description: 'Test',
        mediaUrl: '/test.png',
      });
      expect(res.status).toBe(401);
      expect(res.body.message).toContain('Missing token');
    });

    it('should reject access to admin endpoints with invalid token format (403)', async () => {
      const res = await request(app)
        .post('/api/works/admin')
        .set('Authorization', 'InvalidToken')
        .send({
          title: 'Test',
          description: 'Test',
          mediaUrl: '/test.png',
        });
      expect(res.status).toBe(403);
      expect(res.body.message).toContain('Invalid token');
    });

    it('should reject access to admin endpoints with regular user token (403)', async () => {
      const res = await request(app)
        .post('/api/works/admin')
        .set(authHeader(regularUser.token))
        .send({
          title: 'Test',
          description: 'Test',
          mediaUrl: '/test.png',
        });
      expect(res.status).toBe(403);
      expect(res.body.message).toContain('Admin access required');
    });

    it('should reject access to admin GET endpoints with regular user token (403)', async () => {
      const res = await request(app)
        .get('/api/works/admin/all')
        .set(authHeader(regularUser.token));
      expect(res.status).toBe(403);
    });
  });

  describe('2. Admin Create Work', () => {
    it('should create work with default status PUBLISHED', async () => {
      const res = await request(app)
        .post('/api/works/admin')
        .set(authHeader(admin.token))
        .send({
          title: 'My Artwork',
          description: 'A beautiful piece of digital art',
          mediaUrl: '/uploads/art.png',
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Work created');
      expect(res.body.data.title).toBe('My Artwork');
      expect(res.body.data.status).toBe('PUBLISHED');
      expect(res.body.data.viewCount).toBe(0);
      expect(res.body.data.category).toBe('Uncategorized');
    });

    it('should create work with specified status DRAFT', async () => {
      const res = await request(app)
        .post('/api/works/admin')
        .set(authHeader(admin.token))
        .send({
          title: 'Draft Work',
          description: 'Not ready yet',
          mediaUrl: '/uploads/draft.png',
          status: 'DRAFT',
          category: 'Digital Art',
          tags: '["draft", "wip"]',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe('DRAFT');
      expect(res.body.data.category).toBe('Digital Art');
      expect(res.body.data.tags).toBe('["draft", "wip"]');
    });

    it('should create work with specified status PUBLISHED', async () => {
      const res = await request(app)
        .post('/api/works/admin')
        .set(authHeader(admin.token))
        .send({
          title: 'Published Work',
          description: 'Ready to show',
          mediaUrl: '/uploads/published.png',
          status: 'PUBLISHED',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe('PUBLISHED');
    });

    it('should return 400 when title is missing', async () => {
      const res = await request(app)
        .post('/api/works/admin')
        .set(authHeader(admin.token))
        .send({
          description: 'Missing title',
          mediaUrl: '/uploads/test.png',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Missing required fields');
      expect(res.body.message).toContain('title');
    });

    it('should return 400 when description is missing', async () => {
      const res = await request(app)
        .post('/api/works/admin')
        .set(authHeader(admin.token))
        .send({
          title: 'Missing Description',
          mediaUrl: '/uploads/test.png',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Missing required fields');
      expect(res.body.message).toContain('description');
    });

    it('should return 400 when mediaUrl is missing', async () => {
      const res = await request(app)
        .post('/api/works/admin')
        .set(authHeader(admin.token))
        .send({
          title: 'Missing Media',
          description: 'No media URL',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Missing required fields');
      expect(res.body.message).toContain('mediaUrl');
    });

    it('should return 400 when multiple required fields are missing', async () => {
      const res = await request(app)
        .post('/api/works/admin')
        .set(authHeader(admin.token))
        .send({
          title: '',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('title');
      expect(res.body.message).toContain('description');
      expect(res.body.message).toContain('mediaUrl');
    });

    it('should trim whitespace from title and description', async () => {
      const res = await request(app)
        .post('/api/works/admin')
        .set(authHeader(admin.token))
        .send({
          title: '  Trimmed Title  ',
          description: '  Trimmed description  ',
          mediaUrl: '/uploads/test.png',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.title).toBe('Trimmed Title');
      expect(res.body.data.description).toBe('Trimmed description');
    });
  });

  describe('3. Public Work Listing with Filters', () => {
    beforeAll(async () => {
      await Promise.all([
        createTestWork({ title: 'Abstract Art', category: 'Art', status: 'PUBLISHED', tags: '["abstract", "modern"]' }),
        createTestWork({ title: 'Nature Photo', category: 'Photography', status: 'PUBLISHED', tags: '["nature", "photo"]' }),
        createTestWork({ title: 'UI Design', category: 'Design', status: 'PUBLISHED', tags: '["ui", "design"]' }),
        createTestWork({ title: 'Draft Work', category: 'Art', status: 'DRAFT' }),
        createTestWork({ title: 'Another Draft', category: 'Photography', status: 'DRAFT' }),
      ]);
    });

    it('should only return PUBLISHED works in public listing', async () => {
      const res = await request(app).get('/api/works');
      expect(res.status).toBe(200);
      expect(res.body.data.works).toHaveLength(3);
      res.body.data.works.forEach((work: any) => {
        expect(work.status).toBe('PUBLISHED');
      });
    });

    it('should return paginated results', async () => {
      const res = await request(app).get('/api/works?page=1&limit=2');
      expect(res.status).toBe(200);
      expect(res.body.data.works).toHaveLength(2);
      expect(res.body.data.page).toBe(1);
      expect(res.body.data.limit).toBe(2);
      expect(res.body.data.total).toBe(3);
    });

    it('should return second page correctly', async () => {
      const res = await request(app).get('/api/works?page=2&limit=2');
      expect(res.status).toBe(200);
      expect(res.body.data.works).toHaveLength(1);
      expect(res.body.data.page).toBe(2);
    });

    it('should filter works by category', async () => {
      const res = await request(app).get('/api/works?category=Art');
      expect(res.status).toBe(200);
      expect(res.body.data.works).toHaveLength(1);
      expect(res.body.data.works[0].category).toBe('Art');
      expect(res.body.data.works[0].title).toBe('Abstract Art');
    });

    it('should filter works by keyword in title', async () => {
      const res = await request(app).get('/api/works?search=Nature');
      expect(res.status).toBe(200);
      expect(res.body.data.works).toHaveLength(1);
      expect(res.body.data.works[0].title).toBe('Nature Photo');
    });

    it('should filter works by keyword in tags', async () => {
      const res = await request(app).get('/api/works?search=design');
      expect(res.status).toBe(200);
      expect(res.body.data.works).toHaveLength(1);
      expect(res.body.data.works[0].title).toBe('UI Design');
    });

    it('should return empty array when no matches found', async () => {
      const res = await request(app).get('/api/works?search=Nonexistent');
      expect(res.status).toBe(200);
      expect(res.body.data.works).toHaveLength(0);
      expect(res.body.data.total).toBe(0);
    });

    it('should combine category and search filters', async () => {
      const res = await request(app).get('/api/works?category=Art&search=Abstract');
      expect(res.status).toBe(200);
      expect(res.body.data.works).toHaveLength(1);
      expect(res.body.data.works[0].title).toBe('Abstract Art');
    });
  });

  describe('4. Work Detail View Count Increment', () => {
    let workId: number;

    beforeAll(async () => {
      const work = await createTestWork({ title: 'View Count Test' });
      workId = work.id;
    });

    it('should increment viewCount on first access', async () => {
      const res = await request(app).get(`/api/works/${workId}`);
      expect(res.status).toBe(200);
      expect(res.body.data.viewCount).toBe(1);
    });

    it('should increment viewCount on second access', async () => {
      const res = await request(app).get(`/api/works/${workId}`);
      expect(res.status).toBe(200);
      expect(res.body.data.viewCount).toBe(2);
    });

    it('should increment viewCount on third access', async () => {
      const res = await request(app).get(`/api/works/${workId}`);
      expect(res.status).toBe(200);
      expect(res.body.data.viewCount).toBe(3);
    });

    it('should return 400 for invalid work ID', async () => {
      const res = await request(app).get('/api/works/invalid');
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Invalid ID');
    });

    it('should not return DRAFT works in public detail view', async () => {
      const draftWork = await createTestWork({
        title: 'Draft Detail Test',
        status: 'DRAFT',
      });

      const res = await request(app).get(`/api/works/${draftWork.id}`);
      expect(res.status).toBe(404);
    });

    it('should persist viewCount correctly in database', async () => {
      await request(app).get(`/api/works/${workId}`);
      await request(app).get(`/api/works/${workId}`);

      const dbWork = await prisma.work.findUnique({ where: { id: workId } });
      expect(dbWork?.viewCount).toBe(5);
    });
  });

  describe('5. Toggle Like/Favorite Interaction', () => {
    let workId: number;
    let user2: TestUser;

    beforeAll(async () => {
      const work = await createTestWork({ title: 'Interaction Test' });
      workId = work.id;
      user2 = await createTestUser('user2', 'USER');
    });

    describe('Like Toggle', () => {
      it('should add like on first call (201)', async () => {
        const res = await request(app)
          .post(`/api/works/${workId}/interact`)
          .set(authHeader(regularUser.token))
          .send({ type: 'LIKE' });

        expect(res.status).toBe(201);
        expect(res.body.message).toContain('LIKE added');

        const interaction = await prisma.interaction.findUnique({
          where: {
            userId_workId_interactionType: {
              userId: regularUser.id,
              workId,
              interactionType: 'LIKE',
            },
          },
        });
        expect(interaction).not.toBeNull();
      });

      it('should remove like on second call (toggle) (200)', async () => {
        const res = await request(app)
          .post(`/api/works/${workId}/interact`)
          .set(authHeader(regularUser.token))
          .send({ type: 'LIKE' });

        expect(res.status).toBe(200);
        expect(res.body.message).toContain('LIKE removed');

        const interaction = await prisma.interaction.findUnique({
          where: {
            userId_workId_interactionType: {
              userId: regularUser.id,
              workId,
              interactionType: 'LIKE',
            },
          },
        });
        expect(interaction).toBeNull();
      });

      it('should add like again on third call (201)', async () => {
        const res = await request(app)
          .post(`/api/works/${workId}/interact`)
          .set(authHeader(regularUser.token))
          .send({ type: 'LIKE' });

        expect(res.status).toBe(201);
        expect(res.body.message).toContain('LIKE added');
      });
    });

    describe('Favorite Toggle', () => {
      it('should add favorite on first call (201)', async () => {
        const res = await request(app)
          .post(`/api/works/${workId}/interact`)
          .set(authHeader(regularUser.token))
          .send({ type: 'FAVORITE' });

        expect(res.status).toBe(201);
        expect(res.body.message).toContain('FAVORITE added');

        const interaction = await prisma.interaction.findUnique({
          where: {
            userId_workId_interactionType: {
              userId: regularUser.id,
              workId,
              interactionType: 'FAVORITE',
            },
          },
        });
        expect(interaction).not.toBeNull();
      });

      it('should remove favorite on second call (toggle) (200)', async () => {
        const res = await request(app)
          .post(`/api/works/${workId}/interact`)
          .set(authHeader(regularUser.token))
          .send({ type: 'FAVORITE' });

        expect(res.status).toBe(200);
        expect(res.body.message).toContain('FAVORITE removed');

        const interaction = await prisma.interaction.findUnique({
          where: {
            userId_workId_interactionType: {
              userId: regularUser.id,
              workId,
              interactionType: 'FAVORITE',
            },
          },
        });
        expect(interaction).toBeNull();
      });
    });

    describe('Unique Constraint Enforcement', () => {
      it('should allow different users to like the same work independently', async () => {
        await request(app)
          .post(`/api/works/${workId}/interact`)
          .set(authHeader(regularUser.token))
          .send({ type: 'LIKE' });

        await request(app)
          .post(`/api/works/${workId}/interact`)
          .set(authHeader(user2.token))
          .send({ type: 'LIKE' });

        const interactions = await prisma.interaction.findMany({
          where: { workId, interactionType: 'LIKE' },
        });
        expect(interactions).toHaveLength(2);
        expect(interactions.map(i => i.userId)).toContain(regularUser.id);
        expect(interactions.map(i => i.userId)).toContain(user2.id);
      });

      it('should allow same user to like and favorite the same work', async () => {
        await request(app)
          .post(`/api/works/${workId}/interact`)
          .set(authHeader(user2.token))
          .send({ type: 'LIKE' });

        await request(app)
          .post(`/api/works/${workId}/interact`)
          .set(authHeader(user2.token))
          .send({ type: 'FAVORITE' });

        const interactions = await prisma.interaction.findMany({
          where: { workId, userId: user2.id },
        });
        expect(interactions).toHaveLength(2);
        expect(interactions.map(i => i.interactionType)).toEqual(
          expect.arrayContaining(['LIKE', 'FAVORITE'])
        );
      });

      it('should handle concurrent toggle requests gracefully (unique constraint)', async () => {
        const promises = Array(5)
          .fill(null)
          .map(() =>
            request(app)
              .post(`/api/works/${workId}/interact`)
              .set(authHeader(user2.token))
              .send({ type: 'LIKE' })
          );

        await Promise.allSettled(promises);

        const finalCount = await prisma.interaction.count({
          where: {
            userId: user2.id,
            workId,
            interactionType: 'LIKE',
          },
        });
        expect(finalCount).toBeLessThanOrEqual(1);
      });
    });

    describe('Validation', () => {
      it('should return 400 for invalid interaction type', async () => {
        const res = await request(app)
          .post(`/api/works/${workId}/interact`)
          .set(authHeader(regularUser.token))
          .send({ type: 'INVALID' });

        expect(res.status).toBe(400);
        expect(res.body.message).toContain('Invalid interaction type');
      });

      it('should return 400 for invalid work ID', async () => {
        const res = await request(app)
          .post('/api/works/invalid/interact')
          .set(authHeader(regularUser.token))
          .send({ type: 'LIKE' });

        expect(res.status).toBe(400);
        expect(res.body.message).toContain('Invalid ID');
      });

      it('should return 401 when not authenticated', async () => {
        const res = await request(app)
          .post(`/api/works/${workId}/interact`)
          .send({ type: 'LIKE' });

        expect(res.status).toBe(401);
      });
    });
  });

  describe('6. Delete Work with Interaction Cleanup', () => {
    let workId1: number;
    let workId2: number;

    beforeAll(async () => {
      const [work1, work2] = await Promise.all([
        createTestWork({ title: 'Delete Test 1' }),
        createTestWork({ title: 'Delete Test 2' }),
      ]);
      workId1 = work1.id;
      workId2 = work2.id;

      await Promise.all([
        createInteraction(regularUser.id, workId1, 'LIKE'),
        createInteraction(regularUser.id, workId1, 'FAVORITE'),
        createInteraction(admin.id, workId1, 'LIKE'),
        createInteraction(regularUser.id, workId2, 'LIKE'),
      ]);
    });

    it('should verify interactions exist before deletion', async () => {
      const interactions = await prisma.interaction.count({
        where: { workId: workId1 },
      });
      expect(interactions).toBe(3);
    });

    it('should delete work and all associated interactions', async () => {
      const res = await request(app)
        .delete(`/api/works/admin/${workId1}`)
        .set(authHeader(admin.token));

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('Work deleted');

      const deletedWork = await prisma.work.findUnique({
        where: { id: workId1 },
      });
      expect(deletedWork).toBeNull();

      const remainingInteractions = await prisma.interaction.count({
        where: { workId: workId1 },
      });
      expect(remainingInteractions).toBe(0);
    });

    it('should preserve interactions for other works', async () => {
      const interactions = await prisma.interaction.count({
        where: { workId: workId2 },
      });
      expect(interactions).toBe(1);
    });

    it('should preserve user records after work deletion', async () => {
      const user = await prisma.user.findUnique({
        where: { id: regularUser.id },
      });
      expect(user).not.toBeNull();
    });

    it('should not allow regular user to delete work', async () => {
      const res = await request(app)
        .delete(`/api/works/admin/${workId2}`)
        .set(authHeader(regularUser.token));

      expect(res.status).toBe(403);

      const work = await prisma.work.findUnique({
        where: { id: workId2 },
      });
      expect(work).not.toBeNull();
    });

    it('should return 400 for invalid work ID on delete', async () => {
      const res = await request(app)
        .delete('/api/works/admin/invalid')
        .set(authHeader(admin.token));

      expect(res.status).toBe(400);
    });
  });

  describe('7. Complete Work Lifecycle End-to-End', () => {
    it('should handle full lifecycle: create -> view -> interact -> delete', async () => {
      const createRes = await request(app)
        .post('/api/works/admin')
        .set(authHeader(admin.token))
        .send({
          title: 'Lifecycle Test',
          description: 'Full lifecycle test work',
          mediaUrl: '/uploads/lifecycle.png',
          category: 'Test',
        });
      expect(createRes.status).toBe(201);
      const workId = createRes.data.id;

      await request(app).get(`/api/works/${workId}`);
      await request(app).get(`/api/works/${workId}`);

      const viewRes = await request(app).get(`/api/works/${workId}`);
      expect(viewRes.status).toBe(200);
      expect(viewRes.body.data.viewCount).toBe(3);

      const likeRes = await request(app)
        .post(`/api/works/${workId}/interact`)
        .set(authHeader(regularUser.token))
        .send({ type: 'LIKE' });
      expect(likeRes.status).toBe(201);

      const favRes = await request(app)
        .post(`/api/works/${workId}/interact`)
        .set(authHeader(regularUser.token))
        .send({ type: 'FAVORITE' });
      expect(favRes.status).toBe(201);

      const interactionCount = await prisma.interaction.count({
        where: { workId },
      });
      expect(interactionCount).toBe(2);

      const listRes = await request(app).get('/api/works?search=Lifecycle');
      expect(listRes.status).toBe(200);
      expect(listRes.data.works).toHaveLength(1);
      expect(listRes.data.works[0].title).toBe('Lifecycle Test');

      const deleteRes = await request(app)
        .delete(`/api/works/admin/${workId}`)
        .set(authHeader(admin.token));
      expect(deleteRes.status).toBe(200);

      const afterDeleteList = await request(app).get('/api/works?search=Lifecycle');
      expect(afterDeleteList.data.works).toHaveLength(0);

      const afterDeleteInteractions = await prisma.interaction.count({
        where: { workId },
      });
      expect(afterDeleteInteractions).toBe(0);
    });
  });
});
