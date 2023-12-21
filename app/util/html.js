export function escapeHtml(text) {
    return text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;');
}
  
export function textToHtml(text, { preserveNewLine, preserveLink } = { preserveNewLine: true, preserveLink: true }) {
  let html = escapeHtml(text);

  if(preserveNewLine === undefined) preserveNewLine = true;
  if(preserveLink    === undefined) preserveLink    = true;

  if (preserveNewLine) html = html.replace('\n', '<br>');
  if (preserveLink)    html = html.replace(/[a-z]+?:\/\/\S+?(?=((\s|$)|\.+(\s|$)))/g, '<a target="_blank" href="$&">$&</a>');// make url clickable
  if (preserveLink)    html = html.replace(/\w+@\w+(\.\w+)+/g, '<a target="_blank" href="mailto:$&">$&</a>');// make url clickable

  return html;
}