export function escapeHtml(text) {
    return text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;');
}
  
export function textToHtml(text, { preserveNewLine, preserveLink } = { preserveNewLine: true, preserveLink: true }) {
  let html = escapeHtml(text);

  if (preserveNewLine) html = html.replace('\n', '<br>');
  if (preserveLink)    html = html.replace(/[a-z]+?:\/\/\S+?(?=((\s|$)|\.+(\s|$)))/g, '<a target="_blank" href="$&">$&</a>');// make url clickable

  return html;
}