// Maps decision/recommendation reference codes (as written by select-decision-dialog.js)
// onto entries of the /api/v2013/index search index. Only COP decisions live in the
// decisions collection; recommendations (SBI, SBSTTA, WG8J...) exist only in the index.

// Index body codes differ from the ones written into references.
const INDEX_BODIES = { 'NP/COP-MOP': 'NPMOP', 'BS/COP-MOP': 'CPMOP' };

// "CBD/SBI/01/01/07" -> { body:'SBI', session:1, decision:1 }. Bodies can contain a slash
// ("NP/COP-MOP"), so the body is everything before the first purely numeric segment.
export function parseReference(code) {

    const parts = (code || '').split('/');

    if(parts.shift() !== 'CBD') return null;

    const start = parts.findIndex(p => /^\d+$/.test(p));

    if(start < 1) return null;

    const body     = parts.slice(0, start).join('/');
    const session  = parseInt(parts[start]);
    const decision = parseInt(parts[start+1]);

    if(!body || isNaN(session) || isNaN(decision)) return null;

    return { body, session, decision };
}

// Solr clause matching the index entries of the given reference codes, or '' when none of
// them can be parsed.
export function indexQuery(codes) {

    const clauses = (codes || []).map(parseReference)
                                 .filter(ref => !!ref)
                                 .map(({ body, session, decision }) =>
                                    `(body_s:"${INDEX_BODIES[body] || body}" AND session_i:${session} AND decision_i:${decision})`);

    return [...new Set(clauses)].join(' OR ');
}

// True when an index document is the entry for the given reference code.
export function isIndexMatch(doc, code) {

    const ref = parseReference(code);

    if(!ref) return false;

    return doc.body_s === (INDEX_BODIES[ref.body] || ref.body)
        && doc.session_i === ref.session
        && doc.decision_i === ref.decision;
}
