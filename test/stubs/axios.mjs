// Stand-in for axios (the app loads it from a CDN, it is not in node_modules).
// `axios.respondWith(fn)` programs the reply: fn(request) returns { status, headers, data }; status >= 400 rejects like axios.
const stub = {
  requests : [],
  reply    : null,
  respondWith(fn) { stub.reply = fn; stub.requests = [] },
  create(config) {
    const send = async (method, url, ...args) => {
      const [data, options] = (method === 'put' || method === 'post' || method === 'patch') ? args : [undefined, args[0]];
      const request = { method, url, baseURL: config.baseURL, data, headers: { ...config.headers, ...(options && options.headers) } };

      stub.requests.push(request);

      const res = await stub.reply(request);

      if(res.status >= 400) throw Object.assign(new Error(`Request failed with status code ${res.status}`), { response: res });

      return res;
    };

    return { get: (url, o) => send('get', url, o), put: (url, d, o) => send('put', url, d, o) };
  }
};

export default stub;
