import { LRUCache } from 'lru-cache'
import request from 'superagent';
import { normalizeDocumentSymbol } from '../app/services/meetings.js'
import { mapObjectId, isObjectId } from '../app/services/object-id.js'
import httpProxy from 'http-proxy';

const apiUrl =  process.env.API_URL || 'https://api.cbddev.xyz';
const wwwUrl =  process.env.WWW_URL || 'https://www.cbd.int';
const proxy  = httpProxy.createProxyServer({ target: wwwUrl, secure: false, changeOrigin:true });

const documentsCache = new LRUCache({ max: 2000 });
const meetingsCache  = new LRUCache({ max:  200 }); //doc/meeting ratio 10:1
const documentSymbolRe = /^(UNEP\/)?CBD(\/[a-zA-Z0-9-.]+)+$/i;

function isSymbol(symbol) {
    return documentSymbolRe.test(symbol)
}

function isMeetingDocument(idOrSymbol) {
    return isSymbol  (idOrSymbol) || isObjectId(idOrSymbol);
}

export default async function handleDocuments(req, res, next) { 

    const idOrSymbol = req.params[0] || '';

    if(idOrSymbol && isMeetingDocument(idOrSymbol)) { // Maybe we can drop this `isMeetingDocument()` check if nginx do it. 

        try {
            const document = await getDocument(idOrSymbol);
            const meeting  = await getMeeting (document.meeting);

            const url = `/meetings/${encodeURIComponent(meeting.symbol)}?doc=${encodeURIComponent(document.symbol || document._id)}`

            res.redirect(url);
            return;
        }
        catch(e) {
            // console.error(e);
        }
    }
    
    proxy.web(req, res);
}

async function getDocument(idOrSymbol) {

    const normalizedSymbol = normalizeDocumentSymbol(idOrSymbol);

    if(documentsCache.get(normalizedSymbol)) return documentsCache.get(normalizedSymbol);

    const q = isObjectId(idOrSymbol) 
      ? { _id: mapObjectId(idOrSymbol) }
      : { $or: [ 
            { normalizedSymbol },
            // TODO only use normalizedSymbol when implemented on GAIA
            { symbol:  { $in: [normalizedSymbol, idOrSymbol] } }
        ]};

    const { body: document }  = await request.get(`${apiUrl}/api/v2016/documents`).accept('json').query({ 
        q: JSON.stringify(q),
        f: JSON.stringify({ symbol:1, normalizedSymbol:1, meeting:1 }),
        fo: 1
    });

    documentsCache.set(normalizedSymbol, document);

    return document;
}


async function getMeeting(id) {

    if(meetingsCache.get(id)) return meetingsCache.get(id);

    const { body }  = await request.get(`${apiUrl}/api/v2016/meetings`).accept('json').query({ 
        q : JSON.stringify({ _id: { $oid: id } }),
        f : JSON.stringify({ symbol:1, normalizedSymbol:1 }),
        fo: 1
    });

    const { normalizedSymbol: symbol } = body;
    const meeting = { symbol, ...body }

    meetingsCache.set(id, meeting);

    return meeting;
}