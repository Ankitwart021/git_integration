import request from 'supertest';
import { app } from '../server';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

const prisma = new PrismaClient();

const userAToken = process.env.TEST_AUTH_TOKEN;
const userBToken = process.env.TEST_AUTH_TOKEN_B;

describe('Applications API', () => {
  beforeEach(async () => {
    await prisma.userApplicationMap.deleteMany({});
    await prisma.application.deleteMany({});
  });

  describe('POST /applications', () => {
    it('should create a new application for user A', async () => {
      const res = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          name: 'Test App A',
          description: 'A test application for user A',
        });
      expect(res.statusCode).toEqual(201);
      expect(res.body.name).toBe('Test App A');
    });

    it('should create a new application for user B', async () => {
        const res = await request(app)
          .post('/api/applications')
          .set('Authorization', `Bearer ${userBToken}`)
          .send({
            name: 'Test App B',
            description: 'A test application for user B',
          });
        expect(res.statusCode).toEqual(201);
        expect(res.body.name).toBe('Test App B');
      });
  });

  describe('GET /applications', () => {
    it('should fetch all applications for user A', async () => {
        await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          name: 'Test App A',
          description: 'A test application for user A',
        });

      const res = await request(app)
        .get('/api/applications')
        .set('Authorization', `Bearer ${userAToken}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].name).toBe('Test App A');
    });

    it('should fetch zero applications for user B', async () => {
        const res = await request(app)
          .get('/api/applications')
          .set('Authorization', `Bearer ${userBToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.data).toBeInstanceOf(Array);
        expect(res.body.data.length).toBe(0);
      });
  });

  describe('GET /applications/:id', () => {
    let appCreatedByUserA: any;
    beforeEach(async () => {
        const res = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          name: 'Test App A',
          description: 'A test application for user A',
        });
        appCreatedByUserA = res.body;
    });
    it('should fetch an application by ID for user A', async () => {
      const res = await request(app)
        .get(`/api/applications/${appCreatedByUserA.id}`)
        .set('Authorization', `Bearer ${userAToken}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.name).toBe('Test App A');
    });

    it('should not fetch user A\'s application for user B', async () => {
      const res = await request(app)
        .get(`/api/applications/${appCreatedByUserA.id}`)
        .set('Authorization', `Bearer ${userBToken}`);
      expect(res.statusCode).toEqual(404);
    });
  });

  describe('PUT /applications/:id', () => {
    let appCreatedByUserA: any;
    beforeEach(async () => {
        const res = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          name: 'Test App A',
          description: 'A test application for user A',
        });
        appCreatedByUserA = res.body;
    });
    it('should update an application for user A', async () => {
      const res = await request(app)
        .put(`/api/applications/${appCreatedByUserA.id}`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          name: 'Updated Test App A',
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body.name).toBe('Updated Test App A');
    });

    it('should not update user A\'s application for user B', async () => {
      const res = await request(app)
        .put(`/api/applications/${appCreatedByUserA.id}`)
        .set('Authorization', `Bearer ${userBToken}`)
        .send({
          name: 'User B trying to update App A',
        });
      expect(res.statusCode).toEqual(404);
    });
  });

  describe('DELETE /applications/:id', () => {
    let appCreatedByUserA: any;
    beforeEach(async () => {
        const res = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          name: 'Test App A',
          description: 'A test application for user A',
        });
        appCreatedByUserA = res.body;
    });
    it('should not delete user A\'s application for user B', async () => {
      const res = await request(app)
        .delete(`/api/applications/${appCreatedByUserA.id}`)
        .set('Authorization', `Bearer ${userBToken}`);
      expect(res.statusCode).toEqual(404);
    });

    it('should delete an application for user A', async () => {
      const res = await request(app)
        .delete(`/api/applications/${appCreatedByUserA.id}`)
        .set('Authorization', `Bearer ${userAToken}`);
      expect(res.statusCode).toEqual(200);
    });
  });
});