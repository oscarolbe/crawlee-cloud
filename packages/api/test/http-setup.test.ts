/**
 * HTTP Setup Tests — request body decompression
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import Fastify from 'fastify';
import { gzipSync, brotliCompressSync } from 'node:zlib';
import { configureHttp, API_BODY_LIMIT } from '../src/http-setup.js';

describe('configureHttp request decompression', () => {
  let app: FastifyInstance;
  const payload = JSON.stringify({ hello: 'world' });

  beforeAll(async () => {
    app = Fastify({ bodyLimit: API_BODY_LIMIT });
    await configureHttp(app);
    app.post('/echo', async (request) => request.body);
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('accepts gzip request bodies (Apify SDK)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/echo',
      headers: { 'content-type': 'application/json', 'content-encoding': 'gzip' },
      payload: gzipSync(payload),
    });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ hello: 'world' });
  });

  it('accepts Brotli request bodies', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/echo',
      headers: { 'content-type': 'application/json', 'content-encoding': 'br' },
      payload: brotliCompressSync(payload),
    });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ hello: 'world' });
  });
});
