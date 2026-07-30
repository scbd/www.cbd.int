import loadFranc from 'franc'

// ISO 639-3 (franc's output) and 639-2/B aliases -> the six UN languages of `~/data/languages`.
const UN_LANGUAGE = { ara:'ar', arb:'ar', eng:'en', spa:'es', esp:'es',
                      fra:'fr', fre:'fr', rus:'ru', cmn:'zh', zho:'zh', chi:'zh' };

const UN_CODES = new Set(Object.values(UN_LANGUAGE));

// Exported: a caller holding an explicit code (a `-fra` suffix) needs the same table.
export function toUnLanguage(code) {
    code = (code||'').toLowerCase();

    return UN_CODES.has(code) ? code : (UN_LANGUAGE[code] || null);
}

// null when franc cannot tell (`und`), names a language we do not publish, or fails to load - the
// caller picks the default. franc's 10-character minimum is tuned for prose and rejects short
// Chinese and Arabic outright, so it is lowered.
export async function detectLanguage(text) {
    if(!text) return null;

    const franc = await loadFranc().catch(() => null);

    return franc ? toUnLanguage(franc(text, { minLength: 3 })) : null;
}

// AI translations carry an `.ai` marker before the extension: `my-file-name-en.ai.docx`.
const AI_MARKER = /\.ai(?=\.)/i;
const EXTENSION = /\.[^.]+$/;

// `-fr`, `-eng`: an explicit suffix is trusted over detection. One that is not a UN language
// (`-rev`, `-final`) falls through instead of blocking it.
const LANGUAGE_SUFFIX = /-([a-z]{2,3})$/i;

export async function detectFilenameLanguage(filename) {
    const basename   = (filename||'').replace(AI_MARKER, '').replace(EXTENSION, '');
    const [, suffix] = basename.match(LANGUAGE_SUFFIX) || [];

    return toUnLanguage(suffix) || await detectLanguage(basename.replace(/[-_]+/g, ' '));
}
