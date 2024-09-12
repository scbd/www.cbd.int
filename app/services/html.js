import DOMPurify from 'dompurify';

export function encodeHtml(html) {
    var div = document.createElement('div');
    return div.text(html).html();
}

export function sanitizeHtml(unsafeHtml, options) {
    return DOMPurify.sanitize(unsafeHtml, {ADD_TAGS: ['oembed'], ADD_ATTR: ['url'] }); // only there to prevent XSS not to enforce html styling
};
