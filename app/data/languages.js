
export const UN = {
 'ar': 'العربية',
 'en': 'English',
 'es': 'Español',
 'fr': 'Français',
 'ru': 'Русский',
 'zh': '中文',
}

export const Floor = {
  xx : 'Floor'    
}

export default {
  ...UN,
} 

const allLanguages = {
  ...UN,
  ...Floor
};

export function getLanguageName(code) {

  if(!code) return null;

  const name = allLanguages[code];

  return name || code.toUpperCase();
}
