import { test, expect } from '@playwright/test';

test('handle-check rejects malformed handles with 400', async ({ request }) => {
  for (const bad of ['', 'has space', 'x'.repeat(33), 'emoji🙂']) {
    const res = await request.get(`/api/handle-check?handle=${encodeURIComponent(bad)}`);
    expect(res.status(), `handle=${JSON.stringify(bad)}`).toBe(400);
    expect(await res.json()).toEqual({ ok: false, error: 'Invalid handle.' });
  }
});

test('handle-check answers JSON for a well-formed handle', async ({ request }) => {
  const res = await request.get('/api/handle-check?handle=DrBio');
  // 200 when SUPABASE_SERVICE_ROLE_KEY is configured (.dev.vars / Worker
  // secret); 500 "not configured" otherwise. Both are JSON with `ok`.
  expect([200, 500]).toContain(res.status());
  const body = await res.json();
  expect(typeof body.ok).toBe('boolean');
});
