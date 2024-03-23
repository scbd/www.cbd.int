import app from '~/app'
import DOMPurify from 'dompurify';

export function encodeHtml(html) {
    var div = document.createElement('div');
    return div.text(html).html();
}

export function sanitizeHtml(unsafeHtml) {
    return DOMPurify.sanitize(unsafeHtml); // only there to prevent XSS not to enforce html styling
};

////////////////////
// NG filters
////////////////////
app.filter('sanitizeHtml', [function() {
    return sanitizeHtml;
}]);

app.filter('safeHtml', ["$sce", function($sce) {
    return function(unsafeHtml) {
        var sanitizedHtml = sanitizeHtml(unsafeHtml); // Enforce XSS sanitization when html "trustes" using a ng filter;
        return $sce.trustAsHtml(sanitizedHtml);
    };
}]);

app.filter('encodeHtml', [function() {
    return htmlEncode;
}]);

