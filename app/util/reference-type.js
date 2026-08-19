//===========================
// Classifies a decision reference code (meeting, document,
// notification or link) so the right lookup / card can be used.
// Codes are stored as plain strings — the type is not persisted.
// Patterns mirror the Joi codes in gaia controllers/decisions/validation-schemas.js
//===========================
export default function referenceType(code) {

    code = (code || '').trim();

    if(/^(?:https?:)?\/\//i.test(code)) return 'url';
    if(/^\d{4}-\d{3}$/     .test(code)) return 'notification';
    if(code.indexOf('/') >= 0)          return 'document';

    return 'meeting';
}
