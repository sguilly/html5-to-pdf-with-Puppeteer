import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('GeneratePdfController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/v2/generate-pdf/url (POST) - should return pdf when valid url is provided', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v2/generate-pdf/url')
      .send({
        url: 'https://example.com',
        format: 'pdf',
      })
      .expect(HttpStatus.OK);

    expect(response.header['content-type']).toBe('application/pdf');
    expect(Buffer.isBuffer(response.body)).toBe(true);
  });

  it('/api/v2/generate-pdf/url (POST) - should return 404 when format is missing', async () => {
    await request(app.getHttpServer())
      .post('/v2/generate-pdf/url')
      .send({
        url: 'https://example.com',
      })
      .expect(HttpStatus.NOT_FOUND);
  });

  it('/v2/generate-pdf/html (POST) - should return image when valid html and format is provided', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v2/generate-pdf/html')
      .send({
        html: '<html><body><h1>Hello World</h1></body></html>',
        format: 'image',
      })
      .expect(HttpStatus.OK);

    expect(response.header['content-type']).toBe('image/jpg');
    expect(Buffer.isBuffer(response.body)).toBe(true);
  });

  it('/api/v2/generate-pdf/html (POST) - should return 404 when format is invalid', async () => {
    await request(app.getHttpServer())
      .post('/v2/generate-pdf/html')
      .send({
        html: '<html><body><h1>Hello World</h1></body></html>',
        format: 'invalid-format',
      })
      .expect(HttpStatus.NOT_FOUND);
  });

  afterAll(async () => {
    await app.close();
  });
});
