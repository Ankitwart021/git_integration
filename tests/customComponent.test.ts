import request from 'supertest';
import { app } from '../server';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

const prisma = new PrismaClient();

const userAToken = process.env.TEST_AUTH_TOKEN;
const userBToken = process.env.TEST_AUTH_TOKEN_B;

describe('Custom Components API', () => {
  let componentCreatedByUserA: any;

  beforeEach(async () => {
    await prisma.customComponent.deleteMany({});
  });

  describe('POST /customComponents', () => {
    it('should create a new custom component for user A', async () => {
      const res = await request(app)
        .post('/api/customComponents')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          componentName: 'Test Component A',
          componentContent: { data: 'some content' },
        });
      expect(res.statusCode).toEqual(201);
      expect(res.body.componentName).toBe('Test Component A');
      componentCreatedByUserA = res.body;
    });
  });

  describe('GET /customComponents', () => {
    beforeEach(async () => {
        const res = await request(app)
        .post('/api/customComponents')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          componentName: 'Test Component A',
          componentContent: { data: 'some content' },
        });
        componentCreatedByUserA = res.body;
    });

    it('should fetch all custom components for user A', async () => {
      const res = await request(app)
        .get(`/api/customComponents`)
        .set('Authorization', `Bearer ${userAToken}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].componentName).toBe('Test Component A');
    });

    it('should fetch zero custom components for user B', async () => {
        const res = await request(app)
          .get(`/api/customComponents`)
          .set('Authorization', `Bearer ${userBToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.data).toBeInstanceOf(Array);
        expect(res.body.data.length).toBe(0);
      });
  });

  describe('GET /customComponents/component/:id', () => {
    beforeEach(async () => {
        const res = await request(app)
        .post('/api/customComponents')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          componentName: 'Test Component A',
          componentContent: { data: 'some content' },
        });
        componentCreatedByUserA = res.body;
    });
    it('should fetch a custom component by ID for user A', async () => {
      const res = await request(app)
        .get(`/api/customComponents/component/${componentCreatedByUserA.id}`)
        .set('Authorization', `Bearer ${userAToken}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.componentName).toBe('Test Component A');
    });

    it('should not fetch user A\'s custom component for user B', async () => {
      const res = await request(app)
        .get(`/api/customComponents/component/${componentCreatedByUserA.id}`)
        .set('Authorization', `Bearer ${userBToken}`);
      expect(res.statusCode).toEqual(403);
    });
  });

  describe('PUT /customComponents/:id', () => {
    beforeEach(async () => {
        const res = await request(app)
        .post('/api/customComponents')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          componentName: 'Test Component A',
          componentContent: { data: 'some content' },
        });
        componentCreatedByUserA = res.body;
    });
    it('should update a custom component for user A', async () => {
      const res = await request(app)
        .put(`/api/customComponents/${componentCreatedByUserA.id}`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          componentName: 'Updated Test Component A',
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body.componentName).toBe('Updated Test Component A');
    });

    it('should not update user A\'s custom component for user B', async () => {
      const res = await request(app)
        .put(`/api/customComponents/${componentCreatedByUserA.id}`)
        .set('Authorization', `Bearer ${userBToken}`)
        .send({
          componentName: 'User B trying to update Component A',
        });
      expect(res.statusCode).toEqual(403);
    });
  });

  describe('DELETE /customComponents/:id', () => {
    beforeEach(async () => {
        const res = await request(app)
        .post('/api/customComponents')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          componentName: 'Test Component A',
          componentContent: { data: 'some content' },
        });
        componentCreatedByUserA = res.body;
    });
    it('should not delete user A\'s custom component for user B', async () => {
      const res = await request(app)
        .delete(`/api/customComponents/${componentCreatedByUserA.id}`)
        .set('Authorization', `Bearer ${userBToken}`);
      expect(res.statusCode).toEqual(403);
    });

    it('should delete a custom component for user A', async () => {
      const res = await request(app)
        .delete(`/api/customComponents/${componentCreatedByUserA.id}`)
        .set('Authorization', `Bearer ${userAToken}`);
      expect(res.statusCode).toEqual(200);
    });
  });
});