export default function onError(err, req, res, next) {

    let { message } = err || {};

    message = message || 'Error handling the request';

    try { console.error(req?.url, err); } catch (e) {}

    res.send(500, { statusCode: 500, message });
};
