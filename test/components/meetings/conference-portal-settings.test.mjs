import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import axios from 'axios';
import Api, { ConferencePortalError } from '../../../app/components/meetings/api.js';

const api      = new Api({ tokenReader: () => 'ticket-123', prefixUrl: 'https://gaia.test' });
const settings = { menus: [{ code: 'home' }], meta: { updatedOn: '2026-10-25T14:03:11.482Z' } };
const ETAG     = '"2026-10-25T14:03:11.482Z"';

beforeEach(() => axios.respondWith(() => { throw new Error('unexpected request') }));

test('GET returns the settings with their ETag and calls the portal url with the token', async () => {

  axios.respondWith(() => ({ status: 200, data: settings, headers: { etag: ETAG } }));

  const result = await api.getConferencePortalSettings('panama-2025');

  assert.deepEqual(result, { settings, etag: ETAG });
  assert.equal(axios.requests[0].method, 'get');
  assert.equal(axios.requests[0].url, 'api/v2025/conferences/panama-2025/portal');
  assert.equal(axios.requests[0].headers.Authorization, 'Token ticket-123');
  assert.equal(axios.requests[0].baseURL, 'https://gaia.test'); // the prefixUrl option becomes the base url
});

test('GET builds the ETag from meta.updatedOn in the body, not from the response header', async () => {

  axios.respondWith(() => ({ status: 200, data: settings, headers: {} }));

  assert.equal((await api.getConferencePortalSettings('panama-2025')).etag, ETAG);
});

test('GET of never-edited settings (no meta) uses "none"', async () => {

  axios.respondWith(() => ({ status: 200, data: { menus: [] }, headers: {} }));

  assert.equal((await api.getConferencePortalSettings('panama-2025')).etag, '"none"');
});

test('PUT sends If-Match as given, omits meta, and returns the new ETag', async () => {

  const NEW_ETAG = '"2026-10-25T15:00:00.000Z"';
  axios.respondWith(() => ({ status: 200, data: { menus: [], meta: { updatedOn: '2026-10-25T15:00:00.000Z' } }, headers: {} }));

  const result = await api.updateConferencePortalSettings('panama-2025', settings, ETAG);

  const [request] = axios.requests;
  assert.equal(request.method, 'put');
  assert.equal(request.url, 'api/v2025/conferences/panama-2025/portal');
  assert.equal(request.headers['If-Match'], ETAG);
  assert.equal(request.headers['Content-Type'], 'application/json');
  assert.deepEqual(request.data, { menus: [{ code: 'home' }] });
  assert.deepEqual(result, { settings: { menus: [], meta: { updatedOn: '2026-10-25T15:00:00.000Z' } }, etag: NEW_ETAG });
});

test('PUT 412 raises a conflict error and is not retried', async () => {

  axios.respondWith(() => ({ status: 412, data: {}, headers: {} }));

  await assert.rejects(api.updateConferencePortalSettings('panama-2025', settings, ETAG), (e) => {
    assert.ok(e instanceof ConferencePortalError);
    assert.equal(e.code, 'conflict');
    assert.equal(e.status, 412);
    assert.match(e.message, /changed by someone else/);
    return true;
  });

  assert.equal(axios.requests.length, 1);
});

test('PUT without an ETag is refused before any request is sent', async () => {

  for(const etag of [undefined, null, '']) {
    await assert.rejects(api.updateConferencePortalSettings('panama-2025', settings, etag), { code: 'missing-etag' });
  }

  assert.equal(axios.requests.length, 0);
});

test('PUT refuses a non-object body, which would wipe the stored settings', async () => {

  await assert.rejects(api.updateConferencePortalSettings('panama-2025', null, ETAG), { code: 'invalid-settings' });

  assert.equal(axios.requests.length, 0);
});

test('each failing status maps to its own error', async () => {

  const expected = { 400: 'bad-request', 401: 'unauthorized', 403: 'forbidden', 404: 'not-found', 428: 'missing-etag' };
  const messages = new Set();

  for(const [status, code] of Object.entries(expected)) {
    axios.respondWith(() => ({ status: Number(status), data: {}, headers: {} }));

    await assert.rejects(api.getConferencePortalSettings('x'), (e) => { assert.equal(e.code, code); messages.add(e.message); return true; });
  }

  assert.equal(messages.size, 5);
});
