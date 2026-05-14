import request from 'supertest';
import { app } from '../server';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

const prisma = new PrismaClient();

const userAToken = process.env.TEST_AUTH_TOKEN;
const userBToken = process.env.TEST_AUTH_TOKEN_B;

describe('Enums API', () => {
  let appCreatedByUserA: any;
  let enumCreatedInAppA: any;

  beforeEach(async () => {
    await prisma.userApplicationMap.deleteMany({});
    await prisma.applicationEnum.deleteMany({});
    await prisma.application.deleteMany({});

    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ name: 'Test App for Enums', description: 'An app for enum tests' });
    appCreatedByUserA = res.body;
  });

  describe('POST /applications/:applicationId/createEnum', () => {
    it('should create a new enum for an application', async () => {
      const res = await request(app)
        .post(`/api/applications/${appCreatedByUserA.id}/createEnum`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ enumName: 'TestEnum', enums: { key: 'value' } });
      expect(res.statusCode).toEqual(201);
      expect(res.body.enumName).toBe('TestEnum');
      enumCreatedInAppA = res.body;
    });

    it('should not create an enum for an application owned by another user', async () => {
        const res = await request(app)
          .post(`/api/applications/${appCreatedByUserA.id}/createEnum`)
          .set('Authorization', `Bearer ${userBToken}`)
          .send({ enumName: 'TestEnum', enums: { key: 'value' } });
        expect(res.statusCode).toEqual(404);
      });
  });

  describe('GET /applications/:applicationId/getEnums', () => {
    beforeEach(async () => {
        const res = await request(app)
        .post(`/api/applications/${appCreatedByUserA.id}/createEnum`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ enumName: 'TestEnum', enums: { key: 'value' } });
        enumCreatedInAppA = res.body;
    });
    it('should fetch all enums for an application', async () => {
      const res = await request(app)
        .get(`/api/applications/${appCreatedByUserA.id}/getEnums`)
        .set('Authorization', `Bearer ${userAToken}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBe(1);
      expect(res.body[0].enumName).toBe('TestEnum');
    });

    it('should not fetch enums for an application owned by another user', async () => {
        const res = await request(app)
            .get(`/api/applications/${appCreatedByUserA.id}/getEnums`)
            .set('Authorization', `Bearer ${userBToken}`);
        expect(res.statusCode).toEqual(404);
        });
  });

  describe('PUT /applications/:applicationId/updateEnum/:enumId', () => {
    beforeEach(async () => {
        const res = await request(app)
        .post(`/api/applications/${appCreatedByUserA.id}/createEnum`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ enumName: 'TestEnum', enums: { key: 'value' } });
        enumCreatedInAppA = res.body;
    });
    it('should update an enum', async () => {
      const res = await request(app)
        .put(`/api/applications/${appCreatedByUserA.id}/updateEnum/${enumCreatedInAppA.id}`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ enumName: 'UpdatedTestEnum' });
      expect(res.statusCode).toEqual(200);
      expect(res.body.enumName).toBe('UpdatedTestEnum');
    });

    it('should not update an enum in an application owned by another user', async () => {
        const res = await request(app)
            .put(`/api/applications/${appCreatedByUserA.id}/updateEnum/${enumCreatedInAppA.id}`)
            .set('Authorization', `Bearer ${userBToken}`)
            .send({ enumName: 'UpdatedTestEnum' });
        expect(res.statusCode).toEqual(404);
        });
  });

  describe('DELETE /applications/:applicationId/deleteEnum/:enumId', () => {
    beforeEach(async () => {
        const res = await request(app)
        .post(`/api/applications/${appCreatedByUserA.id}/createEnum`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ enumName: 'TestEnum', enums: { key: 'value' } });
        enumCreatedInAppA = res.body;
    });
    it('should not delete an enum from an application owned by another user', async () => {
        const res = await request(app)
            .delete(`/api/applications/${appCreatedByUserA.id}/deleteEnum/${enumCreatedInAppA.id}`)
            .set('Authorization', `Bearer ${userBToken}`);
        expect(res.statusCode).toEqual(404);
        });

    it('should delete an enum', async () => {
      const res = await request(app)
        .delete(`/api/applications/${appCreatedByUserA.id}/deleteEnum/${enumCreatedInAppA.id}`)
        .set('Authorization', `Bearer ${userAToken}`);
      expect(res.statusCode).toEqual(200);
    });
  });
});