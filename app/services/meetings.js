import lstring from '../services/lstring.js';
import {isEmpty} from 'lodash';

//==============================
//
//==============================
export function normalizeMeeting(meeting) {

    let { EVT_CD: code, printSmart, agenda, venueText } = meeting;

    const isMontreal = /montr.al.*canada/i.test((venueText || {}).en || '');

    printSmart = !!printSmart;
    agenda = normalizeAgenda(agenda || {});

    return {
        ...meeting,
        code,
        agenda,
        printSmart,
        isMontreal
    };
}

export function normalizeAgenda(agenda) {

    agenda = agenda || {};
    const { prefix, color } = agenda;

    const items = (agenda?.items || []).map((item) => ({
        prefix,
        color,
        ...item
    }));

    return { ...agenda, items }
}

export function normalizeDocumentSymbol(symbol) {
    return symbol.toUpperCase().replace(/[^A-Z0-9\/\-\*]/gi, '').replace(/\/$/g, '');
}

const Priorities_Type = {
    'official'       : 1,
    'information'    : 2,
    'reference'      : 3,
    'in-session'     : 4,
    'draft-decision' : 5,
    'other'          : 6,
}

const Priorities_Natures = {
    'limited'   : 1,
    'crp'       : 2,
    'non-paper' : 3,
}

//====================================
//
//====================================
export function documentSortKey(d, { baseSymbol, locale } ) {

    const parts = [];

    parts.push(`SUPERSEDED`);

    if((d.metadata||{}).superseded) parts.push(1);
    else                            parts.push(0);

    parts.push(`TYPE`);
    parts.push(Priorities_Type[d.type] || pad('', 9)); 

    parts.push(`NATURE`);
    parts.push(Priorities_Natures[d.nature] || pad('', 9)); 
    
    let normalizedBaseSymbol = normalizeDocumentSymbol(baseSymbol||'');
    let normalizedSymbol     = normalizeDocumentSymbol(d.symbol||'');

    parts.push(`MATCH_BASE_SYMBOL`);
    if(normalizedSymbol && normalizedSymbol.startsWith(normalizedBaseSymbol)) 
        parts.push(0);
    else if(normalizedSymbol) 
        parts.push(1);
    else
        parts.push(2);

    normalizedSymbol = normalizedSymbol.replace(/\d+/g, (t)=>pad(t));
    normalizedSymbol = normalizedSymbol.replace(/\b(REV)(\d+)\b/, 'A-$1.$2')
    normalizedSymbol = normalizedSymbol.replace(/\b(ADD)(\d+)\b/, 'B-$1.$2')
    normalizedSymbol = normalizedSymbol.replace(/\b(L)(\d+)\b/,   'C-$1.$2')
    normalizedSymbol = normalizedSymbol.replace(/\b(CRP)(\d+)\b/, 'D-$1.$2')

    parts.push(`SYMBOL`);
    parts.push(normalizedSymbol || pad('', 'Z'));
    
    if(!isEmpty(d.title)){
        parts.push(`TITLE`);
        parts.push(lstring(d.title, locale).replace(/\s/g, '').toUpperCase());
    }

    parts.push(`ID`);
    parts.push(d._id.toUpperCase());

    const key = parts.join('-').replace(/\d+/g, (t)=>pad(t));;

    // d.title.en = key;

    return key;
}

//====================================
//
//====================================
function pad(t, c='0') {
    return (t||'').toString().padStart(8, c);
}