import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('GET /generate?format=pdf&url=https://example.com (PDF generation)', async () => {
    const response = await request(app.getHttpServer())
      .get('/generate')
      .query({ format: 'pdf', url: 'https://example.com' })
      .expect(200);

    // Check if the response has the correct content type (PDF)
    expect(response.headers['content-type']).toBe('application/pdf');
    expect(Buffer.isBuffer(response.body)).toBe(true);
  });

  it('GET /generate?format=image&url=https://example.com (Image generation)', async () => {
    const response = await request(app.getHttpServer())
      .get('/generate')
      .query({ format: 'image', url: 'https://example.com' })
      .expect(200);

    // Check if the response has the correct content type (Image)
    expect(response.headers['content-type']).toBe('image/jpg');
    expect(Buffer.isBuffer(response.body)).toBe(true);
  });

  it('POST /generate (PDF generation from HTML)', async () => {
    const response = await request(app.getHttpServer())
      .post('/generate')
      .send({
        format: 'pdf',
        html: '<!DOCTYPE html><html><body><h1>Test Heading</h1><p>Test paragraph.</p></body></html>',
        waitFor: 'h1', // Optional: waiting for the <h1> element
      })
      .expect(200);

    // Check if the response has the correct content type (PDF)
    expect(response.headers['content-type']).toBe('application/pdf');
    expect(Buffer.isBuffer(response.body)).toBe(true);
  });

  it('POST /generate (Image generation from HTML)', async () => {
    const response = await request(app.getHttpServer())
      .post('/generate')
      .send({
        format: 'image',
        html: '<!DOCTYPE html><html><body><h1>Test Heading</h1><p>Test paragraph.</p></body></html>',
        waitFor: 'h1',
      })
      .expect(200);

    // Check if the response has the correct content type (Image)
    expect(response.headers['content-type']).toBe('image/jpg');
    expect(Buffer.isBuffer(response.body)).toBe(true);
  });

  afterAll(async () => {
    await app.close();
  });
});
