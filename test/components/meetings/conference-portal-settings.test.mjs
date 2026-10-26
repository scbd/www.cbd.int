import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import axios from 'axios';
import Api, { ConferencePortalError } from '../../../app/components/meetings/api.js';

const api         = new Api({ tokenReader: () => 'ticket-123', prefixUrl: 'https://gaia.test' });
const VERSION     = 'a'.repeat(64);
const NEW_VERSION = 'b'.repeat(64);
const settings    = { menus: [{ code: 'home' }], meta: { updatedOn: '2026-10-25T14:03:11.482Z', updatedBy: 15331, _updatedBy: { firstName: 'A', lastName: 'B' }, _version: VERSION } };

beforeEach(() => axios.respondWith(() => { throw new Error('unexpected request') }));

test('GET returns the settings with meta._version, calling the portal url with the token', async () => {

  axios.respondWith(() => ({ status: 200, data: settings, headers: {} }));

  const result = await api.getConferencePortalSettings('2026');

  assert.deepEqual(result, { settings, version: VERSION });
  assert.equal(axios.requests[0].method, 'get');
  assert.equal(axios.requests[0].url, 'api/v2025/conferences/2026/portal');
  assert.equal(axios.requests[0].headers.Authorization, 'Token ticket-123');
  assert.equal(axios.requests[0].baseURL, 'https://gaia.test'); // the prefixUrl option becomes the base url
});

test('GET ignores any ETag header: the version is only meta._version', async () => {

  axios.respondWith(() => ({ status: 200, data: settings, headers: { etag: '"something-else"' } }));

  assert.equal((await api.getConferencePortalSettings('2026')).version, VERSION);
});

test('GET of never-edited settings still has a version', async () => {

  const never = { menus: [], meta: { updatedOn: null, _version: VERSION } };
  axios.respondWith(() => ({ status: 200, data: never, headers: {} }));

  assert.deepEqual(await api.getConferencePortalSettings('2026'), { settings: never, version: VERSION });
});

test('GET without meta._version in the body fails clearly', async () => {

  axios.respondWith(() => ({ status: 200, data: { menus: [] }, headers: { etag: '"x"' } }));

  await assert.rejects(api.getConferencePortalSettings('2026'), { code: 'invalid-response' });
});

test('PUT sends the bare version as If-Match, omits meta, and returns the new version from the response', async () => {

  axios.respondWith(() => ({ status: 200, data: { menus: [], meta: { updatedOn: '2026-10-25T15:00:00.000Z', _version: NEW_VERSION } }, headers: {} }));

  const result = await api.updateConferencePortalSettings('2026', settings, VERSION);

  const [request] = axios.requests;
  assert.equal(request.method, 'put');
  assert.equal(request.url, 'api/v2025/conferences/2026/portal');
  assert.equal(request.headers['If-Match'], VERSION);
  assert.equal(request.headers['Content-Type'], 'application/json');
  assert.deepEqual(request.data, { menus: [{ code: 'home' }] });
  assert.equal(result.version, NEW_VERSION);
  assert.equal(result.settings.meta._version, NEW_VERSION);
});

test('PUT 412 raises a conflict error (the caller reloads) and is not retried', async () => {

  axios.respondWith(() => ({ status: 412, data: {}, headers: {} }));

  await assert.rejects(api.updateConferencePortalSettings('2026', settings, VERSION), (e) => {
    assert.ok(e instanceof ConferencePortalError);
    assert.equal(e.code, 'conflict');
    assert.equal(e.status, 412);
    assert.match(e.message, /Reload the latest settings/);
    return true;
  });

  assert.equal(axios.requests.length, 1);
});

test('PUT without a version never reaches the server', async () => {

  for(const version of [undefined, null, '']) {
    await assert.rejects(api.updateConferencePortalSettings('2026', settings, version), { code: 'missing-version' });
  }

  assert.equal(axios.requests.length, 0);
});

test('PUT refuses a non-object body, which would wipe the stored settings', async () => {

  await assert.rejects(api.updateConferencePortalSettings('2026', null, VERSION), { code: 'invalid-settings' });

  assert.equal(axios.requests.length, 0);
});

test('each failing status maps to its own error', async () => {

  const expected = { 400: 'bad-request', 401: 'unauthorized', 403: 'forbidden', 404: 'not-found', 412: 'conflict', 428: 'missing-version' };
  const messages = new Set();

  for(const [status, code] of Object.entries(expected)) {
    axios.respondWith(() => ({ status: Number(status), data: {}, headers: {} }));

    await assert.rejects(api.getConferencePortalSettings('x'), (e) => { assert.equal(e.code, code); messages.add(e.message); return true; });
  }

  assert.equal(messages.size, 6);
});
