import app from '~/app'

const partsRe = /\/(Add|Rev|Corr|CRP|L|Amend|Annex)(\d+)\b/gi

//============================================================
//
//
//============================================================
app.filter("toDisplaySymbol", function () {
  return function (symbol) {
  
    if (!symbol) return;

    return symbol.replace(partsRe, (m, t, n) =>  `/${Capitalize(t)}.${n}`);
  };
});

//============================================================
//
//
//============================================================
function Capitalize(s) {
  s = s.toLowerCase();
  
  if(s=='crp') return 'CRP';
    
  return `${s[0].toUpperCase()}${s.substr(1)}`;
}