import app from '~/app'
import { encodeHtml, sanitizeHtml } from '~/services/html';

app.filter('sanitizeHtml', [function() {
    return sanitizeHtml;
}]);

app.filter('safeHtml', ["$sce", function($sce) {
    return function(unsafeHtml) {
        const sanitizedHtml = sanitizeHtml(unsafeHtml); // Enforce XSS sanitization when html is blindly `trusted` using a ng filter;
        return $sce.trustAsHtml(sanitizedHtml);
    };
}]);

app.filter('encodeHtml', [function() {
    return encodeHtml;
}]);