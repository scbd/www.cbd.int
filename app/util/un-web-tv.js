export const WEBTV_HOST       = 'webtv.un.org';
export const TRANSCRIPTS_HOST = 'transcripts.un.org';

export function isUnWebTv(url) {
  return parseUrl(url)?.hostname == WEBTV_HOST;
}

// UN Web TV assets have a transcript page at the same path on transcripts.un.org.
export function getTranscriptUrl(urls) {
  const videoUrl = [].concat(urls||[]).find(isUnWebTv);
  if(!videoUrl) return null;

  const url = new URL(videoUrl);
  url.hostname = TRANSCRIPTS_HOST;
  url.search   = '';
  url.hash     = '';

  return url.toString();
}

function parseUrl(url) {
  try      { return new URL(url) }
  catch(e) { return null }
}
