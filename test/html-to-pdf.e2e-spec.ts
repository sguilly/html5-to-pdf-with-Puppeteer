import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module'; // Importez votre module principal

describe('GeneratePdfController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule], // Importez votre module principal
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/v2/generate-pdf/url (POST) - should return pdf when valid url is provided', async () => {
    const response = await request(app.getHttpServer())
      .post('/v2/generate-pdf/url')
      .send({
        url: 'https://example.com',
        format: 'pdf',
      })
      .expect(HttpStatus.OK);

    expect(response.header['content-type']).toBe('application/pdf');
    expect(Buffer.isBuffer(response.body)).toBe(true);

    //expect(response.body).toBeInstanceOf(Buffer); // Adjust according to your actual response
  });

  it('/v2/generate-pdf/url (POST) - should return 400 when format is missing', async () => {
    await request(app.getHttpServer())
      .post('/v2/generate-pdf/url')
      .send({
        url: 'https://example.com',
      })
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('/v2/generate-pdf/html (POST) - should return image when valid html and format is provided', async () => {
    const response = await request(app.getHttpServer())
      .post('/v2/generate-pdf/html')
      .send({
        html: '<html><body><h1>Hello World</h1></body></html>',
        format: 'image',
      })
      .expect(HttpStatus.OK);

    expect(response.header['content-type']).toBe('image/jpg');
    expect(Buffer.isBuffer(response.body)).toBe(true);

    //expect(response.body).toBeInstanceOf(Buffer); // Adjust according to your actual response
  });

  it('/v2/generate-pdf/html (POST) - should return 400 when format is invalid', async () => {
    await request(app.getHttpServer())
      .post('/v2/generate-pdf/html')
      .send({
        html: '<html><body><h1>Hello World</h1></body></html>',
        format: 'invalid-format',
      })
      .expect(HttpStatus.BAD_REQUEST);
  });

  afterAll(async () => {
    await app.close();
  });
});
