import request from 'supertest';
import { app } from '../server';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

const prisma = new PrismaClient();

const userAToken = process.env.TEST_AUTH_TOKEN;
const userBToken = process.env.TEST_AUTH_TOKEN_B;

describe('Pages API', () => {
  let appCreatedByUserA: any;
  let pageCreatedInAppA: any;

  beforeEach(async () => {
    await prisma.userApplicationMap.deleteMany({});
    await prisma.page.deleteMany({});
    await prisma.application.deleteMany({});

    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ name: 'Test App for Pages', description: 'An app for page tests' });
    appCreatedByUserA = res.body;
  });

  describe('POST /applications/:applicationId/pages', () => {
    it('should create a new page for an application', async () => {
      const res = await request(app)
        .post(`/api/applications/${appCreatedByUserA.id}/pages`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ pageName: 'Test Page', pageContent: { data: 'some content' } });
      expect(res.statusCode).toEqual(201);
      expect(res.body.pageName).toBe('Test Page');
      pageCreatedInAppA = res.body;
    });

    it('should not create a page for an application owned by another user', async () => {
        const res = await request(app)
          .post(`/api/applications/${appCreatedByUserA.id}/pages`)
          .set('Authorization', `Bearer ${userBToken}`)
          .send({ pageName: 'Test Page', pageContent: { data: 'some content' } });
        expect(res.statusCode).toEqual(404);
      });
  });

  describe('GET /applications/:applicationId/pages', () => {
    beforeEach(async () => {
        const res = await request(app)
        .post(`/api/applications/${appCreatedByUserA.id}/pages`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ pageName: 'Test Page', pageContent: { data: 'some content' } });
        pageCreatedInAppA = res.body;
    });
    it('should fetch all pages for an application', async () => {
      const res = await request(app)
        .get(`/api/applications/${appCreatedByUserA.id}/pages`)
        .set('Authorization', `Bearer ${userAToken}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].pageName).toBe('Test Page');
    });

    it('should not fetch pages for an application owned by another user', async () => {
        const res = await request(app)
            .get(`/api/applications/${appCreatedByUserA.id}/pages`)
            .set('Authorization', `Bearer ${userBToken}`);
        expect(res.statusCode).toEqual(404);
        });
  });

  describe('GET /applications/:applicationId/pages/:id', () => {
    beforeEach(async () => {
        const res = await request(app)
        .post(`/api/applications/${appCreatedByUserA.id}/pages`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ pageName: 'Test Page', pageContent: { data: 'some content' } });
        pageCreatedInAppA = res.body;
    });
    it('should fetch a page by ID', async () => {
      const res = await request(app)
        .get(`/api/applications/${appCreatedByUserA.id}/pages/${pageCreatedInAppA.id}`)
        .set('Authorization', `Bearer ${userAToken}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.pageContent).toEqual({ data: 'some content' });
    });

    it('should not fetch a page from an application owned by another user', async () => {
        const res = await request(app)
            .get(`/api/applications/${appCreatedByUserA.id}/pages/${pageCreatedInAppA.id}`)
            .set('Authorization', `Bearer ${userBToken}`);
        expect(res.statusCode).toEqual(404);
        });
    });

  describe('PUT /applications/:applicationId/pages/:id', () => {
    beforeEach(async () => {
        const res = await request(app)
        .post(`/api/applications/${appCreatedByUserA.id}/pages`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ pageName: 'Test Page', pageContent: { data: 'some content' } });
        pageCreatedInAppA = res.body;
    });
    it('should update a page', async () => {
      const res = await request(app)
        .put(`/api/applications/${appCreatedByUserA.id}/pages/${pageCreatedInAppA.id}`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ pageName: 'Updated Test Page' });
      expect(res.statusCode).toEqual(200);
      expect(res.body.pageName).toBe('Updated Test Page');
    });

    it('should not update a page in an application owned by another user', async () => {
        const res = await request(app)
            .put(`/api/applications/${appCreatedByUserA.id}/pages/${pageCreatedInAppA.id}`)
            .set('Authorization', `Bearer ${userBToken}`)
            .send({ pageName: 'Updated Test Page' });
        expect(res.statusCode).toEqual(404);
        });
  });

  describe('DELETE /applications/:applicationId/pages/:id', () => {
    beforeEach(async () => {
        const res = await request(app)
        .post(`/api/applications/${appCreatedByUserA.id}/pages`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ pageName: 'Test Page', pageContent: { data: 'some content' } });
        pageCreatedInAppA = res.body;
    });
    it('should not delete a page from an application owned by another user', async () => {
        const res = await request(app)
            .delete(`/api/applications/${appCreatedByUserA.id}/pages/${pageCreatedInAppA.id}`)
            .set('Authorization', `Bearer ${userBToken}`);
        expect(res.statusCode).toEqual(404);
        });

    it('should delete a page', async () => {
      const res = await request(app)
        .delete(`/api/applications/${appCreatedByUserA.id}/pages/${pageCreatedInAppA.id}`)
        .set('Authorization', `Bearer ${userAToken}`);
      expect(res.statusCode).toEqual(200);
    });
  });
});