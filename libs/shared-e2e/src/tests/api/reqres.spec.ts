/**
 * API Tests — https://jsonplaceholder.typicode.com
 * A free, zero-auth REST API for testing and prototyping.
 */
import { test, expect } from '@playwright/test';
import { ApiClient } from '../../api/http/api-client';

const BASE_URL = 'https://jsonplaceholder.typicode.com';

test.describe('JSONPlaceholder API Tests', () => {
  let client: ApiClient;

  test.beforeAll(() => {
    client = new ApiClient(BASE_URL);
  });

  test.afterAll(async () => {
    await client.dispose();
  });

  // --- GET ---

  test('TC-API-01: GET /posts returns an array of 100 posts', async () => {
    const response = await client.get('/posts');

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body).toHaveLength(100);
    expect(body[0]).toMatchObject({
      userId: expect.any(Number),
      id: 1,
      title: expect.any(String),
      body: expect.any(String),
    });
  });

  test('TC-API-02: GET /posts/:id returns the correct post', async () => {
    const response = await client.get('/posts/1');

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toMatchObject({ id: 1, userId: 1 });
    expect(typeof body.title).toBe('string');
  });

  test('TC-API-03: GET /posts/:id returns 404 for non-existent resource', async () => {
    const response = await client.get('/posts/9999');

    expect(response.status()).toBe(404);
  });

  test('TC-API-04: GET /posts with query filter returns matching posts', async () => {
    const response = await client.get('/posts', { params: { userId: '1' } });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
    body.forEach((post: { userId: number }) => {
      expect(post.userId).toBe(1);
    });
  });

  test('TC-API-05: GET /users returns list of users with contact info', async () => {
    const response = await client.get('/users');

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
    expect(body[0]).toHaveProperty('email');
    expect(body[0]).toHaveProperty('address');
  });

  // --- POST ---

  test('TC-API-06: POST /posts creates a new post and returns 201', async () => {
    const payload = { title: 'Test Post', body: 'Created by automation', userId: 1 };
    const response = await client.post('/posts', { body: payload });

    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body).toMatchObject({
      title: 'Test Post',
      body: 'Created by automation',
      userId: 1,
      id: expect.any(Number),
    });
  });

  // --- PUT ---

  test('TC-API-07: PUT /posts/:id replaces the post and returns 200', async () => {
    const payload = { id: 1, title: 'Updated Title', body: 'Updated body', userId: 1 };
    const response = await client.put('/posts/1', { body: payload });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toMatchObject({ id: 1, title: 'Updated Title' });
  });

  // --- PATCH ---

  test('TC-API-08: PATCH /posts/:id partially updates the post', async () => {
    const payload = { title: 'Patched Title' };
    const response = await client.patch('/posts/1', { body: payload });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.title).toBe('Patched Title');
    expect(body.id).toBe(1);
  });

  // --- DELETE ---

  test('TC-API-09: DELETE /posts/:id returns 200 with empty object', async () => {
    const response = await client.delete('/posts/1');

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toEqual({});
  });

  // --- Nested resource ---

  test('TC-API-10: GET /posts/:id/comments returns comments for the post', async () => {
    const response = await client.get('/posts/1/comments');

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
    body.forEach((comment: { postId: number; email: string }) => {
      expect(comment.postId).toBe(1);
      expect(comment.email).toContain('@');
    });
  });
});
