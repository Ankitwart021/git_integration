
import request from 'supertest';
import { app } from '../server';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

const prisma = new PrismaClient();

const userAToken = process.env.TEST_AUTH_TOKEN;
const userBToken = process.env.TEST_AUTH_TOKEN_B;

describe('Resources API', () => {
  let appCreatedByUserA: any;
  let resourceCreatedInAppA: any;

  beforeEach(async () => {
    await prisma.userApplicationMap.deleteMany({});
    await prisma.resource.deleteMany({});
    await prisma.application.deleteMany({});

    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ name: 'Test App for Resources', description: 'An app for resource tests' });
    appCreatedByUserA = res.body;
  });

  describe('POST /applications/:applicationId/createResource', () => {
    it('should create a new resource for an application', async () => {
      const res = await request(app)
        .post(`/api/applications/${appCreatedByUserA.id}/createResource`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ resourceName: 'TestResource', attributes: { key: 'value' } });
      expect(res.statusCode).toEqual(201);
      expect(res.body.resourceName).toBe('TestResource');
      resourceCreatedInAppA = res.body;
    });

    it('should not create a resource for an application owned by another user', async () => {
        const res = await request(app)
          .post(`/api/applications/${appCreatedByUserA.id}/createResource`)
          .set('Authorization', `Bearer ${userBToken}`)
          .send({ resourceName: 'TestResource', attributes: { key: 'value' } });
        expect(res.statusCode).toEqual(404);
      });
  });

  describe('GET /applications/:applicationId/getResources', () => {
    beforeEach(async () => {
        const res = await request(app)
        .post(`/api/applications/${appCreatedByUserA.id}/createResource`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ resourceName: 'TestResource', attributes: { key: 'value' } });
        resourceCreatedInAppA = res.body;
    });
    it('should fetch all resources for an application', async () => {
      const res = await request(app)
        .get(`/api/applications/${appCreatedByUserA.id}/getResources`)
        .set('Authorization', `Bearer ${userAToken}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBe(1);
      expect(res.body[0].resourceName).toBe('TestResource');
    });

    it('should not fetch resources for an application owned by another user', async () => {
        const res = await request(app)
            .get(`/api/applications/${appCreatedByUserA.id}/getResources`)
            .set('Authorization', `Bearer ${userBToken}`);
        expect(res.statusCode).toEqual(404);
        });
  });

  describe('PUT /applications/:applicationId/updateResource/:resourceId', () => {
    beforeEach(async () => {
        const res = await request(app)
        .post(`/api/applications/${appCreatedByUserA.id}/createResource`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ resourceName: 'TestResource', attributes: { key: 'value' } });
        resourceCreatedInAppA = res.body;
    });
    it('should update a resource', async () => {
      const res = await request(app)
        .put(`/api/applications/${appCreatedByUserA.id}/updateResource/${resourceCreatedInAppA.id}`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ resourceName: 'UpdatedTestResource' });
      expect(res.statusCode).toEqual(200);
      expect(res.body.resourceName).toBe('UpdatedTestResource');
    });

    it('should not update a resource in an application owned by another user', async () => {
        const res = await request(app)
            .put(`/api/applications/${appCreatedByUserA.id}/updateResource/${resourceCreatedInAppA.id}`)
            .set('Authorization', `Bearer ${userBToken}`)
            .send({ resourceName: 'UpdatedTestResource' });
        expect(res.statusCode).toEqual(404);
        });
  });

  describe('DELETE /applications/:applicationId/deleteResource/:resourceId', () => {
    beforeEach(async () => {
        const res = await request(app)
        .post(`/api/applications/${appCreatedByUserA.id}/createResource`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ resourceName: 'TestResource', attributes: { key: 'value' } });
        resourceCreatedInAppA = res.body;
    });
    it('should not delete a resource from an application owned by another user', async () => {
        const res = await request(app)
            .delete(`/api/applications/${appCreatedByUserA.id}/deleteResource/${resourceCreatedInAppA.id}`)
            .set('Authorization', `Bearer ${userBToken}`);
        expect(res.statusCode).toEqual(404);
        });

    it('should delete a resource', async () => {
      const res = await request(app)
        .delete(`/api/applications/${appCreatedByUserA.id}/deleteResource/${resourceCreatedInAppA.id}`)
        .set('Authorization', `Bearer ${userAToken}`);
      expect(res.statusCode).toEqual(200);
    });
  });
});
