//==============================
//
//==============================
export default function normalizeSymbol(symbol) {
    return symbol.toUpperCase().replace(/[^A-Z0-9\/\-\*]/gi, '').replace(/\/$/g, '');
}
