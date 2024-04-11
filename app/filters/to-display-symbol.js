import app from '~/app'

const partsRe = /\/(Add|Rev|Corr|CRP|L|Amend|Annex)(\d+)\b/gi

//============================================================
//
//
//============================================================
app.filter("toDisplaySymbol", function () {
  return toDisplaySymbol
});

//============================================================
//
//
//============================================================
function capitalize(s) {
  s = s.toLowerCase();
  
  if(s=='crp') return 'CRP';
    
  return `${s[0].toUpperCase()}${s.substr(1)}`;
}

//============================================================
//
//
//============================================================
export default function toDisplaySymbol(symbol) {
  
  if (!symbol) return;

  return symbol.replace(partsRe, (m, t, n) =>  `/${capitalize(t)}.${n}`);
};